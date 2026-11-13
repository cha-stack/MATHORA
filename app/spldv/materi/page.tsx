"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { getSectionState, saveSectionState, getCurrentUser } from "@/lib/auth";

const SECTION_TITLES: Record<number, string> = {
  1: "Pengertian & Konsep SPLDV",
  2: "Variabel, Koefisien & Konstanta",
  3: "Metode Eliminasi & Substitusi",
  4: "Metode Campuran & Grafik",
  5: "Aplikasi Soal Cerita Kontekstual",
};

const SLIDE_TITLES: Record<number, string[]> = {
  1: [
    "1. Bedah Konsep: Klik Unsur Pembentuk SPLDV",
    "2. Misi Koperasi: Susun Total Belanja Pas!",
    "3. Mini-Game Detektif: Mana yang SPLDV?",
    "4. Rangkuman & Kuis Section 1",
  ],
  2: [
    "1. Klik Langsung Persamaan: Bedah Anatomi",
    "2. Lab Detektif Jebakan Tanda & Bentuk Tak Baku",
    "3. Lab Interaktif: Uji Solusi Titik (x, y)",
    "4. Rangkuman & Kuis Section 2",
  ],
  3: [
    "1. Simulator Eliminasi: Pilih + atau - Sendiri!",
    "2. Lab Pengali KPK: Samakan Koefisiennya",
    "3. Lab Substitusi: Temukan x Secara Langsung",
    "4. Rangkuman & Kuis Section 3",
  ],
  4: [
    "1. Simulator Campuran 2-Tahap Interaktif",
    "2. Lab Grafik Interaktif: Geser Garis 2D",
    "3. Tester Rasio Koefisien & Detektor Garis",
    "4. Rangkuman & Kuis Section 4",
  ],
  5: [
    "1. Rakit Model Persamaan dari Soal Cerita!",
    "2. Studi Kasus 1: Tantangan Tiket Wahana",
    "3. Lab Geometri Interaktif: Taman Persegi Panjang",
    "4. Rangkuman Akhir & Kuis Tantangan",
  ],
};

