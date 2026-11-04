"use client";

import { useState } from "react";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";

export default function SpldvMateri() {
  const [slide, setSlide] = useState(1);
  const totalSlides = 5;
  const { playClick } = useSound();

  // State interaktif Slide 1: Kartu yang aktif diklik
  const [activeTab, setActiveTab] = useState<"SP" | "L" | "DV">("SP");

  // State interaktif Simulasi Toko Buah SPLDV (Slide 2)
  const [apelCount, setApelCount] = useState(3);
  const [jerukCount, setJerukCount] = useState(1);
  const hargaApel = 2000;
  const hargaJeruk = 5000;
  const totalHarga = apelCount * hargaApel + jerukCount * hargaJeruk;

  // State interaktif Slide 3: Interactive Dynamic Graph Slider
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(1);
  const [c1, setC1] = useState(7);
  const [a2, setA2] = useState(1);
  const [b2, setB2] = useState(-1);
  const [c2, setC2] = useState(1);

  // State mini kuis interaktif Slide 5
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  // Perhitungan titik potong grafik
  const det = a1 * b2 - a2 * b1;
  const hasSingleSolution = det !== 0;
  const solX = hasSingleSolution ? (c1 * b2 - c2 * b1) / det : 0;
  const solY = hasSingleSolution ? (a1 * c2 - a2 * c1) / det : 0;

  const isParallel =
    !hasSingleSolution && !(a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1);
  const isCoincident =
    !hasSingleSolution && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1;

  // Preset skenario grafik
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

  // Helper render garis koordinat SVG (-10 sampai 10)
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
    <GameShell backUrl="/spldv" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Learning Card */}
        <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center min-h-[590px] justify-between">
          {/* Top Progress Bar & Subheader */}
          <div className="w-full flex flex-col items-center">
            {/* Multi-segment Progress Bar */}
            <div className="flex w-full max-w-2xl gap-2.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    playClick();
                    setSlide(s);
                  }}
                  className={`h-3.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                    s <= slide ? "bg-[#7251a8] shadow" : "bg-white/80 hover:bg-white"
                  }`}
                  title={`Menuju Slide ${s}`}
                />
              ))}
            </div>

            <h2 className="game-font text-2xl sm:text-3xl md:text-4xl text-[#2a2830] font-bold text-center">
              {slide === 1 && "Pengertian & Bedah Konsep SPLDV"}
              {slide === 2 && "Simulasi Belanja Kontekstual"}
              {slide === 3 && "Laboratorium Grafik Interaktif (Bisa Digeser)"}
              {slide === 4 && "Metode Penyelesaian & Alur Berpikir"}
              {slide === 5 && "Evaluasi Mini Kuis Pemantapan"}
            </h2>
          </div>

          {/* SLIDE 1: PENGANTAR + KARTU INTERAKTIF YANG BISA DIKLIK */}
          {slide === 1 && (
            <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
              <div className="w-full rounded-[24px] bg-white p-5 sm:p-6 shadow-md text-center border-3 border-purple-100">
                <p className="text-lg sm:text-2xl text-[#2a2830] font-bold leading-relaxed">
                  <span className="text-[#e05f1e]">SPLDV</span> adalah dua persamaan linear yang memuat dua variabel yang sama dan harus dipenuhi bersama-sama.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f8f298] px-4 py-1 text-xs sm:text-sm font-bold text-[#422376]">
                  <span>💡 Klik tab kartu di bawah untuk membongkar artinya:</span>
                </div>
              </div>

              {/* 3 Interactive Clickable Tabs */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveTab("SP");
                  }}
                  className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 sm:p-4 transition-all cursor-pointer ${
                    activeTab === "SP"
                      ? "bg-[#1cd8a4] shadow-[0px_6px_0px_0px_#028560] scale-103"
                      : "bg-white/90 shadow-[0px_4px_0px_0px_#aaafaf] hover:bg-white"
                  }`}
                >
                  <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">
                    [ SP ]
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#2a2830] text-center">
                    Sistem Persamaan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveTab("L");
                  }}
                  className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 sm:p-4 transition-all cursor-pointer ${
                    activeTab === "L"
                      ? "bg-[#f8f298] shadow-[0px_6px_0px_0px_#f4ad21] scale-103"
                      : "bg-white/90 shadow-[0px_4px_0px_0px_#aaafaf] hover:bg-white"
                  }`}
                >
                  <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">
                    [ L ]
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#2a2830] text-center">
                    Linear
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveTab("DV");
                  }}
                  className={`flex flex-col items-center justify-center rounded-[24px] border-[5px] border-white p-3.5 sm:p-4 transition-all cursor-pointer ${
                    activeTab === "DV"
                      ? "bg-[#d3e9ff] shadow-[0px_6px_0px_0px_#5e65e9] scale-103"
                      : "bg-white/90 shadow-[0px_4px_0px_0px_#aaafaf] hover:bg-white"
                  }`}
                >
                  <span className="game-font text-2xl sm:text-4xl font-bold text-[#2a2830]">
                    [ DV ]
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#2a2830] text-center">
                    Dua Variabel
                  </span>
                </button>
              </div>

              {/* Dynamic Interactive Explanation Card */}
              <div className="w-full rounded-[24px] border-4 border-white bg-white p-5 shadow-lg animate-in zoom-in-95 duration-150 text-left">
                {activeTab === "SP" && (
                  <div>
                    <h3 className="game-font text-xl font-bold text-[#028560] mb-1">
                      🔗 Sistem Persamaan: Dua Petunjuk Sekaligus!
                    </h3>
                    <p className="text-sm sm:text-base text-[#2a2830] font-medium leading-relaxed">
                      Satu petunjuk (misal: <i>&quot;3 pensil + 1 buku = Rp11.000&quot;</i>) belum cukup karena ada banyak kemungkinan harga. Dengan dua petunjuk sekaligus, jawabannya jadi pasti: <b>dua petunjuk untuk menemukan dua bilangan yang dicari</b>!
                    </p>
                    <div className="mt-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 p-2.5 text-xs sm:text-sm font-mono font-bold text-emerald-900">
                      Bentuk Baku: a₁x + b₁y = c₁ &nbsp;dan&nbsp; a₂x + b₂y = c₂
                    </div>
                  </div>
                )}

                {activeTab === "L" && (
                  <div>
                    <h3 className="game-font text-xl font-bold text-[#b57a05] mb-1">
                      📏 Linear: Grafiknya Garis Lurus!
                    </h3>
                    <p className="text-sm sm:text-base text-[#2a2830] font-medium leading-relaxed">
                      Pangkat tertinggi dari variabelnya selalu <b>1</b> (tidak ada x² atau xy). Jika digambar pada bidang Cartesius, setiap persamaan selalu menghasilkan <b>garis lurus</b> dengan gradien m = -a/b.
                    </p>
                    <div className="mt-2.5 rounded-xl bg-amber-50 border-2 border-amber-300 p-2.5 text-xs sm:text-sm font-mono font-bold text-amber-900">
                      Sifat: ax + by = c ➔ y = (-a/b)x + (c/b)
                    </div>
                  </div>
                )}

                {activeTab === "DV" && (
                  <div>
                    <h3 className="game-font text-xl font-bold text-[#343ebb] mb-1">
                      ✏️ Dua Variabel: Dua Nilai Misterius (x dan y)
                    </h3>
                    <p className="text-sm sm:text-base text-[#2a2830] font-medium leading-relaxed">
                      Terdapat dua besaran yang belum diketahui nilainya, biasanya disimbolkan huruf latin (x dan y, a dan b, atau p dan l).
                    </p>
                    <div className="mt-2.5 rounded-xl bg-blue-50 border-2 border-blue-300 p-2.5 text-xs sm:text-sm font-mono font-bold text-blue-900">
                      Contoh: x = harga pensil (Rp2.000), y = harga buku (Rp5.000)
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 2: LAB INTERAKTIF BELANJA BUAH (SIMULASI DINAMIS) */}
          {slide === 2 && (
            <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
              <div className="w-full rounded-[20px] bg-white p-4 shadow text-center">
                <span className="game-font text-lg sm:text-xl font-bold text-[#7251a8]">
                  🛒 Studi Kasus Koperasi Sekolah: Belanja Pensil & Buku
                </span>
                <p className="text-xs sm:text-sm text-[#2a2830]/80 font-medium">
                  Ani membeli 3 pensil dan 1 buku seharga Rp11.000. Budi membeli 1 pensil dan 2 buku seharga Rp12.000. Coba ubah jumlah di bawah untuk menguji total harganya!
                </p>
              </div>

              {/* Counter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Pensil (x) */}
                <div className="flex items-center justify-between rounded-2xl border-4 border-white bg-blue-50 p-4 shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✏️</span>
                    <div>
                      <span className="game-font text-lg font-bold text-[#2a2830]">
                        Pensil (x)
                      </span>
                      <p className="text-xs font-semibold text-blue-700">@ Rp 2.000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        setApelCount(Math.max(0, apelCount - 1));
                      }}
                      className="size-8 rounded-full border-2 border-white bg-blue-500 font-bold text-white shadow hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="game-font text-xl font-bold w-6 text-center text-[#2a2830]">
                      {apelCount}
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        setApelCount(apelCount + 1);
                      }}
                      className="size-8 rounded-full border-2 border-white bg-blue-500 font-bold text-white shadow hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buku (y) */}
                <div className="flex items-center justify-between rounded-2xl border-4 border-white bg-amber-50 p-4 shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📖</span>
                    <div>
                      <span className="game-font text-lg font-bold text-[#2a2830]">
                        Buku (y)
                      </span>
                      <p className="text-xs font-semibold text-amber-700">@ Rp 5.000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        setJerukCount(Math.max(0, jerukCount - 1));
                      }}
                      className="size-8 rounded-full border-2 border-white bg-amber-500 font-bold text-white shadow hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="game-font text-xl font-bold w-6 text-center text-[#2a2830]">
                      {jerukCount}
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        setJerukCount(jerukCount + 1);
                      }}
                      className="size-8 rounded-full border-2 border-white bg-amber-500 font-bold text-white shadow hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Math Output Card */}
              <div className="w-full rounded-[24px] border-4 border-white bg-[#fdffd3] p-5 shadow-lg text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2a2830]/70">
                  Model Matematika Yang Terbentuk:
                </span>
                <div className="game-font text-2xl sm:text-4xl text-[#422376] font-bold my-2">
                  {apelCount}x + {jerukCount}y = Rp {totalHarga.toLocaleString("id-ID")}
                </div>
                <p className="text-xs sm:text-sm text-[#2a2830] font-semibold">
                  Jika {apelCount === 3 && jerukCount === 1 ? "Ani membayar tepat Rp11.000 (3x + y = 11.000) ✓" : `Total belanja untuk ${apelCount} pensil dan ${jerukCount} buku adalah Rp ${totalHarga.toLocaleString("id-ID")}`}
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: LABORATORIUM GRAFIK INTERAKTIF (BISA DIGESER LANGSUNG) */}
          {slide === 3 && (
            <div className="w-full flex flex-col md:flex-row gap-5 items-center my-auto animate-in fade-in duration-200 py-1">
              {/* SVG Coordinate Canvas */}
              <div className="flex flex-col items-center">
                <div className="relative size-[280px] sm:size-[300px] rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Grid lines */}
                    {[-8, -6, -4, -2, 2, 4, 6, 8].map((i) => (
                      <g key={i}>
                        <line x1={150 + i * 12} y1="0" x2={150 + i * 12} y2="300" stroke="#f0eaff" strokeWidth="1" />
                        <line x1="0" y1={150 + i * 12} x2="300" y2={150 + i * 12} stroke="#f0eaff" strokeWidth="1" />
                      </g>
                    ))}
                    {/* Axes */}
                    <line x1="0" y1="150" x2="300" y2="150" stroke="#7251a8" strokeWidth="2" />
                    <line x1="150" y1="0" x2="150" y2="300" stroke="#7251a8" strokeWidth="2" />
                    <text x="285" y="145" fontSize="12" fill="#7251a8" fontWeight="bold">x</text>
                    <text x="155" y="15" fontSize="12" fill="#7251a8" fontWeight="bold">y</text>

                    {/* Garis 1 (Merah/Pink) */}
                    {renderLine(a1, b1, c1, "#e0457b")}

                    {/* Garis 2 (Hijau Toska) */}
                    {renderLine(a2, b2, c2, "#0f9d8a")}

                    {/* Titik Potong (Solusi) */}
                    {hasSingleSolution && (
                      <circle
                        cx={150 + solX * 12}
                        cy={150 - solY * 12}
                        r="6"
                        fill="#f4ad21"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
                <div className="mt-2 text-xs font-bold text-[#2a2830] flex gap-4">
                  <span className="flex items-center gap-1 text-[#e0457b]">● Garis 1</span>
                  <span className="flex items-center gap-1 text-[#0f9d8a]">● Garis 2</span>
                  <span className="flex items-center gap-1 text-[#f4ad21]">● Solusi (x,y)</span>
                </div>
              </div>

              {/* Slider Controls Panel */}
              <div className="flex-1 w-full flex flex-col gap-2.5">
                {/* Garis 1 Controls */}
                <div className="rounded-xl border-2 border-white bg-white/95 p-3 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#e0457b]">
                      Garis 1: {a1}x {b1 >= 0 ? `+ ${b1}y` : `- ${Math.abs(b1)}y`} = {c1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-[#2a2830]">
                    <div>
                      a₁: {a1}
                      <input type="range" min="-5" max="5" value={a1} onChange={(e) => setA1(Number(e.target.value))} className="w-full accent-[#e0457b]" />
                    </div>
                    <div>
                      b₁: {b1}
                      <input type="range" min="-5" max="5" value={b1} onChange={(e) => setB1(Number(e.target.value))} className="w-full accent-[#e0457b]" />
                    </div>
                    <div>
                      c₁: {c1}
                      <input type="range" min="-15" max="15" value={c1} onChange={(e) => setC1(Number(e.target.value))} className="w-full accent-[#e0457b]" />
                    </div>
                  </div>
                </div>

                {/* Garis 2 Controls */}
                <div className="rounded-xl border-2 border-white bg-white/95 p-3 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#0f9d8a]">
                      Garis 2: {a2}x {b2 >= 0 ? `+ ${b2}y` : `- ${Math.abs(b2)}y`} = {c2}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-[#2a2830]">
                    <div>
                      a₂: {a2}
                      <input type="range" min="-5" max="5" value={a2} onChange={(e) => setA2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" />
                    </div>
                    <div>
                      b₂: {b2}
                      <input type="range" min="-5" max="5" value={b2} onChange={(e) => setB2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" />
                    </div>
                    <div>
                      c₂: {c2}
                      <input type="range" min="-15" max="15" value={c2} onChange={(e) => setC2(Number(e.target.value))} className="w-full accent-[#0f9d8a]" />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPreset(1, 1, 7, 1, -1, 1)}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow hover:bg-purple-100"
                  >
                    1 Solusi (Berpotongan)
                  </button>
                  <button
                    onClick={() => setPreset(2, 4, 6, 1, 2, 5)}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow hover:bg-purple-100"
                  >
                    Sejajar (0 Solusi)
                  </button>
                  <button
                    onClick={() => setPreset(1, 2, 6, 2, 4, 12)}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#7251a8] shadow hover:bg-purple-100"
                  >
                    Berimpit (∞ Solusi)
                  </button>
                </div>

                {/* Status Box */}
                <div className="rounded-xl border-2 border-purple-200 bg-[#f8f298] p-2.5 text-xs font-bold text-[#2a2830]">
                  {hasSingleSolution && (
                    <span>🎯 Berpotongan di 1 titik: (x = {solX.toFixed(1)}, y = {solY.toFixed(1)})</span>
                  )}
                  {isParallel && <span>⚠️ Garis Sejajar: Tidak Ada Titik Temu (0 Solusi)</span>}
                  {isCoincident && <span>♾️ Garis Berimpit: Memiliki Tak Hingga Banyak Solusi</span>}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: 4 METODE PENYELESAIAN */}
          {slide === 4 && (
            <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <span className="game-font text-lg font-bold text-[#e05f1e]">
                    1. Metode Eliminasi
                  </span>
                  <p className="text-xs sm:text-sm text-[#2a2830] font-medium mt-1">
                    Menghilangkan salah satu variabel dengan menjumlahkan atau mengurangkan kedua persamaan setelah menyamakan koefisiennya.
                  </p>
                </div>

                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <span className="game-font text-lg font-bold text-[#5e65e9]">
                    2. Metode Substitusi
                  </span>
                  <p className="text-xs sm:text-sm text-[#2a2830] font-medium mt-1">
                    Mengubah satu persamaan ke bentuk x = ... atau y = ..., lalu memasukkan rumus tersebut ke persamaan lainnya.
                  </p>
                </div>

                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <span className="game-font text-lg font-bold text-[#028560]">
                    3. Metode Campuran (Gabungan)
                  </span>
                  <p className="text-xs sm:text-sm text-[#2a2830] font-medium mt-1">
                    Metode tercepat & terpopuler: eliminasi satu variabel terlebih dahulu, lalu substitusi nilai yang didapat ke persamaan lain.
                  </p>
                </div>

                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow">
                  <span className="game-font text-lg font-bold text-[#7251a8]">
                    4. Metode Grafik
                  </span>
                  <p className="text-xs sm:text-sm text-[#2a2830] font-medium mt-1">
                    Menggambar dua garis lurus pada koordinat kartesius dan melihat titik temu perpotongannya (x, y).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: QUIZ PEMANTAPAN */}
          {slide === 5 && (
            <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
              <div className="w-full rounded-[24px] bg-white p-5 shadow border-3 border-purple-200 text-center">
                <span className="game-font text-lg sm:text-xl font-bold text-[#7251a8]">
                  🎯 Kuis Pemantapan Konsep:
                </span>
                <p className="text-base sm:text-lg font-bold text-[#2a2830] mt-1">
                  Jika dua garis SPLDV memiliki kemiringan (gradien) yang sama tetapi titik potong sumbu-y berbeda, maka kedua garis itu...
                </p>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {[
                    { label: "Berpotongan di 1 titik", isRight: false },
                    { label: "Sejajar (Tidak ada solusi)", isRight: true },
                    { label: "Berimpit (Tak hingga)", isRight: false },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playClick();
                        setQuizAnswered(idx);
                      }}
                      className={`rounded-xl border-3 border-white px-4 py-2 font-bold game-font text-sm sm:text-base shadow transition-all cursor-pointer ${
                        quizAnswered === idx
                          ? item.isRight
                            ? "bg-[#1cd8a4] text-[#144837]"
                            : "bg-[#fd363a] text-white"
                          : "bg-[#e4d3ff] text-[#2a2830] hover:bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {quizAnswered !== null && (
                  <p className="mt-3 text-sm font-bold text-[#2a2830]">
                    {quizAnswered === 1
                      ? "🎉 Benar! Dua garis sejajar tidak akan pernah bertemu, sehingga SPLDV tidak memiliki penyelesaian."
                      : "❌ Belum tepat! Garis sejajar memiliki gradien sama dan tidak pernah berpotongan."}
                  </p>
                )}
              </div>

              <Link
                href="/spldv/pretest"
                className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-8 py-3 game-font text-lg font-bold text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:scale-105 active:translate-y-1"
              >
                Uji Pemahaman di Kuis Pre-Test &rarr;
              </Link>
            </div>
          )}

          {/* Bottom Slide Navigation Buttons */}
          <div className="flex w-full items-center justify-between pt-4 border-t border-white/50">
            <button
              onClick={prevSlide}
              disabled={slide === 1}
              className={`rounded-2xl border-4 border-white px-5 py-2 game-font text-base sm:text-lg font-bold transition-all ${
                slide === 1
                  ? "bg-zinc-400 text-zinc-200 opacity-50 cursor-not-allowed"
                  : "bg-zinc-600 text-white shadow-[0px_3px_0px_0px_#333] hover:scale-102 active:translate-y-1 cursor-pointer"
              }`}
            >
              &larr; Sebelumnya
            </button>

            <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">
              Slide {slide} dari {totalSlides}
            </span>

            {slide < totalSlides ? (
              <button
                onClick={nextSlide}
                className="rounded-2xl border-4 border-white bg-[#e05f1e] px-5 py-2 game-font text-base sm:text-lg font-bold text-white shadow-[0px_3px_0px_0px_#aaafaf] hover:scale-102 active:translate-y-1 cursor-pointer"
              >
                Selanjutnya &rarr;
              </button>
            ) : (
              <Link
                href="/spldv"
                className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-5 py-2 game-font text-base sm:text-lg font-bold text-[#144837] shadow-[0px_3px_0px_0px_#028560] hover:scale-102 active:translate-y-1 cursor-pointer"
              >
                Selesai Materi
              </Link>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
