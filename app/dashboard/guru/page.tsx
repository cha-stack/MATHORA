"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardGuru() {
  const [displayName, setDisplayName] = useState("Guru");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      setDisplayName(user.username);
    }
  }, []);

  return (
    <GameShell backUrl="/login" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Welcome Header */}
        <div className="w-full text-left px-2 sm:px-6 mb-8">
          <div className="inline-block rounded-full bg-[#1cd8a4] px-4 py-1 text-sm font-bold text-[#144837] mb-2 shadow">
            Panel Pendidik / Guru
          </div>
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Halo {displayName},
          </h2>
          <p className="text-white/90 text-lg sm:text-2xl font-medium">
            Kelola materi pembelajaran, kuis evaluasi, dan pantau progres siswa.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1: Kuis & Bank Soal */}
          <Link
            href="/spldv/pretest"
            className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#f8f298] p-6 shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer min-h-[220px]"
          >
            <div>
              <span className="inline-block rounded-full bg-[#e05f1e] px-3 py-1 text-xs font-bold text-white mb-3">
                Evaluasi
              </span>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Kuis & Bank Soal
              </h3>
              <p className="text-[#2a2830]/80 text-sm font-medium">
                Review dan uji coba paket soal Pre-test & Post-test untuk siswa.
              </p>
            </div>
            <div className="mt-4 flex items-center font-bold text-[#e05f1e] text-sm group-hover:translate-x-1 transition-transform">
              Lihat Kuis &rarr;
            </div>
          </Link>

          {/* Card 2: Materi Pembelajaran */}
          <Link
            href="/spldv/materi"
            className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#d3e9ff] p-6 shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer min-h-[220px]"
          >
            <div>
              <span className="inline-block rounded-full bg-[#5e65e9] px-3 py-1 text-xs font-bold text-white mb-3">
                Kurikulum
              </span>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Materi SPLDV
              </h3>
              <p className="text-[#2a2830]/80 text-sm font-medium">
                Pratinjau slide pembelajaran interaktif dan simulasi matematika.
              </p>
            </div>
            <div className="mt-4 flex items-center font-bold text-[#5e65e9] text-sm group-hover:translate-x-1 transition-transform">
              Buka Materi &rarr;
            </div>
          </Link>

          {/* Card 3: Statistik Siswa */}
          <div className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#ffd3d3] p-6 shadow-[0px_7px_0px_0px_#aaafaf] min-h-[220px]">
            <div>
              <span className="inline-block rounded-full bg-[#e05f1e] px-3 py-1 text-xs font-bold text-white mb-3">
                Rekap Data
              </span>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Progres Siswa
              </h3>
              <p className="text-[#2a2830]/80 text-sm font-medium">
                Daftar nilai evaluasi dan statistik ketuntasan belajar siswa.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#2a2830]/70 font-semibold">
              <span>Status: Siap Ditautkan</span>
              <span className="rounded-md bg-white/70 px-2 py-0.5">Lokal / Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