function QuizOptionRow({
  options,
  answered,
  onSelect,
}: {
  options: { label: string; isRight: boolean }[];
  answered: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-3">
      {options.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`rounded-xl border-2 border-white px-4 py-2 font-semibold text-xs sm:text-sm shadow cursor-pointer transition-all ${
            answered !== null
              ? item.isRight
                ? "bg-emerald-400 text-emerald-950 font-bold"
                : answered === idx
                ? "bg-rose-200 border-rose-400 text-rose-900"
                : "bg-rose-50/90 border-rose-200 text-rose-800/80"
              : "bg-[#e4d3ff] text-[#2a2830] hover:bg-white"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

const DETECTIVE_CARDS = [
  { eq: "x + y = 7 dan 2x - y = 4", isSpldv: true, reason: "Benar! Ada tepat 2 variabel (x, y) dan pangkat tertinggi keduanya adalah 1." },
  { eq: "x² + y = 10 dan x - y = 2", isSpldv: false, reason: "Bukan SPLDV! Terdapat kuadrat (x²), jadi bukan persamaan linear." },
  { eq: "xy = 12 dan x + y = 8", isSpldv: false, reason: "Bukan SPLDV! Perkalian antar variabel (xy) membuatnya bukan linear." },
  { eq: "3p = 12 - 2q dan p - q = 1", isSpldv: true, reason: "Benar! Variabel boleh huruf lain (p & q), yang penting tepat 2 variabel berpangkat 1." },
];

const TRAP_CASES = [
  { eq: "3x - 5y = 20", baku: "3x - 5y = 20", kx: "3", ky: "-5", kon: "20", tip: "Hati-hati! Tanda minus ikut pada koefisien y, jadi koefisien y = -5 (bukan 5)." },
  { eq: "2x + 3y - 12 = 0", baku: "2x + 3y = 12", kx: "2", ky: "3", kon: "12", tip: "Pindahkan -12 ke ruas kanan sehingga tandanya berubah menjadi +12!" },
  { eq: "7y - x = 14", baku: "-1x + 7y = 14", kx: "-1", ky: "7", kon: "14", tip: "Posisi x dan y dibalik! Koefisien x adalah -1 dan koefisien y adalah 7." },
];

function SpldvMateriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secParam = searchParams.get("section");
  const parsedSec = Number(secParam);
  const sectionNum = (parsedSec >= 1 && parsedSec <= 5 ? parsedSec : 1) as 1 | 2 | 3 | 4 | 5;

  const [isGuru, setIsGuru] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.role === "guru";
    }
    return false;
  });

  const [slide, setSlide] = useState(1);
  const totalSlides = 4;
  const { playClick, playCorrect } = useSound();

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role === "guru") {
      setIsGuru(true);
      return;
    }
    const st = getSectionState(sectionNum);
    if (sectionNum > 1 && !st.unlocked) {
      alert(`Section ${sectionNum} masih terkunci!`);
      router.replace("/spldv");
    } else if (!st.pretest) {
      alert(`Kamu harus menyelesaikan Pre-Test Section ${sectionNum} terlebih dahulu!`);
      router.replace(`/spldv/pretest?section=${sectionNum}`);
    }
  }, [sectionNum, router]);

  useEffect(() => {
    setSlide(1);
    setQuizAnswered(null);
  }, [sectionNum]);

  useEffect(() => {
    if (slide === totalSlides) {
      const user = getCurrentUser();
      if (user?.role !== "guru") {
        saveSectionState(sectionNum, { materi: true });
      }
    }
  }, [slide, totalSlides, sectionNum]);

  // Section 1 States:
  const [activeTab, setActiveTab] = useState<"SP" | "L" | "DV">("SP");
  const [apelCount, setApelCount] = useState(2);
  const [jerukCount, setJerukCount] = useState(1);
  const totalHarga = apelCount * 2000 + jerukCount * 5000;
  const [detectiveGuesses, setDetectiveGuesses] = useState<Record<number, boolean | null>>({});

  // Section 2 States:
  const [activeUnsurTab, setActiveUnsurTab] = useState<"VAR" | "KOEF" | "KONST">("VAR");
  const [trapIdx, setTrapIdx] = useState(0);
  const [trapRevealed, setTrapRevealed] = useState(false);
  const [trapGuessKy, setTrapGuessKy] = useState<string>("");
  const [customA, setCustomA] = useState(4);
  const [customB, setCustomB] = useState(-2);
  const [customC, setCustomC] = useState(16);
  const [inputX, setInputX] = useState(5);
  const [inputY, setInputY] = useState(2);

  // Section 3 States:
  const [elimMode, setElimMode] = useState<"sama" | "beda">("sama");
  const [elimOpPick, setElimOpPick] = useState<"-" | "+" | null>(null);
  const [eq2Mult, setEq2Mult] = useState<number>(1);
  const [kpkSolved, setKpkSolved] = useState(false);
  const [subTestX, setSubTestX] = useState<number>(1);

  // Section 4 States:
  const [mixStage, setMixStage] = useState<number>(1);
  const [mixYGuess, setMixYGuess] = useState<string>("");
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(1);
  const [c1, setC1] = useState(7);
  const [a2, setA2] = useState(1);
  const [b2, setB2] = useState(-1);
  const [c2, setC2] = useState(1);
  const [ratioA2, setRatioA2] = useState(1);
  const [ratioB2, setRatioB2] = useState(2);
  const [ratioC2, setRatioC2] = useState(5);

  // Section 5 States:
  const [storyTokens, setStoryTokens] = useState<string[]>([]);
  const [storyStep, setStoryStep] = useState<number>(1);
  const [rectP, setRectP] = useState<number>(9);
  const [rectL, setRectL] = useState<number>(9);

  // Shared quiz state per section
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const det = a1 * b2 - a2 * b1;
  const hasSingleSolution = det !== 0;
  const solX = hasSingleSolution ? (c1 * b2 - c2 * b1) / det : 0;
  const solY = hasSingleSolution ? (a1 * c2 - a2 * c1) / det : 0;
  const isParallel = !hasSingleSolution && !(a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1);
  const isCoincident = !hasSingleSolution && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1;

  const setPreset = (pa1: number, pb1: number, pc1: number, pa2: number, pb2: number, pc2: number) => {
    playClick();
    setA1(pa1);
    setB1(pb1);
    setC1(pc1);
    setA2(pa2);
    setB2(pb2);
    setC2(pc2);
  };

  const renderLine = (a: number, b: number, c: number, color: string) => {
    if (b !== 0) {
      const x1 = -10;
      const y1 = (c - a * x1) / b;
      const x2 = 10;
      const y2 = (c - a * x2) / b;
      return (
        <line
          x1={150 + x1 * 12}
          y1={150 - y1 * 12}
          x2={150 + x2 * 12}
          y2={150 - y2 * 12}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    } else if (a !== 0) {
      const svgX = 150 + (c / a) * 12;
      return <line x1={svgX} y1={0} x2={svgX} y2={300} stroke={color} strokeWidth="3" strokeLinecap="round" />;
    }
    return null;
  };

  const renderSectionFooterAction = () => {
    if (isGuru) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2 w-full">
          {sectionNum < 5 && (
            <button
              onClick={() => {
                playClick();
                router.push(`/spldv/materi?section=${sectionNum + 1}`);
              }}
              className="rounded-2xl border-4 border-white bg-[#5e65e9] px-6 py-2.5 game-font text-base font-semibold text-white shadow hover:scale-103 cursor-pointer"
            >
              Lanjut ke Materi Bagian {sectionNum + 1} &rarr;
            </button>
          )}
          <Link
            href="/spldv"
            onClick={playClick}
            className="rounded-2xl border-4 border-white bg-[#34b2cc] px-6 py-2.5 game-font text-base font-semibold text-white shadow hover:scale-103"
          >
            Kembali ke Menu 5 Tahap
          </Link>
        </div>
      );
    }
    return (
      <Link
        href={`/spldv/posttest?section=${sectionNum}`}
        onClick={playClick}
        className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-3 game-font text-base sm:text-lg font-semibold text-[#144837] shadow hover:scale-103 mt-2"
      >
        Lanjut ke Post-Test Section {sectionNum} &rarr;
      </Link>
    );
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full max-w-5xl rounded-[28px] sm:rounded-[42px] border-[5px] sm:border-[7px] border-white bg-[#e4d3ff]/90 p-3.5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center min-h-[600px] justify-between">
        {/* Top Progress & Title */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 text-center">
            <span className="rounded-full bg-[#7251a8] px-3.5 py-0.5 text-[11px] sm:text-xs font-bold text-white shadow text-center">
              Section {sectionNum} dari 5 • {SECTION_TITLES[sectionNum]}
            </span>
          </div>

          <div className="flex w-full max-w-xl gap-2 sm:gap-2.5 mb-3">
            {Array.from({ length: totalSlides }).map((_, i) => {
              const s = i + 1;
              return (
                <button
                  key={s}
                  onClick={() => {
                    playClick();
                    setSlide(s);
                  }}
                  className={`h-3 sm:h-3.5 flex-1 rounded-full transition-all cursor-pointer ${
                    s <= slide ? "bg-[#7251a8] shadow" : "bg-white/80 hover:bg-white"
                  }`}
                  title={`Slide ${s}`}
                />
              );
            })}
          </div>

          <h2 className="game-font text-xl sm:text-3xl md:text-4xl text-[#2a2830] font-semibold text-center leading-snug">
            {SLIDE_TITLES[sectionNum][slide - 1]}
          </h2>
        </div>

        {/* ══════════════ SECTION 1: PENGERTIAN & KONSEP SPLDV ══════════════ */}
        {sectionNum === 1 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow text-center border-3 border-purple-100">
                  <p className="text-lg sm:text-2xl text-[#2a2830] font-bold leading-relaxed">
                    <span className="text-[#e05f1e]">SPLDV</span> adalah dua persamaan linear yang memuat dua variabel yang sama dan harus dipenuhi bersama-sama.
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-[#f8f298] px-4 py-1 text-xs font-bold text-[#422376]">
                    💡 Klik masing-masing kotak di bawah untuk membedah artinya!
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                  <button
                    onClick={() => { playClick(); setActiveTab("SP"); }}
                    className={`flex flex-col items-center justify-center rounded-[18px] sm:rounded-[24px] border-3 sm:border-[5px] border-white p-2 sm:p-3.5 transition-all cursor-pointer ${
                      activeTab === "SP" ? "bg-[#1cd8a4] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-4xl font-semibold text-[#2a2830]">[ SP ]</span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#2a2830] text-center">Sistem Persamaan</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab("L"); }}
                    className={`flex flex-col items-center justify-center rounded-[18px] sm:rounded-[24px] border-3 sm:border-[5px] border-white p-2 sm:p-3.5 transition-all cursor-pointer ${
                      activeTab === "L" ? "bg-[#f8f298] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-4xl font-semibold text-[#2a2830]">[ L ]</span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#2a2830] text-center">Linear</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab("DV"); }}
                    className={`flex flex-col items-center justify-center rounded-[18px] sm:rounded-[24px] border-3 sm:border-[5px] border-white p-2 sm:p-3.5 transition-all cursor-pointer ${
                      activeTab === "DV" ? "bg-[#d3e9ff] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-4xl font-semibold text-[#2a2830]">[ DV ]</span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#2a2830] text-center">Dua Variabel</span>
                  </button>
                </div>

                <div className="w-full rounded-[24px] border-4 border-white bg-white p-5 shadow text-left">
                  {activeTab === "SP" && (
                    <div>
                      <h4 className="font-bold text-emerald-800 text-base mb-1">🔗 Sistem Persamaan: Dua Petunjuk Sekaligus!</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Satu petunjuk saja punya banyak kemungkinan jawaban. Dua persamaan sekaligus mengunci tepat satu pasangan nilai (x, y) yang pasti!
                      </p>
                    </div>
                  )}
                  {activeTab === "L" && (
                    <div>
                      <h4 className="font-bold text-amber-800 text-base mb-1">📏 Linear: Pangkat Satu, Grafik Garis Lurus!</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Pangkat tertinggi setiap variabelnya tepat satu (tidak ada x² atau √x). Jika digambar di Cartesius, grafiknya selalu lurus.
                      </p>
                    </div>
                  )}
                  {activeTab === "DV" && (
                    <div>
                      <h4 className="font-bold text-blue-800 text-base mb-1">🍎🍊 Dua Variabel: Dua Nilai Misterius</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Memiliki tepat dua jenis variabel berbeda (misal x dan y) yang mewakili dua barang atau besaran yang dicari.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[20px] bg-white p-4 shadow text-center">
                  <span className="game-font text-lg font-semibold text-[#7251a8]">
                    🎯 Misi Belanja: Buat Total Belanja Tepat Rp 19.000!
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Klik + / - untuk mengatur jumlah Pensil (x) dan Buku (y) lalu lihat persamaannya berubah!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="flex items-center justify-between rounded-2xl border-3 sm:border-4 border-white bg-blue-50 p-3.5 sm:p-4 shadow">
                    <div>
                      <span className="game-font text-base sm:text-lg font-semibold text-[#2a2830]">Pensil (x)</span>
                      <p className="text-xs font-semibold text-blue-700">@ Rp 2.000</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { playClick(); setApelCount(Math.max(0, apelCount - 1)); }} className="size-8 rounded-full bg-blue-500 font-bold text-white shadow cursor-pointer active:scale-95 shrink-0">-</button>
                      <span className="game-font text-xl font-bold w-7 text-center text-[#2a2830]">{apelCount}</span>
                      <button onClick={() => { playClick(); setApelCount(apelCount + 1); }} className="size-8 rounded-full bg-blue-500 font-bold text-white shadow cursor-pointer active:scale-95 shrink-0">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border-3 sm:border-4 border-white bg-amber-50 p-3.5 sm:p-4 shadow">
                    <div>
                      <span className="game-font text-base sm:text-lg font-semibold text-[#2a2830]">Buku (y)</span>
                      <p className="text-xs font-semibold text-amber-700">@ Rp 5.000</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { playClick(); setJerukCount(Math.max(0, jerukCount - 1)); }} className="size-8 rounded-full bg-amber-500 font-bold text-white shadow cursor-pointer active:scale-95 shrink-0">-</button>
                      <span className="game-font text-xl font-bold w-7 text-center text-[#2a2830]">{jerukCount}</span>
                      <button onClick={() => { playClick(); setJerukCount(jerukCount + 1); }} className="size-8 rounded-full bg-amber-500 font-bold text-white shadow cursor-pointer active:scale-95 shrink-0">+</button>
                    </div>
                  </div>
                </div>

                <div className={`w-full rounded-[24px] border-4 border-white p-5 shadow text-center transition-all ${totalHarga === 19000 ? "bg-emerald-100" : "bg-[#fdffd3]"}`}>
                  <span className="text-xs font-bold uppercase text-gray-500">Persamaan Terbentuk:</span>
                  <div className="game-font text-2xl sm:text-3xl text-[#422376] font-semibold my-1">
                    {apelCount}x + {jerukCount}y = Rp {totalHarga.toLocaleString("id-ID")}
                  </div>
                  <span className={`inline-block rounded-full px-4 py-1 text-xs font-bold ${totalHarga === 19000 ? "bg-emerald-500 text-white" : "bg-amber-200 text-amber-900"}`}>
                    {totalHarga === 19000
                      ? `🎉 Misi Tercapai! Kombinasi ${apelCount} pensil & ${jerukCount} buku pas Rp 19.000!`
                      : totalHarga < 19000
                      ? `Kurang Rp ${(19000 - totalHarga).toLocaleString("id-ID")} lagi menuju Rp 19.000!`
                      : `Kelebihan Rp ${(totalHarga - 19000).toLocaleString("id-ID")}! Coba kurangi barangnya.`}
                  </span>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col gap-3 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="rounded-2xl bg-white p-3.5 shadow text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">
                    🕵️ Mini-Game Detektif: Klik Apakah Kartu Ini Termasuk SPLDV atau Bukan!
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DETECTIVE_CARDS.map((card, i) => {
                    const guess = detectiveGuesses[i] ?? null;
                    const isGuessed = guess !== null;
                    const isCorrect = guess === card.isSpldv;
                    return (
                      <div
                        key={i}
                        className={`rounded-2xl border-4 border-white p-4 shadow transition-all ${
                          !isGuessed ? "bg-white" : isCorrect ? "bg-emerald-50" : "bg-rose-50"
                        }`}
                      >
                        <div className="font-bold text-sm sm:text-base text-[#2a2830] mb-2">{card.eq}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (card.isSpldv) playCorrect(); else playClick();
                              setDetectiveGuesses((p) => ({ ...p, [i]: true }));
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-2 transition-all ${
                              guess === true
                                ? card.isSpldv
                                  ? "bg-emerald-400 border-emerald-600 text-emerald-950"
                                  : "bg-rose-200 border-rose-400 text-rose-900"
                                : "bg-purple-50 border-purple-200 hover:bg-purple-100 text-[#2a2830]"
                            }`}
                          >
                            ✓ Ya, SPLDV
                          </button>
                          <button
                            onClick={() => {
                              if (!card.isSpldv) playCorrect(); else playClick();
                              setDetectiveGuesses((p) => ({ ...p, [i]: false }));
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-2 transition-all ${
                              guess === false
                                ? !card.isSpldv
                                  ? "bg-emerald-400 border-emerald-600 text-emerald-950"
                                  : "bg-rose-200 border-rose-400 text-rose-900"
                                : "bg-purple-50 border-purple-200 hover:bg-purple-100 text-[#2a2830]"
                            }`}
                          >
                            ✗ Bukan SPLDV
                          </button>
                        </div>
                        {isGuessed && (
                          <p className={`mt-2 text-xs font-semibold ${isCorrect ? "text-emerald-800" : "text-rose-800"}`}>
                            {isCorrect ? "✓ Tepat! " : "✗ Kurang tepat: "}
                            {card.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Section 1:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Manakah pasangan persamaan berikut yang merupakan bentuk SPLDV yang sah?
                  </p>
                  <QuizOptionRow
                    answered={quizAnswered}
                    onSelect={(idx) => { playClick(); setQuizAnswered(idx); }}
                    options={[
                      { label: "2a + b = 10 dan a - 3b = 2", isRight: true },
                      { label: "x² + 2y = 8 dan x + y = 5", isRight: false },
                      { label: "xy + 2x = 6 dan x + y = 4", isRight: false },
                    ]}
                  />
                </div>
                {renderSectionFooterAction()}
              </div>
            )}
          </>
        )}

        {/* ══════════════ SECTION 2: VARIABEL, KOEFISIEN & KONSTANTA ══════════════ */}
        {sectionNum === 2 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow text-center border-3 border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Klik langsung angka atau huruf pada persamaan di bawah ini!
                  </span>
                  <div className="game-font text-3xl sm:text-5xl text-[#2a2830] font-semibold my-3 flex items-center justify-center gap-1 flex-wrap">
                    <button
                      onClick={() => { playClick(); setActiveUnsurTab("KOEF"); }}
                      className={`px-2 py-0.5 rounded-xl cursor-pointer transition-all ${activeUnsurTab === "KOEF" ? "bg-rose-200 text-rose-700 scale-110" : "text-rose-600 hover:bg-rose-50"}`}
                      title="Klik: Koefisien"
                    >
                      a
                    </button>
                    <button
                      onClick={() => { playClick(); setActiveUnsurTab("VAR"); }}
                      className={`px-2 py-0.5 rounded-xl cursor-pointer transition-all ${activeUnsurTab === "VAR" ? "bg-blue-200 text-blue-700 scale-110" : "text-blue-600 hover:bg-blue-50"}`}
                      title="Klik: Variabel"
                    >
                      x
                    </button>
                    <span className="mx-1">+</span>
                    <button
                      onClick={() => { playClick(); setActiveUnsurTab("KOEF"); }}
                      className={`px-2 py-0.5 rounded-xl cursor-pointer transition-all ${activeUnsurTab === "KOEF" ? "bg-rose-200 text-rose-700 scale-110" : "text-rose-600 hover:bg-rose-50"}`}
                      title="Klik: Koefisien"
                    >
                      b
                    </button>
                    <button
                      onClick={() => { playClick(); setActiveUnsurTab("VAR"); }}
                      className={`px-2 py-0.5 rounded-xl cursor-pointer transition-all ${activeUnsurTab === "VAR" ? "bg-blue-200 text-blue-700 scale-110" : "text-blue-600 hover:bg-blue-50"}`}
                      title="Klik: Variabel"
                    >
                      y
                    </button>
                    <span className="mx-1">=</span>
                    <button
                      onClick={() => { playClick(); setActiveUnsurTab("KONST"); }}
                      className={`px-2 py-0.5 rounded-xl cursor-pointer transition-all ${activeUnsurTab === "KONST" ? "bg-amber-200 text-amber-800 scale-110" : "text-amber-600 hover:bg-amber-50"}`}
                      title="Klik: Konstanta"
                    >
                      c
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("VAR"); }}
                    className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white p-2 sm:p-3.5 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "VAR" ? "bg-[#d3e9ff] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xs sm:text-xl font-semibold text-blue-700 block">Variabel (x, y)</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("KOEF"); }}
                    className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white p-2 sm:p-3.5 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "KOEF" ? "bg-[#ffd3d3] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xs sm:text-xl font-semibold text-rose-700 block">Koefisien (a, b)</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("KONST"); }}
                    className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white p-2 sm:p-3.5 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "KONST" ? "bg-[#fef08a] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xs sm:text-xl font-semibold text-amber-700 block">Konstanta (c)</span>
                  </button>
                </div>

                <div className="w-full rounded-[24px] border-4 border-white bg-white p-5 shadow text-left">
                  {activeUnsurTab === "VAR" && (
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      <b className="text-blue-800 block text-base mb-1">📌 Variabel (Peubah):</b>
                      Lambang huruf kecil seperti x, y, p, q yang menggantikan nilai bilangan yang belum diketahui.
                    </p>
                  )}
                  {activeUnsurTab === "KOEF" && (
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      <b className="text-rose-800 block text-base mb-1">📌 Koefisien:</b>
                      Bilangan pengali di depan variabel. Jika tertulis <b>x</b> koefisiennya <b>1</b>; jika tertulis <b>-y</b> koefisiennya <b>-1</b>.
                    </p>
                  )}
                  {activeUnsurTab === "KONST" && (
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      <b className="text-amber-800 block text-base mb-1">📌 Konstanta:</b>
                      Bilangan tetap murni yang berdiri sendiri tanpa ditemani variabel sama sekali.
                    </p>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col items-center gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                {(() => {
                  const curTrap = TRAP_CASES[trapIdx];
                  const isMatch = trapGuessKy.trim() === curTrap.ky;
                  return (
                    <>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {TRAP_CASES.map((tc, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              playClick();
                              setTrapIdx(i);
                              setTrapRevealed(false);
                              setTrapGuessKy("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-2 border-white transition-all ${
                              trapIdx === i ? "bg-[#7251a8] text-white shadow" : "bg-white text-[#2a2830]"
                            }`}
                          >
                            Jebakan #{i + 1}
                          </button>
                        ))}
                      </div>

                      <div className="w-full rounded-2xl border-4 border-white bg-rose-50 p-5 shadow text-center">
                        <span className="text-xs font-bold text-rose-700 uppercase">Tantangan Tebak Koefisien y:</span>
                        <div className="game-font text-2xl sm:text-4xl text-[#2a2830] font-semibold my-2">
                          {curTrap.eq}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                          <span className="text-xs font-bold text-gray-700">Berapa koefisien <b>y</b>?</span>
                          <input
                            type="text"
                            value={trapGuessKy}
                            onChange={(e) => setTrapGuessKy(e.target.value)}
                            placeholder="Ketik angka..."
                            className="w-28 rounded-xl border-2 border-purple-300 bg-white px-3 py-1.5 text-center font-bold text-sm text-[#2a2830]"
                          />
                          <button
                            onClick={() => {
                              if (isMatch) playCorrect(); else playClick();
                              setTrapRevealed(true);
                            }}
                            className="rounded-xl bg-[#5e65e9] text-white px-4 py-1.5 text-xs font-bold cursor-pointer shadow"
                          >
                            Cek &amp; Ubah Bentuk Baku
                          </button>
                        </div>

                        {trapRevealed && (
                          <div className="mt-4 rounded-xl bg-white p-3.5 border-2 border-purple-200 text-left text-xs sm:text-sm space-y-1.5 animate-in fade-in">
                            <div className={`font-bold ${isMatch ? "text-emerald-700" : "text-rose-700"}`}>
                              {isMatch ? "✓ Keren, tebakanmu benar!" : `✗ Yang benar koefisien y = ${curTrap.ky}`}
                            </div>
                            <div>
                              Bentuk Baku: <b className="text-[#5e65e9]">{curTrap.baku}</b> → Koef x = <b>{curTrap.kx}</b>, Koef y = <b>{curTrap.ky}</b>, Konstanta = <b>{curTrap.kon}</b>
                            </div>
                            <p className="text-gray-600 font-medium">💡 {curTrap.tip}</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col items-center gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="grid grid-cols-3 gap-2.5 w-full bg-white/85 rounded-2xl p-3 border-2 border-white text-xs font-bold">
                  <div>
                    <span className="text-gray-600">a = {customA}</span>
                    <input type="range" min="-5" max="8" value={customA} onChange={(e) => setCustomA(Number(e.target.value))} className="w-full accent-[#7251a8]" />
                  </div>
                  <div>
                    <span className="text-gray-600">b = {customB}</span>
                    <input type="range" min="-5" max="8" value={customB} onChange={(e) => setCustomB(Number(e.target.value))} className="w-full accent-[#7251a8]" />
                  </div>
                  <div>
                    <span className="text-gray-600">Target c = {customC}</span>
                    <input type="range" min="-20" max="30" value={customC} onChange={(e) => setCustomC(Number(e.target.value))} className="w-full accent-[#d97706]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                  <div className="rounded-2xl border-3 border-white bg-white p-3.5 shadow">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Uji Nilai x:</span>
                    <div className="flex items-center gap-3">
                      <input type="range" min="-5" max="10" value={inputX} onChange={(e) => setInputX(Number(e.target.value))} className="w-full accent-[#2563eb]" />
                      <span className="game-font text-lg font-bold w-8 text-center text-blue-700">{inputX}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border-3 border-white bg-white p-3.5 shadow">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Uji Nilai y:</span>
                    <div className="flex items-center gap-3">
                      <input type="range" min="-5" max="10" value={inputY} onChange={(e) => setInputY(Number(e.target.value))} className="w-full accent-[#e0457b]" />
                      <span className="game-font text-lg font-bold w-8 text-center text-pink-700">{inputY}</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const lhs = customA * inputX + customB * inputY;
                  const isMatch = lhs === customC;
                  return (
                    <div className={`w-full rounded-[24px] border-4 border-white p-4 shadow text-center transition-all ${isMatch ? "bg-emerald-100" : "bg-[#fdffd3]"}`}>
                      <span className="text-xs font-bold uppercase text-gray-600">
                        Persamaan: {customA}x {customB >= 0 ? `+ ${customB}y` : `- ${Math.abs(customB)}y`} = {customC}
                      </span>
                      <div className="game-font text-xl sm:text-2xl text-[#422376] font-semibold my-1">
                        {customA}({inputX}) {customB >= 0 ? `+ ${customB}` : `- ${Math.abs(customB)}`}({inputY}) = {lhs}
                      </div>
                      <span className={`inline-block rounded-full px-4 py-1 text-xs font-bold ${isMatch ? "bg-emerald-500 text-white" : "bg-amber-200 text-amber-900"}`}>
                        {isMatch
                          ? `✓ Benar! (${inputX}, ${inputY}) memenuhi persamaan!`
                          : `Belum cocok (${lhs} ≠ ${customC}). Geser x atau y lagi!`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Section 2:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Pada persamaan 5x - y - 15 = 0, berapakah koefisien variabel y dan konstantanya dalam bentuk baku?
                  </p>
                  <QuizOptionRow
                    answered={quizAnswered}
                    onSelect={(idx) => { playClick(); setQuizAnswered(idx); }}
                    options={[
                      { label: "Koefisien y = -1, Konstanta = 15", isRight: true },
                      { label: "Koefisien y = 1, Konstanta = -15", isRight: false },
                      { label: "Koefisien y = -1, Konstanta = -15", isRight: false },
                    ]}
                  />
                </div>
                {renderSectionFooterAction()}
              </div>
            )}
          </>
        )}

        {/* ══════════════ SECTION 3: METODE ELIMINASI & SUBSTITUSI ══════════════ */}
        {sectionNum === 3 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl p-3.5 shadow border-2 border-purple-100">
                  <div>
                    <span className="game-font text-base sm:text-lg font-semibold text-[#e05f1e]">
                      ✂️ Aturan Sakti: &quot;SAMA KURANG, BEDA TAMBAH&quot;
                    </span>
                    <p className="text-xs text-gray-600 font-medium">Pilih kasus, lalu tekan tombol operasi (-) atau (+) untuk melenyapkan y!</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { playClick(); setElimMode("sama"); setElimOpPick(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        elimMode === "sama" ? "bg-[#e05f1e] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      Kasus 1: Tanda Sama
                    </button>
                    <button
                      onClick={() => { playClick(); setElimMode("beda"); setElimOpPick(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        elimMode === "beda" ? "bg-[#5e65e9] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      Kasus 2: Tanda Beda
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border-4 border-white bg-white p-5 shadow flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-amber-50 px-6 py-3 font-bold text-base sm:text-xl text-[#2a2830] text-center space-y-1 border border-amber-200">
                    <div>(1) {elimMode === "sama" ? "2x + y = 11" : "x + y = 9"}</div>
                    <div>(2) {elimMode === "sama" ? "x + y = 7" : "x - y = 3"}</div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Operasi apa agar variabel <b>y</b> hilang?</span>
                    <button
                      onClick={() => {
                        if (elimMode === "sama") playCorrect(); else playClick();
                        setElimOpPick("-");
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-sm cursor-pointer border-2 transition-all ${
                        elimOpPick === "-"
                          ? elimMode === "sama"
                            ? "bg-emerald-400 border-emerald-600 text-emerald-950"
                            : "bg-rose-200 border-rose-400 text-rose-900"
                          : "bg-purple-100 border-purple-300 hover:bg-purple-200"
                      }`}
                    >
                      Kurangkan (-)
                    </button>
                    <button
                      onClick={() => {
                        if (elimMode === "beda") playCorrect(); else playClick();
                        setElimOpPick("+");
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-sm cursor-pointer border-2 transition-all ${
                        elimOpPick === "+"
                          ? elimMode === "beda"
                            ? "bg-emerald-400 border-emerald-600 text-emerald-950"
                            : "bg-rose-200 border-rose-400 text-rose-900"
                          : "bg-purple-100 border-purple-300 hover:bg-purple-200"
                      }`}
                    >
                      Tambahkan (+)
                    </button>
                  </div>

                  {elimOpPick && (
                    <div className={`w-full rounded-xl p-3 text-center text-xs sm:text-sm font-semibold ${
                      (elimMode === "sama" && elimOpPick === "-") || (elimMode === "beda" && elimOpPick === "+")
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-rose-100 text-rose-900"
                    }`}>
                      {elimMode === "sama" && elimOpPick === "-" && "✓ Tepat! (+y) - (+y) = 0! Diperoleh x = 4, lalu y = 3 → HP: {(4, 3)}"}
                      {elimMode === "sama" && elimOpPick === "+" && "✗ Waduh! Jika ditambah malah jadi +2y (tidak hilang). Karena sama-sama +y, pilih Kurangkan (-)!"}
                      {elimMode === "beda" && elimOpPick === "+" && "✓ Tepat! (+y) + (-y) = 0! Diperoleh 2x = 12 → x = 6, lalu y = 3 → HP: {(6, 3)}"}
                      {elimMode === "beda" && elimOpPick === "-" && "✗ Hati-hati! (+y) - (-y) malah jadi +2y! Karena tandanya beda (+ dan -), pilih Tambahkan (+)!"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                      ✖️ Lab Pengali KPK: Samakan Koefisien y Sebelum Eliminasi!
                    </span>
                    <span className="text-xs font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                      Target: Koefisien y jadi -2y
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-sky-50 p-3.5 border border-sky-200 font-bold text-[#2a2830]">
                      <span className="text-xs text-sky-700 block mb-1">Persamaan (1) [Tetap]:</span>
                      <div className="text-lg">3x + <span className="text-rose-600">2y</span> = 16</div>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 font-bold text-[#2a2830]">
                      <span className="text-xs text-amber-800 block mb-1">Persamaan (2) Awal: x - y = 2 → Kalikan berapa?</span>
                      <div className="text-lg">
                        {eq2Mult === 1 ? "" : eq2Mult}x - <span className="text-rose-600">{eq2Mult === 1 ? "" : eq2Mult}y</span> = {2 * eq2Mult}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3].map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              playClick();
                              setEq2Mult(m);
                              setKpkSolved(false);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              eq2Mult === m ? "bg-[#e05f1e] text-white" : "bg-white text-gray-800 border border-amber-300"
                            }`}
                          >
                            Kalikan ×{m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (eq2Mult === 2) playCorrect(); else playClick();
                        setKpkSolved(true);
                      }}
                      className="rounded-xl bg-[#1cd8a4] text-[#144837] font-bold px-5 py-2 text-xs sm:text-sm shadow cursor-pointer hover:brightness-105"
                    >
                      Jalankan Eliminasi (+) Sekarang!
                    </button>
                  </div>

                  {kpkSolved && (
                    <div className={`rounded-xl p-3 text-center text-xs sm:text-sm font-semibold ${eq2Mult === 2 ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
                      {eq2Mult === 2
                        ? "🎉 Sukses! (+2y) + (-2y) = 0 → (3x + 2x) = 16 + 4 → 5x = 20 → x = 4, dan y = 2!"
                        : `⚠️ Belum sama! Koefisien y masih -${eq2Mult}y (butuh -2y). Klik Kalikan ×2 dulu!`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full rounded-2xl border-4 border-white bg-white p-5 shadow text-left flex flex-col gap-3 my-auto animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#5e65e9]">
                    🔄 Lab Substitusi: Ganti y dengan (2x + 1), lalu Geser Slider Nilai x!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-gray-800">
                  <div className="rounded-xl bg-blue-50/80 p-3.5 space-y-1.5">
                    <div>Diketahui: <b>(1) y = 2x + 1</b> dan <b>(2) 3x + y = 16</b></div>
                    <div>Substitusi ke (2): <b className="text-blue-900">3x + (2x + 1) = 16</b></div>
                    <div className="pt-2">
                      <span className="font-bold text-blue-800 block mb-1">Geser tebakan nilai x = {subTestX}:</span>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        value={subTestX}
                        onChange={(e) => setSubTestX(Number(e.target.value))}
                        className="w-full accent-[#5e65e9]"
                      />
                    </div>
                  </div>
                  <div className={`rounded-xl p-3.5 flex flex-col justify-center text-center border-2 ${5 * subTestX + 1 === 16 ? "bg-emerald-100 border-emerald-400" : "bg-amber-50 border-amber-200"}`}>
                    <span className="text-xs font-bold text-gray-600">Hasil Substitusi 3({subTestX}) + (2({subTestX}) + 1):</span>
                    <div className="game-font text-2xl sm:text-3xl font-semibold text-[#422376] my-1">
                      = {5 * subTestX + 1}
                    </div>
                    <span className={`text-xs font-bold ${5 * subTestX + 1 === 16 ? "text-emerald-800" : "text-amber-800"}`}>
                      {5 * subTestX + 1 === 16
                        ? `✓ Pas = 16! Jadi x = 3, dan y = 2(3)+1 = 7 → HP: {(3, 7)}`
                        : `Targetnya 16! Sekarang masih ${5 * subTestX + 1}.`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Section 3:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Diketahui 3x + y = 14 dan 3x - y = 10. Jika dieliminasi dengan MENJUMLAHKAN kedua persamaan, nilai x adalah...
                  </p>
                  <QuizOptionRow
                    answered={quizAnswered}
                    onSelect={(idx) => { playClick(); setQuizAnswered(idx); }}
                    options={[
                      { label: "x = 4 (karena 6x = 24)", isRight: true },
                      { label: "x = 2 (karena 6x = 12)", isRight: false },
                      { label: "x = 8 (karena 3x = 24)", isRight: false },
                    ]}
                  />
                </div>
                {renderSectionFooterAction()}
              </div>
            )}
          </>
        )}

        {/* ══════════════ SECTION 4: METODE CAMPURAN & GRAFIK ══════════════ */}
        {sectionNum === 4 && (
          <>
            {slide === 1 && (
              <div className="w-full rounded-2xl border-4 border-white bg-white p-5 shadow text-left flex flex-col gap-3 my-auto animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#028560]">
                    ⚡ Simulator Campuran 2-Tahap: Selesaikan Bersama!
                  </span>
                  <button
                    onClick={() => { playClick(); setMixStage(1); setMixYGuess(""); }}
                    className="text-xs font-bold text-[#5e65e9] underline cursor-pointer"
                  >
                    Ulangi Simulasi
                  </button>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 font-bold text-sm text-[#2a2830]">
                  Sistem: (1) <b>2x + 3y = 19</b> dan (2) <b>2x + y = 9</b>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 flex flex-col gap-2">
                    <b className="text-amber-900">Tahap 1: Eliminasi x (Kurangkan (1) - (2))</b>
                    <div>(2x + 3y) - (2x + y) = 19 - 9 → <b>2y = 10</b></div>
                    <div className="flex items-center gap-2">
                      <span>Maka y =</span>
                      <input
                        type="number"
                        value={mixYGuess}
                        onChange={(e) => setMixYGuess(e.target.value)}
                        placeholder="?"
                        className="w-16 rounded-lg border-2 border-amber-400 bg-white px-2 py-1 text-center font-bold"
                      />
                      <button
                        onClick={() => {
                          if (mixYGuess.trim() === "5") {
                            playCorrect();
                            setMixStage(2);
                          } else {
                            playClick();
                          }
                        }}
                        className="rounded-lg bg-[#e05f1e] text-white px-3 py-1 text-xs font-bold cursor-pointer"
                      >
                        Lanjut Substitusi →
                      </button>
                    </div>
                    {mixYGuess !== "" && mixYGuess.trim() !== "5" && (
                      <span className="text-xs font-bold text-rose-700">Tip: 10 dibagi 2 berapa ya?</span>
                    )}
                  </div>

                  <div className={`rounded-xl p-3.5 border flex flex-col justify-center gap-1 transition-all ${mixStage >= 2 ? "bg-emerald-50 border-emerald-300" : "bg-gray-100 opacity-50 border-gray-200"}`}>
                    <b className="text-emerald-900">Tahap 2: Substitusi y = 5 ke Persamaan (2)</b>
                    {mixStage >= 2 ? (
                      <>
                        <div>2x + <b>5</b> = 9 → 2x = 4 → <b className="text-emerald-700">x = 2</b></div>
                        <div className="font-bold text-emerald-950">✓ Selesai! Solusi = (2, 5)</div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 font-semibold">Isi nilai y terlebih dahulu di Tahap 1 untuk membuka Tahap 2!</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col md:flex-row gap-5 items-center my-auto animate-in fade-in duration-200 py-1">
                <div className="flex flex-col items-center">
                  <div className="relative size-[250px] sm:size-[270px] rounded-2xl border-4 border-white bg-white shadow overflow-hidden">
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {[-8, -6, -4, -2, 2, 4, 6, 8].map((i) => (
                        <g key={i}>
                          <line x1={150 + i * 12} y1="0" x2={150 + i * 12} y2="300" stroke="#f0eaff" strokeWidth="1" />
                          <line x1="0" y1={150 + i * 12} x2="300" y2={150 + i * 12} stroke="#f0eaff" strokeWidth="1" />
                        </g>
                      ))}
                      <line x1="0" y1="150" x2="300" y2="150" stroke="#7251a8" strokeWidth="2" />
                      <line x1="150" y1="0" x2="150" y2="300" stroke="#7251a8" strokeWidth="2" />
                      {renderLine(a1, b1, c1, "#e0457b")}
                      {renderLine(a2, b2, c2, "#0f9d8a")}
                      {hasSingleSolution && (
                        <circle cx={150 + solX * 12} cy={150 - solY * 12} r="6" fill="#f4ad21" stroke="#ffffff" strokeWidth="2" />
                      )}
                    </svg>
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#2a2830] flex gap-3">
                    <span className="text-[#e0457b]">● Garis 1</span>
                    <span className="text-[#0f9d8a]">● Garis 2</span>
                    <span className="text-[#f4ad21]">● Titik Potong</span>
                  </div>
                </div>

                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="rounded-xl border-2 border-white bg-white/95 p-3 shadow-xs">
                    <span className="text-xs font-bold text-[#e0457b] block mb-1">
                      Garis 1: {a1}x {b1 >= 0 ? `+ ${b1}y` : `- ${Math.abs(b1)}y`} = {c1}
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                      <div>a₁: <input type="range" min="-5" max="5" value={a1} onChange={(e) => setA1(Number(e.target.value))} className="w-full accent-[#e0457b]" /></div>
                      <div>b₁: <input type="range" min="-5" max="5" value={b1} onChange={(e) => setB1(Number(e.target.value))} className="w-full accent-[#e0457b]" /></div>
                      <div>c₁: <input type="range" min="-15" max="15" value={c1} onChange={(e) => setC1(Number(e.target.value))} className="w-full accent-[#e0457b]" /></div>
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-white bg-white/95 p-3 shadow-xs">
                    <span className="text-xs font-bold text-[#0f9d8a] block mb-1">
                      Garis 2: {a2}x {b2 >= 0 ? `+ ${b2}y` : `- ${Math.abs(b2)}y`} = {c2}
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                      <div>a₂: <input type="range" min="-5" max="5" value={a2} onChange={(e) => setA2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" /></div>
                      <div>b₂: <input type="range" min="-5" max="5" value={b2} onChange={(e) => setB2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" /></div>
                      <div>c₂: <input type="range" min="-15" max="15" value={c2} onChange={(e) => setC2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" /></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setPreset(1, 1, 7, 1, -1, 1)} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">1 Solusi</button>
                    <button onClick={() => setPreset(2, 4, 6, 1, 2, 5)} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">Sejajar (0 Solusi)</button>
                    <button onClick={() => setPreset(1, 2, 6, 2, 4, 12)} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">Berimpit (∞ Solusi)</button>
                  </div>
                  <div className="rounded-xl border-2 border-white bg-[#fdffd3] p-2.5 text-xs font-bold text-[#2a2830]">
                    {hasSingleSolution && (
                      <span>✓ Titik Potong: x = {solX.toFixed(1).replace(/\.0$/, "")}, y = {solY.toFixed(1).replace(/\.0$/, "")}</span>
                    )}
                    {isParallel && <span>⚠️ Sejajar → 0 solusi</span>}
                    {isCoincident && <span>♾️ Berimpit → ∞ solusi</span>}
                  </div>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col gap-3 my-auto animate-in fade-in duration-200 py-2 text-left">
                {(() => {
                  // Persamaan patokan: x + 2y = 4
                  const sameSlope = 1 * ratioB2 === ratioA2 * 2;
                  const sameConst = sameSlope && 1 * ratioC2 === ratioA2 * 4 && 2 * ratioC2 === ratioB2 * 4;
                  const status = !sameSlope ? "1_SOL" : sameConst ? "INF_SOL" : "NO_SOL";
                  return (
                    <>
                      <div className="rounded-2xl border-4 border-white bg-white p-4 shadow flex flex-col gap-2">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="game-font text-base font-semibold text-[#7251a8]">
                            🔬 Tester Rasio Koefisien (Patokan: 1x + 2y = 4)
                          </span>
                          <span className="text-xs font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                            Geser Persamaan 2: {ratioA2}x + {ratioB2}y = {ratioC2}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                          <div>a₂ = {ratioA2} <input type="range" min="1" max="4" value={ratioA2} onChange={(e) => setRatioA2(Number(e.target.value))} className="w-full accent-[#5e65e9]" /></div>
                          <div>b₂ = {ratioB2} <input type="range" min="1" max="6" value={ratioB2} onChange={(e) => setRatioB2(Number(e.target.value))} className="w-full accent-[#e05f1e]" /></div>
                          <div>c₂ = {ratioC2} <input type="range" min="2" max="12" value={ratioC2} onChange={(e) => setRatioC2(Number(e.target.value))} className="w-full accent-[#16a34a]" /></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className={`rounded-2xl border-4 border-white p-4 shadow transition-all ${status === "1_SOL" ? "bg-emerald-100 scale-103 ring-2 ring-emerald-500" : "bg-white/75 opacity-65"}`}>
                          <span className="game-font text-base font-semibold text-emerald-800 block">1. Tepat 1 Solusi</span>
                          <div className="font-bold text-emerald-700 my-1">a₁/a₂ ≠ b₁/b₂</div>
                          <p className="text-gray-700 font-medium">Rasio: 1/{ratioA2} vs 2/{ratioB2}. Dua garis berpotongan di 1 titik!</p>
                        </div>
                        <div className={`rounded-2xl border-4 border-white p-4 shadow transition-all ${status === "NO_SOL" ? "bg-rose-100 scale-103 ring-2 ring-rose-500" : "bg-white/75 opacity-65"}`}>
                          <span className="game-font text-base font-semibold text-rose-800 block">2. Sejajar (0 Solusi)</span>
                          <div className="font-bold text-rose-700 my-1">a₁/a₂ = b₁/b₂ ≠ c₁/c₂</div>
                          <p className="text-gray-700 font-medium">Koefisien x &amp; y sebanding, tapi konstantanya beda!</p>
                        </div>
                        <div className={`rounded-2xl border-4 border-white p-4 shadow transition-all ${status === "INF_SOL" ? "bg-sky-100 scale-103 ring-2 ring-sky-500" : "bg-white/75 opacity-65"}`}>
                          <span className="game-font text-base font-semibold text-sky-800 block">3. Berimpit (∞ Solusi)</span>
                          <div className="font-bold text-sky-700 my-1">a₁/a₂ = b₁/b₂ = c₁/c₂</div>
                          <p className="text-gray-700 font-medium">Persamaan kedua kelipatan utuh Persamaan pertama!</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Section 4:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Jika garis 2x + 4y = 8 dan x + 2y = 10 digambar di bidang Cartesius, kedudukan kedua garis tersebut adalah...
                  </p>
                  <QuizOptionRow
                    answered={quizAnswered}
                    onSelect={(idx) => { playClick(); setQuizAnswered(idx); }}
                    options={[
                      { label: "Sejajar (0 solusi)", isRight: true },
                      { label: "Berimpit (∞ solusi)", isRight: false },
                      { label: "Berpotongan di 1 titik", isRight: false },
                    ]}
                  />
                </div>
                {renderSectionFooterAction()}
              </div>
            )}
          </>
        )}

        {/* ══════════════ SECTION 5: APLIKASI SOAL CERITA KONTEKSTUAL ══════════════ */}
        {sectionNum === 5 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2 text-center">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#e05f1e] block mb-1">
                    🧩 Rakit Model Matematika!
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    &quot;Harga <b>2 mangkuk bakso (x)</b> dan <b>3 gelas es teh (y)</b> adalah <b>Rp 34.000</b>&quot;
                  </p>

                  <div className="mt-3 min-h-[44px] rounded-xl bg-purple-50 border-2 border-dashed border-purple-300 flex items-center justify-center gap-2 px-4 py-2 font-bold text-lg text-[#422376]">
                    {storyTokens.length === 0 ? (
                      <span className="text-xs text-gray-500">Klik kepingan di bawah secara berurutan untuk merakit persamaannya!</span>
                    ) : (
                      <span>{storyTokens.join(" ")}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {["2x", "+", "-", "3y", "=", "34.000", "2y"].map((tok) => (
                      <button
                        key={tok}
                        onClick={() => {
                          playClick();
                          setStoryTokens((prev) => [...prev, tok]);
                        }}
                        className="rounded-xl border-2 border-purple-200 bg-white px-3.5 py-1.5 font-bold text-sm text-[#2a2830] hover:bg-purple-100 cursor-pointer shadow-xs"
                      >
                        {tok}
                      </button>
                    ))}
                    <button
                      onClick={() => { playClick(); setStoryTokens([]); }}
                      className="rounded-xl bg-rose-100 text-rose-800 px-3 py-1.5 font-bold text-xs cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>

                  {storyTokens.join(" ") === "2x + 3y = 34.000" && (
                    <div className="mt-2 rounded-xl bg-emerald-100 text-emerald-900 p-2 text-xs font-bold">
                      🎉 Tepat Sekali! 2x + 3y = 34.000! Sekarang kamu ahli menerjemahkan soal cerita!
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col gap-3 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                      🎟️ Buka Langkah Demi Langkah: Tiket Wahana
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((st) => (
                        <button
                          key={st}
                          onClick={() => { playClick(); setStoryStep(st); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            storyStep >= st ? "bg-[#7251a8] text-white" : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          Tahap {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 bg-purple-50 rounded-xl p-3 border border-purple-200">
                    &quot;Harga 2 tiket dewasa dan 1 tiket anak Rp 70.000, sedangkan 1 dewasa dan 2 anak Rp 50.000. Berapa harga 1 dewasa + 1 anak?&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <button onClick={() => { playClick(); setStoryStep(Math.max(storyStep, 1)); }} className={`text-left rounded-xl border-2 border-white p-3 shadow cursor-pointer ${storyStep >= 1 ? "bg-white" : "bg-white/40 opacity-60"}`}>
                    <b className="text-[#e05f1e] block">1. Misal Variabel</b>
                    <span className="text-gray-700 font-medium">Tiket dewasa = <b>x</b>, Tiket anak = <b>y</b></span>
                  </button>
                  <button onClick={() => { playClick(); setStoryStep(Math.max(storyStep, 2)); }} className={`text-left rounded-xl border-2 border-white p-3 shadow cursor-pointer ${storyStep >= 2 ? "bg-white" : "bg-white/40 opacity-50"}`}>
                    <b className="text-[#5e65e9] block">2. Model SPLDV {storyStep < 2 && "(Klik untuk buka!)"}</b>
                    <span className="text-gray-700 font-medium">{storyStep >= 2 ? "(1) 2x + y = 70.000 & (2) x + 2y = 50.000" : "???"}</span>
                  </button>
                  <button onClick={() => { playClick(); setStoryStep(Math.max(storyStep, 3)); }} className={`text-left rounded-xl border-2 border-white p-3 shadow cursor-pointer ${storyStep >= 3 ? "bg-white" : "bg-white/40 opacity-50"}`}>
                    <b className="text-[#028560] block">3. Hitung Solusi {storyStep < 3 && "(Klik untuk buka!)"}</b>
                    <span className="text-gray-700 font-medium">{storyStep >= 3 ? "4x + 2y = 140.000 - (2) → 3x = 90.000 → x = 30.000" : "???"}</span>
                  </button>
                  <button onClick={() => { playCorrect(); setStoryStep(4); }} className={`text-left rounded-xl border-2 border-white p-3 shadow cursor-pointer ${storyStep >= 4 ? "bg-[#f0fdf4]" : "bg-white/40 opacity-50"}`}>
                    <b className="text-emerald-800 block">4. Kesimpulan {storyStep < 4 && "(Klik untuk buka!)"}</b>
                    <span className="text-emerald-950 font-semibold">{storyStep >= 4 ? "y = 10.000 → Jadi x + y = Rp 40.000!" : "???"}</span>
                  </button>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow flex flex-col gap-3">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#5e65e9]">
                    📐 Lab Taman Geometri: Cari p dan l Supaya Keliling = 36 m &amp; Selisih = 4 m!
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-7 flex flex-col gap-2.5 text-xs font-bold">
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                        Panjang (p) = {rectP} m
                        <input type="range" min="4" max="15" value={rectP} onChange={(e) => setRectP(Number(e.target.value))} className="w-full accent-[#5e65e9]" />
                      </div>
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                        Lebar (l) = {rectL} m
                        <input type="range" min="3" max="14" value={rectL} onChange={(e) => setRectL(Number(e.target.value))} className="w-full accent-[#e05f1e]" />
                      </div>
                      {(() => {
                        const kel = 2 * (rectP + rectL);
                        const sel = rectP - rectL;
                        const ok = kel === 36 && sel === 4;
                        return (
                          <div className={`p-3 rounded-xl border-2 text-center ${ok ? "bg-emerald-100 border-emerald-400 text-emerald-900" : "bg-purple-50 border-purple-200 text-gray-800"}`}>
                            <div>Keliling = <b>{kel} m</b> (Target: 36 m) | Selisih (p - l) = <b>{sel} m</b> (Target: 4 m)</div>
                            <div className="mt-1">{ok ? `🎉 Pas! Luas Taman = ${rectP} × ${rectL} = ${rectP * rectL} m²!` : "Geser slider p & l sampai kedua target cocok!"}</div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#f8f7fc] rounded-2xl p-4 border-2 border-purple-200 min-h-[150px]">
                      <div
                        style={{ width: `${Math.min(180, rectP * 11)}px`, height: `${Math.min(120, rectL * 10)}px` }}
                        className="rounded-lg bg-emerald-400/80 border-4 border-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-950 shadow transition-all"
                      >
                        {rectP}m × {rectL}m
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600 mt-2">Sketsa Taman Langsung</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Akhir (Section 5):</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Keliling persegi panjang 30 cm. Jika panjang = p dan lebar = l, persamaan paling sederhana adalah...
                  </p>
                  <QuizOptionRow
                    answered={quizAnswered}
                    onSelect={(idx) => { playClick(); setQuizAnswered(idx); }}
                    options={[
                      { label: "p + l = 15", isRight: true },
                      { label: "p + l = 30", isRight: false },
                      { label: "p × l = 30", isRight: false },
                    ]}
                  />
                </div>
                {renderSectionFooterAction()}
              </div>
            )}
          </>
        )}

        {/* Bottom Slide Nav */}
        <div className="flex w-full items-center justify-between gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-white/50">
          <button
            onClick={() => { playClick(); if (slide > 1) setSlide(slide - 1); }}
            disabled={slide === 1}
            className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white px-3 sm:px-5 py-1.5 sm:py-2 game-font text-xs sm:text-sm font-bold transition-all shrink-0 ${
              slide === 1 ? "bg-zinc-400 text-zinc-200 opacity-50 cursor-not-allowed" : "bg-zinc-600 text-white shadow hover:scale-102 cursor-pointer active:scale-95"
            }`}
          >
            &larr; <span className="hidden sm:inline">Sebelumnya</span><span className="sm:hidden">Sebelum</span>
          </button>

          <span className="game-font text-xs sm:text-sm font-bold text-[#2a2830] whitespace-nowrap px-1 text-center shrink-0">
            Slide {slide} dari {totalSlides}
          </span>

          {slide < totalSlides ? (
            <button
              onClick={() => { playClick(); setSlide(slide + 1); }}
              className="rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-[#e05f1e] px-3 sm:px-5 py-1.5 sm:py-2 game-font text-xs sm:text-sm font-bold text-white shadow hover:scale-102 cursor-pointer active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Selanjutnya</span><span className="sm:hidden">Lanjut</span> &rarr;
            </button>
          ) : isGuru && sectionNum < 5 ? (
            <button
              onClick={() => {
                playClick();
                router.push(`/spldv/materi?section=${sectionNum + 1}`);
              }}
              className="rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-[#5e65e9] px-3 sm:px-5 py-1.5 sm:py-2 game-font text-xs sm:text-sm font-bold text-white shadow hover:scale-102 cursor-pointer active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Materi Bagian {sectionNum + 1}</span><span className="sm:hidden">Bagian {sectionNum + 1}</span> &rarr;
            </button>
          ) : (
            <Link
              href="/spldv"
              onClick={playClick}
              className="rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white bg-[#1cd8a4] px-3 sm:px-5 py-1.5 sm:py-2 game-font text-xs sm:text-sm font-bold text-[#144837] shadow hover:scale-102 cursor-pointer active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Kembali ke Menu</span><span className="sm:hidden">Menu</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpldvMateriPage() {
  return (
    <GameShell backUrl="/spldv" showBack={true}>
      <Suspense fallback={<div className="game-font text-white text-2xl">Memuat Materi...</div>}>
        <SpldvMateriContent />
      </Suspense>
    </GameShell>
  );
}
