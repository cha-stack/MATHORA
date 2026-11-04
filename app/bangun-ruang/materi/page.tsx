"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";

type ShapeType = "kubus" | "balok" | "prisma" | "limas" | "tabung" | "kerucut" | "bola";

const SHAPES_DATA: Record<
  ShapeType,
  {
    name: string;
    sisi: string;
    rusuk: string;
    titikSudut: string;
    rumusL: string;
    rumusV: string;
    jaringDesc: string;
  }
> = {
  kubus: {
    name: "Kubus",
    sisi: "6 (persegi sama besar)",
    rusuk: "12 (sama panjang)",
    titikSudut: "8",
    rumusL: "L = 6s²",
    rumusV: "V = s³",
    jaringDesc: "Terdiri dari 6 persegi identik yang dapat dilipat menjadi kotak.",
  },
  balok: {
    name: "Balok",
    sisi: "6 (3 pasang persegi panjang)",
    rusuk: "12",
    titikSudut: "8",
    rumusL: "L = 2(pl + pt + lt)",
    rumusV: "V = p × l × t",
    jaringDesc: "Terdiri dari 3 pasang persegi panjang yang saling berhadapan.",
  },
  prisma: {
    name: "Prisma Segitiga",
    sisi: "5 (2 segitiga, 3 persegi panjang)",
    rusuk: "9",
    titikSudut: "6",
    rumusL: "L = 2 × L.alas + Kel.alas × t",
    rumusV: "V = Luas alas × t",
    jaringDesc: "Dua segitiga sejajar sebagai tutup dan alas, serta 3 persegi panjang tegak.",
  },
  limas: {
    name: "Limas Persegi",
    sisi: "5 (1 persegi, 4 segitiga)",
    rusuk: "8",
    titikSudut: "5",
    rumusL: "L = L.alas + Jumlah L.segitiga",
    rumusV: "V = ⅓ × Luas alas × t",
    jaringDesc: "Satu persegi di dasar dengan 4 segitiga yang meruncing ke satu puncak.",
  },
  tabung: {
    name: "Tabung (Silinder)",
    sisi: "3 (2 lingkaran, 1 selimut melengkung)",
    rusuk: "2 (rusuk lengkung)",
    titikSudut: "0",
    rumusL: "L = 2πr(r + t)",
    rumusV: "V = πr²t",
    jaringDesc: "Dua lingkaran identik (atas & bawah) dan 1 persegi panjang berukuran 2πr × t.",
  },
  kerucut: {
    name: "Kerucut",
    sisi: "2 (1 lingkaran, 1 selimut)",
    rusuk: "1 (rusuk lengkung)",
    titikSudut: "1 (titik puncak)",
    rumusL: "L = πr(r + s), dengan s = √(r² + t²)",
    rumusV: "V = ⅓πr²t",
    jaringDesc: "Satu lingkaran alas dan satu juring lingkaran dengan jari-jari s.",
  },
  bola: {
    name: "Bola",
    sisi: "1 (bidang lengkung penuh)",
    rusuk: "0",
    titikSudut: "0",
    rumusL: "L = 4πr²",
    rumusV: "V = ⁴⁄₃πr³",
    jaringDesc: "Tidak memiliki jaring-jaring datar karena melengkung ke segala arah.",
  },
};

