"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { generateProceduralQuestions, Question } from "@/lib/questions";

export default function SpldvPretest() {
  const router = useRouter();
  const { playClick } = useSound();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(90); // 90 detik

  // Inisialisasi paket soal acak
  useEffect(() => {
    const list = generateProceduralQuestions(5);
    setQuestions(list);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions, userAnswers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (idx: number) => {
    playClick();
    setSelectedOption(idx);
  };

  const finishQuiz = (answersToCalculate?: number[]) => {
    const finalAnswers = answersToCalculate || userAnswers;
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / Math.max(1, questions.length)) * 100);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pretest_score", score.toString());
      sessionStorage.setItem("pretest_correct_count", correctCount.toString());
      sessionStorage.setItem("pretest_total_count", questions.length.toString());
      sessionStorage.setItem("pretest_is_correct", score >= 60 ? "true" : "false");
    }

    router.push("/spldv/hasil");
  };

  const handleNext = () => {
    if (selectedOption === null) {
      alert("Pilih salah satu jawaban terlebih dahulu!");
      return;
    }

    playClick();
    const updated = [...userAnswers, selectedOption];
    setUserAnswers(updated);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz(updated);
    }
  };

  const currentQ = questions[currentIndex];

  if (!currentQ) {
    return (
      <GameShell backUrl="/dashboard/siswa" showBack={true}>
        <div className="game-font text-2xl text-white">Memuat Soal Pre-Test...</div>
      </GameShell>
    );
  }

  return (
    <GameShell backUrl="/dashboard/siswa" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Top Badges (Pre Test & Timer) */}
        <div className="flex w-full max-w-4xl items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[24px] border-[5px] border-white bg-[#fdffd3] px-6 py-2 shadow-[0px_5px_0px_0px_#aaafaf]">
              <span className="game-font text-xl sm:text-2xl font-bold text-[#2a2830]">
                PRE-TEST
              </span>
            </div>
            <div className="rounded-xl border-[4px] border-white bg-[#5e65e9] px-4 py-1.5 shadow-[0px_4px_0px_0px_#aaafaf]">
              <span className="game-font text-base sm:text-lg font-bold text-white">
                Soal {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center rounded-xl border-[4px] border-white bg-[#fd363a] px-5 py-2 shadow-[0px_4px_0px_0px_#aaafaf]">
            <span className="game-font text-xl sm:text-2xl font-bold text-white tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          {/* Question Box */}
          <div className="w-full rounded-[24px] sm:rounded-[28px] border-4 border-white bg-white p-6 shadow-md mb-6 text-center">
            {currentQ.context && (
              <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 mb-2">
                {currentQ.context}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl text-[#2a2830] font-bold leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-3.5 w-full max-w-2xl">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const optionLetters = ["A", "B", "C", "D"];
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`group relative flex w-full items-center gap-4 rounded-[22px] border-[5px] border-white px-5 py-3.5 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#1cd8a4] shadow-[0px_6px_0px_0px_#028560] translate-y-[-2px]"
                      : "bg-[#fdffd3] shadow-[0px_5px_0px_0px_#aaafaf] hover:scale-101 hover:brightness-105 active:translate-y-[2px]"
                  }`}
                >
                  <span
                    className={`flex size-10 items-center justify-center rounded-full border-3 border-white game-font text-lg font-bold shadow ${
                      isSelected ? "bg-white text-[#028560]" : "bg-[#7251a8] text-white"
                    }`}
                  >
                    {optionLetters[index]}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#2a2830]">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Button Footer */}
          <div className="mt-8 flex w-full justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-2xl border-[5px] border-white bg-[#e05f1e] px-8 py-2.5 shadow-[0px_5px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <span className="game-font text-xl sm:text-2xl font-bold text-white">
                {currentIndex + 1 === questions.length ? "Selesai" : "Lanjut"}
              </span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.85-1.42 1.42L16.86 11H5v2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
