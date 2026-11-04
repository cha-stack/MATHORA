"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardSiswa() {
  const [displayName, setDisplayName] = useState("Dardar");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      setDisplayName(user.username);
    }
  }, []);

  return (
    <GameShell backUrl="/login" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Welcome Text */}
        <div className="w-full text-left px-2 sm:px-6 mb-8 sm:mb-12">
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Halo {displayName},
          </h2>
          <p className="text-white/90 text-lg sm:text-2xl font-medium">
            Udah siap belajar MTK blom hari enih?
          </p>
        </div>

        {/* Roadmap Timeline with Cards */}
        <div className="relative w-full max-w-5xl py-8">
          {/* Main Horizontal Connecting Bar */}
          <div className="absolute top-1/2 left-8 right-8 h-4 -translate-y-1/2 rounded-full bg-[#a8b7b8] border-2 border-white shadow-md hidden md:block" />

          {/* Cards & Nodes Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center">
            {/* 1. Materi SPLDV (Kiri Atas) */}
            <div className="flex flex-col items-center">
              <Link
                href="/spldv"
                className="group relative flex h-48 w-full max-w-[320px] flex-col items-center justify-center rounded-[32px] border-[7px] border-white bg-[#f8f298] p-6 text-center shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold">
                  Materi SPLDV
                </span>
                <span className="mt-3 inline-block rounded-full bg-[#e05f1e] px-4 py-1 text-xs sm:text-sm font-bold text-white shadow">
                  Klik untuk Mulai
                </span>
              </Link>
              {/* Connector Pin */}
              <div className="mt-4 hidden md:flex flex-col items-center">
                <div className="h-6 w-3 bg-white" />
                <div className="size-10 rounded-full border-4 border-white bg-[#f8f298] shadow-md" />
              </div>
            </div>

            {/* 2. Materi Bangun Ruang (Tengah Bawah) */}
            <div className="flex flex-col-reverse md:flex-col items-center md:pt-16">
              {/* Connector Pin */}
              <div className="mb-4 hidden md:flex flex-col items-center">
                <div className="size-10 rounded-full border-4 border-white bg-[#d3e9ff] shadow-md" />
                <div className="h-6 w-3 bg-white" />
              </div>
              <Link
                href="/bangun-ruang/materi"
                className="group relative flex h-48 w-full max-w-[320px] flex-col items-center justify-center rounded-[32px] border-[7px] border-white bg-[#d3e9ff] p-6 text-center shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold">
                  Materi Bangun Ruang
                </span>
                <span className="mt-3 inline-block rounded-full bg-[#5e65e9] px-4 py-1 text-xs sm:text-sm font-bold text-white shadow">
                  3D Interaktif &rarr;
                </span>
              </Link>
            </div>

            {/* 3. Game Kompetitif (Kanan Atas) */}
            <div className="flex flex-col items-center">
              <div className="group relative flex h-48 w-full max-w-[320px] flex-col items-center justify-center rounded-[32px] border-[7px] border-white bg-[#ffd3d3] p-6 text-center shadow-[0px_7px_0px_0px_#aaafaf] opacity-90">
                <span className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold">
                  Game Kompetitif
                </span>
                <span className="mt-3 inline-block rounded-full bg-zinc-500 px-4 py-1 text-xs sm:text-sm font-bold text-white">
                  Terkunci
                </span>
              </div>
              {/* Connector Pin */}
              <div className="mt-4 hidden md:flex flex-col items-center">
                <div className="h-6 w-3 bg-white" />
                <div className="size-10 rounded-full border-4 border-white bg-[#ffd3d3] shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
