"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { setAuthCookie, CURRENT_USER_KEY, UserAccount } from "@/lib/auth";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Menyelesaikan login Google...");

  useEffect(() => {
    async function processAuth() {
      // 1. Ambil target role dari query params
      const targetRole = (searchParams.get("role") === "guru" ? "guru" : "siswa") as "siswa" | "guru";
      const loginUrl = `/login/${targetRole}`;

      // 2. Cek apakah ada error dari query (?error=...) atau dari URL hash (#error=...)
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);

      const errorParam =
        urlParams.get("error_description") ||
        hashParams.get("error_description") ||
        urlParams.get("error") ||
        hashParams.get("error");

      if (errorParam) {
        console.error("OAuth Error from provider:", errorParam);
        window.location.href = `${loginUrl}?error=${encodeURIComponent(errorParam)}`;
        return;
      }

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

      if (!supabaseUrl || !supabaseAnonKey) {
        window.location.href = `${loginUrl}?error=supabase_not_configured`;
        return;
      }

      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 3. Tangani PKCE authorization code (?code=...) jika ada
        const code = urlParams.get("code");
        let session = null;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            session = data.session;
          }
        }

        // 4. Jika belum ada session dari code, ambil dari hash fragment (#access_token=...)
        if (!session) {
          const { data: sessionData } = await supabase.auth.getSession();
          session = sessionData?.session;
        }

        if (!session || !session.user || !session.user.email) {
          console.error("Session tidak ditemukan di callback.");
          window.location.href = `${loginUrl}?error=no_session`;
          return;
        }

        const email = session.user.email.toLowerCase();
        const googleName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          "";

        setStatusMessage("Menyiapkan akun Anda...");

        // 5. Cek tabel users MATHORA
        const { data: existingUser } = await supabase
          .from("users")
          .select("username, email, role, avatar")
          .eq("email", email)
          .maybeSingle();

        let activeUsername = "";
        let activeRole = targetRole;
        let activeAvatar = "/images/avatar-1.svg";

        if (!existingUser) {
          // Buat akun baru otomatis
          const rawName = googleName || email.split("@")[0];
          const sanitized = rawName.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
          const prefix = targetRole === "guru" ? "guru_" : "siswa_";
          const baseUsername =
            sanitized.length >= 3 ? sanitized : `${prefix}${Date.now().toString().slice(-5)}`;

          const { data: usernameCheck } = await supabase
            .from("users")
            .select("username")
            .eq("username", baseUsername)
            .maybeSingle();

          activeUsername = usernameCheck
            ? `${baseUsername}_${Date.now().toString().slice(-4)}`
            : baseUsername;
          activeRole = targetRole;

          const { error: insertError } = await supabase.from("users").insert({
            username: activeUsername,
            email,
            password: "",
            role: activeRole,
            avatar: activeAvatar,
          });

          if (insertError) {
            console.error("Gagal auto-insert user OAuth:", insertError);
            window.location.href = `${loginUrl}?error=register_failed`;
            return;
          }
        } else {
          // Jika akun sudah ada, periksa kesesuaian role
          if (existingUser.role !== targetRole) {
            const dest = existingUser.role === "guru" ? "/login/guru" : "/login/siswa";
            window.location.href = `${dest}?error=role_mismatch_${existingUser.role}`;
            return;
          }
          activeUsername = existingUser.username;
          activeRole = existingUser.role as "siswa" | "guru";
          activeAvatar = existingUser.avatar || activeAvatar;
        }

        // 6. Simpan sesi aktif ke localStorage dan Cookie Middleware
        const activeUser: UserAccount = {
          username: activeUsername,
          email,
          password: "",
          role: activeRole,
          avatar: activeAvatar,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
        setAuthCookie(activeUser);

        // 7. Berhasil! Arahkan ke dashboard tujuan
        const dest = activeRole === "guru" ? "/dashboard/guru" : "/dashboard/siswa";
        window.location.href = dest;
      } catch (err) {
        console.error("Callback unexpected error:", err);
        window.location.href = `${loginUrl}?error=server_error`;
      }
    }

    processAuth();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] text-white p-4">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-sm w-full text-center">
        <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="game-font text-xl font-bold">{statusMessage}</p>
        <p className="text-sm opacity-80">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#482b78] text-white">
          <p>Memuat...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
