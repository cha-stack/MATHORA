"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";

export default function HasilPretest() {
  const [score, setScore] = useState<number>(100);
  const [correctCount, setCorrectCount] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(5);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScore = sessionStorage.getItem("pretest_score");
      const storedCorrect = sessionStorage.getItem("pretest_correct_count");
      const storedTotal = sessionStorage.getItem("pretest_total_count");
      if (storedScore !== null) {
        setScore(parseInt(storedScore, 10));
      }
      if (storedCorrect !== null) setCorrectCount(parseInt(storedCorrect, 10));
      if (storedTotal !== null) setTotalCount(parseInt(storedTotal, 10));
    }
  }, []);

  const isLulus = score >= 60;

  return (
    <GameShell backUrl="/spldv" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Result Card */}
        <div className="relative w-full max-w-2xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center text-center">
          {/* Header Title */}
          <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] mb-6 font-bold">
            Hasil Pre-Test
          </h2>

          {/* Big Score Bubble */}
          <div className="relative my-4 flex size-44 sm:size-52 items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-b from-[#f8f298] to-[#f4ad21] shadow-[0px_8px_0px_0px_#aaafaf]">
            <div className="flex flex-col items-center">
              <span className="game-font text-6xl sm:text-7xl font-bold text-[#2a2830]">
                {score}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2a2830]/80">
                Poin Kamu
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-4 mb-2">
            <span
              className={`inline-block rounded-full px-6 py-2 game-font text-lg sm:text-xl font-bold text-white shadow ${
                isLulus ? "bg-[#1cd8a4]" : "bg-[#e05f1e]"
              }`}
            >
              {isLulus ? "Kerja Bagus! Siap Belajar" : "Jangan Menyerah, Ayo Pahami Materi!"}
            </span>
            <p className="mt-3 text-base sm:text-lg font-semibold text-[#2a2830]">
              Kamu menjawab benar <b>{correctCount}</b> dari <b>{totalCount}</b> soal.
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Link
              href="/spldv/pretest"
              className="flex-1 rounded-2xl border-4 border-white bg-zinc-600 py-3 game-font text-lg font-bold text-white shadow-[0px_4px_0px_0px_#333] hover:scale-102 active:translate-y-1 active:shadow-none"
            >
              Ulangi Tes
            </Link>
            <Link
              href="/spldv/materi"
              className="flex-1 rounded-2xl border-4 border-white bg-[#1cd8a4] py-3 game-font text-lg font-bold text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:scale-102 active:translate-y-1 active:shadow-none"
            >
              Mulai Materi &rarr;
            </Link>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
