"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSound } from "@/components/SoundContext";
import { getCurrentUser } from "@/lib/auth";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; avatar?: string } | null>(null);
  const { isMuted, toggleMute, playClick } = useSound();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const isGuru = currentUser?.role === "guru";
  const homeUrl = isGuru ? "/dashboard/guru" : "/dashboard/siswa";
  const userAvatar = currentUser?.avatar || "/images/avatar.png";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-3 sm:p-6 md:p-8">
      {/* Background Math Formula Doodles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
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

      {/* Top Navbar Header */}
      <header className="relative z-20 flex w-full max-w-7xl items-center justify-between rounded-[24px] sm:rounded-[32px] border-[5px] sm:border-[7px] border-white bg-[#d3e9ff] px-6 sm:px-8 py-3 sm:py-4 shadow-[0px_5px_0px_0px_#aaafaf]">
        <Link href={homeUrl} className="flex items-center gap-3">
          <span className="game-title-mathora text-3xl sm:text-5xl font-bold tracking-wider uppercase leading-none">
            MATHORA
          </span>
          {isGuru && (
            <span className="hidden sm:inline-block rounded-full bg-[#5e65e9] px-3 py-1 text-xs font-bold text-white shadow">
              GURU
            </span>
          )}
        </Link>
        <Link href="/settings" className="flex items-center gap-3 group cursor-pointer" title="Pengaturan Akun">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="game-font text-base text-[#2a2830] font-bold">
              {currentUser?.username || "Pemain"}
            </span>
            <span className="text-xs text-[#2a2830]/70 font-semibold capitalize">
              {currentUser?.role || "Siswa"}
            </span>
          </div>
          <div className="relative size-12 sm:size-14 overflow-hidden rounded-full border-4 border-white shadow-md bg-purple-200 group-hover:scale-105 transition-transform">
            <Image
              src={userAvatar}
              alt="Avatar Profile"
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 my-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-4">
        {children}
      </div>

      {/* Bottom Floating Controls (Menu Button & Back Button) */}
      <div className="relative z-20 flex w-full max-w-7xl items-end justify-between px-2 sm:px-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Menu / Hamburger Button -> Toggle Sidebar */}
          <button
            onClick={() => {
              playClick();
              setSidebarOpen(true);
            }}
            aria-label="Buka Menu Sidebar"
            className="group flex size-14 sm:size-16 md:size-[68px] items-center justify-center rounded-[18px] sm:rounded-[20px] border-[5px] sm:border-[6px] border-white bg-[#34cc9e] shadow-[0px_5px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="size-7 sm:size-8 text-white drop-shadow-sm"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Back Button */}
          {showBack && backUrl && (
            <Link
              href={backUrl}
              onClick={playClick}
              aria-label="Kembali"
              className="group flex size-14 sm:size-16 md:size-[68px] items-center justify-center rounded-full border-[5px] sm:border-[6px] border-white bg-[#e05f1e] shadow-[0px_5px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-7 sm:size-8 text-white"
              >
                <rect x="4" y="5" width="3" height="14" rx="1" />
                <path d="M20 5.5v13a1 1 0 01-1.55.83L9.5 12.83a1 1 0 010-1.66L18.45 4.67A1 1 0 0120 5.5z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Right Corner Sound/Music Pill */}
        <button
          onClick={() => {
            playClick();
            toggleMute();
          }}
          title={isMuted ? "Aktifkan Musik" : "Bisukan Musik"}
          className="flex size-14 sm:size-16 md:size-[68px] items-center justify-center rounded-[18px] sm:rounded-[20px] border-[5px] sm:border-[6px] border-white bg-[#5e65e9] shadow-[0px_5px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 cursor-pointer"
        >
          {!isMuted ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7 sm:size-8 text-white"
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
              className="size-7 sm:size-8 text-white opacity-70"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Overlay Modal (node 79:352) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch">
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-[#7f7296]/70 backdrop-blur-xs transition-opacity"
          />

          {/* Sidebar Drawer Container */}
          <aside className="relative z-10 flex w-72 sm:w-80 md:w-[340px] flex-col justify-between rounded-r-[55px] sm:rounded-r-[75px] border-r-8 border-y-8 border-white bg-[#e5dbf5] p-6 sm:p-8 shadow-[0px_8px_0px_0px_#aaafaf] my-auto h-[84vh] max-h-[700px] overflow-y-auto">
            <div className="flex flex-col gap-5 sm:gap-6 pt-2">
              {/* Close Button top-right inside drawer */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="self-end rounded-full bg-white/80 p-2 text-[#422376] hover:bg-white cursor-pointer"
                aria-label="Tutup Menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="size-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Menu Item 1: Home Dashboard */}
              <Link
                href={homeUrl}
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-white/50"
              >
                <div className="flex size-10 items-center justify-center text-[#422376]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>
                <span className="game-font text-2xl sm:text-3xl text-[#422376]">
                  Home
                </span>
              </Link>

              {/* Menu Item 2: SPLDV */}
              <Link
                href="/spldv"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-white/50"
              >
                <div className="flex size-10 items-center justify-center text-[#422376]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                  </svg>
                </div>
                <span className="game-font text-2xl sm:text-3xl text-[#422376]">
                  SPLDV
                </span>
              </Link>

              {/* Menu Khusus Guru: Quiz / Pre-test & Post-test */}
              {isGuru && (
                <Link
                  href="/spldv/pretest"
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-white/50 bg-[#f8f298]/60"
                >
                  <div className="flex size-10 items-center justify-center text-[#e05f1e]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="game-font text-2xl sm:text-3xl text-[#2a2830]">
                    Quiz / Tes
                  </span>
                </Link>
              )}

              {/* Menu Item 3: Bangun Ruang */}
              <Link
                href="/bangun-ruang/materi"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-white/50"
              >
                <div className="flex size-10 items-center justify-center text-[#422376]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.91 12.21 21.96 12 21.96C11.79 21.96 11.59 21.91 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.09 11.79 2.04 12 2.04C12.21 2.04 12.41 2.09 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
                  </svg>
                </div>
                <span className="game-font text-2xl sm:text-3xl text-[#422376] leading-tight">
                  Bangun Ruang
                </span>
              </Link>

              {/* Menu Item 4: Settings */}
              <Link
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-white/50"
              >
                <div className="flex size-10 items-center justify-center text-[#422376]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </div>
                <span className="game-font text-2xl sm:text-3xl text-[#422376]">
                  Settings
                </span>
              </Link>
            </div>

            {/* Logout button in drawer footer */}
            <div className="pt-4 border-t border-purple-200">
              <Link
                href="/login"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-[#fd363a] px-4 py-2 text-white font-bold shadow hover:brightness-110"
              >
                <span className="game-font text-lg text-white">Keluar Akun</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
