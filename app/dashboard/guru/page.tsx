"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardGuru() {
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.username || "Guru";
    }
    return "Guru";
  });

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
        <div className="w-full text-left px-2 sm:px-6 mb-8 sm:mb-10">
          <div className="inline-block rounded-full bg-[#1cd8a4] px-4 py-1 text-xs sm:text-sm font-bold text-[#144837] mb-2 shadow">
            Panel Pendidik &amp; Pengampu • SMP Islam Parung
          </div>
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Halo {displayName},
          </h2>
          <p className="text-white/90 text-lg sm:text-2xl font-medium">
            Kelola pembelajaran kelas, bank soal kuis, dan aktivitas game tim.
          </p>
        </div>

        {/* 3 Main Action Cards for Teacher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl px-2">
          {/* Card 1: Kuis & Bank Soal */}
          <Link
            href="/bank-soal"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#fef08a] to-[#fde047] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#e05f1e] px-4 py-1 text-xs font-bold text-white shadow">
                  Fitur Guru
                </span>
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Kuis &amp; Bank Soal
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Akses bank soal lengkap dengan fitur <b>&quot;Tampilkan Hasil&quot;</b> untuk menyorot kunci jawaban benar (warna hijau).
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between font-bold text-[#e05f1e] pt-4 border-t border-amber-300">
              <span className="game-font text-lg">Buka Bank Soal</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Game Kompetitif (Tarik Tambang) */}
          <Link
            href="/game-kompetitif"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#ffd3d3] to-[#fca5a5] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#ef4444] px-4 py-1 text-xs font-bold text-white shadow">
                  Aktivitas Tim Kelas
                </span>
                <span className="text-4xl">🚩</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Game Kompetitif
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Tarik Tambang Matematika antar tim siswa. Adu cepat dan tepat menyelesaikan soal SPLDV &amp; Bangun Ruang secara seru!
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between font-bold text-[#ef4444] pt-4 border-t border-rose-300">
              <span className="game-font text-lg">Mulai Tarik Tambang</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 3: Modul Materi (SPLDV & Bangun Ruang) */}
          <Link
            href="/materi"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#d3e9ff] to-[#bae6fd] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#0284c7] px-4 py-1 text-xs font-bold text-white shadow">
                  Kurikulum
                </span>
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Modul Materi
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Akses materi lengkap berisi kartu SPLDV bertingkat serta visualisasi 3D Bangun Ruang interaktif.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between font-bold text-[#0284c7] pt-4 border-t border-sky-300">
              <span className="game-font text-lg">Lihat Materi</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
