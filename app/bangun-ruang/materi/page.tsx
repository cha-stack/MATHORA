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
    sisiDetail: string;
    rusuk: string;
    rusukDetail: string;
    titikSudut: string;
    titikSudutDetail: string;
    rumusL: string;
    rumusV: string;
    jaringDesc: string;
  }
> = {
  kubus: {
    name: "Kubus",
    sisi: "6 Sisi",
    sisiDetail: "Semua berupa persegi datar yang kongruen (luas sama).",
    rusuk: "12 Rusuk",
    rusukDetail: "12 garis lurus yang semuanya sama panjang.",
    titikSudut: "8 Titik Sudut",
    titikSudutDetail: "Pertemuan dari setiap 3 rusuk kubus.",
    rumusL: "L = 6s²",
    rumusV: "V = s³",
    jaringDesc: "Terdiri dari 6 bujur sangkar/persegi yang tersusun membentuk pola salib.",
  },
  balok: {
    name: "Balok",
    sisi: "6 Sisi",
    sisiDetail: "3 pasang persegi panjang yang saling berhadapan kongruen.",
    rusuk: "12 Rusuk",
    rusukDetail: "Terbagi jadi 4 rusuk panjang, 4 rusuk lebar, dan 4 rusuk tinggi.",
    titikSudut: "8 Titik Sudut",
    titikSudutDetail: "Setiap sudut pertemuan siku-siku (90 derajat).",
    rumusL: "L = 2(pl + pt + lt)",
    rumusV: "V = p × l × t",
    jaringDesc: "Terdiri dari 3 pasang persegi panjang yang saling berhadapan.",
  },
  prisma: {
    name: "Prisma Segitiga",
    sisi: "5 Sisi",
    sisiDetail: "2 sisi segitiga (alas & tutup) + 3 persegi panjang tegak.",
    rusuk: "9 Rusuk",
    rusukDetail: "6 rusuk alas/tutup segitiga + 3 rusuk tegak (tinggi prisma).",
    titikSudut: "6 Titik Sudut",
    titikSudutDetail: "3 di bagian bawah alas dan 3 di bagian atas tutup.",
    rumusL: "L = 2 × L.alas + Kel.alas × t",
    rumusV: "V = Luas alas × t",
    jaringDesc: "Dua segitiga sejajar sebagai alas dan tutup, dikelilingi 3 persegi panjang tegak.",
  },
  limas: {
    name: "Limas Persegi",
    sisi: "5 Sisi",
    sisiDetail: "1 persegi (alas) + 4 segitiga selimut yang meruncing.",
    rusuk: "8 Rusuk",
    rusukDetail: "4 rusuk alas persegi + 4 rusuk miring menuju puncak.",
    titikSudut: "5 Titik Sudut",
    titikSudutDetail: "4 sudut pada alas persegi + 1 puncak limas.",
    rumusL: "L = L.alas + Jumlah 4 L.segitiga",
    rumusV: "V = ⅓ × Luas alas × t",
    jaringDesc: "Satu persegi di bagian dasar dengan 4 daun segitiga yang melipat ke puncak.",
  },
  tabung: {
    name: "Tabung (Silinder)",
    sisi: "3 Sisi",
    sisiDetail: "2 sisi datar lingkaran (alas & tutup) + 1 selimut melengkung.",
    rusuk: "2 Rusuk Lengkung",
    rusukDetail: "Keliling lingkaran alas dan keliling lingkaran tutup (berupa kurva melingkar).",
    titikSudut: "0 Titik Sudut",
    titikSudutDetail: "Tidak memiliki sudut runcing karena bentuknya melengkung halus.",
    rumusL: "L = 2πr(r + t)",
    rumusV: "V = πr²t",
    jaringDesc: "Dua lingkaran identik (atas & bawah) dan 1 persegi panjang bentangan selimut (2πr × t).",
  },
  kerucut: {
    name: "Kerucut",
    sisi: "2 Sisi",
    sisiDetail: "1 sisi datar lingkaran (alas) + 1 sisi selimut melengkung.",
    rusuk: "1 Rusuk Lengkung",
    rusukDetail: "Berupa garis keliling tepi lingkaran alas.",
    titikSudut: "1 Titik Puncak",
    titikSudutDetail: "Titik temu runcing di ujung atas kerucut (puncak).",
    rumusL: "L = πr(r + s), s = √(r² + t²)",
    rumusV: "V = ⅓πr²t",
    jaringDesc: "Satu lingkaran alas dan satu juring lingkaran melengkung dengan radius garis pelukis (s).",
  },
  bola: {
    name: "Bola",
    sisi: "1 Sisi Melengkung",
    sisiDetail: "Seluruh permukaan bola adalah 1 bidang lengkung utuh tanpa batas datar.",
    rusuk: "0 Rusuk",
    rusukDetail: "Tidak memiliki rusuk/garis patahan tepi sama sekali.",
    titikSudut: "0 Titik Sudut",
    titikSudutDetail: "Permukaannya mulus melengkung ke segala arah tanpa sudut.",
    rumusL: "L = 4πr²",
    rumusV: "V = ⁴⁄₃πr³",
    jaringDesc: "Bola tidak memiliki jaring-jaring datar karena melengkung ke segala arah (seperti kulit jeruk).",
  },
};

