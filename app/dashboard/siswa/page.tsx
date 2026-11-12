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
    <GameShell backUrl="/login" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Welcome Text */}
        <div className="w-full text-left px-2 sm:px-6 mb-8 sm:mb-10">
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

        {/* Siswa Hanya Punya 2 Fitur: Materi & Game Kompetitif */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-2">
          {/* Card 1: Materi Pembelajaran */}
          <Link
            href="/materi"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#fef08a] to-[#fde047] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#e05f1e] px-4 py-1 text-xs font-bold text-white shadow">
                  Eksplorasi
                </span>
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Materi Belajar
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Buka materi SPLDV bertahap (dengan Pre-test & Post-test) serta model 3D Bangun Ruang yang bisa diputar 360°.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between font-bold text-[#e05f1e] pt-4 border-t border-amber-300">
              <span className="game-font text-lg">Mulai Belajar</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Game Kompetitif Tarik Tambang */}
          <Link
            href="/game-kompetitif"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#ffd3d3] to-[#fca5a5] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#dc2626] px-4 py-1 text-xs font-bold text-white shadow">
                  Adu Cepat Tim
                </span>
                <span className="text-4xl">🚩</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Game Kompetitif
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Tarik Tambang Online bersama teman kelas! Jawab cepat soal matematika untuk menarik tali tambang ke timmu!
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between font-bold text-[#dc2626] pt-4 border-t border-rose-300">
              <span className="game-font text-lg">Masuk Game Tim</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
