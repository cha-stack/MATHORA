"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getCurrentUser, getSectionState } from "@/lib/auth";

export default function DashboardSiswa() {
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.username || "Siswa";
    }
    return "Siswa";
  });

  const [progressSummary, setProgressSummary] = useState({
    completedSections: 0,
    totalSections: 5,
    percent: 0,
    currentSection: 1,
    sectionDetails: [] as { num: number; done: boolean; unlocked: boolean }[],
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      setDisplayName(user.username);
    }

    // Hitung ringkasan progres 5 Section SPLDV
    let completed = 0;
    let nextSec = 1;
    const details = [];
    for (let i = 1; i <= 5; i++) {
      const st = getSectionState(i);
      const isDone = Boolean(st.posttest);
      if (isDone) completed++;
      if (st.unlocked) nextSec = i;
      details.push({
        num: i,
        done: isDone,
        unlocked: Boolean(st.unlocked),
      });
    }

    setProgressSummary({
      completedSections: completed,
      totalSections: 5,
      percent: Math.round((completed / 5) * 100),
      currentSection: nextSec,
      sectionDetails: details,
    });
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

        {/* Widget Progres Belajar Khusus Role Siswa */}
        <div className="w-full max-w-4xl px-2 mb-8">
          <div className="rounded-[32px] border-[6px] border-white bg-white/95 p-5 sm:p-6 shadow-[0px_6px_0px_0px_#aaafaf] backdrop-blur-xs flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#5e65e9] text-white text-lg shadow-xs">
                  📈
                </span>
                <div>
                  <h3 className="game-font text-lg sm:text-2xl text-[#2a2830] font-bold">
                    Progres Belajar Matematika Kamu
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                    {progressSummary.completedSections === 5
                      ? "Hebat! Kamu telah menuntaskan seluruh 5 tahapan materi SPLDV!"
                      : "Selesaikan materi dan kuis untuk membuka tahapan berikutnya."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-[#f8f298] px-3.5 py-1 text-xs sm:text-sm font-bold text-[#422376] border border-amber-300 shadow-xs">
                  {progressSummary.completedSections} dari 5 Tahap ({progressSummary.percent}%)
                </span>
              </div>
            </div>

            {/* Progress Bar Kartun */}
            <div className="flex flex-col gap-1.5">
              <div className="h-4 sm:h-5 w-full rounded-full bg-[#f0eaff] p-0.5 border-2 border-purple-200 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1cd8a4] to-[#5e65e9] transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.max(progressSummary.percent, 4)}%` }}
                />
              </div>
            </div>

            {/* Step Indicators (5 Tahap) */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {progressSummary.sectionDetails.map((sec) => (
                <Link
                  key={sec.num}
                  href={`/spldv/materi?section=${sec.num}`}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 p-2 sm:p-2.5 transition-all cursor-pointer ${
                    sec.done
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-xs hover:scale-103"
                      : sec.unlocked
                      ? "border-[#5e65e9] bg-purple-50 text-[#422376] shadow-xs hover:scale-103"
                      : "border-gray-200 bg-gray-50 text-gray-400 opacity-70 cursor-not-allowed"
                  }`}
                  title={`Tahap ${sec.num}: ${sec.done ? "Selesai" : sec.unlocked ? "Terbuka" : "Terkunci"}`}
                >
                  <span className="text-base sm:text-xl">
                    {sec.done ? "⭐" : sec.unlocked ? "📖" : "🔒"}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold mt-0.5">
                    Tahap {sec.num}
                  </span>
                </Link>
              ))}
            </div>

            {/* Aksi Lanjutkan Belajar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {progressSummary.completedSections === 5
                  ? "Semua materi tuntas. Uji kemampuanmu di Game Kompetitif!"
                  : `Lanjutkan ke Tahap ${progressSummary.currentSection} sekarang`}
              </span>
              <Link
                href={`/spldv/materi?section=${progressSummary.currentSection}`}
                className="flex items-center gap-1.5 rounded-xl border-2 border-white bg-[#5e65e9] px-4 py-2 text-white font-bold text-xs sm:text-sm shadow-[0px_3px_0px_0px_#3d43ab] hover:scale-102 active:translate-y-0.5"
              >
                <span>Lanjutkan Belajar</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Siswa Punya 2 Fitur: Materi & Game Kompetitif */}
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
