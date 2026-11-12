"use client";

import { useState } from "react";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { buildBankSoalGuruPool, QuestionItem } from "@/lib/questions";
import { generateQuestions, QuestionTopic } from "@/lib/questionGenerator";
import ScratchpadModal from "@/components/ScratchpadModal";

let _infSeq = 1000;

function createNextQuestion(filter: "ALL" | "S1" | "S2" | "BANGUN"): QuestionItem {
  _infSeq++;
  let chosen = filter;
  if (chosen === "ALL") {
    const r = Math.random();
    chosen = r < 0.4 ? "S1" : r < 0.7 ? "S2" : "BANGUN";
  }

  if (chosen === "S1") {
    const topic: QuestionTopic = Math.random() > 0.3 ? "spldv_eliminasi" : "spldv_identifikasi";
    const [q] = generateQuestions({ topic, count: 1 });
    return { ...q, id: `gen_s1_inf_${_infSeq}`, section: 1 };
  } else if (chosen === "S2") {
    const topic: QuestionTopic = Math.random() > 0.4 ? "spldv_cerita" : "spldv_identifikasi";
    const [q] = generateQuestions({ topic, count: 1 });
    return { ...q, id: `gen_s2_inf_${_infSeq}`, section: 2 };
  } else {
    const topics: QuestionTopic[] = ["bangun_tabung", "bangun_kerucut", "bangun_bola", "bangun_limas"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const [q] = generateQuestions({ topic, count: 1 });
    return { ...q, id: `bg_gen_inf_${_infSeq}`, section: 1 };
  }
}

export default function BankSoalPage() {
  const { playClick, playCorrect } = useSound();
  const [filterSection, setFilterSection] = useState<"ALL" | "S1" | "S2" | "BANGUN">("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [shownAnswers, setShownAnswers] = useState<Record<string, boolean>>({});
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Pool bank soal guru: statis + generated otomatis terintegrasi langsung di tiap section
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>(() =>
    buildBankSoalGuruPool(3, 100)
  );

  const filteredQuestions = allQuestions.filter((q) => {
    if (filterSection === "ALL") return true;
    if (filterSection === "S1") return q.section === 1 && !q.id.startsWith("bg_");
    if (filterSection === "S2") return q.section === 2;
    if (filterSection === "BANGUN") return q.id.startsWith("bg_");
    return true;
  });

  // Clamp index jika filter berganti
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
  const currentQ = filteredQuestions[safeIndex];

  // Hitung jumlah soal per section
  const countS1 = allQuestions.filter((q) => q.section === 1 && !q.id.startsWith("bg_")).length;
  const countS2 = allQuestions.filter((q) => q.section === 2).length;
  const countBangun = allQuestions.filter((q) => q.id.startsWith("bg_")).length;

  const handleSelect = (idx: number) => {
    if (!currentQ) return;
    playClick();
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleToggleShow = () => {
    if (!currentQ) return;
    playCorrect();
    setShownAnswers((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      playClick();
      setCurrentIndex(safeIndex - 1);
    }
  };

  // Infinite Next: jika sudah sampai di soal terakhir, otomatis generate soal baru di kategori tersebut!
  const handleNext = () => {
    playClick();
    if (safeIndex < filteredQuestions.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      const newQ = createNextQuestion(filterSection);
      setAllQuestions((prev) => [...prev, newQ]);
      setCurrentIndex(safeIndex + 1);
    }
  };

  return (
    <GameShell backUrl="/dashboard/guru" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Modal Papan Coretan */}
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
          title={`Coretan Hitungan Guru - Soal #${safeIndex + 1}`}
        />

        {/* Header Badge */}
        <div className="mb-3">
          <div className="rounded-[32px] border-[7px] border-white bg-[#fdffd3] px-8 py-2 shadow-[0px_5px_0px_0px_#aaafaf]">
            <h2 className="game-font text-2xl sm:text-4xl text-[#2a2830] font-bold tracking-wider uppercase text-center">
              KUIS &amp; BANK SOAL
            </h2>
          </div>
        </div>

        {/* Filter Bar (Hanya 4 Kategori Asli) */}
        <div className="flex flex-wrap items-center gap-2 justify-center mb-5 bg-white/70 p-2 rounded-2xl border-2 border-white shadow">
          {[
            { id: "ALL",    label: `Semua (${allQuestions.length})` },
            { id: "S1",     label: `SPLDV Sec 1 (${countS1})` },
            { id: "S2",     label: `SPLDV Sec 2 (${countS2})` },
            { id: "BANGUN", label: `Bangun Ruang (${countBangun})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setFilterSection(tab.id as typeof filterSection);
                setCurrentIndex(0);
              }}
              className={`rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                filterSection === tab.id
                  ? "bg-[#7251a8] text-white shadow"
                  : "text-[#422376] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentQ ? (
          <>
            {/* Main Big Glass Card (Sesuai Desain Figma 183:247) */}
            <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[38px] border-[7px] border-white bg-[#e4d3ff]/80 p-6 sm:p-9 shadow-2xl backdrop-blur-xs flex flex-col justify-between min-h-[480px]">
              
              {/* Dua Persamaan Linear Jika Tersedia */}
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

              {/* Question Header & Context */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-white/70 px-3 py-1 rounded-full shadow-xs">
                      Soal {safeIndex + 1} dari {filteredQuestions.length} • {currentQ.context || "Matematika"}
                    </span>
                    {currentQ.id.includes("gen") && (
                      <span className="text-[11px] font-bold text-[#5e65e9] bg-white/80 border border-purple-200 px-2.5 py-0.5 rounded-full shadow-xs">
                        ⚡ Variasi Acak
                      </span>
                    )}
                  </div>
                  {shownAnswers[currentQ.id] && (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                      ✓ Kunci Jawaban Aktif
                    </span>
                  )}
                </div>

                <p className="text-xl sm:text-2xl font-bold text-[#2a2830] leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options List A, B, C, D */}
              <div className="flex flex-col gap-3 my-auto">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const isShown = shownAnswers[currentQ.id];

                  let optionBg = "bg-white/70 border-white hover:bg-white/90 text-[#2a2830]";
                  let letterBg = "bg-white text-[#2a2830]";

                  if (isShown) {
                    if (isCorrect) {
                      optionBg = "bg-[#4ade80] border-emerald-600 shadow-[0px_4px_0px_0px_#16a34a] text-[#052e16] font-bold";
                      letterBg = "bg-emerald-700 text-white";
                    } else if (isSelected) {
                      // Pilihan salah oleh user disorot merah pudar lembut
                      optionBg = "bg-rose-200/85 border-rose-400 shadow-[0px_3px_0px_0px_#fb7185] text-rose-950 font-semibold";
                      letterBg = "bg-rose-500 text-white";
                    } else {
                      // Opsi salah lainnya juga diberi merah pudar ringan agar tidak ambigu
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

                      {isShown && isCorrect && (
                        <span className="flex size-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow font-bold text-sm">
                          ✓
                        </span>
                      )}
                      {isShown && !isCorrect && isSelected && (
                        <span className="flex size-7 items-center justify-center rounded-full bg-white text-rose-500 shadow font-bold text-sm">
                          ✗
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {shownAnswers[currentQ.id] && (
                <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-950 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
                  <span className="font-bold block mb-1">💡 Pembahasan Kunci Jawaban:</span>
                  {currentQ.explanation}
                </div>
              )}

              {/* Bottom Actions Row (Sesuai Figma: Buka Coretan + Periksa dan Tampilkan Hasil) */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-purple-300/60">
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

                <button
                  onClick={handleToggleShow}
                  className={`flex items-center gap-2 rounded-[18px] border-[4px] border-white px-6 py-2.5 shadow-[0px_4px_0px_0px_#028560] game-font text-sm sm:text-base font-bold transition-all ${
                    shownAnswers[currentQ.id]
                      ? "bg-emerald-300 text-emerald-900 opacity-90 cursor-default"
                      : "bg-[#1cd8a4] text-[#144837] hover:scale-102 active:translate-y-1 cursor-pointer"
                  }`}
                >
                  <span>🔍</span>
                  <span>{shownAnswers[currentQ.id] ? "Kunci Jawaban Aktif (Hijau)" : "Periksa dan Tampilkan Hasil"}</span>
                </button>
              </div>

            </div>

            {/* Slide Navigation Arrows */}
            <div className="flex w-full max-w-4xl items-center justify-between mt-4 px-2">
              <button
                onClick={handlePrev}
                disabled={safeIndex === 0}
                className={`flex size-12 sm:size-14 items-center justify-center rounded-full border-[4px] border-white bg-[#5e65e9] text-white shadow-[0px_4px_0px_0px_#aaafaf] transition-all ${
                  safeIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:translate-y-1 cursor-pointer"
                }`}
                aria-label="Soal Sebelumnya"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 sm:size-7 rotate-180">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <span className="game-font text-sm sm:text-base font-bold text-white drop-shadow">
                Slide Soal {safeIndex + 1} / {filteredQuestions.length}
              </span>

              <button
                onClick={handleNext}
                className="flex size-12 sm:size-14 items-center justify-center rounded-full border-[4px] border-white bg-[#1cd8a4] text-white shadow-[0px_4px_0px_0px_#aaafaf] transition-all hover:scale-105 active:translate-y-1 cursor-pointer"
                title={
                  safeIndex === filteredQuestions.length - 1
                    ? "✨ Buat & buka soal variasi baru!"
                    : "Soal Berikutnya"
                }
                aria-label="Soal Berikutnya"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 sm:size-7">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-white font-bold game-font text-xl">
            Tidak ada soal untuk kategori ini.
          </div>
        )}

      </div>
    </GameShell>
  );
}
