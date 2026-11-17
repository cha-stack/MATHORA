"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardSiswa() {
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.username || "Siswa";
    }
    return "Siswa";
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      setDisplayName(user.username);
    }
  }, []);

  return (
    <GameShell showBack={false}>
      <div className="flex w-full flex-col items-center">
        {/* Welcome Text */}
        <div className="w-full text-left px-2 sm:px-6 mb-6 sm:mb-8">
          <div className="inline-block rounded-full bg-[#f8f298] px-4 py-1 text-xs sm:text-sm font-bold text-[#422376] mb-2 shadow">
            Siswa SMP Islam Parung
          </div>
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Halo {displayName},
          </h2>
          <p className="text-white/90 text-lg sm:text-2xl font-medium">
            Udah siap belajar matematika seru hari ini?
          </p>
        </div>

        {/* Siswa Punya 3 Fitur Utama: Materi, Game Kompetitif & Studio Karakter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full max-w-5xl px-2">
          {/* Card 1: Materi Pembelajaran */}
          <Link
            href="/materi"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#fef08a] to-[#fde047] p-6 sm:p-7 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#e05f1e] px-4 py-1 text-xs font-bold text-white shadow">
                  Eksplorasi
                </span>
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Materi Belajar
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Buka materi SPLDV bertahap (dengan Pre-test & Post-test) serta model 3D Bangun Ruang interaktif.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between font-bold text-[#e05f1e] pt-3 border-t border-amber-300">
              <span className="game-font text-base sm:text-lg">Mulai Belajar</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Game Kompetitif Tarik Tambang */}
          <Link
            href="/game-kompetitif"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#ffd3d3] to-[#fca5a5] p-6 sm:p-7 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#dc2626] px-4 py-1 text-xs font-bold text-white shadow">
                  Adu Cepat Tim
                </span>
                <span className="text-4xl">🚩</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Game Kompetitif
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Tarik Tambang Online bersama teman kelas! Jawab cepat soal matematika untuk menarik tali ke timmu!
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between font-bold text-[#dc2626] pt-3 border-t border-rose-300">
              <span className="game-font text-base sm:text-lg">Masuk Game Tim</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 3: Studio Karakter 2D */}
          <Link
            href="/karakter"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#f3e8ff] to-[#d8b4fe] p-6 sm:p-7 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#7c3aed] px-4 py-1 text-xs font-bold text-white shadow">
                  Kustomisasi
                </span>
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Studio Karakter
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Desain avatar 2D sesukamu dengan ribuan gaya rambut, mata, baju sekolah, warna, dan aksesoris!
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between font-bold text-[#7c3aed] pt-3 border-t border-purple-300">
              <span className="game-font text-base sm:text-lg">Kustom Karakter</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
