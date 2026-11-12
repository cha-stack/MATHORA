"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { getMateriProgress, saveMateriProgress, getCurrentUser } from "@/lib/auth";

function SpldvMateriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secParam = searchParams.get("section");
  const sectionNum = secParam === "2" ? 2 : 1;

  const [isGuru, setIsGuru] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.role === "guru";
    }
    return false;
  });

  const [slide, setSlide] = useState(1);
  const totalSlides = sectionNum === 2 ? 6 : 7;
  const { playClick } = useSound();

  // Validasi: Siswa wajib Pre-Test, GURU BEBAS AKSES materi langsung
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role === "guru") {
      setIsGuru(true);
      return; // GURU BEBAS AKSES MATERI TANPA PRE-TEST!
    }
    const p = getMateriProgress();
    if (sectionNum === 1) {
      if (!p.section1_pretest) {
        alert("Kamu harus menyelesaikan Pre-Test Section 1 terlebih dahulu!");
        router.replace("/spldv/pretest?section=1");
      }
    } else {
      if (!p.section2_unlocked) {
        alert("Section 2 masih terkunci!");
        router.replace("/spldv");
      } else if (!p.section2_pretest) {
        alert("Kamu harus menyelesaikan Pre-Test Section 2 terlebih dahulu!");
        router.replace("/spldv/pretest?section=2");
      }
    }
  }, [sectionNum, router]);

  // Tandai materi section ini telah selesai dipelajari saat mencapai slide terakhir (khusus siswa)
  useEffect(() => {
    if (slide === totalSlides) {
      const user = getCurrentUser();
      if (user?.role !== "guru") {
        if (sectionNum === 1) {
          saveMateriProgress({ section1_materi: true });
        } else {
          saveMateriProgress({ section2_materi: true });
        }
      }
    }
  }, [slide, totalSlides, sectionNum]);

  // Section 1 States:
  const [activeTab, setActiveTab] = useState<"SP" | "L" | "DV">("SP");
  const [apelCount, setApelCount] = useState(3);
  const [jerukCount, setJerukCount] = useState(1);
  const hargaApel = 2000;
  const hargaJeruk = 5000;
  const totalHarga = apelCount * hargaApel + jerukCount * hargaJeruk;

  // Graph slider states
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(1);
  const [c1, setC1] = useState(7);
  const [a2, setA2] = useState(1);
  const [b2, setB2] = useState(-1);
  const [c2, setC2] = useState(1);

  // Section 2 States:
  const [activeUnsurTab, setActiveUnsurTab] = useState<"VAR" | "KOEF" | "KONST">("VAR");
  const [customA, setCustomA] = useState(4);
  const [customB, setCustomB] = useState(-2);
  const [customC, setCustomC] = useState(16);
  const [inputX, setInputX] = useState(3);
  const [inputY, setInputY] = useState(2);

  // Mini quiz & interactive states
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizAnsweredSec2, setQuizAnsweredSec2] = useState<number | null>(null);
  const [elimMode, setElimMode] = useState<"sama" | "beda">("sama");
  const [subMode, setSubMode] = useState<"substitusi" | "campuran">("substitusi");
  const [storyStep, setStoryStep] = useState<number>(4);

  // Graph calculations
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

  const nextSlide = () => {
    playClick();
    if (slide < totalSlides) setSlide(slide + 1);
  };

  const prevSlide = () => {
    playClick();
    if (slide > 1) setSlide(slide - 1);
  };

  const renderLine = (a: number, b: number, c: number, color: string) => {
    if (b !== 0) {
      const x1 = -10;
      const y1 = (c - a * x1) / b;
      const x2 = 10;
      const y2 = (c - a * x2) / b;
      const svgX1 = 150 + x1 * 12;
      const svgY1 = 150 - y1 * 12;
      const svgX2 = 150 + x2 * 12;
      const svgY2 = 150 - y2 * 12;
      return <line x1={svgX1} y1={svgY1} x2={svgX2} y2={svgY2} stroke={color} strokeWidth="3" strokeLinecap="round" />;
    } else if (a !== 0) {
      const x = c / a;
      const svgX = 150 + x * 12;
      return <line x1={svgX} y1={0} x2={svgX} y2={300} stroke={color} strokeWidth="3" strokeLinecap="round" />;
    }
    return null;
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center min-h-[600px] justify-between">
        {/* Top Progress & Title */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-[#7251a8] px-3.5 py-0.5 text-xs font-bold text-white shadow">
              Section {sectionNum} • {sectionNum === 1 ? "Pengertian SPLDV" : "Variabel & Koefisien"}
            </span>
          </div>

          <div className="flex w-full max-w-xl gap-2.5 mb-3">
            {Array.from({ length: totalSlides }).map((_, i) => {
              const s = i + 1;
              return (
                <button
                  key={s}
                  onClick={() => {
                    playClick();
                    setSlide(s);
                  }}
                  className={`h-3.5 flex-1 rounded-full transition-all cursor-pointer ${
                    s <= slide ? "bg-[#7251a8] shadow" : "bg-white/80 hover:bg-white"
                  }`}
                  title={`Slide ${s}`}
                />
              );
            })}
          </div>

          <h2 className="game-font text-2xl sm:text-3xl md:text-4xl text-[#2a2830] font-semibold text-center">
            {sectionNum === 1 ? (
              <>
                {slide === 1 && "1. Bedah Konsep: Mengapa Perlu SPLDV?"}
                {slide === 2 && "2. Simulasi Belanja Koperasi Sekolah"}
                {slide === 3 && "3. Lab Grafik Interaktif: Geser Garis"}
                {slide === 4 && "4. Metode Eliminasi: Menghilangkan Variabel"}
                {slide === 5 && "5. Metode Substitusi & Campuran"}
                {slide === 6 && "6. Strategi Pemodelan Soal Cerita SPLDV"}
                {slide === 7 && "7. Rangkuman & Kuis Pemantapan"}
              </>
            ) : (
              <>
                {slide === 1 && "1. Bedah Anatomi Persamaan Linear"}
                {slide === 2 && "2. Jebakan Tanda & Bentuk Tak Baku"}
                {slide === 3 && "3. Lab Interaktif: Uji Solusi Titik (x, y)"}
                {slide === 4 && "4. Mengenal Jenis Solusi dari Perbandingan Koefisien"}
                {slide === 5 && "5. Kuis Pemantapan Unsur Aljabar"}
                {slide === 6 && "6. Rangkuman Section 2"}
              </>
            )}
          </h2>
        </div>

        {/* SECTION 1 SLIDES */}
        {sectionNum === 1 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow text-center border-3 border-purple-100">
                  <p className="text-lg sm:text-2xl text-[#2a2830] font-bold leading-relaxed">
                    <span className="text-[#e05f1e]">SPLDV</span> adalah dua persamaan linear yang memuat dua variabel yang sama dan harus dipenuhi bersama-sama.
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-[#f8f298] px-4 py-1 text-xs font-bold text-[#422376]">
                    💡 Klik tab kartu di bawah untuk melihat rahasianya:
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <button
                    onClick={() => { playClick(); setActiveTab("SP"); }}
                    className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 transition-all cursor-pointer ${
                      activeTab === "SP" ? "bg-[#1cd8a4] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">[ SP ]</span>
                    <span className="text-xs font-bold text-[#2a2830]">Sistem Persamaan</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab("L"); }}
                    className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 transition-all cursor-pointer ${
                      activeTab === "L" ? "bg-[#f8f298] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">[ L ]</span>
                    <span className="text-xs font-bold text-[#2a2830]">Linear</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab("DV"); }}
                    className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 transition-all cursor-pointer ${
                      activeTab === "DV" ? "bg-[#d3e9ff] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">[ DV ]</span>
                    <span className="text-xs font-bold text-[#2a2830]">Dua Variabel</span>
                  </button>
                </div>

                <div className="w-full rounded-[24px] border-4 border-white bg-white p-5 shadow animate-in zoom-in-95 text-left">
                  {activeTab === "SP" && (
                    <div>
                      <h4 className="font-bold text-emerald-800 text-base mb-1">🔗 Sistem Persamaan: Dua Petunjuk Sekaligus!</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Satu petunjuk (misal: 3 pensil + 1 buku = Rp11.000) belum cukup karena banyak kemungkinan harga. Dengan dua petunjuk sekaligus, jawabannya jadi pasti!
                      </p>
                    </div>
                  )}
                  {activeTab === "L" && (
                    <div>
                      <h4 className="font-bold text-amber-800 text-base mb-1">📏 Linear: Grafiknya Selalu Garis Lurus!</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Pangkat tertinggi setiap variabelnya tepat satu. Jika digambar di koordinat Cartesius, bentuknya berupa garis lurus tanpa lengkungan.
                      </p>
                    </div>
                  )}
                  {activeTab === "DV" && (
                    <div>
                      <h4 className="font-bold text-blue-800 text-base mb-1">🍎🍊 Dua Variabel: Dua Nilai Misterius</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Memiliki dua variabel berbeda (misal x dan y) yang mewakili dua besaran yang belum diketahui harganya.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[20px] bg-white p-4 shadow text-center">
                  <span className="game-font text-lg font-bold text-[#7251a8]">
                    🛒 Simulasi Koperasi Sekolah: Pensil (x) & Buku (y)
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Coba klik tombol + atau - untuk melihat model matematika terbentuk secara dinamis.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex items-center justify-between rounded-2xl border-4 border-white bg-blue-50 p-4 shadow">
                    <div>
                      <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">Pensil (x)</span>
                      <p className="text-xs font-semibold text-blue-700">@ Rp 2.000</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { playClick(); setApelCount(Math.max(0, apelCount - 1)); }} className="size-8 rounded-full bg-blue-500 font-bold text-white shadow">-</button>
                      <span className="game-font text-xl font-bold w-6 text-center">{apelCount}</span>
                      <button onClick={() => { playClick(); setApelCount(apelCount + 1); }} className="size-8 rounded-full bg-blue-500 font-bold text-white shadow">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border-4 border-white bg-amber-50 p-4 shadow">
                    <div>
                      <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">Buku (y)</span>
                      <p className="text-xs font-semibold text-amber-700">@ Rp 5.000</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { playClick(); setJerukCount(Math.max(0, jerukCount - 1)); }} className="size-8 rounded-full bg-amber-500 font-bold text-white shadow">-</button>
                      <span className="game-font text-xl font-bold w-6 text-center">{jerukCount}</span>
                      <button onClick={() => { playClick(); setJerukCount(jerukCount + 1); }} className="size-8 rounded-full bg-amber-500 font-bold text-white shadow">+</button>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-[24px] border-4 border-white bg-[#fdffd3] p-5 shadow text-center">
                  <span className="text-xs font-bold uppercase text-gray-500">Persamaan Terbentuk:</span>
                  <div className="game-font text-2xl sm:text-3xl text-[#422376] font-bold my-1">
                    {apelCount}x + {jerukCount}y = Rp {totalHarga.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col md:flex-row gap-5 items-center my-auto animate-in fade-in duration-200 py-1">
                <div className="flex flex-col items-center">
                  <div className="relative size-[260px] sm:size-[280px] rounded-2xl border-4 border-white bg-white shadow overflow-hidden">
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
                    <span className="text-[#f4ad21]">● Solusi (x,y)</span>
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
                    <button onClick={() => setPreset(1, 1, 7, 1, -1, 1)} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">1 Solusi</button>
                    <button onClick={() => setPreset(2, 4, 6, 1, 2, 5)} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">Sejajar (0 Solusi)</button>
                    <button onClick={() => setPreset(1, 2, 6, 2, 4, 12)} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#7251a8] shadow cursor-pointer">Berimpit (∞ Solusi)</button>
                  </div>

                  <div className="rounded-xl border-2 border-white bg-[#fdffd3] p-2.5 text-xs font-bold text-[#2a2830]">
                    {hasSingleSolution && (
                      <span>✓ Titik Potong (Solusi Tunggal): x = {solX.toFixed(1).replace(/\.0$/, "")}, y = {solY.toFixed(1).replace(/\.0$/, "")}</span>
                    )}
                    {isParallel && <span>⚠️ Kedua garis sejajar → Tidak ada titik potong (0 solusi)</span>}
                    {isCoincident && <span>♾️ Kedua garis berimpit → Tak hingga banyak solusi</span>}
                  </div>
                </div>
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl p-3.5 shadow border-2 border-purple-100">
                  <div>
                    <span className="game-font text-base sm:text-lg font-semibold text-[#e05f1e]">
                      ✂️ Rumus Sakti Eliminasi: &quot;SAMA KURANG, BEDA TAMBAH&quot;
                    </span>
                    <p className="text-xs text-gray-600 font-medium">
                      Samakan angka di depan salah satu variabel, lalu lihat tandanya (+ / -) untuk menghilangkannya.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { playClick(); setElimMode("sama"); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        elimMode === "sama" ? "bg-[#e05f1e] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      Tanda Sama (-)
                    </button>
                    <button
                      onClick={() => { playClick(); setElimMode("beda"); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        elimMode === "beda" ? "bg-[#5e65e9] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      Tanda Beda (+)
                    </button>
                  </div>
                </div>

                {elimMode === "sama" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                    <div className="rounded-2xl border-4 border-white bg-white p-4 shadow flex flex-col gap-2">
                      <span className="text-xs font-bold text-[#e05f1e] uppercase">Contoh Soal (Tanda Sama):</span>
                      <div className="rounded-xl bg-amber-50 p-3 font-bold text-sm sm:text-base text-[#2a2830] space-y-1">
                        <div>(1) 2x + y = 11</div>
                        <div>(2) x + y = 7</div>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        Koefisien <b>y</b> sudah sama-sama <b>+1</b> (tanda SAMA). Karena tandanya sama, maka kita <b>KURANGKAN (-)</b> agar y menjadi 0!
                      </p>
                    </div>
                    <div className="rounded-2xl border-4 border-white bg-[#f0fdf4] p-4 shadow flex flex-col gap-1.5 text-xs sm:text-sm font-medium text-gray-800">
                      <span className="text-xs font-bold text-emerald-800 uppercase mb-1">Langkah Pengerjaan:</span>
                      <div>1. Kurangkan (1) - (2): <span className="font-bold">(2x - x) + (y - y) = 11 - 7</span></div>
                      <div>2. Diperoleh: <span className="font-bold text-emerald-700">x = 4</span></div>
                      <div>3. Masukkan x = 4 ke (2): <span className="font-bold">4 + y = 7 → y = 3</span></div>
                      <div className="mt-1 rounded-lg bg-emerald-200/70 px-3 py-1.5 font-bold text-emerald-950">
                        ✓ Jadi Himpunan Penyelesaian = &#123;(4, 3)&#125;
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                    <div className="rounded-2xl border-4 border-white bg-white p-4 shadow flex flex-col gap-2">
                      <span className="text-xs font-bold text-[#5e65e9] uppercase">Contoh Soal (Tanda Berlawanan):</span>
                      <div className="rounded-xl bg-indigo-50 p-3 font-bold text-sm sm:text-base text-[#2a2830] space-y-1">
                        <div>(1) 3x + 2y = 16</div>
                        <div>(2) x - y = 2  <span className="text-xs text-indigo-700">(×2 → 2x - 2y = 4)</span></div>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        Setelah dikali 2, koefisien y menjadi <b>+2y</b> dan <b>-2y</b> (tanda BEDA). Maka kita <b>TAMBAHKAN (+)</b> agar +2y + (-2y) = 0!
                      </p>
                    </div>
                    <div className="rounded-2xl border-4 border-white bg-[#f0fdf4] p-4 shadow flex flex-col gap-1.5 text-xs sm:text-sm font-medium text-gray-800">
                      <span className="text-xs font-bold text-emerald-800 uppercase mb-1">Langkah Pengerjaan:</span>
                      <div>1. Jumlahkan (1) + (2&apos;): <span className="font-bold">(3x + 2x) = 16 + 4 → 5x = 20</span></div>
                      <div>2. Diperoleh: <span className="font-bold text-emerald-700">x = 4</span></div>
                      <div>3. Masukkan x = 4 ke x - y = 2: <span className="font-bold">4 - y = 2 → y = 2</span></div>
                      <div className="mt-1 rounded-lg bg-emerald-200/70 px-3 py-1.5 font-bold text-emerald-950">
                        ✓ Jadi Himpunan Penyelesaian = &#123;(4, 2)&#125;
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {slide === 5 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl p-3.5 shadow border-2 border-purple-100">
                  <div>
                    <span className="game-font text-base sm:text-lg font-semibold text-[#5e65e9]">
                      🔄 Metode Substitusi (Ganti Nilai) &amp; Metode Campuran
                    </span>
                    <p className="text-xs text-gray-600 font-medium">
                      Pilih tab di kanan untuk melihat langkah lengkap kedua metode favorit dalam ujian!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { playClick(); setSubMode("substitusi"); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        subMode === "substitusi" ? "bg-[#5e65e9] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      2. Substitusi
                    </button>
                    <button
                      onClick={() => { playClick(); setSubMode("campuran"); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        subMode === "campuran" ? "bg-[#028560] text-white shadow" : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      3. Campuran
                    </button>
                  </div>
                </div>

                {subMode === "substitusi" ? (
                  <div className="rounded-2xl border-4 border-white bg-white p-4 sm:p-5 shadow text-left flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <span className="text-xs sm:text-sm font-bold text-[#5e65e9]">Contoh: Selesaikan y = 2x + 1 dan 3x + y = 16</span>
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">Cocok jika ada koefisien 1</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-gray-800 pt-1">
                      <div className="rounded-xl bg-blue-50/70 p-3 space-y-1">
                        <div><b>Langkah 1:</b> Persamaan (1) sudah dalam bentuk <b>y = 2x + 1</b>.</div>
                        <div><b>Langkah 2:</b> Ganti huruf <b>y</b> pada (2) dengan <b>(2x + 1)</b>:</div>
                        <div className="font-bold text-blue-900">3x + (2x + 1) = 16</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50/80 p-3 space-y-1">
                        <div><b>Langkah 3:</b> 5x + 1 = 16 → 5x = 15 → <b className="text-emerald-700">x = 3</b></div>
                        <div><b>Langkah 4:</b> Hitung y = 2(3) + 1 = <b className="text-emerald-700">7</b></div>
                        <div className="font-bold text-emerald-900">✓ Solusi: (x, y) = (3, 7)</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-4 border-white bg-white p-4 sm:p-5 shadow text-left flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <span className="text-xs sm:text-sm font-bold text-[#028560]">Metode Campuran (Eliminasi → lalu Substitusi)</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Paling Cepat &amp; Populer!</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-gray-800 pt-1">
                      <div className="rounded-xl bg-amber-50/80 p-3 space-y-1">
                        <div><b>Soal:</b> 2x + 3y = 19 dan 2x + y = 9</div>
                        <div><b>Tahap 1 (Eliminasi x):</b> (2x + 3y) - (2x + y) = 19 - 9</div>
                        <div className="font-bold text-amber-900">2y = 10 → y = 5</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50/80 p-3 space-y-1">
                        <div><b>Tahap 2 (Substitusi y = 5):</b> Masukkan ke 2x + y = 9</div>
                        <div>2x + 5 = 9 → 2x = 4 → <b className="text-emerald-700">x = 2</b></div>
                        <div className="font-bold text-emerald-900">✓ Solusi: (x, y) = (2, 5)</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {slide === 6 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                      📖 Studi Kasus Soal Cerita SPLDV
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
                    &quot;Di taman hiburan, harga 2 tiket dewasa dan 1 tiket anak adalah Rp 70.000. Sedangkan 1 tiket dewasa dan 2 tiket anak adalah Rp 50.000. Berapakah harga 1 tiket dewasa dan 1 tiket anak?&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <div className={`rounded-xl border-2 border-white p-3 shadow transition-all ${storyStep >= 1 ? "bg-white" : "bg-white/40 opacity-50"}`}>
                    <b className="text-[#e05f1e] block">1. Pemisalan Variabel</b>
                    <span className="text-gray-700 font-medium">Misal: Harga tiket dewasa = <b>x</b>, Harga tiket anak = <b>y</b></span>
                  </div>
                  <div className={`rounded-xl border-2 border-white p-3 shadow transition-all ${storyStep >= 2 ? "bg-white" : "bg-white/40 opacity-50"}`}>
                    <b className="text-[#5e65e9] block">2. Model Matematika</b>
                    <span className="text-gray-700 font-medium">(1) <b>2x + y = 70.000</b> &amp; (2) <b>x + 2y = 50.000</b></span>
                  </div>
                  <div className={`rounded-xl border-2 border-white p-3 shadow transition-all ${storyStep >= 3 ? "bg-white" : "bg-white/40 opacity-50"}`}>
                    <b className="text-[#028560] block">3. Hitung (Eliminasi/Substitusi)</b>
                    <span className="text-gray-700 font-medium">Kalikan (1) × 2: 4x + 2y = 140.000. Kurangi (2) → 3x = 90.000 → <b>x = 30.000</b></span>
                  </div>
                  <div className={`rounded-xl border-2 border-white p-3 shadow transition-all ${storyStep >= 4 ? "bg-[#f0fdf4]" : "bg-white/40 opacity-50"}`}>
                    <b className="text-emerald-800 block">4. Kesimpulan Jawaban</b>
                    <span className="text-emerald-950 font-semibold">y = 70.000 - 2(30.000) = 10.000. Jadi x+y = <b>Rp 40.000</b>!</span>
                  </div>
                </div>
              </div>
            )}

            {slide === 7 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-bold text-[#7251a8]">🎯 Kuis Pemantapan Section 1:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-1">
                    Jika dua garis saling sejajar, berapa jumlah penyelesaian SPLDV tersebut?
                  </p>
                  <div className="flex justify-center gap-2.5 mt-3">
                    {[
                      { label: "1 Solusi", isRight: false },
                      { label: "0 Solusi (Tidak Ada)", isRight: true },
                      { label: "Tak Hingga", isRight: false },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { playClick(); setQuizAnswered(idx); }}
                        className={`rounded-xl border-2 border-white px-4 py-2 font-semibold text-xs sm:text-sm shadow cursor-pointer transition-all ${
                          quizAnswered !== null
                            ? item.isRight
                              ? "bg-emerald-400 text-emerald-950 font-bold"
                              : quizAnswered === idx
                              ? "bg-rose-200 border-rose-400 text-rose-900"
                              : "bg-rose-50/90 border-rose-200 text-rose-800/80"
                            : "bg-[#e4d3ff] text-[#2a2830] hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isGuru ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3 w-full">
                    <button
                      onClick={() => {
                        playClick();
                        router.push("/spldv/materi?section=2");
                        setSlide(1);
                      }}
                      className="rounded-2xl border-4 border-white bg-[#5e65e9] px-6 py-3 game-font text-base sm:text-lg font-bold text-white shadow hover:scale-103 cursor-pointer"
                    >
                      Lanjut ke Materi Bagian 2 (Variabel & Koefisien) &rarr;
                    </button>
                    <Link
                      href="/spldv"
                      onClick={playClick}
                      className="rounded-2xl border-4 border-white bg-[#34b2cc] px-6 py-3 game-font text-base sm:text-lg font-bold text-white shadow hover:scale-103 cursor-pointer"
                    >
                      Kembali ke Menu Modul
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/spldv/posttest?section=1"
                    onClick={playClick}
                    className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-3 game-font text-base sm:text-lg font-bold text-[#144837] shadow hover:scale-103"
                  >
                    Lanjut ke Post-Test Section 1 &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* SECTION 2 SLIDES (VARIABEL, KOEFISIEN, KONSTANTA) */}
        {sectionNum === 2 && (
          <>
            {slide === 1 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow text-center border-3 border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Bentuk Baku Persamaan Linear:</span>
                  <div className="game-font text-3xl sm:text-5xl text-[#2a2830] font-bold my-2">
                    <span className="text-rose-600">a</span>x + <span className="text-blue-600">b</span>y = <span className="text-amber-600">c</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600">
                    Setiap bagian memiliki peran unik yang saling melengkapi dalam sistem aljabar.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("VAR"); }}
                    className={`rounded-2xl border-4 border-white p-4 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "VAR" ? "bg-[#d3e9ff] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-2xl font-bold text-blue-700 block">Variabel</span>
                    <span className="text-xs font-bold text-gray-700">Simbol Huruf (x, y)</span>
                  </button>

                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("KOEF"); }}
                    className={`rounded-2xl border-4 border-white p-4 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "KOEF" ? "bg-[#ffd3d3] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-2xl font-bold text-rose-700 block">Koefisien</span>
                    <span className="text-xs font-bold text-gray-700">Angka Pengali (a, b)</span>
                  </button>

                  <button
                    onClick={() => { playClick(); setActiveUnsurTab("KONST"); }}
                    className={`rounded-2xl border-4 border-white p-4 text-center transition-all cursor-pointer ${
                      activeUnsurTab === "KONST" ? "bg-[#fef08a] shadow-md scale-103" : "bg-white/90 shadow hover:bg-white"
                    }`}
                  >
                    <span className="game-font text-xl sm:text-2xl font-bold text-amber-700 block">Konstanta</span>
                    <span className="text-xs font-bold text-gray-700">Bilangan Tetap (c)</span>
                  </button>
                </div>

                <div className="w-full rounded-[24px] border-4 border-white bg-white p-5 shadow text-left">
                  {activeUnsurTab === "VAR" && (
                    <div>
                      <h4 className="font-bold text-blue-800 text-sm sm:text-base mb-1">📌 Variabel (Peubah)</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti. Biasanya disimbolkan dengan huruf kecil seperti x, y, p, q, a, b.
                      </p>
                    </div>
                  )}
                  {activeUnsurTab === "KOEF" && (
                    <div>
                      <h4 className="font-bold text-rose-800 text-sm sm:text-base mb-1">📌 Koefisien</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Bilangan pengali yang berada tepat di depan variabel. Jika tertulis -y, artinya koefisiennya adalah -1.
                      </p>
                    </div>
                  )}
                  {activeUnsurTab === "KONST" && (
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm sm:text-base mb-1">📌 Konstanta</h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        Bilangan tetap murni yang berdiri sendiri tanpa memuat variabel/huruf sama sekali di sisinya.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="w-full flex flex-col items-center gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[20px] bg-white p-4 shadow text-center">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                    🔍 Hati-Hati Jebakan Tanda &amp; Bentuk Tidak Baku!
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Selalu ubah dulu ke bentuk baku <b>ax + by = c</b> sebelum membaca koefisien dan konstantanya.
                  </p>
                </div>

                <div className="w-full rounded-2xl border-4 border-white bg-rose-50 p-4 sm:p-5 shadow text-center">
                  <div className="game-font text-2xl sm:text-3xl text-[#2a2830] font-semibold">
                    3x <span className="text-rose-600">- 5y</span> = 20
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2.5 text-xs sm:text-sm font-bold">
                    <div className="rounded-xl bg-white p-2.5 border border-gray-200">
                      <span className="block text-gray-500 text-xs">Koefisien x:</span>
                      <span className="text-base sm:text-lg text-emerald-700">3</span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border-2 border-rose-400">
                      <span className="block text-rose-600 text-xs">Koefisien y:</span>
                      <span className="text-base sm:text-lg text-rose-700 font-extrabold">-5 (Bukan 5!)</span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-gray-200">
                      <span className="block text-gray-500 text-xs">Konstanta:</span>
                      <span className="text-base sm:text-lg text-amber-700">20</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left text-xs sm:text-sm">
                  <div className="rounded-2xl border-2 border-white bg-white p-3.5 shadow">
                    <b className="text-amber-800 block mb-1">⚠️ Contoh Pindah Ruas:</b>
                    <span className="text-gray-700 font-medium">
                      <b>2x + 3y - 12 = 0</b> → pindahkan -12 ke kanan jadi <b>2x + 3y = 12</b>. Konstantanya adalah <b>12</b>, bukan -12!
                    </span>
                  </div>
                  <div className="rounded-2xl border-2 border-white bg-white p-3.5 shadow">
                    <b className="text-blue-800 block mb-1">⚠️ Contoh Urutan Terbalik:</b>
                    <span className="text-gray-700 font-medium">
                      <b>7y - x = 14</b> → koefisien <b>x</b> adalah <b>-1</b> (bukan 7!), dan koefisien <b>y</b> adalah <b>7</b>.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="w-full flex flex-col items-center gap-3.5 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[20px] bg-white p-3.5 shadow text-center">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                    🔬 Lab Uji Solusi: Apakah (x, y) Memenuhi Persamaan?
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Atur koefisien persamaan &amp; nilai titik (x, y) untuk melihat kapan ruas kiri tepat sama dengan ruas kanan!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 w-full bg-white/80 rounded-2xl p-3 border-2 border-white text-xs font-bold">
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

                <div className="grid grid-cols-2 gap-3.5 w-full">
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
                        Persamaan Target: {customA}x {customB >= 0 ? `+ ${customB}y` : `- ${Math.abs(customB)}y`} = {customC}
                      </span>
                      <div className="game-font text-xl sm:text-2xl text-[#422376] font-semibold my-1">
                        {customA}({inputX}) {customB >= 0 ? `+ ${customB}` : `- ${Math.abs(customB)}`}({inputY}) = {lhs}
                      </div>
                      <span className={`inline-block rounded-full px-4 py-1 text-xs font-bold ${isMatch ? "bg-emerald-500 text-white" : "bg-amber-200 text-amber-900"}`}>
                        {isMatch
                          ? `✓ Benar! (${inputX}, ${inputY}) adalah salah satu penyelesaian!`
                          : `Belum cocok (hasil ${lhs} ≠ ${customC}). Coba geser x atau y lagi!`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {slide === 4 && (
              <div className="w-full flex flex-col gap-3.5 my-auto animate-in fade-in duration-200 py-2 text-left">
                <div className="w-full rounded-[20px] bg-white p-3.5 shadow text-center">
                  <span className="game-font text-base sm:text-lg font-semibold text-[#7251a8]">
                    📐 Menebak Jumlah Solusi SPLDV Hanya dari Koefisiennya!
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Dari sistem a₁x + b₁y = c₁ dan a₂x + b₂y = c₂, cukup bandingkan rasio a₁/a₂, b₁/b₂, dan c₁/c₂:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div className="rounded-2xl border-4 border-white bg-emerald-50 p-4 shadow flex flex-col gap-1.5">
                    <span className="game-font text-base font-semibold text-emerald-800">1. Tepat 1 Solusi</span>
                    <div className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-emerald-700 text-center">a₁/a₂ ≠ b₁/b₂</div>
                    <p className="text-gray-700 font-medium">Dua garis pasti berpotongan di 1 titik unik.</p>
                    <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-1 rounded">Contoh: 2x+y=5 &amp; x-y=1</span>
                  </div>
                  <div className="rounded-2xl border-4 border-white bg-rose-50 p-4 shadow flex flex-col gap-1.5">
                    <span className="game-font text-base font-semibold text-rose-800">2. Tidak Ada Solusi</span>
                    <div className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-rose-700 text-center">a₁/a₂ = b₁/b₂ ≠ c₁/c₂</div>
                    <p className="text-gray-700 font-medium">Dua garis sejajar dan tidak akan pernah bertemu.</p>
                    <span className="text-[11px] font-semibold text-rose-900 bg-rose-100 px-2 py-1 rounded">Contoh: x+2y=4 &amp; 2x+4y=10</span>
                  </div>
                  <div className="rounded-2xl border-4 border-white bg-sky-50 p-4 shadow flex flex-col gap-1.5">
                    <span className="game-font text-base font-semibold text-sky-800">3. Tak Hingga Solusi</span>
                    <div className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-sky-700 text-center">a₁/a₂ = b₁/b₂ = c₁/c₂</div>
                    <p className="text-gray-700 font-medium">Persamaan kedua kelipatan persamaan pertama (berimpit).</p>
                    <span className="text-[11px] font-semibold text-sky-900 bg-sky-100 px-2 py-1 rounded">Contoh: x+y=3 &amp; 2x+2y=6</span>
                  </div>
                </div>
              </div>
            )}

            {slide === 5 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-base font-semibold text-[#7251a8]">🎯 Kuis Pemantapan Section 2:</span>
                  <p className="text-sm sm:text-base font-bold text-[#2a2830] mt-2">
                    Diberikan persamaan 5x - y - 15 = 0. Berapakah koefisien variabel y dan konstantanya dalam bentuk baku?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5 mt-4">
                    {[
                      { label: "Koefisien y = -1, Konstanta = 15", isRight: true },
                      { label: "Koefisien y = 1, Konstanta = -15", isRight: false },
                      { label: "Koefisien y = -1, Konstanta = -15", isRight: false },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { playClick(); setQuizAnsweredSec2(idx); }}
                        className={`rounded-xl border-2 border-white px-4 py-2 font-semibold text-xs sm:text-sm shadow cursor-pointer transition-all ${
                          quizAnsweredSec2 !== null
                            ? item.isRight
                              ? "bg-emerald-400 text-emerald-950 font-bold"
                              : quizAnsweredSec2 === idx
                              ? "bg-rose-200 border-rose-400 text-rose-900"
                              : "bg-rose-50/90 border-rose-200 text-rose-800/80"
                            : "bg-[#e4d3ff] text-[#2a2830] hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {quizAnsweredSec2 !== null && (
                    <p className="mt-3 text-xs font-semibold text-gray-700 bg-purple-50 rounded-xl p-2.5">
                      Pembahasan: Pindahkan -15 ke ruas kanan menjadi <b>5x - y = 15</b>. Karena <b>-y</b> berarti <b>(-1)y</b>, maka koefisien y = <b>-1</b> dan konstanta = <b>15</b>.
                    </p>
                  )}
                </div>
              </div>
            )}

            {slide === 6 && (
              <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
                <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                  <span className="game-font text-lg font-bold text-emerald-700">
                    🎉 {isGuru ? "Materi Modul SPLDV Lengkap Dipaparkan" : "Selamat! Kamu Menyelesaikan Materi Section 2"}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-2">
                    {isGuru
                      ? "Anda telah menyelesaikan peninjauan seluruh bahan ajar konsep SPLDV. Materi siap digunakan untuk mengajar."
                      : "Sekarang kamu siap untuk menguji pemahaman di Post-Test Section 2."}
                  </p>
                </div>

                {isGuru ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/spldv"
                      onClick={playClick}
                      className="rounded-2xl border-4 border-white bg-[#5e65e9] px-6 py-3 game-font text-base sm:text-lg font-bold text-white shadow hover:scale-103 cursor-pointer"
                    >
                      Kembali ke Menu Modul SPLDV
                    </Link>
                    <Link
                      href="/dashboard/guru"
                      onClick={playClick}
                      className="rounded-2xl border-4 border-white bg-[#e05f1e] px-6 py-3 game-font text-base sm:text-lg font-bold text-white shadow hover:scale-103 cursor-pointer"
                    >
                      Kembali ke Dashboard Guru
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/spldv/posttest?section=2"
                    onClick={playClick}
                    className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-3 game-font text-base sm:text-lg font-bold text-[#144837] shadow hover:scale-103"
                  >
                    Mulai Post-Test Section 2 &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Bottom Slide Nav */}
        <div className="flex w-full items-center justify-between pt-4 border-t border-white/50">
          <button
            onClick={prevSlide}
            disabled={slide === 1}
            className={`rounded-2xl border-4 border-white px-5 py-2 game-font text-xs sm:text-sm font-bold transition-all ${
              slide === 1 ? "bg-zinc-400 text-zinc-200 opacity-50 cursor-not-allowed" : "bg-zinc-600 text-white shadow hover:scale-102 cursor-pointer"
            }`}
          >
            &larr; Sebelumnya
          </button>

          <span className="game-font text-xs sm:text-sm font-bold text-[#2a2830]">
            Slide {slide} dari {totalSlides}
          </span>

          {slide < totalSlides ? (
            <button
              onClick={nextSlide}
              className="rounded-2xl border-4 border-white bg-[#e05f1e] px-5 py-2 game-font text-xs sm:text-sm font-bold text-white shadow hover:scale-102 cursor-pointer"
            >
              Selanjutnya &rarr;
            </button>
          ) : isGuru && sectionNum === 1 ? (
            <button
              onClick={() => {
                playClick();
                router.push("/spldv/materi?section=2");
                setSlide(1);
              }}
              className="rounded-2xl border-4 border-white bg-[#5e65e9] px-5 py-2 game-font text-xs sm:text-sm font-bold text-white shadow hover:scale-102 cursor-pointer"
            >
              Materi Bagian 2 &rarr;
            </button>
          ) : (
            <Link
              href="/spldv"
              onClick={playClick}
              className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-5 py-2 game-font text-xs sm:text-sm font-bold text-[#144837] shadow hover:scale-102 cursor-pointer"
            >
              Kembali ke Menu
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
