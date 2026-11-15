import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SB_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SB_KEY ||
  process.env.NEXT_PUBLIC_SB_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

/**
 * Handler OAuth Callback — Google Sign-In via Supabase
 *
 * Alur:
 * 1. Supabase mengirim ?code= setelah user menyetujui OAuth Google
 * 2. Tukar code → session via exchangeCodeForSession()
 * 3. Ambil email dari Supabase Auth user
 * 4. Cek / buat entri di tabel `users` custom MATHORA
 * 5. Set cookie mathora_auth_session dan redirect ke /dashboard/siswa
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  // Jika ada error dari OAuth provider, redirect ke login dengan pesan
  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/login/siswa?error=${encodeURIComponent(errorParam)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login/siswa?error=no_code", origin)
    );
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL("/login/siswa?error=supabase_not_configured", origin)
    );
  }

  try {
    // Buat Supabase client untuk server-side (Route Handler)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // 1. Tukar authorization code ke session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session) {
      console.error("OAuth exchangeCodeForSession error:", sessionError);
      return NextResponse.redirect(
        new URL("/login/siswa?error=oauth_failed", origin)
      );
    }

    // 2. Ambil data user dari Supabase Auth
    const supabaseUser = sessionData.session.user;
    const email = supabaseUser?.email;
    const googleName =
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.user_metadata?.name ||
      "";

    if (!email) {
      return NextResponse.redirect(
        new URL("/login/siswa?error=no_email", origin)
      );
    }

    // 3. Cek apakah email sudah terdaftar di tabel users MATHORA
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("username, email, role, avatar")
      .eq("email", email.toLowerCase())
      .single();

    let username: string;
    let role: string;
    let avatar: string;

    if (fetchError || !existingUser) {
      // 4a. Belum ada akun → auto-register sebagai siswa
      // Buat username dari nama Google atau bagian depan email
      const rawName = googleName || email.split("@")[0];
      // Sanitize: hanya alfanumerik + underscore, max 20 karakter
      const sanitized = rawName
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 20);
      // Tambah suffix acak jika kosong
      const baseUsername =
        sanitized.length >= 3 ? sanitized : `siswa_${Date.now().toString().slice(-5)}`;

      // Cek apakah username tersebut sudah ada; jika iya, tambah suffix
      const { data: usernameCheck } = await supabase
        .from("users")
        .select("username")
        .eq("username", baseUsername)
        .maybeSingle();

      username = usernameCheck
        ? `${baseUsername}_${Date.now().toString().slice(-4)}`
        : baseUsername;

      role = "siswa";
      avatar = "/images/avatar-1.svg";

      // Insert user baru ke tabel users (tanpa password — akun Google)
      const { error: insertError } = await supabase.from("users").insert({
        username,
        email: email.toLowerCase(),
        password: "", // akun Google tidak punya password lokal
        role,
        avatar,
      });

      if (insertError) {
        console.error("OAuth insert user error:", insertError);
        return NextResponse.redirect(
          new URL("/login/siswa?error=register_failed", origin)
        );
      }
    } else {
      // 4b. Email sudah ada → pakai data yang sudah ada
      username = existingUser.username;
      role = existingUser.role;
      avatar = existingUser.avatar || "/images/avatar-1.svg";

      // Jika sebelumnya akun guru, tolak masuk via siswa OAuth
      if (role === "guru") {
        return NextResponse.redirect(
          new URL("/login/guru?error=use_guru_login", origin)
        );
      }
    }

    // 5. Buat session cookie mathora_auth_session (sama seperti loginUser())
    const sessionPayload = encodeURIComponent(
      JSON.stringify({ username, role })
    );

    const response = NextResponse.redirect(
      new URL("/dashboard/siswa", origin)
    );

    // Set cookie dengan masa berlaku 7 hari
    response.cookies.set("mathora_auth_session", sessionPayload, {
      path: "/",
      maxAge: 7 * 24 * 3600,
      sameSite: "lax",
      httpOnly: false, // Harus bisa dibaca client untuk sinkronisasi localStorage
    });

    // Set cookie sementara berisi data user lengkap untuk sinkronisasi localStorage
    // (dibaca oleh halaman dashboard saat pertama kali load)
    const userDataPayload = encodeURIComponent(
      JSON.stringify({ username, email: email.toLowerCase(), role, avatar, createdAt: new Date().toISOString() })
    );
    response.cookies.set("mathora_oauth_userdata", userDataPayload, {
      path: "/",
      maxAge: 60, // 60 detik — hanya untuk handoff ke localStorage
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (err) {
    console.error("OAuth callback unexpected error:", err);
    return NextResponse.redirect(
      new URL("/login/siswa?error=server_error", origin)
    );
  }
}
