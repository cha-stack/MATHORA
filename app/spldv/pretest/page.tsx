"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { SECTION_1_PRETEST, SECTION_2_PRETEST, buildPretestPool, QuestionItem } from "@/lib/questions";
import { getMateriProgress, saveMateriProgress, getCurrentUser } from "@/lib/auth";
import ScratchpadModal from "@/components/ScratchpadModal";

function PretestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const sectionNum = sectionParam === "2" ? 2 : 1;

  const { playClick, playCorrect } = useSound();

  // Modal Coretan Hitungan
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Proteksi: Guru tidak memerlukan pre-test sama sekali!
  useEffect(() => {
    const u = getCurrentUser();
    if (u?.role === "guru") {
      router.replace(`/spldv/materi?section=${sectionNum}`);
      return;
    }
    if (sectionNum === 2) {
      const p = getMateriProgress();
      if (!p.section2_unlocked) {
        alert("Section 2 masih terkunci!");
        router.replace("/spldv");
      }
    }
  }, [sectionNum, router]);

  // Pool soal: statis (terstandarisasi) + generated (variatif tiap sesi)
  // useMemo dengan seed konstan awal agar aman saat prerender
  const questions: QuestionItem[] = useMemo(
    () => buildPretestPool(sectionNum, 3, sectionNum * 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userScore, setUserScore] = useState(0);

  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    playClick();
    setSelectedOption(idx);
  };

  const handleTampilkanHasil = () => {
    if (selectedOption === null) {
      alert("Pilih salah satu jawaban terlebih dahulu!");
      return;
    }
    playCorrect();
    setShowAnswer(true);

    if (selectedOption === currentQ.correctIndex) {
      setUserScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    playClick();
    setShowAnswer(false);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hitung skor akhir pre-test
      const finalScore = Math.round((userScore / questions.length) * 100);

      // Simpan progress & skor
      if (sectionNum === 1) {
        saveMateriProgress({
          section1_pretest: true,
          section1_pretest_score: finalScore,
          section1_pretest_correct: userScore,
        });
      } else {
        saveMateriProgress({
          section2_pretest: true,
          section2_pretest_score: finalScore,
          section2_pretest_correct: userScore,
        });
      }

      // Tampilkan screen hasil evaluasi pre-test
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playClick();
      setShowAnswer(false);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // TAMPILAN SCREEN HASIL PRETEST (Bisa dilihat kapan saja & ada navigasi lanjut materi)
  if (isFinished) {
    const finalScore = Math.round((userScore / questions.length) * 100);
    const isLulus = finalScore >= 60;
    return (
      <div className="flex w-full flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="relative w-full max-w-2xl rounded-[36px] border-[8px] border-white bg-[#e4d3ff]/95 p-8 shadow-2xl text-center">
          <span className="rounded-full bg-[#1cd8a4] px-4 py-1 text-xs font-bold text-[#144837] shadow">
            Pre-Test Selesai
          </span>
          <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold my-3">
            Hasil Pre-Test Section {sectionNum}
          </h2>

          <div className="relative my-4 flex size-44 mx-auto items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-b from-[#f8f298] to-[#f4ad21] shadow-[0px_8px_0px_0px_#aaafaf]">
            <div className="flex flex-col items-center">
              <span className="game-font text-6xl font-bold text-[#2a2830]">
                {finalScore}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2a2830]/80">
                Poin Kamu
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg font-bold text-[#2a2830]">
            Kamu menjawab benar <b>{userScore}</b> dari <b>{questions.length}</b> soal.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1">
            {isLulus
              ? "🎉 Pemahaman awalmu sangat baik! Yuk perdalam lagi lewat materi interaktif."
              : "💪 Jangan khawatir, ini tes awal. Pelajari materi interaktif agar semakin paham!"}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                playClick();
                setCurrentIndex(0);
                setSelectedOption(null);
                setShowAnswer(false);
                setUserScore(0);
                setIsFinished(false);
              }}
              className="rounded-2xl border-4 border-white bg-zinc-600 px-6 py-2.5 game-font text-base font-bold text-white shadow hover:scale-102 cursor-pointer"
            >
              Ulangi Tes
            </button>
            <Link
              href={`/spldv/materi?section=${sectionNum}`}
              className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-2.5 game-font text-base font-bold text-[#144837] shadow hover:scale-103"
            >
              Lanjut ke Materi &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* Modal Papan Coretan */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title={`Coretan Hitungan - Soal #${currentIndex + 1}`}
      />

      {/* Header Badge */}
      <div className="mb-4">
        <div className="rounded-[32px] border-[7px] border-white bg-[#fdffd3] px-8 py-2.5 shadow-[0px_5px_0px_0px_#aaafaf]">
          <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold tracking-wider uppercase text-center">
            QUIZ • PRE-TEST
          </h2>
        </div>
      </div>

      {/* Main Big Glass Card (Sesuai Desain Figma 183:247) */}
      <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[38px] border-[7px] border-white bg-[#e4d3ff]/80 p-6 sm:p-9 shadow-2xl backdrop-blur-xs flex flex-col justify-between min-h-[480px]">
        
        {/* Top Section: Dua Persamaan Linear Jika Tersedia */}
        {currentQ.equations && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-5">
            <div className="flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white bg-[#e4d3ff]/70 p-4 shadow-[0px_4px_0px_0px_#aaafaf]">
              <span className="game-font text-2xl sm:text-3xl text-black font-bold tracking-wide">
                {currentQ.equations.eq1}
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">
                {currentQ.equations.label1}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white bg-[#e4d3ff]/70 p-4 shadow-[0px_4px_0px_0px_#aaafaf]">
              <span className="game-font text-2xl sm:text-3xl text-black font-bold tracking-wide">
                {currentQ.equations.eq2}
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">
                {currentQ.equations.label2}
              </span>
            </div>
          </div>
        )}

        {/* Question Text */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-white/70 px-3 py-1 rounded-full shadow-xs">
              Soal {currentIndex + 1} dari {questions.length} • {currentQ.context || "SPLDV"}
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-bold text-[#2a2830] leading-snug">
            {currentQ.question}
          </p>
        </div>

        {/* Options List A, B, C, D */}
        <div className="flex flex-col gap-3 my-auto">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let optionBg = "bg-white/70 border-white hover:bg-white/90 text-[#2a2830]";
            let letterBg = "bg-white text-[#2a2830]";

            if (showAnswer) {
              if (isCorrect) {
                // Jawaban benar DISOROT HIJAU (#4ade80 / #16a34a)
                optionBg = "bg-[#4ade80] border-emerald-600 shadow-[0px_4px_0px_0px_#16a34a] text-[#052e16] font-bold";
                letterBg = "bg-emerald-700 text-white";
              } else if (isSelected) {
                // Jawaban salah yang dipilih user disorot merah pudar
                optionBg = "bg-rose-200/85 border-rose-400 shadow-[0px_3px_0px_0px_#fb7185] text-rose-950 font-semibold";
                letterBg = "bg-rose-500 text-white";
              } else {
                // Pilihan salah lainnya disorot merah pudar ringan agar tidak ambigu
                optionBg = "bg-rose-50/90 border-rose-200 text-rose-800/85";
                letterBg = "bg-rose-200 text-rose-800";
              }
            } else if (isSelected) {
              optionBg = "bg-[#d3e9ff] border-blue-400 shadow-[0px_4px_0px_0px_#0284c7] text-[#0c4a6e] font-semibold";
              letterBg = "bg-[#0284c7] text-white";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`flex items-center gap-4 rounded-[22px] border-[4px] px-5 py-3 text-left transition-all cursor-pointer ${optionBg}`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full border-2 border-white game-font text-base font-semibold shadow-xs ${letterBg}`}
                >
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span className="text-base sm:text-lg font-semibold flex-1">
                  {opt}
                </span>

                {showAnswer && isCorrect && (
                  <span className="flex size-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow font-bold text-sm">
                    ✓
                  </span>
                )}
                {showAnswer && !isCorrect && isSelected && (
                  <span className="flex size-7 items-center justify-center rounded-full bg-white text-rose-500 shadow font-bold text-sm">
                    ✗
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showAnswer && (
          <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-950 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
            <span className="font-bold block mb-1">💡 Pembahasan Kunci Jawaban:</span>
            {currentQ.explanation}
          </div>
        )}

        {/* Bottom Actions Row (Sesuai Figma: Tombol Buka Coretan + Periksa dan Tampilkan Hasil) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-purple-300/60">
          {/* Tombol Buka Coretan */}
          <button
            onClick={() => {
              playClick();
              setIsScratchpadOpen(true);
            }}
            className="flex items-center gap-2 rounded-[18px] border-[4px] border-white bg-[#5e65e9] px-5 py-2.5 shadow-[0px_4px_0px_0px_#3d43ab] text-white game-font text-sm sm:text-base font-bold hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <span>✏️</span>
            <span>Buka Coretan</span>
          </button>

          {/* Tombol Periksa dan Tampilkan Hasil */}
          <button
            onClick={handleTampilkanHasil}
            disabled={showAnswer}
            className={`flex items-center gap-2 rounded-[18px] border-[4px] border-white px-6 py-2.5 shadow-[0px_4px_0px_0px_#028560] game-font text-sm sm:text-base font-bold transition-all ${
              showAnswer
                ? "bg-emerald-300 text-emerald-900 opacity-80 cursor-default"
                : "bg-[#1cd8a4] text-[#144837] hover:scale-102 active:translate-y-1 cursor-pointer"
            }`}
          >
            <span>🔍</span>
            <span>{showAnswer ? "Kunci Jawaban Tampil (Hijau)" : "Periksa dan Tampilkan Hasil"}</span>
          </button>
        </div>

      </div>

      {/* Floating Bottom Prev/Next Arrows (Sesuai Figma Navigasi Panah Kiri & Kanan) */}
      <div className="flex w-full max-w-4xl items-center justify-between mt-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex size-12 sm:size-14 items-center justify-center rounded-full border-[4px] border-white bg-[#5e65e9] text-white shadow-[0px_4px_0px_0px_#aaafaf] transition-all ${
            currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:translate-y-1 cursor-pointer"
          }`}
          aria-label="Soal Sebelumnya"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 sm:size-7 rotate-180">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <span className="game-font text-sm sm:text-base font-bold text-white drop-shadow">
          Slide Soal {currentIndex + 1} / {questions.length}
        </span>

        <button
          onClick={handleNext}
          className="flex size-12 sm:size-14 items-center justify-center rounded-full border-[4px] border-white bg-[#1cd8a4] text-white shadow-[0px_4px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 cursor-pointer"
          aria-label="Lanjut Soal Berikutnya"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 sm:size-7">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default function SpldvPretestPage() {
  return (
    <GameShell backUrl="/spldv" showBack={true}>
      <Suspense fallback={<div className="game-font text-white text-2xl">Memuat Pre-Test...</div>}>
        <PretestContent />
      </Suspense>
    </GameShell>
  );
}
