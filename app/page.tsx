"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSound } from "@/components/SoundContext";

export default function Home() {
  const [showExitModal, setShowExitModal] = useState(false);
  const { isMuted, toggleMute, playClick } = useSound();

  const handlePlayClick = () => {
    playClick();
  };

  const handleExit = () => {
    playClick();
    setShowExitModal(true);
  };

  const handleToggleSound = () => {
    toggleMute();
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4 sm:p-6">
      {/* Background Math Formula Doodles - reduced sizes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        {/* Top-left formula */}
        <div className="absolute -top-4 -left-4 w-36 sm:w-48 md:w-60 rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 1"
            width={300}
            height={200}
            sizes="(max-width: 640px) 150px, 240px"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Top-right formula */}
        <div className="absolute -top-8 -right-8 w-44 sm:w-64 md:w-80 -rotate-[30deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 2"
            width={350}
            height={220}
            sizes="(max-width: 640px) 180px, 320px"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Left middle formula */}
        <div className="absolute top-[35%] -left-6 w-32 sm:w-44 md:w-56 -rotate-[10deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 3"
            width={280}
            height={180}
            sizes="(max-width: 640px) 140px, 220px"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right middle graph formula */}
        <div className="absolute top-[38%] -right-10 w-40 sm:w-60 md:w-80 rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 5"
            width={360}
            height={240}
            sizes="(max-width: 640px) 160px, 320px"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Bottom right coordinate graph */}
        <div className="absolute -bottom-10 right-[8%] w-44 sm:w-64 md:w-80 -rotate-[21deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 6"
            width={360}
            height={240}
            sizes="(max-width: 640px) 180px, 320px"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Bottom left formula */}
        <div className="absolute -bottom-12 -left-8 w-40 sm:w-56 md:w-72 rotate-[15deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 7"
            width={320}
            height={220}
            sizes="(max-width: 640px) 160px, 280px"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Top Spacer for Balance */}
      <div className="w-full h-2 sm:h-6 shrink-0" />

      {/* Central Hero: Title + Subtitle + Play Button (Tersusun Padu & Tidak Renggang) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4 max-w-3xl">
        {/* Badge PKM */}
        <div className="mb-2 sm:mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#f8f298] px-4 sm:px-5 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-[#422376] shadow-md border-2 border-white">
          <span>🎓</span>
          <span>PKM SMP ISLAM PARUNG</span>
        </div>

        {/* Big Game Title */}
        <h1 className="game-title-mathora text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider uppercase leading-none drop-shadow-md">
          MATHORA
        </h1>

        {/* Subtitle */}
        <div className="game-title-sub mt-1.5 sm:mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase leading-tight">
          <p className="m-0">BELAJAR</p>
          <p className="m-0 -mt-1 sm:-mt-2">MATEMATIKA</p>
        </div>

        {/* Play Button - Berjarak Dekat & Proporsional */}
        <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col items-center">
          <Link
            href="/login"
            onClick={handlePlayClick}
            aria-label="Mulai Game - Menuju Pilihan Login"
            className="group relative flex items-center justify-center transition-all duration-200 hover:scale-108 active:scale-95 focus:outline-none cursor-pointer"
          >
            {/* Play Button Outer Soft Glow */}
            <div className="absolute -inset-2.5 rounded-full bg-[#1cd8a4]/30 blur-md group-hover:bg-[#1cd8a4]/50 transition-all" />

            {/* Main Round Container with Border and 3D shadow */}
            <div className="relative flex size-20 sm:size-24 md:size-28 lg:size-32 items-center justify-center rounded-full border-[6px] sm:border-[7px] border-white bg-gradient-to-b from-[#1cd8a4] to-[#04b886] shadow-[0px_7px_0px_0px_#028560,0px_12px_18px_rgba(0,0,0,0.35)] group-hover:brightness-105 group-active:shadow-[0px_3px_0px_0px_#028560] group-active:translate-y-[4px]">
              {/* Play Triangle Icon */}
              <div className="ml-2 sm:ml-2.5 md:ml-3 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-10 sm:size-12 md:size-14 lg:size-16 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                >
                  <path d="M8 5.14v13.72a1 1 0 001.55.83l11.08-6.86a1 1 0 000-1.66L9.55 4.31A1 1 0 008 5.14z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Controls */}
      <div className="relative z-10 flex w-full max-w-7xl items-end justify-between px-2 sm:px-6 pb-2 sm:pb-4 shrink-0">
        {/* Exit Button */}
        <button
          onClick={handleExit}
          className="group relative flex items-center justify-center rounded-[16px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#e05f1e] px-5 py-2 sm:px-8 sm:py-2.5 shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
        >
          <span className="game-font text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0px_2px_0px_#aaafaf]">
            Keluar
          </span>
        </button>

        {/* Right Corner Button (Audio / Settings) */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Aktifkan Musik" : "Bisukan Musik"}
          aria-label="Pengaturan Suara"
          className="group relative flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-[16px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#5e65e9] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-110 hover:scale-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
        >
          {!isMuted ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6 sm:size-7 md:size-8 text-white"
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
              className="size-6 sm:size-7 md:size-8 text-white opacity-80"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center rounded-3xl border-4 border-white bg-gradient-to-b from-[#65439e] to-[#482b78] p-6 sm:p-8 text-center shadow-2xl max-w-sm w-full">
            <h2 className="game-font text-2xl sm:text-3xl font-bold text-white mb-3">
              Keluar Game?
            </h2>
            <p className="text-white/90 text-sm sm:text-base mb-6 font-medium">
              Apakah kamu yakin ingin keluar dari game MATHORA?
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 rounded-2xl border-4 border-white bg-zinc-500 py-2.5 game-font text-lg text-white shadow-[0px_4px_0px_0px_#333] hover:brightness-110 active:translate-y-1 active:shadow-none cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  if (typeof window !== "undefined") {
                    window.location.href = "https://www.google.com";
                  }
                }}
                className="flex-1 rounded-2xl border-4 border-white bg-[#e05f1e] py-2.5 game-font text-lg text-white shadow-[0px_4px_0px_0px_#aaafaf] hover:brightness-110 active:translate-y-1 active:shadow-none cursor-pointer"
              >
                Ya, Keluar Chrome
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
