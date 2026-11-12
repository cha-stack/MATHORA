"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser } from "@/lib/auth";

export default function MateriIndexPage() {
  const [backDashboard, setBackDashboard] = useState(() => {
    if (typeof window !== "undefined") {
      const u = getCurrentUser();
      return u?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa";
    }
    return "/dashboard/guru";
  });

  useEffect(() => {
    const u = getCurrentUser();
    if (u?.role === "guru") {
      setBackDashboard("/dashboard/guru");
    } else {
      setBackDashboard("/dashboard/siswa");
    }
  }, []);

  return (
    <GameShell backUrl={backDashboard} showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Header */}
        <div className="w-full text-center px-4 mb-8">
          <div className="inline-block rounded-full bg-[#f8f298] px-4 py-1 text-xs sm:text-sm font-bold text-[#422376] mb-2 shadow">
            Kurikulum Matematika SMP Islam Parung
          </div>
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Pilih Modul Materi
          </h2>
          <p className="text-white/90 text-base sm:text-xl font-medium max-w-xl mx-auto">
            Pelajari konsep matematika dengan visual interaktif 3D, simulasi geser, dan kuis pemantapan.
          </p>
        </div>

        {/* 2 Big Cards: SPLDV & Bangun Ruang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          {/* Card 1: SPLDV */}
          <Link
            href="/spldv"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#fef08a] to-[#fde047] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#e05f1e] px-4 py-1 text-xs font-bold text-white shadow">
                  Tingkatan Bertahap
                </span>
                <span className="text-3xl">📐</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Materi SPLDV
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Pelajari Sistem Persamaan Linear Dua Variabel mulai dari Pengertian dasar, Unsur variabel & koefisien, hingga metode eliminasi & substitusi.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between font-bold text-[#e05f1e] pt-4 border-t border-amber-300">
              <span className="game-font text-base sm:text-lg">Buka Modul SPLDV</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Bangun Ruang */}
          <Link
            href="/bangun-ruang/materi"
            className="group relative flex flex-col justify-between rounded-[36px] border-[8px] border-white bg-gradient-to-b from-[#d3e9ff] to-[#bae6fd] p-8 shadow-[0px_8px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-[#0284c7] px-4 py-1 text-xs font-bold text-white shadow">
                  3D Interaktif
                </span>
                <span className="text-3xl">🧊</span>
              </div>
              <h3 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold mb-2">
                Bangun Ruang
              </h3>
              <p className="text-[#2a2830]/85 text-sm sm:text-base font-semibold leading-relaxed">
                Jelajahi model 3D kubus, balok, prisma, limas, tabung, kerucut, dan bola yang bisa diputar 360°, disertai kalkulator lab ukuran langsung.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between font-bold text-[#0284c7] pt-4 border-t border-sky-300">
              <span className="game-font text-base sm:text-lg">Buka Modul 3D</span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