export default function BangunRuangMateri() {
  const { playClick } = useSound();
  const [activeTab, setActiveTab] = useState<"3D" | "LAB" | "JARING">("3D");
  const [selectedShape, setSelectedShape] = useState<ShapeType>("tabung");

  // Mode Sorot (Highlighting)
  const [highlightMode, setHighlightMode] = useState<"ALL" | "SISI" | "RUSUK" | "TITIK">("ALL");

  // State rotasi 3D (bisa digeser dengan mouse/touch atau slider)
  const [rotX, setRotX] = useState(-0.45);
  const [rotY, setRotY] = useState(0.65);
  const [autoRotate, setAutoRotate] = useState(false);

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
      setRotY((prev) => (prev + 0.015 > Math.PI ? -Math.PI : prev + 0.015));
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Kalkulasi nilai lab
  const pi = useFractionPi ? 22 / 7 : 3.14;
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

  // Engine Proyeksi 3D Berwarna
  const get3DGeometry = (shape: ShapeType) => {
    const lines: Array<{ p1: [number, number, number]; p2: [number, number, number]; isCurved?: boolean }> = [];
    const rings: Array<{ y: number; r: number; n: number; isRim?: boolean }> = [];
    const faces: Array<Array<[number, number, number]>> = [];
    const vertices: Array<[number, number, number]> = [];

    if (shape === "kubus") {
      const a = 0.95;
      const pts: Array<[number, number, number]> = [];
      for (let i = 0; i < 8; i++) {
        const pt: [number, number, number] = [
          (i & 1 ? 1 : -1) * a,
          (i & 2 ? 1 : -1) * a,
          (i & 4 ? 1 : -1) * a,
        ];
        pts.push(pt);
        vertices.push(pt);
      }
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const d = i ^ j;
          if (d === 1 || d === 2 || d === 4) lines.push({ p1: pts[i], p2: pts[j] });
        }
      }
      // 6 Faces
      faces.push([pts[0], pts[1], pts[3], pts[2]]); // front
      faces.push([pts[4], pts[5], pts[7], pts[6]]); // back
      faces.push([pts[0], pts[1], pts[5], pts[4]]); // bottom
      faces.push([pts[2], pts[3], pts[7], pts[6]]); // top
      faces.push([pts[0], pts[2], pts[6], pts[4]]); // left
      faces.push([pts[1], pts[3], pts[7], pts[5]]); // right
    } else if (shape === "balok") {
      const w = 1.3, h = 0.8, d = 0.7;
      const pts: Array<[number, number, number]> = [];
      for (let i = 0; i < 8; i++) {
        const pt: [number, number, number] = [
          (i & 1 ? 1 : -1) * w,
          (i & 2 ? 1 : -1) * h,
          (i & 4 ? 1 : -1) * d,
        ];
        pts.push(pt);
        vertices.push(pt);
      }
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const diff = i ^ j;
          if (diff === 1 || diff === 2 || diff === 4) lines.push({ p1: pts[i], p2: pts[j] });
        }
      }
      faces.push([pts[0], pts[1], pts[3], pts[2]]);
      faces.push([pts[4], pts[5], pts[7], pts[6]]);
      faces.push([pts[0], pts[1], pts[5], pts[4]]);
      faces.push([pts[2], pts[3], pts[7], pts[6]]);
    } else if (shape === "tabung") {
      rings.push({ y: 1.0, r: 0.95, n: 32, isRim: true });
      rings.push({ y: -1.0, r: 0.95, n: 32, isRim: true });
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        lines.push({
          p1: [0.95 * Math.cos(theta), 1.0, 0.95 * Math.sin(theta)],
          p2: [0.95 * Math.cos(theta), -1.0, 0.95 * Math.sin(theta)],
          isCurved: true,
        });
      }
    } else if (shape === "kerucut") {
      rings.push({ y: -1.0, r: 1.0, n: 32, isRim: true });
      const apex: [number, number, number] = [0, 1.25, 0];
      vertices.push(apex);
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        lines.push({
          p1: [1.0 * Math.cos(theta), -1.0, 1.0 * Math.sin(theta)],
          p2: apex,
          isCurved: true,
        });
      }
    } else if (shape === "bola") {
      rings.push({ y: 0, r: 1.05, n: 32 });
      rings.push({ y: 0.55, r: 0.89, n: 32 });
      rings.push({ y: -0.55, r: 0.89, n: 32 });
    } else if (shape === "limas") {
      const c: Array<[number, number, number]> = [
        [-0.95, -0.9, -0.95],
        [0.95, -0.9, -0.95],
        [0.95, -0.9, 0.95],
        [-0.95, -0.9, 0.95],
      ];
      const apex: [number, number, number] = [0, 1.25, 0];
      vertices.push(apex);
      c.forEach((pt) => vertices.push(pt));

      for (let i = 0; i < 4; i++) {
        lines.push({ p1: c[i], p2: c[(i + 1) % 4] });
        lines.push({ p1: c[i], p2: apex });
      }
      faces.push([c[0], c[1], c[2], c[3]]);
      for (let i = 0; i < 4; i++) {
        faces.push([c[i], c[(i + 1) % 4], apex]);
      }
    } else if (shape === "prisma") {
      const b: Array<[number, number, number]> = [
        [-0.95, -0.95, -0.8],
        [0.95, -0.95, -0.8],
        [0, -0.95, 0.9],
      ];
      const t: Array<[number, number, number]> = b.map((p) => [p[0], 0.95, p[2]]);
      b.forEach((pt) => vertices.push(pt));
      t.forEach((pt) => vertices.push(pt));

      for (let i = 0; i < 3; i++) {
        lines.push({ p1: b[i], p2: b[(i + 1) % 3] });
        lines.push({ p1: t[i], p2: t[(i + 1) % 3] });
        lines.push({ p1: b[i], p2: t[i] });
      }
      faces.push([b[0], b[1], b[2]]);
      faces.push([t[0], t[1], t[2]]);
      for (let i = 0; i < 3; i++) {
        faces.push([b[i], b[(i + 1) % 3], t[(i + 1) % 3], t[i]]);
      }
    }

    return { lines, rings, faces, vertices };
  };

  // Proyeksikan 3D titik ke 2D koordinat layar SVG
  const project = (p: [number, number, number]): [number, number, boolean] => {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const x1 = p[0] * cosY + p[2] * sinY;
    const z1 = -p[0] * sinY + p[2] * cosY;
    const y1 = p[1] * cosX - z1 * sinX;
    const z2 = p[1] * sinX + z1 * cosX;

    const scale = 80;
    return [150 + x1 * scale, 130 - y1 * scale, z2 > 0];
  };

  const currentGeom = get3DGeometry(selectedShape);
  const shapeInfo = SHAPES_DATA[selectedShape];

  // Warna khusus untuk membedakan Sisi, Rusuk, Titik
  const colorSisiFill = highlightMode === "RUSUK" ? "rgba(255,255,255,0.05)" : "rgba(254, 240, 138, 0.45)"; // Kuning lembut
  const colorRusukStroke = highlightMode === "SISI" ? "#6b7280" : "#2563eb"; // Biru terang tajam untuk rusuk
  const colorTitikFill = "#ef4444"; // Merah menyala untuk titik sudut

  return (
    <GameShell backUrl="/dashboard/siswa" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Card */}
        <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center min-h-[610px] justify-between">
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
                🔄 Model 3D Berwarna
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
          <div className="flex flex-wrap gap-2 justify-center my-2.5 w-full">
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
                {/* Mode Sorot Bagian (Sisi / Rusuk / Titik Sudut) */}
                <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-xl border border-purple-200 mb-2 shadow-xs">
                  <span className="text-[11px] font-bold text-[#422376] px-1.5">Sorot:</span>
                  <button
                    onClick={() => { playClick(); setHighlightMode("ALL"); }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${highlightMode === "ALL" ? "bg-[#7251a8] text-white" : "text-gray-700"}`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => { playClick(); setHighlightMode("SISI"); }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${highlightMode === "SISI" ? "bg-[#f59e0b] text-white" : "text-amber-800"}`}
                  >
                    🟡 Sisi
                  </button>
                  <button
                    onClick={() => { playClick(); setHighlightMode("RUSUK"); }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${highlightMode === "RUSUK" ? "bg-[#2563eb] text-white" : "text-blue-800"}`}
                  >
                    🔵 Rusuk
                  </button>
                  <button
                    onClick={() => { playClick(); setHighlightMode("TITIK"); }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${highlightMode === "TITIK" ? "bg-[#ef4444] text-white" : "text-red-800"}`}
                  >
                    🔴 Titik
                  </button>
                </div>

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
                  className="relative size-[280px] sm:size-[300px] rounded-3xl border-4 border-white bg-gradient-to-b from-[#f3e8ff] to-[#e0e7ff] shadow-lg cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center select-none"
                >
                  <svg viewBox="0 0 300 260" className="w-full h-full">
                    {/* 1. Render Bidang Sisi (Faces Poligon) */}
                    {currentGeom.faces.map((face, fIdx) => {
                      const pts = face.map((p) => project(p));
                      const isFront = pts.some((pt) => pt[2]);
                      const ptsStr = pts.map((pt) => `${pt[0]},${pt[1]}`).join(" ");
                      return (
                        <polygon
                          key={`face-${fIdx}`}
                          points={ptsStr}
                          fill={highlightMode === "RUSUK" ? "transparent" : isFront ? colorSisiFill : "rgba(254, 240, 138, 0.15)"}
                          stroke="#d97706"
                          strokeWidth={highlightMode === "SISI" ? "2" : "0.5"}
                          strokeOpacity={isFront ? 0.8 : 0.2}
                        />
                      );
                    })}

                    {/* 2. Render Rusuk Lengkung (Rings) */}
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
                                stroke={ring.isRim ? colorRusukStroke : "#9333ea"}
                                strokeWidth={ring.isRim ? (isFront ? 4 : 2) : (isFront ? 2 : 1)}
                                strokeDasharray={isFront ? "none" : "4 3"}
                                opacity={isFront ? 1 : 0.4}
                              />
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* 3. Render Garis Rusuk (Edges) */}
                    {currentGeom.lines.map((line, lIdx) => {
                      const p1 = project(line.p1);
                      const p2 = project(line.p2);
                      const isFront = p1[2] || p2[2];
                      return (
                        <line
                          key={`line-${lIdx}`}
                          x1={p1[0]}
                          y1={p1[1]}
                          x2={p2[0]}
                          y2={p2[1]}
                          stroke={colorRusukStroke}
                          strokeWidth={isFront ? (highlightMode === "RUSUK" ? 5 : 3.5) : 1.8}
                          strokeDasharray={isFront ? "none" : "5 4"}
                          opacity={isFront ? 1 : 0.45}
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* 4. Render Titik Sudut (Vertices) */}
                    {(highlightMode === "ALL" || highlightMode === "TITIK") &&
                      currentGeom.vertices.map((v, vIdx) => {
                        const pt = project(v);
                        return (
                          <circle
                            key={`vert-${vIdx}`}
                            cx={pt[0]}
                            cy={pt[1]}
                            r={highlightMode === "TITIK" ? 7 : 5}
                            fill={colorTitikFill}
                            stroke="#ffffff"
                            strokeWidth={2}
                            opacity={pt[2] ? 1 : 0.6}
                          />
                        );
                      })}
                  </svg>
                  <span className="absolute bottom-2 text-[11px] font-bold text-purple-900 bg-white/80 px-2.5 py-0.5 rounded-full shadow-xs">
                    🖐️ Sentuh & Geser untuk Memutar 360°
                  </span>
                </div>

                {/* Legend Keterangan Warna */}
                <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-amber-900 border border-amber-300">
                    <span className="size-2.5 rounded-full bg-amber-400 inline-block"></span> Sisi (Permukaan)
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900 border border-blue-300">
                    <span className="size-2.5 rounded-full bg-blue-600 inline-block"></span> Rusuk (Garis Tepi)
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-red-900 border border-red-300">
                    <span className="size-2.5 rounded-full bg-red-500 inline-block"></span> Titik Sudut
                  </span>
                </div>
              </div>

              {/* Info Card Rinci & Jelas */}
              <div className="flex flex-col gap-3 rounded-2xl border-4 border-white bg-white/95 p-5 shadow">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="game-font text-2xl font-bold text-[#7251a8]">
                    {shapeInfo.name}
                  </span>
                  <span className="text-xs font-bold rounded-full bg-purple-100 px-2.5 py-1 text-purple-800">
                    {selectedShape === "tabung" || selectedShape === "kerucut" || selectedShape === "bola"
                      ? "Sisi Lengkung"
                      : "Sisi Datar"}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs font-semibold text-[#2a2830]">
                  {/* Sisi Detail */}
                  <div className="rounded-xl bg-amber-50 p-2.5 border-2 border-amber-200">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-0.5">
                      <span className="text-sm">🟡 Sisi: {shapeInfo.sisi}</span>
                      <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md">Bidang Luar</span>
                    </div>
                    <p className="text-amber-950 font-medium leading-relaxed">{shapeInfo.sisiDetail}</p>
                  </div>

                  {/* Rusuk Detail */}
                  <div className="rounded-xl bg-blue-50 p-2.5 border-2 border-blue-200">
                    <div className="flex items-center justify-between font-bold text-blue-900 mb-0.5">
                      <span className="text-sm">🔵 Rusuk: {shapeInfo.rusuk}</span>
                      <span className="text-[10px] bg-blue-200/80 px-2 py-0.5 rounded-md">Garis Batas</span>
                    </div>
                    <p className="text-blue-950 font-medium leading-relaxed">{shapeInfo.rusukDetail}</p>
                  </div>

                  {/* Titik Sudut Detail */}
                  <div className="rounded-xl bg-red-50 p-2.5 border-2 border-red-200">
                    <div className="flex items-center justify-between font-bold text-red-900 mb-0.5">
                      <span className="text-sm">🔴 Titik Sudut: {shapeInfo.titikSudut}</span>
                      <span className="text-[10px] bg-red-200/80 px-2 py-0.5 rounded-md">Pojok Pertemuan</span>
                    </div>
                    <p className="text-red-950 font-medium leading-relaxed">{shapeInfo.titikSudutDetail}</p>
                  </div>
                </div>

                {/* Rumus Ringkas */}
                <div className="mt-1 rounded-xl bg-purple-50 p-3 border-2 border-purple-200">
                  <span className="text-[11px] font-bold text-purple-900 uppercase block mb-1">
                    Rumus Luas & Volume:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#2a2830]">{shapeInfo.rumusL}</p>
                  <p className="text-xs sm:text-sm font-bold text-[#2a2830] mt-0.5">{shapeInfo.rumusV}</p>
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
