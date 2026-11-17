"use client";

import Link from "next/link";
import { useState } from "react";
import { QuestionItem } from "@/lib/questions";
import { useSound } from "@/components/SoundContext";

interface TestReviewBreakdownProps {
  questions: QuestionItem[];
  userAnswers: Record<number, number>;
  sectionNum: number;
  testType: "pretest" | "posttest";
  onRestart: () => void;
  nextHref: string;
  nextLabel: string;
  backHref?: string;
  backLabel?: string;
}

export default function TestReviewBreakdown({
  questions,
  userAnswers,
  sectionNum,
  testType,
  onRestart,
  nextHref,
  nextLabel,
  backHref,
  backLabel,
}: TestReviewBreakdownProps) {
  const { playClick } = useSound();
  const [filter, setFilter] = useState<"all" | "correct" | "wrong">("all");

  const totalQuestions = questions.length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (userAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);
  const wrongCount = totalQuestions - correctCount;
  const finalScore = Math.round((correctCount / totalQuestions) * 100);
  const isLulus = finalScore >= 60;
  const isPosttest = testType === "posttest";

  const questionResults = questions.map((q, idx) => {
    const userAns = userAnswers[idx];
    const isAnswered = userAns !== undefined && userAns !== null;
    const isCorrect = isAnswered && userAns === q.correctIndex;
    return {
      q,
      idx,
      userAns,
      isAnswered,
      isCorrect,
    };
  });

  const filteredQuestions = questionResults.filter((item) => {
    if (filter === "correct") return item.isCorrect;
    if (filter === "wrong") return !item.isCorrect;
    return true;
  });

  return (
    <div className="flex w-full flex-col items-center animate-in zoom-in-95 duration-200 py-2 sm:py-4">
            <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[40px] border-[7px] border-white bg-[#e4d3ff]/95 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center text-center">
                <span
          className={`rounded-full px-4 py-1 text-xs sm:text-sm font-bold shadow ${
            isPosttest ? "bg-[#16a34a] text-white" : "bg-[#1cd8a4] text-[#144837]"
          }`}
        >
          {isPosttest ? "Evaluasi Akhir • Post-Test" : "Evaluasi Awal • Pre-Test"}
        </span>

                <h2 className="game-font text-2xl sm:text-4xl text-[#2a2830] font-bold my-3">
          Hasil {isPosttest ? "Post-Test" : "Pre-Test"} Section {sectionNum}
        </h2>

                <div className="relative my-3 flex size-36 sm:size-44 mx-auto items-center justify-center rounded-full border-[7px] border-white bg-gradient-to-b from-[#f8f298] to-[#f4ad21] shadow-[0px_6px_0px_0px_#aaafaf]">
          <div className="flex flex-col items-center">
            <span className="game-font text-5xl sm:text-6xl font-bold text-[#2a2830]">
              {finalScore}
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2a2830]/80">
              Poin Kamu
            </span>
          </div>
        </div>

                <p className="text-base sm:text-lg font-bold text-[#2a2830]">
          Kamu menjawab benar <span className="text-emerald-700 font-extrabold">{correctCount}</span> dari{" "}
          <span className="font-extrabold">{totalQuestions}</span> soal ({finalScore}%).
        </p>

                <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1 max-w-xl">
          {isPosttest ? (
            isLulus ? (
              <span className="text-emerald-800">
                🏆 Hebat sekali! Kamu berhasil menguasai materi Section {sectionNum} dengan gemilang!
              </span>
            ) : (
              <span className="text-amber-800">
                💪 Tetap semangat! Coba pelajari lagi materi interaktif dan ulangi evaluasi untuk hasil maksimal.
              </span>
            )
          ) : isLulus ? (
            <span className="text-emerald-800">
              🎉 Pemahaman awalmu sangat baik! Yuk perdalam konsepnya lewat materi interaktif.
            </span>
          ) : (
            <span className="text-purple-900">
              💪 Jangan khawatir, ini adalah tes awal. Simak pembahasan di bawah lalu pelajari materi interaktif agar makin paham!
            </span>
          )}
        </p>

                {isPosttest && isLulus && sectionNum < 5 && (
          <div className="my-3 w-full max-w-lg rounded-2xl bg-emerald-100 border-2 border-emerald-400 p-2.5 text-xs sm:text-sm font-bold text-emerald-900 shadow-xs">
            🔓 Selamat! Section {sectionNum + 1} sekarang sudah TERBUKA!
          </div>
        )}

                <div className="my-4 grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg">
          <div className="rounded-2xl border-2 border-white bg-white/80 p-2.5 shadow-xs">
            <span className="block text-[11px] sm:text-xs font-bold text-gray-600">Total Soal</span>
            <span className="game-font text-lg sm:text-2xl font-bold text-purple-950">{totalQuestions}</span>
          </div>
          <div className="rounded-2xl border-2 border-white bg-emerald-100/90 p-2.5 shadow-xs">
            <span className="block text-[11px] sm:text-xs font-bold text-emerald-800">Jawaban Benar</span>
            <span className="game-font text-lg sm:text-2xl font-bold text-emerald-700">{correctCount}</span>
          </div>
          <div className="rounded-2xl border-2 border-white bg-rose-100/90 p-2.5 shadow-xs">
            <span className="block text-[11px] sm:text-xs font-bold text-rose-800">Jawaban Salah</span>
            <span className="game-font text-lg sm:text-2xl font-bold text-rose-600">{wrongCount}</span>
          </div>
        </div>

                <div className="mt-2 flex flex-wrap gap-3 justify-center w-full">
          {backHref && (
            <Link
              href={backHref}
              onClick={() => playClick()}
              className="rounded-2xl border-4 border-white bg-zinc-600 px-5 py-2.5 game-font text-sm sm:text-base font-bold text-white shadow hover:scale-102 cursor-pointer transition-all"
            >
              {backLabel || "Kembali"}
            </Link>
          )}

          <button
            onClick={() => {
              playClick();
              onRestart();
            }}
            className="rounded-2xl border-4 border-white bg-amber-500 px-5 py-2.5 game-font text-sm sm:text-base font-bold text-white shadow hover:scale-102 cursor-pointer transition-all"
          >
            🔄 Ulangi Tes
          </button>

          <Link
            href={nextHref}
            onClick={() => playClick()}
            className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-6 py-2.5 game-font text-sm sm:text-base font-bold text-[#144837] shadow hover:scale-103 cursor-pointer transition-all"
          >
            {nextLabel} &rarr;
          </Link>
        </div>

                <div className="mt-8 w-full border-t border-purple-300/80 pt-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="game-font text-xl sm:text-2xl font-bold text-[#2a2830] flex items-center gap-2">
                <span>📋</span>
                <span>Pembahasan & Rekap Soal</span>
              </h3>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                Cek soal mana yang benar atau salah, beserta langkah penyelesaian lengkapnya.
              </p>
            </div>

                        <div className="inline-flex rounded-2xl bg-white/70 p-1 border-2 border-white self-start sm:self-auto shadow-xs">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setFilter("all");
                }}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  filter === "all" ? "bg-[#5e65e9] text-white shadow-xs" : "text-gray-700 hover:bg-white"
                }`}
              >
                Semua ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setFilter("correct");
                }}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  filter === "correct" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:bg-white"
                }`}
              >
                Benar ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setFilter("wrong");
                }}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  filter === "wrong" ? "bg-rose-600 text-white shadow-xs" : "text-rose-800 hover:bg-white"
                }`}
              >
                Salah ({wrongCount})
              </button>
            </div>
          </div>

                    <div className="flex flex-col gap-4">
            {filteredQuestions.map(({ q, idx, userAns, isAnswered, isCorrect }) => (
              <div
                key={q.id || idx}
                className={`rounded-[26px] border-[4px] p-5 transition-all shadow-sm ${
                  isCorrect
                    ? "border-emerald-400 bg-white/95"
                    : "border-rose-300 bg-white/95"
                }`}
              >
                                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#5e65e9] px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                      Soal #{idx + 1}
                    </span>
                    {q.context && (
                      <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 text-[11px] font-bold">
                        {q.context}
                      </span>
                    )}
                  </div>

                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-400 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                      <span>✓</span>
                      <span>Jawaban Benar</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-400 px-3 py-1 text-xs font-bold text-rose-800 shadow-2xs">
                      <span>✗</span>
                      <span>Jawaban Kurang Tepat</span>
                    </span>
                  )}
                </div>

                                {q.equations && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <div className="rounded-xl border-2 border-purple-200 bg-purple-50/70 p-2.5 text-center">
                      <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">
                        {q.equations.eq1}
                      </span>
                      <span className="block text-[11px] text-gray-600 font-semibold">
                        {q.equations.label1}
                      </span>
                    </div>
                    <div className="rounded-xl border-2 border-purple-200 bg-purple-50/70 p-2.5 text-center">
                      <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">
                        {q.equations.eq2}
                      </span>
                      <span className="block text-[11px] text-gray-600 font-semibold">
                        {q.equations.label2}
                      </span>
                    </div>
                  </div>
                )}

                                <p className="text-base sm:text-lg font-bold text-[#2a2830] mb-3 leading-relaxed">
                  {q.question}
                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = userAns === optIdx;
                    const isCorrectAnswer = optIdx === q.correctIndex;

                    let optStyle = "border-gray-200 bg-gray-50/70 text-gray-700";
                    let badgeLabel: string | null = null;
                    let badgeStyle = "";

                    if (isCorrectAnswer) {
                      optStyle = "border-emerald-500 bg-emerald-100/90 text-emerald-950 font-bold shadow-xs";
                      badgeLabel = "✓ Kunci Benar";
                      badgeStyle = "bg-emerald-600 text-white";
                    } else if (isUserChoice && !isCorrect) {
                      optStyle = "border-rose-400 bg-rose-100/90 text-rose-950 font-bold shadow-xs";
                      badgeLabel = "✗ Pilihanmu";
                      badgeStyle = "bg-rose-600 text-white";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between gap-2 rounded-xl border-2 p-2.5 text-xs sm:text-sm ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                              isCorrectAnswer
                                ? "bg-emerald-700 text-white"
                                : isUserChoice
                                ? "bg-rose-600 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {["A", "B", "C", "D"][optIdx]}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>

                        {badgeLabel && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
                            {badgeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                                <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-3.5 sm:p-4 text-[#2a2830]">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs sm:text-sm mb-1">
                    <span>💡</span>
                    <span>Langkah Penyelesaian / Pembahasan:</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

                    <div className="mt-8 flex flex-wrap gap-3 justify-center w-full">
            <button
              onClick={() => {
                playClick();
                onRestart();
              }}
              className="rounded-2xl border-4 border-white bg-amber-500 px-6 py-2.5 game-font text-sm sm:text-base font-bold text-white shadow hover:scale-102 cursor-pointer transition-all"
            >
              🔄 Ulangi Tes
            </button>
            <Link
              href={nextHref}
              onClick={() => playClick()}
              className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-2.5 game-font text-sm sm:text-base font-bold text-[#144837] shadow hover:scale-103 cursor-pointer transition-all"
            >
              {nextLabel} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