export default function BangunRuangMateri() {
  const { playClick } = useSound();
  const [activeTab, setActiveTab] = useState<"3D" | "LAB" | "JARING">("3D");
  const [selectedShape, setSelectedShape] = useState<ShapeType>("tabung");

  // State rotasi 3D (bisa digeser dengan mouse/touch atau slider)
  const [rotX, setRotX] = useState(-0.5);
  const [rotY, setRotY] = useState(0.6);
  const [autoRotate, setAutoRotate] = useState(true);

  // State simulasi Lab Ukuran
  const [radius, setRadius] = useState(7);
  const [height, setHeight] = useState(10);
  const [useFractionPi, setUseFractionPi] = useState(true);

  // Drag interaction pada 3D canvas
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.02 > Math.PI ? -Math.PI : prev + 0.02));
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Kalkulasi nilai lab
  const pi = useFractionPi ? 22 / 7 : 3.14;
  const piLabel = useFractionPi ? "22/7" : "3,14";
  const sKerucut = Math.sqrt(radius * radius + height * height);

  let luasPermukaan = 0;
  let volume = 0;
  let luasSelimut = 0;

  if (selectedShape === "tabung") {
    luasSelimut = 2 * pi * radius * height;
    luasPermukaan = 2 * pi * radius * (radius + height);
    volume = pi * radius * radius * height;
  } else if (selectedShape === "kerucut") {
    luasSelimut = pi * radius * sKerucut;
    luasPermukaan = pi * radius * (radius + sKerucut);
    volume = (1 / 3) * pi * radius * radius * height;
  } else if (selectedShape === "bola") {
    luasPermukaan = 4 * pi * radius * radius;
    volume = (4 / 3) * pi * radius * radius * radius;
  }

  // Engine Proyeksi 3D Wireframe Sederhana
  const get3DGeometry = (shape: ShapeType) => {
    const lines: Array<[[number, number, number], [number, number, number]]> = [];
    const rings: Array<{ y: number; r: number; n: number }> = [];

    if (shape === "kubus") {
      const a = 1;
      const pts: Array<[number, number, number]> = [];
      for (let i = 0; i < 8; i++) {
        pts.push([(i & 1 ? 1 : -1) * a, (i & 2 ? 1 : -1) * a, (i & 4 ? 1 : -1) * a]);
      }
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const d = i ^ j;
          if (d === 1 || d === 2 || d === 4) lines.push([pts[i], pts[j]]);
        }
      }
    } else if (shape === "balok") {
      const w = 1.4, h = 0.8, d = 0.6;
      const pts: Array<[number, number, number]> = [];
      for (let i = 0; i < 8; i++) {
        pts.push([(i & 1 ? 1 : -1) * w, (i & 2 ? 1 : -1) * h, (i & 4 ? 1 : -1) * d]);
      }
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const diff = i ^ j;
          if (diff === 1 || diff === 2 || diff === 4) lines.push([pts[i], pts[j]]);
        }
      }
    } else if (shape === "tabung") {
      rings.push({ y: 1, r: 0.9, n: 24 });
      rings.push({ y: -1, r: 0.9, n: 24 });
      for (let i = 0; i < 4; i++) {
        const theta = (i * Math.PI) / 2;
        lines.push([
          [0.9 * Math.cos(theta), 1, 0.9 * Math.sin(theta)],
          [0.9 * Math.cos(theta), -1, 0.9 * Math.sin(theta)],
        ]);
      }
    } else if (shape === "kerucut") {
      rings.push({ y: -1, r: 0.9, n: 24 });
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        lines.push([[0.9 * Math.cos(theta), -1, 0.9 * Math.sin(theta)], [0, 1.2, 0]]);
      }
    } else if (shape === "bola") {
      rings.push({ y: 0, r: 1.0, n: 28 });
      rings.push({ y: 0.5, r: 0.866, n: 28 });
      rings.push({ y: -0.5, r: 0.866, n: 28 });
    } else if (shape === "limas") {
      const c: Array<[number, number, number]> = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]];
      const top: [number, number, number] = [0, 1.2, 0];
      for (let i = 0; i < 4; i++) {
        lines.push([c[i], c[(i + 1) % 4]]);
        lines.push([c[i], top]);
      }
    } else if (shape === "prisma") {
      const b: Array<[number, number, number]> = [[-1, -1, -0.8], [1, -1, -0.8], [0, -1, 0.9]];
      const t: Array<[number, number, number]> = b.map((p) => [p[0], 1, p[2]]);
      for (let i = 0; i < 3; i++) {
        lines.push([b[i], b[(i + 1) % 3]]);
        lines.push([t[i], t[(i + 1) % 3]]);
        lines.push([b[i], t[i]]);
      }
    }

    return { lines, rings };
  };

  // Proyeksikan 3D titik ke layar 2D
  const project = (p: [number, number, number]): [number, number, boolean] => {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const x1 = p[0] * cosY + p[2] * sinY;
    const z1 = -p[0] * sinY + p[2] * cosY;
    const y1 = p[1] * cosX - z1 * sinX;
    const z2 = p[1] * sinX + z1 * cosX;

    const scale = 85;
    return [150 + x1 * scale, 130 - y1 * scale, z2 > 0];
  };

  const currentGeom = get3DGeometry(selectedShape);
  const shapeInfo = SHAPES_DATA[selectedShape];

  return (
    <GameShell backUrl="/dashboard/siswa" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Card */}
        <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center min-h-[600px] justify-between">
          {/* Header & Tabs */}
          <div className="w-full flex flex-col items-center gap-3">
            <h2 className="game-font text-2xl sm:text-4xl text-[#2a2830] font-bold text-center">
              Materi Bangun Ruang Interaktif
            </h2>

            {/* Navigation Tabs */}
            <div className="flex gap-2 sm:gap-3 bg-white/70 p-1.5 rounded-2xl border-2 border-white">
              <button
                onClick={() => {
                  playClick();
                  setActiveTab("3D");
                }}
                className={`rounded-xl px-4 py-1.5 game-font text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeTab === "3D" ? "bg-[#7251a8] text-white shadow" : "text-[#422376] hover:bg-white/80"
                }`}
              >
                🔄 Model 3D Bisa Diputar
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveTab("LAB");
                }}
                className={`rounded-xl px-4 py-1.5 game-font text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeTab === "LAB" ? "bg-[#7251a8] text-white shadow" : "text-[#422376] hover:bg-white/80"
                }`}
              >
                🔬 Lab Hitung & Ukuran
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveTab("JARING");
                }}
                className={`rounded-xl px-4 py-1.5 game-font text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeTab === "JARING" ? "bg-[#7251a8] text-white shadow" : "text-[#422376] hover:bg-white/80"
                }`}
              >
                📐 Jaring-Jaring Bangun
              </button>
            </div>
          </div>

          {/* Sub Selector Bangun Ruang */}
          <div className="flex flex-wrap gap-2 justify-center my-3 w-full">
            {(Object.keys(SHAPES_DATA) as ShapeType[]).map((shapeKey) => (
              <button
                key={shapeKey}
                onClick={() => {
                  playClick();
                  setSelectedShape(shapeKey);
                }}
                className={`rounded-xl border-2 border-white px-3 py-1 text-xs sm:text-sm font-bold capitalize transition-all cursor-pointer ${
                  selectedShape === shapeKey
                    ? "bg-[#1cd8a4] text-[#144837] shadow-md scale-105"
                    : "bg-white/80 text-[#2a2830] hover:bg-white"
                }`}
              >
                {shapeKey}
              </button>
            ))}
          </div>

          {/* TAB 1: 3D MODEL YANG BISA DIPUTAR-PUTAR */}
          {activeTab === "3D" && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-auto animate-in fade-in duration-200">
              {/* 3D Canvas Box */}
              <div className="flex flex-col items-center">
                <div
                  onPointerDown={(e) => {
                    isDragging.current = true;
                    lastMousePos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerMove={(e) => {
                    if (!isDragging.current) return;
                    const dx = e.clientX - lastMousePos.current.x;
                    const dy = e.clientY - lastMousePos.current.y;
                    setRotY((prev) => prev + dx * 0.015);
                    setRotX((prev) => prev + dy * 0.015);
                    lastMousePos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerUp={() => {
                    isDragging.current = false;
                  }}
                  className="relative size-[280px] sm:size-[300px] rounded-3xl border-4 border-white bg-gradient-to-b from-purple-100 to-indigo-100 shadow-lg cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center select-none"
                >
                  <svg viewBox="0 0 300 260" className="w-full h-full">
                    {/* Render Rings */}
                    {currentGeom.rings.map((ring, rIdx) => {
                      const pts: Array<[number, number, boolean]> = [];
                      for (let i = 0; i <= ring.n; i++) {
                        const theta = (i / ring.n) * Math.PI * 2;
                        pts.push(
                          project([ring.r * Math.cos(theta), ring.y, ring.r * Math.sin(theta)])
                        );
                      }
                      return (
                        <g key={`ring-${rIdx}`}>
                          {pts.slice(0, -1).map((pt, i) => {
                            const next = pts[i + 1];
                            const isFront = pt[2] || next[2];
                            return (
                              <line
                                key={i}
                                x1={pt[0]}
                                y1={pt[1]}
                                x2={next[0]}
                                y2={next[1]}
                                stroke="#422376"
                                strokeWidth={isFront ? 2.5 : 1.2}
                                strokeDasharray={isFront ? "none" : "3 3"}
                                opacity={isFront ? 1 : 0.4}
                              />
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* Render Lines */}
                    {currentGeom.lines.map((line, lIdx) => {
                      const p1 = project(line[0]);
                      const p2 = project(line[1]);
                      const isFront = p1[2] || p2[2];
                      return (
                        <line
                          key={`line-${lIdx}`}
                          x1={p1[0]}
                          y1={p1[1]}
                          x2={p2[0]}
                          y2={p2[1]}
                          stroke="#1cd8a4"
                          strokeWidth={isFront ? 3.5 : 1.5}
                          strokeDasharray={isFront ? "none" : "4 3"}
                          opacity={isFront ? 1 : 0.45}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  <span className="absolute bottom-2 text-[11px] font-bold text-purple-900 bg-white/70 px-2.5 py-0.5 rounded-full">
                    🖐️ Sentuh & Geser untuk Memutar 360°
                  </span>
                </div>

                {/* Rotasi Controls */}
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#2a2830] cursor-pointer bg-white/80 px-3 py-1 rounded-xl shadow-xs">
                    <input
                      type="checkbox"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      className="accent-[#7251a8]"
                    />
                    Putar Otomatis
                  </label>
                </div>
              </div>

              {/* Info Card */}
              <div className="flex flex-col gap-3 rounded-2xl border-4 border-white bg-white/95 p-5 shadow">
                <span className="game-font text-2xl font-bold text-[#7251a8]">
                  {shapeInfo.name}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#2a2830]">
                  <div className="rounded-xl bg-purple-50 p-2 border border-purple-100">
                    <span className="block text-[#7251a8] font-bold">Banyak Sisi:</span>
                    {shapeInfo.sisi}
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2 border border-purple-100">
                    <span className="block text-[#7251a8] font-bold">Banyak Rusuk:</span>
                    {shapeInfo.rusuk}
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2 border border-purple-100">
                    <span className="block text-[#7251a8] font-bold">Titik Sudut:</span>
                    {shapeInfo.titikSudut}
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2 border border-purple-100">
                    <span className="block text-[#7251a8] font-bold">Jenis:</span>
                    {selectedShape === "tabung" || selectedShape === "kerucut" || selectedShape === "bola" ? "Sisi Lengkung" : "Sisi Datar"}
                  </div>
                </div>

                <div className="mt-1 rounded-xl bg-amber-50 p-3 border-2 border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase block mb-1">
                    Rumus Matematika:
                  </span>
                  <p className="text-sm font-bold text-[#2a2830]">{shapeInfo.rumusL}</p>
                  <p className="text-sm font-bold text-[#2a2830] mt-0.5">{shapeInfo.rumusV}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAB HITUNG & UKURAN DINAMIS */}
          {activeTab === "LAB" && (
            <div className="w-full flex flex-col md:flex-row gap-5 items-center my-auto animate-in fade-in duration-200 py-2">
              {/* Controls */}
              <div className="w-full md:w-1/2 flex flex-col gap-3 rounded-2xl border-4 border-white bg-white/95 p-5 shadow">
                <span className="game-font text-xl font-bold text-[#7251a8]">
                  🎛️ Atur Dimensi {shapeInfo.name}
                </span>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#2a2830] mb-1">
                    <span>Jari-jari (r):</span>
                    <span className="text-purple-700 font-extrabold">{radius} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-[#7251a8]"
                  />
                </div>

                {selectedShape !== "bola" && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2a2830] mb-1">
                      <span>Tinggi (t):</span>
                      <span className="text-purple-700 font-extrabold">{height} cm</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full accent-[#7251a8]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                  <span className="text-xs font-bold text-[#2a2830]">Pilihan Nilai π:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUseFractionPi(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        useFractionPi ? "bg-[#7251a8] text-white" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      22/7
                    </button>
                    <button
                      onClick={() => setUseFractionPi(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        !useFractionPi ? "bg-[#7251a8] text-white" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      3,14
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Calculation Output */}
              <div className="w-full md:w-1/2 flex flex-col gap-3 rounded-2xl border-4 border-white bg-[#fdffd3] p-5 shadow-lg">
                <span className="game-font text-lg font-bold text-[#422376]">
                  📊 Hasil Perhitungan Langsung:
                </span>

                {selectedShape === "kerucut" && (
                  <div className="rounded-xl bg-white/80 p-2.5 border border-amber-200 text-xs font-semibold text-[#2a2830]">
                    Garis Pelukis (s) = √(r² + t²) = √({radius}² + {height}²) = <b>{sKerucut.toFixed(2)} cm</b>
                  </div>
                )}

                {luasSelimut > 0 && (
                  <div className="rounded-xl bg-white/80 p-2.5 border border-amber-200 text-xs font-semibold text-[#2a2830]">
                    Luas Selimut = <b>{luasSelimut.toLocaleString("id-ID", { maximumFractionDigits: 2 })} cm²</b>
                  </div>
                )}

                <div className="rounded-xl bg-white/80 p-2.5 border border-amber-200 text-xs font-semibold text-[#2a2830]">
                  Luas Permukaan = <b>{luasPermukaan.toLocaleString("id-ID", { maximumFractionDigits: 2 })} cm²</b>
                </div>

                <div className="rounded-xl bg-white/80 p-2.5 border border-amber-200 text-xs font-semibold text-[#2a2830]">
                  Volume Ruang = <b>{volume.toLocaleString("id-ID", { maximumFractionDigits: 2 })} cm³</b>{" "}
                  ({(volume / 1000).toFixed(2)} Liter)
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JARING-JARING BANGUN */}
          {activeTab === "JARING" && (
            <div className="w-full flex flex-col items-center gap-4 my-auto animate-in fade-in duration-200 py-2">
              <div className="w-full rounded-2xl bg-white p-4 shadow text-center border-2 border-purple-100">
                <span className="game-font text-lg font-bold text-[#7251a8]">
                  Pola Lipatan & Jaring-Jaring: {shapeInfo.name}
                </span>
                <p className="text-xs sm:text-sm text-[#2a2830] font-medium mt-1">
                  {shapeInfo.jaringDesc}
                </p>
              </div>

              {/* Visual Jaring SVG */}
              <div className="size-[280px] sm:size-[320px] rounded-3xl border-4 border-white bg-white p-3 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 240 200" className="w-full h-full">
                  {selectedShape === "tabung" && (
                    <g>
                      <circle cx="120" cy="35" r="24" fill="#ffd3d3" stroke="#422376" strokeWidth="2" />
                      <rect x="40" y="65" width="160" height="70" fill="#d3e9ff" stroke="#422376" strokeWidth="2" rx="4" />
                      <circle cx="120" cy="165" r="24" fill="#ffd3d3" stroke="#422376" strokeWidth="2" />
                      <text x="120" y="105" fontSize="11" fill="#422376" textAnchor="middle" fontWeight="bold">
                        Selimut (2πr × t)
                      </text>
                    </g>
                  )}
                  {selectedShape === "kerucut" && (
                    <g>
                      <path d="M 120 15 L 60 110 A 90 90 0 0 0 180 110 Z" fill="#d3e9ff" stroke="#422376" strokeWidth="2" />
                      <circle cx="120" cy="148" r="25" fill="#f8f298" stroke="#422376" strokeWidth="2" />
                      <text x="120" y="70" fontSize="11" fill="#422376" textAnchor="middle" fontWeight="bold">
                        Juring Selimut (πrs)
                      </text>
                    </g>
                  )}
                  {selectedShape === "kubus" && (
                    <g>
                      {[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].map(([x, y], i) => (
                        <rect
                          key={i}
                          x={35 + x * 42}
                          y={20 + y * 42}
                          width="40"
                          height="40"
                          fill="#f8f298"
                          stroke="#422376"
                          strokeWidth="2"
                          rx="3"
                        />
                      ))}
                    </g>
                  )}
                  {selectedShape === "bola" && (
                    <g>
                      <circle cx="120" cy="100" r="60" fill="#ffd3d3" stroke="#422376" strokeWidth="2" strokeDasharray="5 4" />
                      <text x="120" y="105" fontSize="12" fill="#422376" textAnchor="middle" fontWeight="bold">
                        Bola tidak punya jaring datar!
                      </text>
                    </g>
                  )}
                  {selectedShape !== "tabung" && selectedShape !== "kerucut" && selectedShape !== "kubus" && selectedShape !== "bola" && (
                    <g>
                      <rect x="50" y="40" width="140" height="120" fill="#e5dbf5" stroke="#422376" strokeWidth="2" rx="4" />
                      <text x="120" y="105" fontSize="12" fill="#422376" textAnchor="middle" fontWeight="bold">
                        Pola Sisi Datar {selectedShape}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex w-full items-center justify-between pt-4 border-t border-white/50">
            <Link
              href="/dashboard/siswa"
              className="rounded-2xl border-4 border-white bg-zinc-600 px-5 py-2 game-font text-base sm:text-lg font-bold text-white shadow-[0px_3px_0px_0px_#333] hover:scale-102 active:translate-y-1"
            >
              &larr; Dashboard
            </Link>

            <Link
              href="/spldv/materi"
              className="rounded-2xl border-4 border-white bg-[#1cd8a4] px-5 py-2 game-font text-base sm:text-lg font-bold text-[#144837] shadow-[0px_3px_0px_0px_#028560] hover:scale-102 active:translate-y-1"
            >
              Ke Materi SPLDV &rarr;
            </Link>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
