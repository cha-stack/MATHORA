"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { getMateriProgress } from "@/lib/auth";

function HasilEvaluasiContent() {
  const searchParams = useSearchParams();
  const secParam = searchParams.get("section");
  const typeParam = searchParams.get("type"); // "pre" | "post"

  const sectionNum = secParam === "2" ? 2 : 1;
  const isPosttest = typeParam === "post";

  const [score, setScore] = useState<number>(100);
  const [correctCount, setCorrectCount] = useState<number>(3);
  const [totalCount, setTotalCount] = useState<number>(isPosttest ? 3 : 4);

  useEffect(() => {
    const p = getMateriProgress();
    if (isPosttest) {
      if (sectionNum === 1) {
        if (p.section1_posttest_score !== undefined) setScore(p.section1_posttest_score);
        if (p.section1_posttest_correct !== undefined) setCorrectCount(p.section1_posttest_correct);
      } else {
        if (p.section2_posttest_score !== undefined) setScore(p.section2_posttest_score);
        if (p.section2_posttest_correct !== undefined) setCorrectCount(p.section2_posttest_correct);
      }
      setTotalCount(3);
    } else {
      if (sectionNum === 1) {
        if (p.section1_pretest_score !== undefined) setScore(p.section1_pretest_score);
        if (p.section1_pretest_correct !== undefined) setCorrectCount(p.section1_pretest_correct);
      } else {
        if (p.section2_pretest_score !== undefined) setScore(p.section2_pretest_score);
        if (p.section2_pretest_correct !== undefined) setCorrectCount(p.section2_pretest_correct);
      }
      setTotalCount(4);
    }
  }, [sectionNum, isPosttest]);

  const isLulus = score >= 60;
  const testTitle = isPosttest ? "Post-Test" : "Pre-Test";

  return (
    <div className="flex w-full flex-col items-center animate-in zoom-in-95 duration-200">
      {/* Main Result Card */}
      <div className="relative w-full max-w-2xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center text-center">
        
        {/* Header Title */}
        <span className={`rounded-full px-4 py-1 text-xs font-bold shadow mb-1 ${
          isPosttest ? "bg-[#16a34a] text-white" : "bg-[#1cd8a4] text-[#144837]"
        }`}>
          {isPosttest ? "Evaluasi Akhir Materi" : "Evaluasi Awal Materi"}
        </span>
        <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] mb-3 font-bold">
          Hasil {testTitle} Section {sectionNum}
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
            className={`inline-block rounded-full px-6 py-2 game-font text-base sm:text-lg font-bold text-white shadow ${
              isLulus ? "bg-[#1cd8a4]" : "bg-[#e05f1e]"
            }`}
          >
            {isLulus
              ? isPosttest
                ? "Hebat! Kamu Menguasai Materi Ini"
                : "Kerja Bagus! Pemahaman Awal Baik"
              : "Jangan Menyerah, Pelajari & Coba Lagi!"}
          </span>
          <p className="mt-3 text-base sm:text-lg font-semibold text-[#2a2830]">
            Kamu menjawab benar <b>{correctCount}</b> dari <b>{totalCount}</b> soal.
          </p>

          {isPosttest && sectionNum === 1 && isLulus && (
            <div className="mt-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 p-2.5 text-xs sm:text-sm font-bold text-emerald-900">
              🔓 Section 2 (Variabel & Koefisien) sudah Terbuka!
            </div>
          )}
        </div>

        {/* Action Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link
            href={isPosttest ? `/spldv/posttest?section=${sectionNum}` : `/spldv/pretest?section=${sectionNum}`}
            className="flex-1 rounded-2xl border-4 border-white bg-zinc-600 py-3 game-font text-base sm:text-lg font-bold text-white shadow-[0px_4px_0px_0px_#333] hover:scale-102 active:translate-y-1 active:shadow-none"
          >
            Ulangi Tes
          </Link>
          
          {isPosttest ? (
            <Link
              href={sectionNum === 1 ? "/spldv/pretest?section=2" : "/spldv"}
              className="flex-1 rounded-2xl border-4 border-white bg-[#1cd8a4] py-3 game-font text-base sm:text-lg font-bold text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:scale-102 active:translate-y-1 active:shadow-none"
            >
              {sectionNum === 1 ? "Lanjut Sec. 2 &rarr;" : "Kembali ke Menu"}
            </Link>
          ) : (
            <Link
              href={`/spldv/materi?section=${sectionNum}`}
              className="flex-1 rounded-2xl border-4 border-white bg-[#1cd8a4] py-3 game-font text-base sm:text-lg font-bold text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:scale-102 active:translate-y-1 active:shadow-none"
            >
              Buka Materi &rarr;
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

export default function HasilEvaluasiPage() {
  return (
    <GameShell backUrl="/spldv" showBack={true}>
      <Suspense fallback={<div className="game-font text-white text-2xl">Memuat Hasil...</div>}>
        <HasilEvaluasiContent />
      </Suspense>
    </GameShell>
  );
}
