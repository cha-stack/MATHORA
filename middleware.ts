import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * MATHORA Security Middleware
 * Melindungi rute Guru & Siswa agar tidak bisa diakses tanpa login atau salah role.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Abaikan static assets, gambar, suara, atau file berekstensi
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sounds") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Ambil cookie sesi auth
  const sessionCookie = request.cookies.get("mathora_auth_session")?.value;
  let session: { username: string; role: string } | null = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      session = null;
    }
  }

  const isLoggedIn = Boolean(session && session.username && session.role);
  const isGuru = session?.role === "guru";
  const isSiswa = session?.role === "siswa";

  // 1. RUTE KHUSUS GURU (Wajib login sebagai Guru)
  const isGuruRoute =
    pathname.startsWith("/dashboard/guru") ||
    pathname.startsWith("/bank-soal");

  // 2. RUTE KHUSUS SISWA (Wajib login sebagai Siswa)
  const isSiswaRoute =
    pathname.startsWith("/dashboard/siswa") ||
    pathname.startsWith("/spldv");

  // 3. RUTE BERSAMA YANG WAJIB LOGIN (Siswa / Guru)
  const isSharedProtectedRoute =
    pathname.startsWith("/materi") ||
    pathname.startsWith("/bangun-ruang") ||
    pathname.startsWith("/game-kompetitif") ||
    pathname.startsWith("/settings");

  // ─── A. JIKA BELUM LOGIN MENCOBA AKSES HALAMAN TERPROTEKSI ───────────────
  if (!isLoggedIn) {
    if (isGuruRoute) {
      return NextResponse.redirect(new URL("/login/guru", request.url));
    }
    if (isSiswaRoute) {
      return NextResponse.redirect(new URL("/login/siswa", request.url));
    }
    if (isSharedProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ─── B. JIKA SUDAH LOGIN, PROTEKSI ROLE / HAK AKSES ───────────────────────
  if (isLoggedIn) {
    // Siswa TIDAK BOLEH masuk ke Dashboard Guru atau Bank Soal
    if (isGuruRoute && !isGuru) {
      return NextResponse.redirect(new URL("/dashboard/siswa", request.url));
    }

    // Guru yang membuka dashboard siswa diarahkan ke dashboard guru
    if (pathname === "/dashboard/siswa" && isGuru) {
      return NextResponse.redirect(new URL("/dashboard/guru", request.url));
    }

    // Jika sudah login tapi membuka halaman login, langsung arahkan ke dashboard
    if (
      pathname === "/login" ||
      pathname === "/login/guru" ||
      pathname === "/login/siswa"
    ) {
      const dest = isGuru ? "/dashboard/guru" : "/dashboard/siswa";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Terapkan ke semua rute aplikasi kecuali file statis & asset
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|sounds|.*\\..*).*)",
  ],
};
