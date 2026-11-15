"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useSound } from "@/components/SoundContext";
import { getCurrentUser, logoutUser } from "@/lib/auth";

interface GameShellProps {
  children: React.ReactNode;
  backUrl?: string;
  showBack?: boolean;
}

export default function GameShell({
  children,
  backUrl,
  showBack = true,
}: GameShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; avatar?: string } | null>(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser();
    }
    return null;
  });
  const { isMuted, toggleMute, playClick } = useSound();

  // Client-Side Auth Guard: Proteksi akses halaman guru & siswa
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const isGuruPage = pathname.startsWith("/dashboard/guru") || pathname.startsWith("/bank-soal");
    const isSiswaPage = pathname.startsWith("/dashboard/siswa");
    const isSharedPage =
      pathname.startsWith("/materi") ||
      pathname.startsWith("/spldv") ||
      pathname.startsWith("/bangun-ruang") ||
      pathname.startsWith("/game-kompetitif") ||
      pathname.startsWith("/settings");

    // Jika belum login mencoba akses halaman terproteksi
    if (!user || !user.username) {
      if (isGuruPage) {
        window.location.href = "/login/guru";
        return;
      }
      if (isSiswaPage) {
        window.location.href = "/login/siswa";
        return;
      }
      if (isSharedPage) {
        window.location.href = "/login";
        return;
      }
    } else {
      // Jika siswa mencoba masuk ke halaman guru
      if (isGuruPage && user.role !== "guru") {
        window.location.href = "/dashboard/siswa";
        return;
      }
    }
  }, [pathname]);

  // Pastikan popup logout dan sidebar selalu tertutup saat navigasi atau halaman dimuat
  useEffect(() => {
    setShowLogoutModal(false);
    setSidebarOpen(false);
  }, [pathname]);

  const activeUser = currentUser || (typeof window !== "undefined" ? getCurrentUser() : null);
  const isGuru = activeUser?.role === "guru";
  const homeUrl = isGuru ? "/dashboard/guru" : "/dashboard/siswa";
  const userAvatar = activeUser?.avatar || "/images/avatar-1.svg";

  // Hitung target backUrl secara dinamis jika merujuk ke dashboard
  let resolvedBackUrl = backUrl || homeUrl;
  if (
    resolvedBackUrl === "/dashboard" ||
    resolvedBackUrl === "/dashboard/siswa" ||
    resolvedBackUrl === "/dashboard/guru"
  ) {
    resolvedBackUrl = homeUrl;
  }

  const handleBackClick = (e: React.MouseEvent) => {
    playClick();
    const u = getCurrentUser();
    const currentIsGuru = u?.role === "guru";

    if (
      resolvedBackUrl === "/dashboard" ||
      resolvedBackUrl === "/dashboard/siswa" ||
      resolvedBackUrl === "/dashboard/guru"
    ) {
      e.preventDefault();
      router.push(currentIsGuru ? "/dashboard/guru" : "/dashboard/siswa");
      return;
    }

    // Jika tombol mengarah ke login (keluar akun), tampilkan popup konfirmasi terlebih dahulu
    if (resolvedBackUrl === "/login") {
      e.preventDefault();
      setShowLogoutModal(true);
      return;
    }
  };

  const isHomeActive = pathname === "/dashboard/guru" || pathname === "/dashboard/siswa" || pathname === "/dashboard";
  const isMateriActive = pathname.startsWith("/materi") || pathname.startsWith("/spldv") || pathname.startsWith("/bangun-ruang");
  const isKompetitifActive = pathname.startsWith("/game-kompetitif");
  const isBankSoalActive = pathname.startsWith("/bank-soal");
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-2 sm:p-6 md:p-8">
      {/* Background Math Formula Doodles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <div className="absolute top-10 -right-8 w-60 sm:w-80 md:w-[420px] rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Doodle"
            width={450}
            height={280}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="absolute -top-16 -left-12 w-64 sm:w-96 md:w-[480px] -rotate-[30deg]">
          <Image
            src="/images/math-formula.png"
            alt="Doodle"
            width={500}
            height={300}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="absolute -bottom-16 right-[-2%] w-64 sm:w-96 md:w-[400px] -rotate-[136deg]">
          <Image
            src="/images/math-formula.png"
            alt="Doodle"
            width={450}
            height={320}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="absolute -bottom-12 left-[-10%] w-60 sm:w-80 md:w-[420px] rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Doodle"
            width={450}
            height={280}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Top Navbar Header with Navigation & Sound Controls */}
      <header className="relative z-20 flex w-full max-w-7xl items-center justify-between rounded-[22px] sm:rounded-[32px] border-[4px] sm:border-[7px] border-white bg-[#d3e9ff] px-2.5 sm:px-6 py-2 sm:py-3 shadow-[0px_5px_0px_0px_#aaafaf]">
        {/* Sisi Kiri: Menu Hamburger + Tombol Kembali + Logo */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Menu / Hamburger Button */}
          <button
            onClick={() => {
              playClick();
              setSidebarOpen(true);
            }}
            aria-label="Buka Menu Sidebar"
            className="group flex size-10 sm:size-12 md:size-13 items-center justify-center rounded-[14px] sm:rounded-[18px] border-[3px] sm:border-[4px] border-white bg-[#34cc9e] shadow-[0px_3px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="size-5 sm:size-6 text-white drop-shadow-sm"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Back Button (jika showBack & resolvedBackUrl aktif) */}
          {showBack && resolvedBackUrl && (
            <Link
              href={resolvedBackUrl}
              onClick={handleBackClick}
              aria-label="Kembali"
              className="group flex size-10 sm:size-12 md:size-13 items-center justify-center rounded-full border-[3px] sm:border-[4px] border-white bg-[#e05f1e] shadow-[0px_3px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 sm:size-6 text-white"
              >
                <rect x="4" y="5" width="3" height="14" rx="1" />
                <path d="M20 5.5v13a1 1 0 01-1.55.83L9.5 12.83a1 1 0 010-1.66L18.45 4.67A1 1 0 0120 5.5z" />
              </svg>
            </Link>
          )}

          {/* Logo & PKM Subtitle */}
          <Link href={homeUrl} className="flex flex-col ml-0.5 sm:ml-1 shrink-0">
            <span className="game-title-nav text-xl sm:text-3xl md:text-4xl font-bold tracking-wider uppercase leading-none">
              MATHORA
            </span>
            <span className="text-[8.5px] sm:text-xs font-bold text-[#3d1e70] tracking-tight sm:tracking-wide mt-1 whitespace-nowrap">
              🎓 PKM SMP ISLAM PARUNG
            </span>
          </Link>

          {isGuru && (
            <span className="hidden md:inline-block rounded-full bg-[#5e65e9] px-2.5 py-0.5 text-xs font-bold text-white shadow">
              GURU
            </span>
          )}
        </div>

        {/* Sisi Kanan: Tombol Suara / Musik + Profil User */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Tombol Suara / Musik (Pindah ke atas) */}
          <button
            onClick={() => {
              playClick();
              toggleMute();
            }}
            title={isMuted ? "Aktifkan Musik" : "Bisukan Musik"}
            aria-label={isMuted ? "Aktifkan Musik" : "Bisukan Musik"}
            className="flex size-10 sm:size-12 md:size-13 items-center justify-center rounded-[14px] sm:rounded-[18px] border-[3px] sm:border-[4px] border-white bg-[#5e65e9] shadow-[0px_3px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            {!isMuted ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 sm:size-6 text-white"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 sm:size-6 text-white opacity-70"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* User Profile Avatar Link */}
          <Link href="/settings" className="flex items-center gap-2 group cursor-pointer" title="Pengaturan Akun">
            <div className="hidden lg:flex flex-col text-right">
              <span className="game-font text-sm md:text-base text-[#2a2830] font-bold max-w-[100px] truncate">
                {currentUser?.username || "Pemain"}
              </span>
            </div>
            <div className="relative size-10 sm:size-12 md:size-13 overflow-hidden rounded-full border-[3px] sm:border-4 border-white shadow-md bg-purple-200 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src={userAvatar}
                alt="Avatar Profile"
                fill
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 my-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-2.5 sm:py-4">
        {children}
      </div>

      {/* Sidebar Overlay Modal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch">
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-[#7f7296]/70 backdrop-blur-xs transition-opacity"
          />

          <aside className="relative z-10 flex w-72 sm:w-80 md:w-[340px] flex-col justify-between rounded-r-[55px] sm:rounded-r-[75px] border-r-8 border-y-8 border-white bg-[#e5dbf5] p-6 sm:p-8 shadow-[0px_8px_0px_0px_#aaafaf] my-auto h-[86vh] max-h-[720px] overflow-y-auto">
            <div className="flex flex-col gap-4 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="self-end rounded-full bg-white/80 p-2 text-[#422376] hover:bg-white cursor-pointer"
                aria-label="Tutup Menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-6">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Menu Item 1: Home Dashboard */}
              <Link
                href={homeUrl}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl p-2 transition-all ${isHomeActive
                  ? "bg-[#f8f298] shadow-sm"
                  : "hover:bg-white/50"
                  }`}
              >
                <div className={`flex size-10 items-center justify-center ${isHomeActive ? "text-[#2a2830]" : "text-[#422376]"}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>
                <span className={`game-font text-2xl ${isHomeActive ? "text-[#2a2830] font-bold" : "text-[#422376]"}`}>Home</span>
              </Link>

              {/* Menu Item 2: Materi */}
              <Link
                href="/materi"
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl p-2 transition-all ${isMateriActive
                  ? "bg-[#f8f298] shadow-sm"
                  : "hover:bg-white/50"
                  }`}
              >
                <div className={`flex size-10 items-center justify-center ${isMateriActive ? "text-[#2a2830]" : "text-[#422376]"}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                  </svg>
                </div>
                <span className={`game-font text-2xl ${isMateriActive ? "text-[#2a2830] font-bold" : "text-[#422376]"}`}>Materi</span>
              </Link>

              {/* Menu Item 3: Game Kompetitif (Tarik Tambang) */}
              <Link
                href="/game-kompetitif"
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl p-2 transition-all ${isKompetitifActive
                  ? "bg-[#f8f298] shadow-sm"
                  : "hover:bg-white/50"
                  }`}
              >
                <div className="flex size-10 items-center justify-center text-[#e05f1e]">
                  <span className="text-2xl">🚩</span>
                </div>
                <span className={`game-font text-2xl ${isKompetitifActive ? "text-[#2a2830] font-bold" : "text-[#422376]"}`}>Kompetitif</span>
              </Link>

              {/* Menu Khusus Guru: Kuis & Bank Soal */}
              {isGuru && (
                <Link
                  href="/bank-soal"
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-2xl p-2 transition-all ${isBankSoalActive
                    ? "bg-[#f8f298] shadow-sm"
                    : "hover:bg-white/50"
                    }`}
                >
                  <div className="flex size-10 items-center justify-center text-[#2a2830]">
                    <span className="text-2xl">📋</span>
                  </div>
                  <span className={`game-font text-2xl ${isBankSoalActive ? "text-[#2a2830] font-bold" : "text-[#422376]"}`}>Bank Soal</span>
                </Link>
              )}

              {/* Menu Item 4: Pengaturan */}
              <Link
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl p-2 transition-all ${isSettingsActive
                  ? "bg-[#f8f298] shadow-sm"
                  : "hover:bg-white/50"
                  }`}
              >
                <div className={`flex size-10 items-center justify-center ${isSettingsActive ? "text-[#2a2830]" : "text-[#422376]"}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </div>
                <span className={`game-font text-2xl ${isSettingsActive ? "text-[#2a2830] font-bold" : "text-[#422376]"}`}>Pengaturan</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-purple-200">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setSidebarOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center rounded-2xl bg-[#fd363a] px-4 py-2.5 text-white font-bold shadow hover:brightness-110 active:translate-y-0.5 cursor-pointer"
              >
                <span className="game-font text-base text-white">Keluar Akun</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Keluar Akun */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-[32px] border-[6px] border-white bg-white p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🚪
            </div>
            <h3 className="game-font text-2xl sm:text-3xl font-bold text-[#2a2830] mb-2">
              Keluar Akun?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base font-semibold mb-6">
              Apakah Anda yakin ingin keluar dari akun MATHORA?
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-3 rounded-2xl border-[3px] border-gray-300 bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowLogoutModal(false);
                  logoutUser();
                  window.location.href = "/login";
                }}
                className="flex-1 py-3 rounded-2xl border-[3px] border-white bg-[#fd363a] font-bold text-white shadow hover:brightness-110 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
