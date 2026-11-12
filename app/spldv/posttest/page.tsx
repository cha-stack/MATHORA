"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { SECTION_1_POSTTEST, SECTION_2_POSTTEST, buildPosttestPool, QuestionItem } from "@/lib/questions";
import { getMateriProgress, saveMateriProgress, getCurrentUser } from "@/lib/auth";
import ScratchpadModal from "@/components/ScratchpadModal";

function PosttestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const sectionNum = sectionParam === "2" ? 2 : 1;

  const { playClick, playCorrect } = useSound();
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Validasi prasyarat: Khusus Siswa (Guru bebas tanpa post-test)
  useEffect(() => {
    const u = getCurrentUser();
    if (u?.role === "guru") {
      router.replace(`/spldv/materi?section=${sectionNum}`);
      return;
    }
    const p = getMateriProgress();
    if (sectionNum === 1) {
      if (!p.section1_pretest) {
        alert("Kamu harus mengerjakan Pre-Test Section 1 terlebih dahulu!");
        router.replace("/spldv/pretest?section=1");
      } else if (!p.section1_materi) {
        alert("Kamu harus mempelajari Materi Section 1 terlebih dahulu sebelum Post-Test!");
        router.replace("/spldv/materi?section=1");
      }
    } else {
      if (!p.section2_unlocked) {
        alert("Section 2 masih terkunci!");
        router.replace("/spldv");
      } else if (!p.section2_pretest) {
        alert("Kamu harus mengerjakan Pre-Test Section 2 terlebih dahulu!");
        router.replace("/spldv/pretest?section=2");
      } else if (!p.section2_materi) {
        alert("Kamu harus mempelajari Materi Section 2 terlebih dahulu sebelum Post-Test!");
        router.replace("/spldv/materi?section=2");
      }
    }
  }, [sectionNum, router]);

  const questions: QuestionItem[] = useMemo(
    () => buildPosttestPool(sectionNum, 3, sectionNum * 200),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
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
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    playClick();
    setShowAnswer(false);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = Math.round((correctCount / questions.length) * 100);

      // Selesaikan Post-test & Simpan Skor serta Kunci Unlock Section 2
      if (sectionNum === 1) {
        saveMateriProgress({
          section1_posttest: true,
          section1_posttest_score: finalScore,
          section1_posttest_correct: correctCount,
          section2_unlocked: true,
        });
      } else {
        saveMateriProgress({
          section2_posttest: true,
          section2_posttest_score: finalScore,
          section2_posttest_correct: correctCount,
        });
      }
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

  if (isFinished) {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex w-full flex-col items-center">
        <div className="relative w-full max-w-2xl rounded-[36px] border-[8px] border-white bg-[#e4d3ff]/95 p-8 shadow-2xl text-center">
          <span className="rounded-full bg-[#16a34a] px-4 py-1 text-xs font-bold text-white shadow">
            Post-Test Selesai
          </span>
          <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-bold my-3">
            Hasil Evaluasi Section {sectionNum}
          </h2>

          <div className="relative my-4 flex size-40 mx-auto items-center justify-center rounded-full border-[7px] border-white bg-gradient-to-b from-[#f8f298] to-[#f4ad21] shadow-md">
            <span className="game-font text-5xl font-bold text-[#2a2830]">
              {finalScore}
            </span>
          </div>

          <p className="text-base sm:text-lg font-bold text-[#2a2830]">
            Kamu berhasil menjawab benar <b>{correctCount}</b> dari <b>{questions.length}</b> soal!
          </p>

          {sectionNum === 1 && (
            <div className="my-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 p-3 text-xs sm:text-sm font-bold text-emerald-900">
              🔓 Selamat! Section 2 (Variabel & Koefisien) sekarang sudah TERBUKA!
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/spldv"
              className="rounded-2xl border-4 border-white bg-[#5e65e9] px-6 py-2.5 game-font text-base font-bold text-white shadow hover:scale-103"
            >
              Kembali ke Menu SPLDV
            </Link>
            {sectionNum === 1 && (
              <Link
                href="/spldv/pretest?section=2"
                className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-6 py-2.5 game-font text-base font-bold text-[#144837] shadow hover:scale-103"
              >
                Lanjut ke Section 2 &rarr;
              </Link>
            )}
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
            QUIZ • POST-TEST
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

export default function SpldvPosttestPage() {
  return (
    <GameShell backUrl="/spldv" showBack={true}>
      <Suspense fallback={<div className="game-font text-white text-2xl">Memuat Post-Test...</div>}>
        <PosttestContent />
      </Suspense>
    </GameShell>
  );
}
