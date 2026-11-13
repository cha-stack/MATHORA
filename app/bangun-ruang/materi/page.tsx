"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { getCurrentUser } from "@/lib/auth";

type ShapeType = "kubus" | "balok" | "prisma" | "limas" | "tabung" | "kerucut" | "bola";
type PovMode = "dimensi_to_hasil" | "hasil_to_dimensi";
type KnownTarget = "volume" | "luas_permukaan";
type BangunViewTab = "lab3d" | "materi" | "perbandingan";

function fmtNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

interface ShapeConfig {
  name: string;
  category: "datar" | "lengkung";
  defaultP: number;
  defaultL: number;
  defaultT: number;
  pLabel: string;
  lLabel: string;
  tLabel: string;
  hasL: boolean; // apakah membutuhkan input L terpisah
  hasT: boolean; // apakah membutuhkan input T terpisah
  calcVol: (p: number, l: number, t: number, pi: number) => number;
  calcLP: (p: number, l: number, t: number, pi: number) => number;
  sisiDesc: string;
  rusukDesc: string;
  titikDesc: string;
}

const SHAPES_CONFIG: Record<ShapeType, ShapeConfig> = {
  kubus: {
    name: "Kubus",
    category: "datar",
    defaultP: 6,
    defaultL: 6,
    defaultT: 6,
    pLabel: "Panjang Rusuk (s)",
    lLabel: "Lebar (s)",
    tLabel: "Tinggi (s)",
    hasL: false,
    hasT: false,
    calcVol: (s) => s * s * s,
    calcLP: (s) => 6 * s * s,
    sisiDesc: "6 Sisi persegi identik kongruen",
    rusukDesc: "12 Rusuk lurus sama panjang",
    titikDesc: "8 Titik sudut siku-siku",
  },
  balok: {
    name: "Balok",
    category: "datar",
    defaultP: 10,
    defaultL: 6,
    defaultT: 8,
    pLabel: "Panjang (p)",
    lLabel: "Lebar (l)",
    tLabel: "Tinggi (t)",
    hasL: true,
    hasT: true,
    calcVol: (p, l, t) => p * l * t,
    calcLP: (p, l, t) => 2 * (p * l + p * t + l * t),
    sisiDesc: "6 Sisi berupa 3 pasang persegi panjang",
    rusukDesc: "12 Rusuk (4p, 4l, 4t)",
    titikDesc: "8 Titik sudut siku-siku",
  },
  prisma: {
    name: "Prisma Segitiga",
    category: "datar",
    defaultP: 8,
    defaultL: 6,
    defaultT: 12,
    pLabel: "Alas Segitiga (a)",
    lLabel: "Tinggi Segitiga (ta)",
    tLabel: "Tinggi Prisma (t)",
    hasL: true,
    hasT: true,
    calcVol: (a, ta, t) => 0.5 * a * ta * t,
    calcLP: (a, ta, t) => {
      const miring = Math.sqrt((a / 2) ** 2 + ta ** 2);
      const keliling = a + 2 * miring;
      const luasAlas = 0.5 * a * ta;
      return 2 * luasAlas + keliling * t;
    },
    sisiDesc: "5 Sisi (2 segitiga alas/tutup + 3 persegi tegak)",
    rusukDesc: "9 Rusuk (6 rusuk alas/tutup + 3 rusuk tegak)",
    titikDesc: "6 Titik sudut",
  },
  limas: {
    name: "Limas Segi Empat",
    category: "datar",
    defaultP: 10,
    defaultL: 10,
    defaultT: 12,
    pLabel: "Panjang Alas (p)",
    lLabel: "Lebar Alas (l)",
    tLabel: "Tinggi Limas (t)",
    hasL: true,
    hasT: true,
    calcVol: (p, l, t) => (1 / 3) * p * l * t,
    calcLP: (p, l, t) => {
      const tTegak1 = Math.sqrt((l / 2) ** 2 + t ** 2);
      const tTegak2 = Math.sqrt((p / 2) ** 2 + t ** 2);
      return p * l + 2 * (0.5 * p * tTegak1) + 2 * (0.5 * l * tTegak2);
    },
    sisiDesc: "5 Sisi (1 alas segi empat + 4 segitiga tegak)",
    rusukDesc: "8 Rusuk (4 alas + 4 rusuk miring)",
    titikDesc: "5 Titik sudut (4 sudut alas + 1 puncak)",
  },
  tabung: {
    name: "Tabung",
    category: "lengkung",
    defaultP: 7,
    defaultL: 14,
    defaultT: 10,
    pLabel: "Jari-jari (r)",
    lLabel: "Diameter (2r)",
    tLabel: "Tinggi Tabung (t)",
    hasL: false,
    hasT: true,
    calcVol: (r, _l, t, pi) => pi * r * r * t,
    calcLP: (r, _l, t, pi) => 2 * pi * r * (r + t),
    sisiDesc: "3 Sisi (2 lingkaran alas/tutup + 1 selimut lengkung)",
    rusukDesc: "2 Rusuk lengkung di tepian lingkaran",
    titikDesc: "0 Titik sudut",
  },
  kerucut: {
    name: "Kerucut",
    category: "lengkung",
    defaultP: 7,
    defaultL: 14,
    defaultT: 24,
    pLabel: "Jari-jari (r)",
    lLabel: "Diameter (2r)",
    tLabel: "Tinggi Kerucut (t)",
    hasL: false,
    hasT: true,
    calcVol: (r, _l, t, pi) => (1 / 3) * pi * r * r * t,
    calcLP: (r, _l, t, pi) => {
      const s = Math.sqrt(r * r + t * t);
      return pi * r * (r + s);
    },
    sisiDesc: "2 Sisi (1 alas lingkaran + 1 selimut kerucut)",
    rusukDesc: "1 Rusuk lengkung di alas",
    titikDesc: "1 Titik puncak di atas",
  },
  bola: {
    name: "Bola",
    category: "lengkung",
    defaultP: 7,
    defaultL: 14,
    defaultT: 7,
    pLabel: "Jari-jari (r)",
    lLabel: "Diameter (2r)",
    tLabel: "Jari-jari (r)",
    hasL: false,
    hasT: false,
    calcVol: (r, _l, _t, pi) => (4 / 3) * pi * r ** 3,
    calcLP: (r, _l, _t, pi) => 4 * pi * r ** 2,
    sisiDesc: "1 Bidang sisi lengkung tertutup sempurna",
    rusukDesc: "0 Rusuk",
    titikDesc: "0 Titik sudut",
  },
};

interface ShapeMateriDetail {
  definisi: string;
  sifatUtama: string[];
  rumusVol: string;
  rumusLP: string;
  rumusKhususLabel: string;
  rumusKhusus: string;
  bendaNyata: string;
  contohSoal: string;
  pembahasan: string[];
}

const SHAPE_MATERI: Record<ShapeType, ShapeMateriDetail> = {
  kubus: {
    definisi:
      "Bangun ruang sisi datar tiga dimensi yang dibatasi oleh enam buah sisi berbentuk persegi kongruen (sama bentuk dan ukuran) dengan sudut antar sisi 90°.",
    sifatUtama: [
      "Semua 6 sisi berbentuk persegi identik (luas tiap sisi = s²).",
      "Memiliki 12 rusuk sama panjang dan 8 titik sudut siku-siku.",
      "Memiliki 12 diagonal bidang (s√2) dan 4 diagonal ruang (s√3).",
    ],
    rumusVol: "V = s × s × s = s³",
    rumusLP: "LP = 6 × s²",
    rumusKhususLabel: "Diagonal & Kerangka",
    rumusKhusus: "Panjang Total Kawat Kerangka = 12 × s  |  Diagonal Ruang = s√3",
    bendaNyata: "Dadu permainan, rubik 3×3, kotak kado persegi, es batu kubus.",
    contohSoal: "Sebuah rubik berbentuk kubus memiliki panjang rusuk 8 cm. Hitunglah Volume dan Luas Permukaannya!",
    pembahasan: [
      "Diketahui panjang rusuk s = 8 cm.",
      "Volume (V) = s³ = 8 × 8 × 8 = 512 cm³.",
      "Luas Permukaan (LP) = 6 × s² = 6 × (8 × 8) = 6 × 64 = 384 cm².",
    ],
  },
  balok: {
    definisi:
      "Bangun ruang sisi datar yang dibatasi oleh tiga pasang sisi berbentuk persegi panjang yang sejajar dan kongruen (depan-belakang, kiri-kanan, atas-bawah).",
    sifatUtama: [
      "Memiliki 6 sisi persegi panjang (3 pasang ukuran: p×l, p×t, l×t).",
      "Memiliki 12 rusuk yang terbagi atas 4 panjang (p), 4 lebar (l), dan 4 tinggi (t).",
      "Memiliki 4 diagonal ruang sama panjang: √(p² + l² + t²).",
    ],
    rumusVol: "V = p × l × t",
    rumusLP: "LP = 2 × (p×l + p×t + l×t)",
    rumusKhususLabel: "Akuarium Tanpa Tutup & Kerangka",
    rumusKhusus: "LP Tanpa Tutup = (p×l) + 2(p×t) + 2(l×t)  |  Kerangka = 4 × (p + l + t)",
    bendaNyata: "Lemari pakaian, kotak pensil, batu bata, kulkas, akuarium.",
    contohSoal: "Akuarium balok berukuran p = 12 cm, l = 5 cm, dan t = 10 cm diisi air penuh. Berapa volumenya?",
    pembahasan: [
      "Diketahui p = 12 cm, l = 5 cm, t = 10 cm.",
      "Volume (V) = p × l × t = 12 × 5 × 10 = 600 cm³.",
      "Luas Permukaan penuh = 2 × (60 + 120 + 50) = 2 × 230 = 460 cm².",
    ],
  },
  prisma: {
    definisi:
      "Bangun ruang sisi datar yang memiliki bidang alas dan bidang tutup sejajar serta kongruen (segitiga), dihubungkan oleh tiga sisi tegak berbentuk persegi panjang.",
    sifatUtama: [
      "Memiliki 2 sisi segitiga (alas dan tutup kongruen) dan 3 sisi tegak persegi panjang.",
      "Rumus umum semua prisma berlaku sama: Volume = Luas Alas × Tinggi Prisma.",
      "Pada prisma segitiga sama kaki/siku-siku, sisi miring alas dicari dengan Pythagoras.",
    ],
    rumusVol: "V = (½ × a × t_alas) × t_prisma",
    rumusLP: "LP = (2 × Luas Alas) + (Keliling Alas × t_prisma)",
    rumusKhususLabel: "Luas Selimut (Sisi Tegak)",
    rumusKhusus: "Luas Selimut = Keliling Segitiga Alas × t_prisma",
    bendaNyata: "Tenda kemah pramuka, cokelat batang segitiga, atap rumah, prisma kaca optik.",
    contohSoal: "Sebuah tenda prisma memiliki alas segitiga siku-siku dengan alas 6 cm, tinggi segitiga 8 cm, dan tinggi prisma 15 cm. Berapa volumenya?",
    pembahasan: [
      "Hitung Luas Alas Segitiga = ½ × 6 × 8 = 24 cm².",
      "Volume Prisma = Luas Alas × t_prisma = 24 × 15 = 360 cm³.",
      "Jika dicari LP, cari sisi miring = √(6² + 8²) = 10 cm → Keliling = 6 + 8 + 10 = 24 cm → LP = 2(24) + 24(15) = 408 cm².",
    ],
  },
  limas: {
    definisi:
      "Bangun ruang sisi datar dengan satu alas segi empat yang keempat sisi tegaknya berbentuk segitiga dan meruncing bertemu tepat di satu titik puncak.",
    sifatUtama: [
      "Memiliki 1 sisi alas segi empat + 4 sisi tegak segitiga (total 5 sisi).",
      "Memiliki 1 titik puncak yang menghubungkan 4 rusuk tegak.",
      "Volume limas tepat sepertiga (⅓) dari volume balok berluas alas dan tinggi yang sama.",
    ],
    rumusVol: "V = ⅓ × Luas Alas × t = ⅓ × (p × l) × t",
    rumusLP: "LP = Luas Alas + Jumlah Luas 4 Segitiga Sisi Tegak",
    rumusKhususLabel: "Tinggi Segitiga Sisi Tegak (Pythagoras)",
    rumusKhusus: "t_segitiga = √((½ × sisi_alas)² + t_limas²)",
    bendaNyata: "Piramida Mesir, atap rumah joglo/menara masjid, kue bugis/limas.",
    contohSoal: "Piramida mini beralas persegi sisi 10 cm dan tinggi limas 12 cm. Hitunglah Volume dan Luas Permukaannya!",
    pembahasan: [
      "Luas Alas = 10 × 10 = 100 cm².",
      "Volume = ⅓ × 100 × 12 = 400 cm³.",
      "Tinggi segitiga sisi tegak = √((10÷2)² + 12²) = √(25 + 144) = √169 = 13 cm.",
      "Luas 4 segitiga = 4 × (½ × 10 × 13) = 260 cm² → LP = 100 + 260 = 360 cm².",
    ],
  },
  tabung: {
    definisi:
      "Bangun ruang sisi lengkung yang alas dan tutupnya berupa lingkaran kongruen sejajar, dihubungkan oleh satu sisi selimut lengkung yang jika dibuka berbentuk persegi panjang.",
    sifatUtama: [
      "Memiliki 3 sisi (2 lingkaran alas/tutup + 1 selimut melengkung) dan 0 titik sudut.",
      "Memiliki 2 rusuk lengkung berbentuk lingkaran di bagian atas dan bawah.",
      "Panjang selimut tabung tepat sama dengan Keliling Lingkaran Alas = 2 × π × r.",
    ],
    rumusVol: "V = π × r² × t",
    rumusLP: "LP = 2 × π × r × (r + t)",
    rumusKhususLabel: "Selimut & Tabung Tanpa Tutup",
    rumusKhusus: "Luas Selimut = 2 × π × r × t  |  LP Tanpa Tutup = πr² + 2πrt = πr(r + 2t)",
    bendaNyata: "Kaleng susu, drum air, gelas minum silinder, baterai, pipa paralon.",
    contohSoal: "Sebuah kaleng berbentuk tabung memiliki jari-jari r = 7 cm dan tinggi t = 10 cm (π = 22/7). Hitung Volume & Luas Permukaannya!",
    pembahasan: [
      "Luas Alas = 22/7 × 7 × 7 = 154 cm².",
      "Volume = Luas Alas × t = 154 × 10 = 1.540 cm³.",
      "Luas Selimut = 2 × 22/7 × 7 × 10 = 440 cm².",
      "Luas Permukaan = 2 × Luas Alas + Selimut = 308 + 440 = 748 cm².",
    ],
  },
  kerucut: {
    definisi:
      "Bangun ruang sisi lengkung yang menyerupai limas beralas lingkaran, memiliki 1 alas lingkaran dan 1 selimut melengkung yang meruncing ke titik puncak.",
    sifatUtama: [
      "Memiliki 2 sisi (1 lingkaran alas + 1 selimut berbentuk juring lingkaran) dan 1 titik puncak.",
      "Hubungan jari-jari (r), tinggi (t), dan garis pelukis (s) mengikuti Pythagoras: s² = r² + t².",
      "Volume kerucut tepat sepertiga (⅓) dari volume tabung yang ber-r dan ber-t sama.",
    ],
    rumusVol: "V = ⅓ × π × r² × t",
    rumusLP: "LP = π × r × (r + s)",
    rumusKhususLabel: "Garis Pelukis & Luas Selimut (Topi)",
    rumusKhusus: "Garis Pelukis s = √(r² + t²)  |  Luas Selimut = π × r × s",
    bendaNyata: "Topi ulang tahun, cone es krim, nasi tumpeng, traffic cone jalan.",
    contohSoal: "Sebuah kerucut memiliki jari-jari 6 cm dan tinggi 8 cm (π = 3,14). Hitung panjang garis pelukis dan Luas Selimutnya!",
    pembahasan: [
      "Cari Garis Pelukis (s) = √(r² + t²) = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.",
      "Luas Selimut (topi tanpa alas) = π × r × s = 3,14 × 6 × 10 = 188,4 cm².",
      "Luas Permukaan penuh = πr(r + s) = 3,14 × 6 × (6 + 10) = 301,44 cm².",
    ],
  },
  bola: {
    definisi:
      "Bangun ruang sisi lengkung sempurna yang tersusun dari tak hingga titik berjarak sama (jari-jari r) terhadap satu titik pusat di tengah ruang.",
    sifatUtama: [
      "Hanya memiliki 1 sisi lengkung tertutup penuh (0 rusuk dan 0 titik sudut).",
      "Luas permukaan 1 bola penuh sama persis dengan 4 kali luas lingkaran berjari-jari sama.",
      "Bola tidak memiliki jaring-jaring bidang datar sempurna; hanya bisa dipotong melengkung seperti kulit jeruk.",
    ],
    rumusVol: "V = ⁴⁄₃ × π × r³",
    rumusLP: "LP = 4 × π × r²",
    rumusKhususLabel: "Setengah Bola (Belahan)",
    rumusKhusus: "V ½ Bola = ⅔πr³ | LP ½ Bola Berongga = 2πr² | LP ½ Bola Pejal/Padat = 3πr²",
    bendaNyata: "Bola sepak, bola basket, kelereng, jeruk, globe peta dunia.",
    contohSoal: "Sebuah globe bola memiliki diameter 14 cm (r = 7 cm, π = 22/7). Hitunglah Luas Permukaannya!",
    pembahasan: [
      "Diketahui d = 14 cm → jari-jari r = 14 ÷ 2 = 7 cm.",
      "Luas Permukaan Bola (LP) = 4 × π × r² = 4 × 22/7 × 7 × 7 = 616 cm².",
      "Jika ditanya ½ bola padat (pejal/tertutup): LP = 3 × 22/7 × 49 = 462 cm².",
    ],
  },
};

interface ChallengeQuestion {
  id: string;
  story: string;
  dims: [number, number, number];
  piMode?: "22/7" | "3.14";
  fieldA: {
    label: string;
    unit: string;
    answer: number;
    placeholder?: string;
  };
  fieldB?: {
    label: string;
    unit: string;
    answer: number;
    placeholder?: string;
  };
  pembahasan: string[];
}

const SHAPE_CHALLENGES: Record<ShapeType, ChallengeQuestion[]> = {
  kubus: [
    {
      id: "kubus-1",
      story: "Sebuah rubik mainan berbentuk kubus memiliki panjang rusuk s = 8 cm. Hitunglah Volume dan Luas Permukaannya!",
      dims: [8, 8, 8],
      fieldA: { label: "Volume Kubus (V)", unit: "cm³", answer: 512, placeholder: "Misal: 512" },
      fieldB: { label: "Luas Permukaan Kubus (LP)", unit: "cm²", answer: 384, placeholder: "Misal: 384" },
      pembahasan: [
        "Diketahui panjang rusuk s = 8 cm.",
        "Volume (V) = s³ = 8 × 8 × 8 = 512 cm³.",
        "Luas Permukaan (LP) = 6 × s² = 6 × (8 × 8) = 6 × 64 = 384 cm².",
      ],
    },
    {
      id: "kubus-2",
      story: "Sebuah kotak kado berbentuk kubus memiliki panjang rusuk s = 10 cm. Berapakah Volume dan Luas Permukaannya?",
      dims: [10, 10, 10],
      fieldA: { label: "Volume Kubus (V)", unit: "cm³", answer: 1000, placeholder: "Misal: 1000" },
      fieldB: { label: "Luas Permukaan Kubus (LP)", unit: "cm²", answer: 600, placeholder: "Misal: 600" },
      pembahasan: [
        "Diketahui rusuk kubus s = 10 cm.",
        "Volume (V) = s³ = 10 × 10 × 10 = 1.000 cm³.",
        "Luas Permukaan (LP) = 6 × s² = 6 × (10 × 10) = 6 × 100 = 600 cm².",
      ],
    },
    {
      id: "kubus-3",
      story: "Dadu hiasan memiliki panjang rusuk s = 5 cm. Hitunglah Volume dan Luas Permukaannya!",
      dims: [5, 5, 5],
      fieldA: { label: "Volume Kubus (V)", unit: "cm³", answer: 125, placeholder: "Misal: 125" },
      fieldB: { label: "Luas Permukaan Kubus (LP)", unit: "cm²", answer: 150, placeholder: "Misal: 150" },
      pembahasan: [
        "Diketahui rusuk kubus s = 5 cm.",
        "Volume (V) = s³ = 5 × 5 × 5 = 125 cm³.",
        "Luas Permukaan (LP) = 6 × s² = 6 × 25 = 150 cm².",
      ],
    },
    {
      id: "kubus-4",
      story: "Cetakan es batu berbentuk kubus dengan panjang rusuk s = 6 cm. Berapakah Volume dan Luas Permukaannya?",
      dims: [6, 6, 6],
      fieldA: { label: "Volume Kubus (V)", unit: "cm³", answer: 216, placeholder: "Misal: 216" },
      fieldB: { label: "Luas Permukaan Kubus (LP)", unit: "cm²", answer: 216, placeholder: "Misal: 216" },
      pembahasan: [
        "Diketahui panjang rusuk s = 6 cm.",
        "Volume (V) = s³ = 6 × 6 × 6 = 216 cm³.",
        "Luas Permukaan (LP) = 6 × s² = 6 × 36 = 216 cm².",
      ],
    },
  ],
  balok: [
    {
      id: "balok-1",
      story: "Akuarium balok berukuran p = 12 cm, l = 5 cm, dan t = 10 cm. Hitunglah Volume dan Luas Permukaannya!",
      dims: [12, 5, 10],
      fieldA: { label: "Volume Balok (V)", unit: "cm³", answer: 600, placeholder: "Misal: 600" },
      fieldB: { label: "Luas Permukaan Balok (LP)", unit: "cm²", answer: 460, placeholder: "Misal: 460" },
      pembahasan: [
        "Diketahui p = 12 cm, l = 5 cm, t = 10 cm.",
        "Volume (V) = p × l × t = 12 × 5 × 10 = 600 cm³.",
        "Luas Permukaan (LP) = 2 × (p×l + p×t + l×t) = 2 × (60 + 120 + 50) = 2 × 230 = 460 cm².",
      ],
    },
    {
      id: "balok-2",
      story: "Sebuah kotak sepatu memiliki ukuran p = 10 cm, l = 6 cm, dan t = 8 cm. Tentukan Volume dan Luas Permukaannya!",
      dims: [10, 6, 8],
      fieldA: { label: "Volume Balok (V)", unit: "cm³", answer: 480, placeholder: "Misal: 480" },
      fieldB: { label: "Luas Permukaan Balok (LP)", unit: "cm²", answer: 376, placeholder: "Misal: 376" },
      pembahasan: [
        "Diketahui p = 10 cm, l = 6 cm, t = 8 cm.",
        "Volume (V) = 10 × 6 × 8 = 480 cm³.",
        "Luas Permukaan (LP) = 2 × (60 + 80 + 48) = 2 × 188 = 376 cm².",
      ],
    },
    {
      id: "balok-3",
      story: "Balok kayu mini berukuran p = 15 cm, l = 8 cm, dan t = 10 cm. Berapakah Volume dan Luas Permukaannya?",
      dims: [15, 8, 10],
      fieldA: { label: "Volume Balok (V)", unit: "cm³", answer: 1200, placeholder: "Misal: 1200" },
      fieldB: { label: "Luas Permukaan Balok (LP)", unit: "cm²", answer: 700, placeholder: "Misal: 700" },
      pembahasan: [
        "Diketahui p = 15 cm, l = 8 cm, t = 10 cm.",
        "Volume (V) = 15 × 8 × 10 = 1.200 cm³.",
        "Luas Permukaan (LP) = 2 × (120 + 150 + 80) = 2 × 350 = 700 cm².",
      ],
    },
    {
      id: "balok-4",
      story: "Sebuah tempat pensil berukuran p = 8 cm, l = 4 cm, dan t = 6 cm. Hitunglah Volume dan Luas Permukaannya!",
      dims: [8, 4, 6],
      fieldA: { label: "Volume Balok (V)", unit: "cm³", answer: 192, placeholder: "Misal: 192" },
      fieldB: { label: "Luas Permukaan Balok (LP)", unit: "cm²", answer: 208, placeholder: "Misal: 208" },
      pembahasan: [
        "Diketahui p = 8 cm, l = 4 cm, t = 6 cm.",
        "Volume (V) = 8 × 4 × 6 = 192 cm³.",
        "Luas Permukaan (LP) = 2 × (32 + 48 + 24) = 2 × 104 = 208 cm².",
      ],
    },
  ],
  prisma: [
    {
      id: "prisma-1",
      story: "Sebuah tenda prisma alas segitiga siku-siku dengan alas 6 cm, tinggi alas 8 cm, dan tinggi prisma 15 cm. Hitung Volume dan Luas Permukaannya!",
      dims: [6, 8, 15],
      fieldA: { label: "Volume Prisma (V)", unit: "cm³", answer: 360, placeholder: "Misal: 360" },
      fieldB: { label: "Luas Permukaan Prisma (LP)", unit: "cm²", answer: 408, placeholder: "Misal: 408" },
      pembahasan: [
        "Luas Alas Segitiga = ½ × a × ta = ½ × 6 × 8 = 24 cm².",
        "Volume Prisma = Luas Alas × t_prisma = 24 × 15 = 360 cm³.",
        "Sisi miring segitiga alas = √(6² + 8²) = 10 cm → Keliling Alas = 6 + 8 + 10 = 24 cm.",
        "Luas Permukaan = (2 × Luas Alas) + (Keliling × t) = 2(24) + 24(15) = 48 + 360 = 408 cm².",
      ],
    },
    {
      id: "prisma-2",
      story: "Kemasan cokelat berbentuk prisma segitiga siku-siku memiliki alas 3 cm, tinggi segitiga 4 cm, dan panjang prisma 10 cm. Hitung Volume dan Luas Permukaannya!",
      dims: [3, 4, 10],
      fieldA: { label: "Volume Prisma (V)", unit: "cm³", answer: 60, placeholder: "Misal: 60" },
      fieldB: { label: "Luas Permukaan Prisma (LP)", unit: "cm²", answer: 132, placeholder: "Misal: 132" },
      pembahasan: [
        "Luas Alas Segitiga = ½ × 3 × 4 = 6 cm².",
        "Volume Prisma = Luas Alas × t = 6 × 10 = 60 cm³.",
        "Sisi miring segitiga = √(3² + 4²) = 5 cm → Keliling Alas = 3 + 4 + 5 = 12 cm.",
        "Luas Permukaan = (2 × 6) + (12 × 10) = 12 + 120 = 132 cm².",
      ],
    },
    {
      id: "prisma-3",
      story: "Atap rumah miniatur prisma segitiga siku-siku memiliki alas 8 cm, tinggi segitiga 6 cm, dan tinggi prisma 12 cm. Tentukan Volume dan Luas Permukaannya!",
      dims: [8, 6, 12],
      fieldA: { label: "Volume Prisma (V)", unit: "cm³", answer: 288, placeholder: "Misal: 288" },
      fieldB: { label: "Luas Permukaan Prisma (LP)", unit: "cm²", answer: 336, placeholder: "Misal: 336" },
      pembahasan: [
        "Luas Alas Segitiga = ½ × 8 × 6 = 24 cm².",
        "Volume Prisma = 24 × 12 = 288 cm³.",
        "Sisi miring segitiga = √(8² + 6²) = 10 cm → Keliling = 8 + 6 + 10 = 24 cm.",
        "Luas Permukaan = (2 × 24) + (24 × 12) = 48 + 288 = 336 cm².",
      ],
    },
  ],
  limas: [
    {
      id: "limas-1",
      story: "Piramida mini berpenampang alas persegi sisi 10 cm dan tinggi limas 12 cm. Hitunglah Volume dan Luas Permukaannya!",
      dims: [10, 10, 12],
      fieldA: { label: "Volume Limas (V)", unit: "cm³", answer: 400, placeholder: "Misal: 400" },
      fieldB: { label: "Luas Permukaan Limas (LP)", unit: "cm²", answer: 360, placeholder: "Misal: 360" },
      pembahasan: [
        "Luas Alas Persegi = 10 × 10 = 100 cm².",
        "Volume (V) = ⅓ × Luas Alas × t = ⅓ × 100 × 12 = 400 cm³.",
        "Tinggi segitiga sisi tegak = √((10÷2)² + 12²) = √(25 + 144) = 13 cm.",
        "Luas 4 segitiga tegak = 4 × (½ × 10 × 13) = 260 cm² → Luas Permukaan = 100 + 260 = 360 cm².",
      ],
    },
    {
      id: "limas-2",
      story: "Kue limas persegi memiliki sisi alas 6 cm dan tinggi limas 4 cm. Berapakah Volume dan Luas Permukaannya?",
      dims: [6, 6, 4],
      fieldA: { label: "Volume Limas (V)", unit: "cm³", answer: 48, placeholder: "Misal: 48" },
      fieldB: { label: "Luas Permukaan Limas (LP)", unit: "cm²", answer: 96, placeholder: "Misal: 96" },
      pembahasan: [
        "Luas Alas = 6 × 6 = 36 cm².",
        "Volume (V) = ⅓ × 36 × 4 = 48 cm³.",
        "Tinggi segitiga sisi tegak = √(3² + 4²) = 5 cm.",
        "Luas Permukaan = 36 + 4 × (½ × 6 × 5) = 36 + 60 = 96 cm².",
      ],
    },
    {
      id: "limas-3",
      story: "Monumen limas persegi beralas sisi 8 cm dan tinggi limas 3 cm. Tentukan Volume dan Luas Permukaannya!",
      dims: [8, 8, 3],
      fieldA: { label: "Volume Limas (V)", unit: "cm³", answer: 64, placeholder: "Misal: 64" },
      fieldB: { label: "Luas Permukaan Limas (LP)", unit: "cm²", answer: 144, placeholder: "Misal: 144" },
      pembahasan: [
        "Luas Alas = 8 × 8 = 64 cm².",
        "Volume (V) = ⅓ × 64 × 3 = 64 cm³.",
        "Tinggi segitiga sisi tegak = √(4² + 3²) = 5 cm.",
        "Luas Permukaan = 64 + 4 × (½ × 8 × 5) = 64 + 80 = 144 cm².",
      ],
    },
  ],
  tabung: [
    {
      id: "tabung-1",
      story: "Sebuah kaleng berbentuk tabung memiliki jari-jari r = 7 cm dan tinggi t = 10 cm (π = 22/7). Hitung Volume dan Luas Permukaannya!",
      dims: [7, 14, 10],
      piMode: "22/7",
      fieldA: { label: "Volume Tabung (V)", unit: "cm³", answer: 1540, placeholder: "Misal: 1540" },
      fieldB: { label: "Luas Permukaan Tabung (LP)", unit: "cm²", answer: 748, placeholder: "Misal: 748" },
      pembahasan: [
        "Luas Alas = 22/7 × 7² = 154 cm².",
        "Volume (V) = Luas Alas × t = 154 × 10 = 1.540 cm³.",
        "Luas Permukaan (LP) = 2 × π × r × (r + t) = 2 × 22/7 × 7 × (7 + 10) = 44 × 17 = 748 cm².",
      ],
    },
    {
      id: "tabung-2",
      story: "Drum air silinder mini memiliki jari-jari r = 7 cm dan tinggi t = 20 cm (π = 22/7). Hitung Volume dan Luas Permukaannya!",
      dims: [7, 14, 20],
      piMode: "22/7",
      fieldA: { label: "Volume Tabung (V)", unit: "cm³", answer: 3080, placeholder: "Misal: 3080" },
      fieldB: { label: "Luas Permukaan Tabung (LP)", unit: "cm²", answer: 1188, placeholder: "Misal: 1188" },
      pembahasan: [
        "Luas Alas = 22/7 × 7² = 154 cm².",
        "Volume (V) = 154 × 20 = 3.080 cm³.",
        "Luas Permukaan (LP) = 2 × 22/7 × 7 × (7 + 20) = 44 × 27 = 1.188 cm².",
      ],
    },
    {
      id: "tabung-3",
      story: "Wadah tabung besar memiliki jari-jari r = 14 cm dan tinggi t = 10 cm (π = 22/7). Hitunglah Volume dan Luas Permukaannya!",
      dims: [14, 28, 10],
      piMode: "22/7",
      fieldA: { label: "Volume Tabung (V)", unit: "cm³", answer: 6160, placeholder: "Misal: 6160" },
      fieldB: { label: "Luas Permukaan Tabung (LP)", unit: "cm²", answer: 2112, placeholder: "Misal: 2112" },
      pembahasan: [
        "Luas Alas = 22/7 × 14 × 14 = 616 cm².",
        "Volume (V) = 616 × 10 = 6.160 cm³.",
        "Luas Permukaan (LP) = 2 × 22/7 × 14 × (14 + 10) = 88 × 24 = 2.112 cm².",
      ],
    },
  ],
  kerucut: [
    {
      id: "kerucut-1",
      story: "Sebuah topi ulang tahun berbentuk kerucut memiliki jari-jari r = 6 cm dan tinggi t = 8 cm (π = 3,14). Hitung garis pelukis (s) dan Luas Permukaannya!",
      dims: [6, 12, 8],
      piMode: "3.14",
      fieldA: { label: "Garis Pelukis (s)", unit: "cm", answer: 10, placeholder: "Misal: 10" },
      fieldB: { label: "Luas Permukaan Kerucut (LP)", unit: "cm²", answer: 301.44, placeholder: "Misal: 301.44" },
      pembahasan: [
        "Garis Pelukis (s) = √(r² + t²) = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.",
        "Luas Permukaan (LP) = π × r × (r + s) = 3,14 × 6 × (6 + 10) = 18,84 × 16 = 301,44 cm².",
      ],
    },
    {
      id: "kerucut-2",
      story: "Cone es krim memiliki jari-jari r = 7 cm dan tinggi t = 24 cm (π = 22/7). Hitung garis pelukis (s) dan Volumenya!",
      dims: [7, 14, 24],
      piMode: "22/7",
      fieldA: { label: "Garis Pelukis (s)", unit: "cm", answer: 25, placeholder: "Misal: 25" },
      fieldB: { label: "Volume Kerucut (V)", unit: "cm³", answer: 1232, placeholder: "Misal: 1232" },
      pembahasan: [
        "Garis Pelukis (s) = √(7² + 24²) = √(49 + 576) = √625 = 25 cm.",
        "Volume Kerucut (V) = ⅓ × π × r² × t = ⅓ × 22/7 × 49 × 24 = ⅓ × 154 × 24 = 1.232 cm³.",
      ],
    },
    {
      id: "kerucut-3",
      story: "Tumpeng kerucut mini memiliki jari-jari r = 3 cm dan tinggi t = 4 cm (π = 3,14). Tentukan garis pelukis (s) dan Luas Permukaannya!",
      dims: [3, 6, 4],
      piMode: "3.14",
      fieldA: { label: "Garis Pelukis (s)", unit: "cm", answer: 5, placeholder: "Misal: 5" },
      fieldB: { label: "Luas Permukaan Kerucut (LP)", unit: "cm²", answer: 75.36, placeholder: "Misal: 75.36" },
      pembahasan: [
        "Garis Pelukis (s) = √(3² + 4²) = √25 = 5 cm.",
        "Luas Permukaan = π × r × (r + s) = 3,14 × 3 × (3 + 5) = 9,42 × 8 = 75,36 cm².",
      ],
    },
  ],
  bola: [
    {
      id: "bola-1",
      story: "Sebuah globe berbentuk bola memiliki jari-jari r = 7 cm (diameter 14 cm, π = 22/7). Hitunglah Luas Permukaan dan Volumenya (bulatkan 2 desimal)!",
      dims: [7, 14, 7],
      piMode: "22/7",
      fieldA: { label: "Luas Permukaan Bola (LP)", unit: "cm²", answer: 616, placeholder: "Misal: 616" },
      fieldB: { label: "Volume Bola (V)", unit: "cm³", answer: 1437.33, placeholder: "Misal: 1437.33" },
      pembahasan: [
        "Diketahui jari-jari r = 7 cm.",
        "Luas Permukaan Bola (LP) = 4 × π × r² = 4 × 22/7 × 7² = 616 cm².",
        "Volume Bola (V) = ⁴⁄₃ × π × r³ = ⁴⁄₃ × 22/7 × 343 = 4.312 ÷ 3 ≈ 1.437,33 cm³.",
      ],
    },
    {
      id: "bola-2",
      story: "Sebuah kelereng bola kaca memiliki jari-jari r = 3 cm (π = 3,14). Hitung Luas Permukaan dan Volumenya!",
      dims: [3, 6, 3],
      piMode: "3.14",
      fieldA: { label: "Luas Permukaan Bola (LP)", unit: "cm²", answer: 113.04, placeholder: "Misal: 113.04" },
      fieldB: { label: "Volume Bola (V)", unit: "cm³", answer: 113.04, placeholder: "Misal: 113.04" },
      pembahasan: [
        "Diketahui r = 3 cm.",
        "Luas Permukaan Bola (LP) = 4 × π × r² = 4 × 3,14 × 9 = 113,04 cm².",
        "Volume Bola (V) = ⁴⁄₃ × π × r³ = ⁴⁄₃ × 3,14 × 27 = 4 × 3,14 × 9 = 113,04 cm³.",
      ],
    },
    {
      id: "bola-3",
      story: "Sebuah bola basket mini memiliki jari-jari r = 10 cm (π = 3,14). Hitunglah Luas Permukaan dan Volumenya (bulatkan 2 desimal)!",
      dims: [10, 20, 10],
      piMode: "3.14",
      fieldA: { label: "Luas Permukaan Bola (LP)", unit: "cm²", answer: 1256, placeholder: "Misal: 1256" },
      fieldB: { label: "Volume Bola (V)", unit: "cm³", answer: 4186.67, placeholder: "Misal: 4186.67" },
      pembahasan: [
        "Diketahui r = 10 cm.",
        "Luas Permukaan Bola (LP) = 4 × π × r² = 4 × 3,14 × 100 = 1.256 cm².",
        "Volume Bola (V) = ⁴⁄₃ × π × r³ = ⁴⁄₃ × 3,14 × 1000 = 12.560 ÷ 3 ≈ 4.186,67 cm³.",
      ],
    },
  ],
};

export default function BangunRuangMateriPage() {
  const { playClick, playCorrect } = useSound();
  const [activeViewTab, setActiveViewTab] = useState<BangunViewTab>("lab3d");
  const [selectedShape, setSelectedShape] = useState<ShapeType>("kubus");
  const [showJaring, setShowJaring] = useState(false);
  const [showExampleSteps, setShowExampleSteps] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard/siswa");
  const [autoSpin, setAutoSpin] = useState(false);
  // Tantangan Mini Soal Interaktif (Multi-soal & Jawab Volume + LP)
  const [challengeIdxByShape, setChallengeIdxByShape] = useState<Record<ShapeType, number>>({
    kubus: 0,
    balok: 0,
    prisma: 0,
    limas: 0,
    tabung: 0,
    kerucut: 0,
    bola: 0,
  });
  const [challengeInputA, setChallengeInputA] = useState("");
  const [challengeInputB, setChallengeInputB] = useState("");
  const [challengeStatus, setChallengeStatus] = useState<"idle" | "both_right" | "a_right" | "b_right" | "wrong">("idle");
  const [catFilter, setCatFilter] = useState<"all" | "datar" | "lengkung">("all");
  const [quickQuizPick, setQuickQuizPick] = useState<number | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setDashboardUrl(u?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa");
  }, []);

  useEffect(() => {
    if (!autoSpin) return;
    const t = setInterval(() => {
      setRotY((prev) => prev + 0.025);
    }, 30);
    return () => clearInterval(t);
  }, [autoSpin]);

  // Mode 2 POV (Dimensi -> Hasil  ATAU  Input Volume/LP -> Cari Dimensi)
  const [povMode, setPovMode] = useState<PovMode>("dimensi_to_hasil");
  const [knownTarget, setKnownTarget] = useState<KnownTarget>("volume");

  // Konstanta Pi untuk bangun ruang lengkung
  const [piMode, setPiMode] = useState<"22/7" | "3.14">("22/7");
  const piVal = piMode === "22/7" ? 22 / 7 : 3.14;
  const piStr = piMode === "22/7" ? "22/7" : "3,14";

  // Nilai Dimensi (Bebas angka berapapun atau string kosong saat pengguna menghapus untuk ketik angka baru)
  const [valP, setValP] = useState<string | number>(6);
  const [valL, setValL] = useState<string | number>(6);
  const [valT, setValT] = useState<string | number>(6);

  // Nilai numerik aman untuk perhitungan rumus & visualisasi 3D
  const numP = typeof valP === "number" ? valP : (parseFloat(String(valP)) || 0);
  const numL = typeof valL === "number" ? valL : (parseFloat(String(valL)) || 0);
  const numT = typeof valT === "number" ? valT : (parseFloat(String(valT)) || 0);

  // Input untuk POV 2 (Jika siswa sudah tahu Volume atau Luas Permukaan)
  const [reverseTargetInput, setReverseTargetInput] = useState<string>("216");
  const [tabungSolveFor, setTabungSolveFor] = useState<"t" | "r">("t");
  const [reverseError, setReverseError] = useState<string | null>(null);

  // Rotasi 3D
  const [rotX, setRotX] = useState(-0.35);
  const [rotY, setRotY] = useState(0.55);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const currentCfg = SHAPES_CONFIG[selectedShape];
  const currentChallenges = SHAPE_CHALLENGES[selectedShape];
  const curChallengeIdx = challengeIdxByShape[selectedShape] % currentChallenges.length;
  const currentChallenge = currentChallenges[curChallengeIdx];

  const handleNextChallenge = () => {
    playClick();
    setChallengeIdxByShape((prev) => ({
      ...prev,
      [selectedShape]: (prev[selectedShape] + 1) % currentChallenges.length,
    }));
    setChallengeInputA("");
    setChallengeInputB("");
    setChallengeStatus("idle");
    setShowExampleSteps(false);
  };

  const handleCheckChallenge = () => {
    const valA = parseFloat(challengeInputA.replace(",", "."));
    const valB = parseFloat(challengeInputB.replace(",", "."));
    const correctA = !isNaN(valA) && Math.abs(valA - currentChallenge.fieldA.answer) < 0.05;
    const correctB = currentChallenge.fieldB
      ? !isNaN(valB) && Math.abs(valB - currentChallenge.fieldB.answer) < 0.05
      : true;

    if (correctA && correctB) {
      playCorrect();
      setChallengeStatus("both_right");
      setShowExampleSteps(true);
    } else if (correctA && !correctB) {
      playClick();
      setChallengeStatus("a_right");
    } else if (!correctA && correctB) {
      playClick();
      setChallengeStatus("b_right");
    } else {
      playClick();
      setChallengeStatus("wrong");
    }
  };

  const handleLoadChallengeToLab = () => {
    playClick();
    const [dP, dL, dT] = currentChallenge.dims;
    setValP(dP);
    setValL(dL);
    setValT(dT);
    if (currentChallenge.piMode) {
      setPiMode(currentChallenge.piMode);
    } else if (currentCfg.category === "lengkung") {
      setPiMode("22/7");
    }
    setActiveViewTab("lab3d");
  };

  const handleSelectShape = (shape: ShapeType) => {
    playClick();
    setSelectedShape(shape);
    const cfg = SHAPES_CONFIG[shape];
    setValP(cfg.defaultP);
    setValL(cfg.defaultL);
    setValT(cfg.defaultT);
    setReverseError(null);
    const defVol = Math.round(cfg.calcVol(cfg.defaultP, cfg.defaultL, cfg.defaultT, piVal));
    setReverseTargetInput(String(defVol));
    setChallengeInputA("");
    setChallengeInputB("");
    setChallengeStatus("idle");
    setShowExampleSteps(false);
  };

  const handleReset = () => {
    playClick();
    setRotX(-0.35);
    setRotY(0.55);
    setValP(currentCfg.defaultP);
    setValL(currentCfg.defaultL);
    setValT(currentCfg.defaultT);
    setShowJaring(false);
    setReverseError(null);
  };

  // Update dimensi leluasa: izinkan input manual kosong saat mengetik tanpa dipaksa menjadi 0 atau 1
  const handleDimChange = (dim: "P" | "L" | "T", rawVal: string | number) => {
    if (typeof rawVal === "string") {
      if (rawVal === "") {
        if (selectedShape === "kubus") {
          setValP("");
          setValL("");
          setValT("");
        } else if (selectedShape === "bola") {
          setValP("");
          setValL("");
          setValT("");
        } else {
          if (dim === "P") setValP("");
          if (dim === "L") setValL("");
          if (dim === "T") setValT("");
        }
        return;
      }
      const parsed = parseFloat(rawVal);
      if (isNaN(parsed) || parsed < 0) return;
    }

    if (selectedShape === "kubus") {
      setValP(rawVal);
      setValL(rawVal);
      setValT(rawVal);
    } else if (selectedShape === "bola") {
      const n = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal)) || 0;
      setValP(rawVal);
      setValL(typeof rawVal === "string" ? (rawVal === "" ? "" : String(n * 2)) : n * 2);
      setValT(rawVal);
    } else {
      if (dim === "P") setValP(rawVal);
      if (dim === "L") setValL(rawVal);
      if (dim === "T") setValT(rawVal);
    }
  };

  // Hitung balik dimensi saat di POV 2 (Input V / LP -> Cari Ukuran)
  const handleSolveReverse = () => {
    playClick();
    setReverseError(null);
    const targetVal = parseFloat(reverseTargetInput.replace(",", "."));
    if (isNaN(targetVal) || targetVal <= 0) {
      setReverseError("Masukkan angka Volume atau Luas Permukaan yang valid (> 0).");
      return;
    }

    const curP = numP || 1;
    const curL = numL || 1;
    const curT = numT || 1;

    if (selectedShape === "kubus") {
      const s =
        knownTarget === "volume"
          ? Math.cbrt(targetVal)
          : Math.sqrt(targetVal / 6);
      const rounded = Math.round(s * 100) / 100;
      setValP(rounded);
      setValL(rounded);
      setValT(rounded);
    } else if (selectedShape === "bola") {
      const r =
        knownTarget === "volume"
          ? Math.cbrt((3 * targetVal) / (4 * piVal))
          : Math.sqrt(targetVal / (4 * piVal));
      const rounded = Math.round(r * 100) / 100;
      setValP(rounded);
      setValL(rounded * 2);
      setValT(rounded);
    } else if (selectedShape === "balok") {
      if (knownTarget === "volume") {
        const tNew = targetVal / (curP * curL);
        setValT(Math.round(tNew * 100) / 100);
      } else {
        const num = targetVal / 2 - curP * curL;
        if (num <= 0) {
          setReverseError(
            `Luas Permukaan terlalu kecil! Dengan p=${curP} & l=${curL}, LP minimal harus > ${fmtNum(
              2 * curP * curL
            )} cm².`
          );
          return;
        }
        const tNew = num / (curP + curL);
        setValT(Math.round(tNew * 100) / 100);
      }
    } else if (selectedShape === "tabung") {
      if (knownTarget === "volume") {
        if (tabungSolveFor === "t") {
          const tNew = targetVal / (piVal * curP * curP);
          setValT(Math.round(tNew * 100) / 100);
        } else {
          const rNew = Math.sqrt(targetVal / (piVal * curT));
          setValP(Math.round(rNew * 100) / 100);
        }
      } else {
        // Diketahui LP, cari t (given r = curP)
        const baseAreas = 2 * piVal * curP * curP;
        if (targetVal <= baseAreas) {
          setReverseError(
            `Luas Permukaan harus > ${fmtNum(baseAreas)} cm² untuk jari-jari r=${curP} cm!`
          );
          return;
        }
        const tNew = targetVal / (2 * piVal * curP) - curP;
        setValT(Math.round(tNew * 100) / 100);
      }
    } else if (selectedShape === "kerucut") {
      if (knownTarget === "volume") {
        if (tabungSolveFor === "t") {
          const tNew = (3 * targetVal) / (piVal * curP * curP);
          setValT(Math.round(tNew * 100) / 100);
        } else {
          const rNew = Math.sqrt((3 * targetVal) / (piVal * curT));
          setValP(Math.round(rNew * 100) / 100);
        }
      } else {
        const minLP = piVal * curP * curP;
        if (targetVal <= minLP) {
          setReverseError(`LP terlalu kecil! Untuk r=${curP} cm, LP harus > ${fmtNum(minLP)} cm².`);
          return;
        }
        const sPelukis = targetVal / (piVal * curP) - curP;
        if (sPelukis <= curP) {
          setReverseError(`Garis pelukis (s = ${fmtNum(sPelukis)}) harus > jari-jari r = ${curP} cm!`);
          return;
        }
        const tNew = Math.sqrt(sPelukis * sPelukis - curP * curP);
        setValT(Math.round(tNew * 100) / 100);
      }
    } else if (selectedShape === "prisma") {
      const luasAlas = 0.5 * curP * curL;
      if (knownTarget === "volume") {
        const tNew = targetVal / luasAlas;
        setValT(Math.round(tNew * 100) / 100);
      } else {
        if (targetVal <= 2 * luasAlas) {
          setReverseError(
            `LP harus lebih besar dari 2 × Luas Alas (> ${fmtNum(2 * luasAlas)} cm²)!`
          );
          return;
        }
        const miring = Math.sqrt((curP / 2) ** 2 + curL ** 2);
        const keliling = curP + 2 * miring;
        const tNew = (targetVal - 2 * luasAlas) / keliling;
        setValT(Math.round(tNew * 100) / 100);
      }
    } else if (selectedShape === "limas") {
      if (knownTarget === "volume") {
        const tNew = (3 * targetVal) / (curP * curL);
        setValT(Math.round(tNew * 100) / 100);
      } else {
        if (targetVal <= curP * curL) {
          setReverseError(`LP limas harus lebih besar dari Luas Alas (> ${fmtNum(curP * curL)} cm²)!`);
          return;
        }
        // Binary search tinggi limas t dari LP
        let low = 0.01;
        let high = 10000;
        for (let iter = 0; iter < 50; iter++) {
          const mid = (low + high) / 2;
          const lpMid = currentCfg.calcLP(curP, curL, mid, piVal);
          if (lpMid < targetVal) low = mid;
          else high = mid;
        }
        setValT(Math.round(((low + high) / 2) * 100) / 100);
      }
    }
  };

  // Hasil Perhitungan Aktif
  const calculatedVol = currentCfg.calcVol(numP, numL, numT, piVal);
  const calculatedLP = currentCfg.calcLP(numP, numL, numT, piVal);

  // Bangun proses pengerjaan manual langkah demi langkah
  const getManualSteps = () => {
    const pF = fmtNum(numP);
    const lF = fmtNum(numL);
    const tF = fmtNum(numT);
    const vF = fmtNum(calculatedVol);
    const lpF = fmtNum(calculatedLP);

    if (povMode === "hasil_to_dimensi") {
      const targetVal = parseFloat(reverseTargetInput.replace(",", ".")) || 0;
      const tvF = fmtNum(targetVal);

      if (selectedShape === "kubus") {
        return knownTarget === "volume"
          ? [
              `Diketahui: Volume (V) = ${tvF} cm³`,
              `Rumus Volume Kubus: V = s × s × s = s³`,
              `Substitusi: ${tvF} = s³  →  s = ∛(${tvF})`,
              `Diperoleh Panjang Rusuk (s) = ${pF} cm`,
              `Maka Luas Permukaan (LP) = 6 × (${pF})² = ${lpF} cm²`,
            ]
          : [
              `Diketahui: Luas Permukaan (LP) = ${tvF} cm²`,
              `Rumus: LP = 6 × s²`,
              `Substitusi: ${tvF} = 6 × s²  →  s² = ${tvF} ÷ 6 = ${fmtNum(targetVal / 6)}`,
              `Diperoleh Panjang Rusuk (s) = √(${fmtNum(targetVal / 6)}) = ${pF} cm`,
              `Maka Volume (V) = (${pF})³ = ${vF} cm³`,
            ];
      }
      if (selectedShape === "bola") {
        return knownTarget === "volume"
          ? [
              `Diketahui: Volume Bola (V) = ${tvF} cm³, π = ${piStr}`,
              `Rumus: V = 4/3 × π × r³`,
              `r³ = (3 × ${tvF}) ÷ (4 × ${piStr}) = ${fmtNum((3 * targetVal) / (4 * piVal))}`,
              `Diperoleh Jari-jari (r) = ∛(${fmtNum((3 * targetVal) / (4 * piVal))}) = ${pF} cm`,
            ]
          : [
              `Diketahui: Luas Permukaan Bola (LP) = ${tvF} cm², π = ${piStr}`,
              `Rumus: LP = 4 × π × r²`,
              `r² = ${tvF} ÷ (4 × ${piStr}) = ${fmtNum(targetVal / (4 * piVal))}`,
              `Diperoleh Jari-jari (r) = √(${fmtNum(targetVal / (4 * piVal))}) = ${pF} cm`,
            ];
      }
      if (selectedShape === "balok") {
        return knownTarget === "volume"
          ? [
              `Diketahui: V = ${tvF} cm³, p = ${pF} cm, l = ${lF} cm`,
              `Rumus: V = p × l × t`,
              `Substitusi: ${tvF} = ${pF} × ${lF} × t = ${fmtNum(numP * numL)} × t`,
              `Diperoleh Tinggi (t) = ${tvF} ÷ ${fmtNum(numP * numL)} = ${tF} cm`,
            ]
          : [
              `Diketahui: LP = ${tvF} cm², p = ${pF} cm, l = ${lF} cm`,
              `Rumus: LP = 2 × (p×l + p×t + l×t)`,
              `LP / 2 = ${pF}×${lF} + t(${pF} + ${lF})  →  ${fmtNum(targetVal / 2)} = ${fmtNum(numP * numL)} + ${fmtNum(numP + numL)}t`,
              `Diperoleh Tinggi (t) = ${fmtNum(targetVal / 2 - numP * numL)} ÷ ${fmtNum(numP + numL)} = ${tF} cm`,
            ];
      }
      if (selectedShape === "tabung") {
        if (knownTarget === "volume") {
          return tabungSolveFor === "t"
            ? [
                `Diketahui: V = ${tvF} cm³, r = ${pF} cm, π = ${piStr}`,
                `Rumus: V = π × r² × t`,
                `Luas Alas = ${piStr} × ${pF}² = ${fmtNum(piVal * numP * numP)} cm²`,
                `Diperoleh Tinggi (t) = ${tvF} ÷ ${fmtNum(piVal * numP * numP)} = ${tF} cm`,
              ]
            : [
                `Diketahui: V = ${tvF} cm³, t = ${tF} cm, π = ${piStr}`,
                `Rumus: V = π × r² × t`,
                `r² = ${tvF} ÷ (${piStr} × ${tF}) = ${fmtNum(targetVal / (piVal * numT))}`,
                `Diperoleh Jari-jari (r) = √(${fmtNum(targetVal / (piVal * numT))}) = ${pF} cm`,
              ];
        } else {
          return [
            `Diketahui: LP = ${tvF} cm², r = ${pF} cm, π = ${piStr}`,
            `Rumus: LP = 2 × π × r × (r + t)`,
            `r + t = ${tvF} ÷ (2 × ${piStr} × ${pF}) = ${fmtNum(targetVal / (2 * piVal * numP))}`,
            `Diperoleh Tinggi (t) = ${fmtNum(targetVal / (2 * piVal * numP))} - ${pF} = ${tF} cm`,
          ];
        }
      }
      if (selectedShape === "kerucut") {
        return knownTarget === "volume"
          ? [
              `Diketahui: V = ${tvF} cm³, r = ${pF} cm, π = ${piStr}`,
              `Rumus: V = 1/3 × π × r² × t`,
              `Diperoleh Tinggi (t) = (3 × ${tvF}) ÷ (${piStr} × ${pF}²) = ${tF} cm`,
            ]
          : [
              `Diketahui: LP = ${tvF} cm², r = ${pF} cm`,
              `Garis pelukis (s) = LP ÷ (π×r) - r = ${fmtNum(targetVal / (piVal * numP) - numP)} cm`,
              `Diperoleh Tinggi (t) = √(s² - r²) = ${tF} cm`,
            ];
      }
      return [
        `Diketahui: ${knownTarget === "volume" ? "Volume" : "Luas Permukaan"} = ${tvF}`,
        `Dengan alas ${pF} cm & ${lF} cm`,
        `Diperoleh Tinggi (t) = ${tF} cm`,
      ];
    }

    // POV 1: Dari Ukuran -> Hitung V & LP (Proses Manual)
    switch (selectedShape) {
      case "kubus":
        return [
          `Volume (V) = s × s × s = ${pF} × ${pF} × ${pF} = ${vF} cm³`,
          `Luas Permukaan (LP) = 6 × s² = 6 × (${pF}²) = 6 × ${fmtNum(numP * numP)} = ${lpF} cm²`,
        ];
      case "balok":
        return [
          `Volume (V) = p × l × t = ${pF} × ${lF} × ${tF} = ${vF} cm³`,
          `Luas Permukaan (LP) = 2 × (${pF}×${lF} + ${pF}×${tF} + ${lF}×${tF}) = 2 × (${fmtNum(numP * numL)} + ${fmtNum(numP * numT)} + ${fmtNum(numL * numT)}) = ${lpF} cm²`,
        ];
      case "prisma": {
        const luasAlas = 0.5 * numP * numL;
        const miring = Math.sqrt((numP / 2) ** 2 + numL ** 2);
        return [
          `Luas Alas Segitiga = ½ × a × ta = ½ × ${pF} × ${lF} = ${fmtNum(luasAlas)} cm²`,
          `Volume (V) = Luas Alas × t = ${fmtNum(luasAlas)} × ${tF} = ${vF} cm³`,
          `Sisi miring segitiga ≈ ${fmtNum(miring)} cm → Keliling Alas = ${fmtNum(numP + 2 * miring)} cm`,
          `Luas Permukaan = (2 × ${fmtNum(luasAlas)}) + (${fmtNum(numP + 2 * miring)} × ${tF}) = ${lpF} cm²`,
        ];
      }
      case "limas":
        return [
          `Luas Alas = ${pF} × ${lF} = ${fmtNum(numP * numL)} cm²`,
          `Volume (V) = ⅓ × Luas Alas × t = ⅓ × ${fmtNum(numP * numL)} × ${tF} = ${vF} cm³`,
          `Luas Permukaan (LP) = Luas Alas + 4 Segitiga Sisi Tegak = ${lpF} cm²`,
        ];
      case "tabung":
        return [
          `Volume (V) = π × r² × t = ${piStr} × ${pF}² × ${tF} = ${piStr} × ${fmtNum(numP * numP)} × ${tF} = ${vF} cm³`,
          `Luas Permukaan (LP) = 2 × π × r × (r + t) = 2 × ${piStr} × ${pF} × (${pF} + ${tF}) = ${lpF} cm²`,
        ];
      case "kerucut": {
        const sPelukis = Math.sqrt(numP * numP + numT * numT);
        return [
          `Garis Pelukis (s) = √(r² + t²) = √(${pF}² + ${tF}²) = ${fmtNum(sPelukis)} cm`,
          `Volume (V) = ⅓ × π × r² × t = ⅓ × ${piStr} × ${fmtNum(numP * numP)} × ${tF} = ${vF} cm³`,
          `Luas Permukaan (LP) = π × r × (r + s) = ${piStr} × ${pF} × (${pF} + ${fmtNum(sPelukis)}) = ${lpF} cm²`,
        ];
      }
      case "bola":
        return [
          `Volume (V) = ⁴⁄₃ × π × r³ = ⁴⁄₃ × ${piStr} × ${pF}³ = ${vF} cm³`,
          `Luas Permukaan (LP) = 4 × π × r² = 4 × ${piStr} × ${fmtNum(numP * numP)} = ${lpF} cm²`,
        ];
    }
  };

  type Pt3D = { x: number; y: number; z: number };

  // Proyeksi 3D Objek dengan Skala Normalisasi Proporsional (Aman untuk angka besar > 12 hingga ribuan!)
  const project3D = (x: number, y: number, z: number): Pt3D => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    return { x: 190 + x1, y: 135 + y2, z: z2 };
  };

  const ptsToStr = (pts: Pt3D[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const effL = selectedShape === "kubus" ? numP : selectedShape === "tabung" || selectedShape === "kerucut" || selectedShape === "bola" ? numP * 2 : numL;
  const effT = selectedShape === "kubus" ? numP : selectedShape === "bola" ? numP * 2 : numT;
  const maxDim = Math.max(numP, effL, effT, 1);
  // Fit proporsi ke span maksimal 125px agar angka berapa pun tampil akurat tanpa keluar frame
  const normScale = 125 / maxDim;

  const sx = (numP * normScale) / 2;
  const sy = (effT * normScale) / 2;
  const sz = (effL * normScale) / 2;

  // 8 Titik Sudut Balok / Kubus / Limas
  const pA = project3D(-sx, -sy, -sz);
  const pB = project3D(sx, -sy, -sz);
  const pC = project3D(sx, sy, -sz);
  const pD = project3D(-sx, sy, -sz);
  const pE = project3D(-sx, -sy, sz);
  const pF = project3D(sx, -sy, sz);
  const pG = project3D(sx, sy, sz);
  const pH = project3D(-sx, sy, sz);

  const boxFaces = [
    { pts: [pA, pB, pC, pD], fill: "rgba(255,255,255,0.14)", name: "belakang" },
    { pts: [pE, pF, pG, pH], fill: "rgba(255,255,255,0.22)", name: "depan" },
    { pts: [pA, pE, pH, pD], fill: "rgba(255,255,255,0.18)", name: "kiri" },
    { pts: [pB, pF, pG, pC], fill: "#ef4444", name: "kanan" },
    { pts: [pA, pB, pF, pE], fill: "rgba(255,255,255,0.28)", name: "atas" },
    { pts: [pD, pC, pG, pH], fill: "rgba(255,255,255,0.16)", name: "bawah" },
  ]
    .map((f) => ({ ...f, avgZ: f.pts.reduce((acc, p) => acc + p.z, 0) / f.pts.length }))
    .sort((a, b) => a.avgZ - b.avgZ);

  // Limas Segi Empat (Alas di y=sy, puncak di y=-sy)
  const apex = project3D(0, -sy, 0);
  const limasFaces = [
    { pts: [pD, pC, pG, pH], fill: "rgba(255,255,255,0.28)" },
    { pts: [pD, pC, apex], fill: "rgba(255,255,255,0.16)" },
    { pts: [pC, pG, apex], fill: "#ef4444" },
    { pts: [pG, pH, apex], fill: "rgba(255,255,255,0.24)" },
    { pts: [pH, pD, apex], fill: "rgba(255,255,255,0.18)" },
  ]
    .map((f) => ({ ...f, avgZ: f.pts.reduce((acc, p) => acc + p.z, 0) / f.pts.length }))
    .sort((a, b) => a.avgZ - b.avgZ);

  // Prisma Segitiga
  const prF1 = project3D(-sx, sy, sz);
  const prF2 = project3D(sx, sy, sz);
  const prF3 = project3D(0, -sy, sz);
  const prB1 = project3D(-sx, sy, -sz);
  const prB2 = project3D(sx, sy, -sz);
  const prB3 = project3D(0, -sy, -sz);
  const prismaFaces = [
    { pts: [prB1, prB2, prB3], fill: "rgba(255,255,255,0.16)" },
    { pts: [prF1, prF2, prF3], fill: "#ef4444" },
    { pts: [prF1, prF2, prB2, prB1], fill: "rgba(255,255,255,0.24)" },
    { pts: [prF2, prF3, prB3, prB2], fill: "rgba(255,255,255,0.22)" },
    { pts: [prF3, prF1, prB1, prB3], fill: "rgba(255,255,255,0.18)" },
  ]
    .map((f) => ({ ...f, avgZ: f.pts.reduce((acc, p) => acc + p.z, 0) / f.pts.length }))
    .sort((a, b) => a.avgZ - b.avgZ);

  // Proporsi Tabung, Kerucut, Bola dalam 3D
  const radPx = selectedShape === "bola" ? Math.min(82, Math.max(42, (numP * normScale) / 2 + 28)) : Math.max(24, (numP * normScale) / 2);
  const hPx = Math.max(38, effT * normScale);

  const SEG_CURVE = 24;
  const cylTopRing: Pt3D[] = [];
  const cylBotRing: Pt3D[] = [];
  for (let i = 0; i < SEG_CURVE; i++) {
    const theta = (i / SEG_CURVE) * Math.PI * 2;
    const cx = radPx * Math.cos(theta);
    const cz = radPx * Math.sin(theta);
    cylTopRing.push(project3D(cx, -hPx / 2, cz));
    cylBotRing.push(project3D(cx, hPx / 2, cz));
  }
  const cylTopCenter = project3D(0, -hPx / 2, 0);
  const cylBotCenter = project3D(0, hPx / 2, 0);
  const cylDrawItems = [
    ...Array.from({ length: SEG_CURVE }, (_, i) => {
      const next = (i + 1) % SEG_CURVE;
      const pts = [cylTopRing[i], cylTopRing[next], cylBotRing[next], cylBotRing[i]];
      const avgZ = pts.reduce((a, p) => a + p.z, 0) / 4;
      const isHighlight = i >= 4 && i <= 8;
      return {
        type: "side" as const,
        pts,
        avgZ,
        fill: isHighlight ? "rgba(239, 68, 68, 0.72)" : avgZ >= 0 ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.1)",
      };
    }),
    { type: "cap" as const, pts: cylTopRing, avgZ: cylTopCenter.z, fill: "#ef4444" },
    { type: "cap" as const, pts: cylBotRing, avgZ: cylBotCenter.z, fill: "rgba(255,255,255,0.3)" },
  ].sort((a, b) => a.avgZ - b.avgZ);

  const coneApex = project3D(0, -hPx / 2, 0);
  const coneBotCenter = project3D(0, hPx / 2, 0);
  const coneDrawItems = [
    ...Array.from({ length: SEG_CURVE }, (_, i) => {
      const next = (i + 1) % SEG_CURVE;
      const pts = [cylBotRing[i], cylBotRing[next], coneApex];
      const avgZ = pts.reduce((a, p) => a + p.z, 0) / 3;
      const isHighlight = i >= 3 && i <= 9;
      return {
        type: "side" as const,
        pts,
        avgZ,
        fill: isHighlight ? "rgba(239, 68, 68, 0.82)" : avgZ >= 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
      };
    }),
    { type: "cap" as const, pts: cylBotRing, avgZ: coneBotCenter.z, fill: "rgba(255,255,255,0.34)" },
  ].sort((a, b) => a.avgZ - b.avgZ);

  // Bola 3D Grid (garis lintang & bujur terproyeksi 3D)
  const buildSphereSegs = () => {
    const segs: { p1: Pt3D; p2: Pt3D; avgZ: number; isMain: boolean }[] = [];
    const steps = 32;
    const latAngles = [-40, 0, 40];
    for (const deg of latAngles) {
      const phi = (deg * Math.PI) / 180;
      const y = radPx * Math.sin(phi);
      const rRing = radPx * Math.cos(phi);
      for (let k = 0; k < steps; k++) {
        const a1 = (k / steps) * Math.PI * 2;
        const a2 = ((k + 1) / steps) * Math.PI * 2;
        const p1 = project3D(rRing * Math.cos(a1), y, rRing * Math.sin(a1));
        const p2 = project3D(rRing * Math.cos(a2), y, rRing * Math.sin(a2));
        segs.push({ p1, p2, avgZ: (p1.z + p2.z) / 2, isMain: deg === 0 });
      }
    }
    const lonAngles = [0, 45, 90, 135];
    for (const deg of lonAngles) {
      const lam = (deg * Math.PI) / 180;
      for (let k = 0; k < steps; k++) {
        const phi1 = (k / steps) * Math.PI * 2;
        const phi2 = ((k + 1) / steps) * Math.PI * 2;
        const p1 = project3D(radPx * Math.cos(phi1) * Math.cos(lam), radPx * Math.sin(phi1), radPx * Math.cos(phi1) * Math.sin(lam));
        const p2 = project3D(radPx * Math.cos(phi2) * Math.cos(lam), radPx * Math.sin(phi2), radPx * Math.cos(phi2) * Math.sin(lam));
        segs.push({ p1, p2, avgZ: (p1.z + p2.z) / 2, isMain: deg === 0 });
      }
    }
    return segs.sort((a, b) => a.avgZ - b.avgZ);
  };
  const sphereSegs = selectedShape === "bola" ? buildSphereSegs() : [];
  const sphereNorth = project3D(0, -radPx, 0);
  const sphereRadiusPt = project3D(radPx, 0, 0);

  const manualSteps = getManualSteps();
  const currentMateri = SHAPE_MATERI[selectedShape];

  return (
    <GameShell backUrl="/materi" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Big Glass Container */}
        <div className="relative w-full max-w-6xl rounded-[36px] sm:rounded-[44px] border-[8px] border-white bg-[#d5cfeb]/95 p-5 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col gap-5">
          
          {/* Header Title & Sub-Navigation Tabs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] font-semibold tracking-wide">
                  Materi &amp; Lab Bangun Ruang
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">
                  Pelajari konsep, rumus, contoh soal, dan putar objek 3D serta kalkulator 2 POV secara bebas!
                </p>
              </div>

              {/* Pemilih Nilai Pi untuk bangun lengkung */}
              {currentCfg.category === "lengkung" && (
                <div className="flex items-center gap-2 bg-white/80 border-2 border-white px-3 py-1.5 rounded-2xl shadow-xs self-start sm:self-auto">
                  <span className="text-xs font-semibold text-gray-700">Nilai π:</span>
                  {(["22/7", "3.14"] as const).map((pm) => (
                    <button
                      key={pm}
                      onClick={() => { playClick(); setPiMode(pm); }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        piMode === pm ? "bg-[#5e65e9] text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3 Tab Mode Utama Bangun Ruang */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-white/75 rounded-2xl border-2 border-white shadow-xs">
              <button
                onClick={() => { playClick(); setActiveViewTab("lab3d"); }}
                className={`rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeViewTab === "lab3d" ? "bg-[#126b7c] text-white shadow" : "text-[#2a2830] hover:bg-white"
                }`}
              >
                <span>🔬</span>
                <span>Lab 3D &amp; Kalkulator 2 POV</span>
              </button>
              <button
                onClick={() => { playClick(); setActiveViewTab("materi"); }}
                className={`rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeViewTab === "materi" ? "bg-[#5e65e9] text-white shadow" : "text-[#2a2830] hover:bg-white"
                }`}
              >
                <span>📖</span>
                <span>Materi, Rumus &amp; Contoh Soal</span>
              </button>
              <button
                onClick={() => { playClick(); setActiveViewTab("perbandingan"); }}
                className={`rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeViewTab === "perbandingan" ? "bg-[#e05f1e] text-white shadow" : "text-[#2a2830] hover:bg-white"
                }`}
              >
                <span>📊</span>
                <span>Rangkuman 7 Bangun Ruang</span>
              </button>
            </div>
          </div>

          {activeViewTab === "lab3d" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
            
            {/* KOLOM KIRI (8 Kolom): 3D Canvas Box + 2-POV Panel + Proses Hitung Manual */}
            <div className="lg:col-span-8 flex flex-col rounded-[32px] border-[6px] border-white bg-gradient-to-b from-[#1b8da3] to-[#126b7c] p-5 shadow-[0px_6px_0px_0px_#aaafaf] text-white">
              
              {/* Header Box Interaksi 3D */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-full border-2 border-white/60 bg-white/20 px-3 py-1 text-xs font-semibold shadow-xs">
                    <span>🖐️</span>
                    <span>Geser Objek 360°</span>
                  </div>
                  <button
                    onClick={() => { playClick(); setRotX(-0.35); setRotY(0.55); }}
                    className="rounded-full border border-white/60 bg-white/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-white hover:text-[#126b7c] transition-all cursor-pointer"
                  >
                    Isometrik
                  </button>
                  <button
                    onClick={() => { playClick(); setAutoSpin(false); setRotX(-1.15); setRotY(0.2); }}
                    className="rounded-full border border-white/60 bg-white/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-white hover:text-[#126b7c] transition-all cursor-pointer"
                  >
                    Tampak Atas
                  </button>
                  <button
                    onClick={() => { playClick(); setAutoSpin((s) => !s); }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      autoSpin
                        ? "bg-amber-300 text-amber-950 border-amber-200 shadow"
                        : "border-white/60 bg-white/15 hover:bg-white hover:text-[#126b7c]"
                    }`}
                  >
                    {autoSpin ? "⏸ Stop Putar" : "🔄 Putar Otomatis"}
                  </button>
                  <button
                    onClick={() => { setAutoSpin(false); handleReset(); }}
                    className="flex items-center gap-1 rounded-full border-2 border-white/80 bg-white/30 px-3 py-1 text-xs font-semibold hover:bg-white hover:text-[#126b7c] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Reset</span>
                  </button>
                </div>

                <span className="game-font text-lg sm:text-xl font-semibold tracking-wide uppercase text-amber-200">
                  {currentCfg.name}
                </span>
              </div>

              {/* 3D Visual Stage */}
              <div
                onPointerDown={(e) => {
                  isDragging.current = true;
                  lastPos.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerMove={(e) => {
                  if (!isDragging.current) return;
                  const dx = e.clientX - lastPos.current.x;
                  const dy = e.clientY - lastPos.current.y;
                  setRotY((prev) => prev + dx * 0.015);
                  setRotX((prev) => prev + dy * 0.015);
                  lastPos.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerUp={() => { isDragging.current = false; }}
                onPointerLeave={() => { isDragging.current = false; }}
                className="relative w-full h-[260px] sm:h-[280px] rounded-[24px] bg-[#126b7c]/50 border-2 border-white/30 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden my-2 shadow-inner touch-none"
              >
                {/* Live Dimensi Badge di Pojok Kiri Bawah */}
                <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-1.5">
                  <span className="bg-black/40 backdrop-blur-xs border border-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    {currentCfg.pLabel}: {fmtNum(numP)} cm
                  </span>
                  {currentCfg.hasL && (
                    <span className="bg-black/40 backdrop-blur-xs border border-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {currentCfg.lLabel}: {fmtNum(numL)} cm
                    </span>
                  )}
                  {currentCfg.hasT && (
                    <span className="bg-black/40 backdrop-blur-xs border border-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {currentCfg.tLabel}: {fmtNum(numT)} cm
                    </span>
                  )}
                </div>

                {!showJaring ? (
                  <svg viewBox="0 0 380 270" className="w-full h-full">
                    {/* KUBUS & BALOK 3D DEPTH-SORTED */}
                    {(selectedShape === "kubus" || selectedShape === "balok") && (
                      <g>
                        {boxFaces.map((f, idx) => (
                          <polygon
                            key={idx}
                            points={ptsToStr(f.pts)}
                            fill={f.fill}
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            opacity={f.name === "kanan" ? 0.9 : 1}
                          />
                        ))}
                        <circle cx={pH.x} cy={pH.y} r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {/* PRISMA SEGITIGA 3D DEPTH-SORTED */}
                    {selectedShape === "prisma" && (
                      <g>
                        {prismaFaces.map((f, idx) => (
                          <polygon
                            key={idx}
                            points={ptsToStr(f.pts)}
                            fill={f.fill}
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            opacity={f.fill === "#ef4444" ? 0.9 : 1}
                          />
                        ))}
                        <circle cx={prF3.x} cy={prF3.y} r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {/* LIMAS SEGI EMPAT 3D DEPTH-SORTED */}
                    {selectedShape === "limas" && (
                      <g>
                        {limasFaces.map((f, idx) => (
                          <polygon
                            key={idx}
                            points={ptsToStr(f.pts)}
                            fill={f.fill}
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            opacity={f.fill === "#ef4444" ? 0.9 : 1}
                          />
                        ))}
                        <circle cx={apex.x} cy={apex.y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {/* TABUNG 3D INTERAKTIF */}
                    {selectedShape === "tabung" && (
                      <g>
                        {cylDrawItems.map((item, idx) => (
                          <polygon
                            key={idx}
                            points={ptsToStr(item.pts)}
                            fill={item.fill}
                            stroke={item.type === "cap" ? "#ffffff" : "rgba(255,255,255,0.22)"}
                            strokeWidth={item.type === "cap" ? 2.2 : 1}
                            strokeLinejoin="round"
                            opacity={item.fill === "#ef4444" ? 0.88 : 1}
                          />
                        ))}
                        <line
                          x1={cylTopCenter.x}
                          y1={cylTopCenter.y}
                          x2={cylTopRing[0].x}
                          y2={cylTopRing[0].y}
                          stroke="#fef08a"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                        />
                        <circle cx={cylTopCenter.x} cy={cylTopCenter.y} r="4.5" fill="#fef08a" />
                        <circle cx={cylBotCenter.x} cy={cylBotCenter.y} r="4" fill="#ffffff" opacity="0.7" />
                      </g>
                    )}

                    {/* KERUCUT 3D INTERAKTIF */}
                    {selectedShape === "kerucut" && (
                      <g>
                        {coneDrawItems.map((item, idx) => (
                          <polygon
                            key={idx}
                            points={ptsToStr(item.pts)}
                            fill={item.fill}
                            stroke={item.type === "cap" ? "#ffffff" : "rgba(255,255,255,0.22)"}
                            strokeWidth={item.type === "cap" ? 2.2 : 1}
                            strokeLinejoin="round"
                          />
                        ))}
                        <line
                          x1={coneBotCenter.x}
                          y1={coneBotCenter.y}
                          x2={coneApex.x}
                          y2={coneApex.y}
                          stroke="#fef08a"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <line
                          x1={coneBotCenter.x}
                          y1={coneBotCenter.y}
                          x2={cylBotRing[0].x}
                          y2={cylBotRing[0].y}
                          stroke="#fef08a"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <circle cx={coneApex.x} cy={coneApex.y} r="5.5" fill="#fef08a" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {/* BOLA 3D INTERAKTIF (GRID LINTANG & BUJUR 360°) */}
                    {selectedShape === "bola" && (
                      <g>
                        <defs>
                          <radialGradient id="gradBall2" cx="38%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ff8b8b" />
                            <stop offset="65%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#991b1b" />
                          </radialGradient>
                        </defs>
                        <circle cx="190" cy="135" r={radPx} fill="url(#gradBall2)" stroke="#ffffff" strokeWidth="2.5" />
                        {sphereSegs.map((seg, idx) => (
                          <line
                            key={idx}
                            x1={seg.p1.x}
                            y1={seg.p1.y}
                            x2={seg.p2.x}
                            y2={seg.p2.y}
                            stroke={seg.isMain ? "#fef08a" : "#ffffff"}
                            strokeWidth={seg.avgZ >= 0 ? (seg.isMain ? 2.2 : 1.4) : 1}
                            opacity={seg.avgZ >= 0 ? 0.92 : 0.28}
                            strokeDasharray={seg.avgZ >= 0 ? undefined : "3 3"}
                          />
                        ))}
                        <line x1="190" y1="135" x2={sphereRadiusPt.x} y2={sphereRadiusPt.y} stroke="#fef08a" strokeWidth="2" strokeDasharray="4 2" />
                        <circle cx={sphereNorth.x} cy={sphereNorth.y} r="4.5" fill="#fef08a" stroke="#ffffff" strokeWidth="1.5" opacity={sphereNorth.z >= 0 ? 1 : 0.4} />
                      </g>
                    )}
                  </svg>
                ) : (
                  /* Tampilan Jaring-Jaring Lengkap Semua 7 Bangun */
                  <div className="flex flex-col items-center justify-center p-3 text-center animate-in zoom-in-95 duration-200">
                    <svg viewBox="0 0 280 185" className="w-64 h-44">
                      {(selectedShape === "kubus" || selectedShape === "balok") && (
                        <g>
                          {[
                            { gx: 1, gy: 0, w: 36, h: 32 },
                            { gx: 0, gy: 1, w: 32, h: selectedShape === "balok" ? 44 : 36 },
                            { gx: 1, gy: 1, w: 36, h: selectedShape === "balok" ? 44 : 36 },
                            { gx: 2, gy: 1, w: 32, h: selectedShape === "balok" ? 44 : 36 },
                            { gx: 3, gy: 1, w: 36, h: selectedShape === "balok" ? 44 : 36 },
                            { gx: 1, gy: 2, w: 36, h: 32 },
                          ].map((b, i) => (
                            <rect
                              key={i}
                              x={56 + b.gx * 38}
                              y={18 + b.gy * 46}
                              width={b.w}
                              height={b.h}
                              fill={i === 2 ? "#ef4444" : "#ffffff"}
                              stroke="#0f5e6e"
                              strokeWidth="2"
                              rx="3"
                            />
                          ))}
                        </g>
                      )}
                      {selectedShape === "prisma" && (
                        <g>
                          <rect x="65" y="55" width="48" height="75" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                          <rect x="113" y="55" width="54" height="75" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                          <rect x="167" y="55" width="48" height="75" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                          <polygon points="113,55 167,55 140,15" fill="#fef08a" stroke="#0f5e6e" strokeWidth="2" />
                          <polygon points="113,130 167,130 140,170" fill="#fef08a" stroke="#0f5e6e" strokeWidth="2" />
                        </g>
                      )}
                      {selectedShape === "limas" && (
                        <g>
                          <rect x="115" y="68" width="50" height="50" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                          <polygon points="115,68 165,68 140,18" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                          <polygon points="165,68 165,118 220,93" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                          <polygon points="115,118 165,118 140,168" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                          <polygon points="115,68 115,118 60,93" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                        </g>
                      )}
                      {selectedShape === "tabung" && (
                        <g>
                          <circle cx="140" cy="28" r="21" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                          <rect x="62" y="56" width="156" height="68" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" rx="3" />
                          <text x="140" y="94" fill="#0f5e6e" fontSize="11" fontWeight="bold" textAnchor="middle">
                            Selimut (2πr × t)
                          </text>
                          <circle cx="140" cy="153" r="21" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2" />
                        </g>
                      )}
                      {selectedShape === "kerucut" && (
                        <g>
                          <path d="M 140 22 L 72 95 A 95 95 0 0 0 208 95 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                          <text x="140" y="75" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                            Selimut Juring (πrs)
                          </text>
                          <circle cx="140" cy="143" r="27" fill="#ffffff" stroke="#0f5e6e" strokeWidth="2.5" />
                          <text x="140" y="147" fill="#0f5e6e" fontSize="10" fontWeight="bold" textAnchor="middle">
                            Alas (πr²)
                          </text>
                        </g>
                      )}
                      {selectedShape === "bola" && (
                        <g>
                          {[0, 1, 2, 3, 4].map((i) => {
                            const cx = 68 + i * 36;
                            return (
                              <path
                                key={i}
                                d={`M ${cx} 25 Q ${cx + 22} 92 ${cx} 160 Q ${cx - 22} 92 ${cx} 25 Z`}
                                fill={i % 2 === 0 ? "#ef4444" : "#ffffff"}
                                stroke="#0f5e6e"
                                strokeWidth="2"
                              />
                            );
                          })}
                        </g>
                      )}
                    </svg>
                    <span className="text-xs font-semibold text-amber-200 mt-1">
                      {selectedShape === "bola"
                        ? "Bola hanya dapat dibelah menyerupai irisan kulit jeruk (tidak memiliki jaring bidang datar)"
                        : `Pola Bentangan Jaring-Jaring ${currentCfg.name}`}
                    </span>
                  </div>
                )}
              </div>

              {/* ─── PANEL KALKULASI 2 POV (DUA SUDUT PANDANG) ─── */}
              <div className="rounded-[24px] bg-[#f8f7fc] p-4 sm:p-5 text-[#2a2830] border-2 border-white shadow-md mt-2 flex flex-col gap-4">
                
                {/* Switch Tab 2 POV */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-purple-100 rounded-2xl border border-purple-200">
                  <button
                    onClick={() => { playClick(); setPovMode("dimensi_to_hasil"); setReverseError(null); }}
                    className={`rounded-xl py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      povMode === "dimensi_to_hasil"
                        ? "bg-[#5e65e9] text-white shadow"
                        : "text-purple-900 hover:bg-white/70"
                    }`}
                  >
                    <span>📐</span>
                    <span>POV 1: Atur Ukuran → Cari V & LP</span>
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      setPovMode("hasil_to_dimensi");
                      setReverseError(null);
                      const curVal = knownTarget === "volume" ? calculatedVol : calculatedLP;
                      setReverseTargetInput(String(Math.round(curVal * 100) / 100));
                    }}
                    className={`rounded-xl py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      povMode === "hasil_to_dimensi"
                        ? "bg-[#126b7c] text-white shadow"
                        : "text-purple-900 hover:bg-white/70"
                    }`}
                  >
                    <span>🔄</span>
                    <span>POV 2: Input V / LP → Cari Ukuran</span>
                  </button>
                </div>

                {/* KONTEN POV 1: INPUT MANUAL BEBAS + SLIDER INTERAKTIF */}
                {povMode === "dimensi_to_hasil" ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Kiri: Kontrol Ukuran (Input Ketik Angka Bebas + Slider Hingga 100) */}
                    <div className="md:col-span-7 flex flex-col gap-3 md:border-r border-gray-300 md:pr-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                        <h4 className="font-bold text-sm text-[#2a2830]">
                          Atur Ukuran Dimensi (cm)
                        </h4>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Bisa Ketik Angka Bebas!
                        </span>
                      </div>

                      {/* Dimensi P (Semua bentuk punya) */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-semibold gap-2">
                          <span className="text-gray-700">{currentCfg.pLabel}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={valP}
                              onChange={(e) => handleDimChange("P", e.target.value)}
                              placeholder="0"
                              className="w-20 rounded-lg border-2 border-purple-300 bg-white px-2 py-1 text-right font-bold text-sm text-[#5e65e9] focus:outline-none focus:border-[#5e65e9]"
                            />
                            <span className="text-xs text-gray-500">cm</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(50, Math.ceil(numP))}
                          value={numP}
                          onChange={(e) => handleDimChange("P", Number(e.target.value))}
                          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-[#5e65e9]"
                        />
                      </div>

                      {/* Dimensi L (Untuk Balok, Prisma, Limas) */}
                      {currentCfg.hasL && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-semibold gap-2">
                            <span className="text-gray-700">{currentCfg.lLabel}</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={valL}
                                onChange={(e) => handleDimChange("L", e.target.value)}
                                placeholder="0"
                                className="w-20 rounded-lg border-2 border-purple-300 bg-white px-2 py-1 text-right font-bold text-sm text-[#5e65e9] focus:outline-none focus:border-[#5e65e9]"
                              />
                              <span className="text-xs text-gray-500">cm</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={Math.max(50, Math.ceil(numL))}
                            value={numL}
                            onChange={(e) => handleDimChange("L", Number(e.target.value))}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-[#5e65e9]"
                          />
                        </div>
                      )}

                      {/* Dimensi T (Untuk Balok, Prisma, Limas, Tabung, Kerucut) */}
                      {currentCfg.hasT && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-semibold gap-2">
                            <span className="text-gray-700">{currentCfg.tLabel}</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={valT}
                                onChange={(e) => handleDimChange("T", e.target.value)}
                                placeholder="0"
                                className="w-20 rounded-lg border-2 border-purple-300 bg-white px-2 py-1 text-right font-bold text-sm text-[#5e65e9] focus:outline-none focus:border-[#5e65e9]"
                              />
                              <span className="text-xs text-gray-500">cm</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={Math.max(50, Math.ceil(numT))}
                            value={numT}
                            onChange={(e) => handleDimChange("T", Number(e.target.value))}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-[#5e65e9]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Kanan: Hasil Volume & Luas Permukaan */}
                    <div className="md:col-span-5 flex flex-col justify-center gap-2.5">
                      <h4 className="font-bold text-sm text-[#2a2830] border-b border-gray-200 pb-1">
                        Hasil Perhitungan
                      </h4>

                      <div>
                        <span className="text-gray-600 block text-xs font-semibold mb-0.5">Volume:</span>
                        <div className="rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 font-bold text-lg text-[#16a34a] shadow-xs">
                          {fmtNum(calculatedVol)} cm³
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600 block text-xs font-semibold mb-0.5">Luas Permukaan:</span>
                        <div className="rounded-xl border-2 border-sky-200 bg-white px-3 py-2 font-bold text-lg text-[#0284c7] shadow-xs">
                          {fmtNum(calculatedLP)} cm²
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* KONTEN POV 2: SUDAH TAHU VOLUME / LP -> CARI UKURANNYA */
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">Nilai yang diketahui:</span>
                        <button
                          onClick={() => {
                            playClick();
                            setKnownTarget("volume");
                            setReverseTargetInput(String(Math.round(calculatedVol * 100) / 100));
                            setReverseError(null);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            knownTarget === "volume"
                              ? "bg-[#16a34a] text-white shadow"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Volume (cm³)
                        </button>
                        <button
                          onClick={() => {
                            playClick();
                            setKnownTarget("luas_permukaan");
                            setReverseTargetInput(String(Math.round(calculatedLP * 100) / 100));
                            setReverseError(null);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            knownTarget === "luas_permukaan"
                              ? "bg-[#0284c7] text-white shadow"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Luas Permukaan (cm²)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Input Nilai Volume atau Luas Permukaan */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Masukkan Nilai {knownTarget === "volume" ? "Volume (cm³)" : "Luas Permukaan (cm²)"}:
                        </label>
                        <input
                          type="number"
                          min={0.1}
                          step="any"
                          value={reverseTargetInput}
                          onChange={(e) => setReverseTargetInput(e.target.value)}
                          placeholder={knownTarget === "volume" ? "Misal: 1000" : "Misal: 600"}
                          className="w-full rounded-xl border-2 border-[#126b7c] bg-white px-3 py-2 text-base font-bold text-[#126b7c] focus:outline-none"
                        />
                      </div>

                      {/* Input Pendamping jika bangun butuh lebih dari 1 variabel */}
                      {selectedShape !== "kubus" && selectedShape !== "bola" && (
                        <div className="sm:col-span-4 flex gap-2">
                          {(selectedShape === "tabung" || selectedShape === "kerucut") && knownTarget === "volume" ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-gray-700">
                                  {tabungSolveFor === "t" ? "Jika r (cm):" : "Jika t (cm):"}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setTabungSolveFor((p) => (p === "t" ? "r" : "t"))}
                                  className="text-[11px] font-bold text-[#5e65e9] underline cursor-pointer"
                                >
                                  Cari {tabungSolveFor === "t" ? "r" : "t"}?
                                </button>
                              </div>
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={tabungSolveFor === "t" ? valP : valT}
                                onChange={(e) =>
                                  handleDimChange(tabungSolveFor === "t" ? "P" : "T", e.target.value)
                                }
                                placeholder="0"
                                className="w-full rounded-xl border-2 border-purple-300 bg-white px-3 py-2 text-sm font-bold text-[#2a2830]"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <label className="block text-[11px] font-bold text-gray-700 mb-1 truncate">
                                  {currentCfg.pLabel}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={valP}
                                  onChange={(e) => handleDimChange("P", e.target.value)}
                                  placeholder="0"
                                  className="w-full rounded-xl border-2 border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-[#2a2830]"
                                />
                              </div>
                              {currentCfg.hasL && (
                                <div className="flex-1">
                                  <label className="block text-[11px] font-bold text-gray-700 mb-1 truncate">
                                    {currentCfg.lLabel}
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={valL}
                                    onChange={(e) => handleDimChange("L", e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-xl border-2 border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-[#2a2830]"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className={`${selectedShape === "kubus" || selectedShape === "bola" ? "sm:col-span-7" : "sm:col-span-3"}`}>
                        <button
                          onClick={handleSolveReverse}
                          className="w-full rounded-xl border-2 border-white bg-[#126b7c] hover:bg-[#0e5664] text-white font-bold py-2.5 px-4 shadow cursor-pointer active:translate-y-0.5 transition-all text-sm"
                        >
                          Hitung & Cek 3D ✓
                        </button>
                      </div>
                    </div>

                    {reverseError && (
                      <div className="rounded-xl bg-rose-100 border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-800">
                        ⚠️ {reverseError}
                      </div>
                    )}
                  </div>
                )}

                {/* PROSES PERHITUNGAN MANUAL (LANGKAH DEMI LANGKAH) */}
                <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                    <span>📝</span>
                    <span>Proses Hitung Manual (Langkah demi Langkah):</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {manualSteps.map((step, i) => (
                      <div key={i} className="text-xs sm:text-sm font-medium text-gray-800 flex items-start gap-2">
                        <span className="text-amber-600 font-bold shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* KOLOM KANAN (4 Kolom): Materi Bangun Ruang & Eksplorasi Interaktif */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* CARD 1: Pilihan Bentuk Bangun Ruang (7 Bentuk Lengkap) */}
              <div className="flex flex-col rounded-[32px] border-[6px] border-white bg-gradient-to-b from-[#1b8da3] to-[#126b7c] p-5 shadow-[0px_6px_0px_0px_#aaafaf] text-white">
                <h3 className="game-font text-xl sm:text-2xl font-semibold mb-3 text-center">
                  Materi Bangun Ruang
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                  {(["kubus", "balok", "prisma", "limas", "tabung", "kerucut", "bola"] as ShapeType[]).map((shape) => {
                    const isSelected = selectedShape === shape;
                    return (
                      <button
                        key={shape}
                        onClick={() => handleSelectShape(shape)}
                        className={`rounded-[16px] border-[3px] border-white py-2 px-2 text-center game-font text-sm font-semibold capitalize transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#126b7c] shadow-md scale-103"
                            : "bg-white/80 text-[#2a2830] hover:bg-white"
                        }`}
                      >
                        {SHAPES_CONFIG[shape].name}
                      </button>
                    );
                  })}
                </div>

                {/* Ringkasan Elemen Bangun */}
                <div className="mt-4 pt-3 border-t border-white/30 text-xs font-medium flex flex-col gap-1.5 text-white/95">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-400 shrink-0"></span>
                    <span>{currentCfg.sisiDesc}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-300 shrink-0"></span>
                    <span>{currentCfg.rusukDesc}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-300 shrink-0"></span>
                    <span>{currentCfg.titikDesc}</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Eksplorasi Interaktif */}
              <div className="flex flex-col rounded-[32px] border-[6px] border-white bg-gradient-to-b from-[#1b8da3] to-[#126b7c] p-5 shadow-[0px_6px_0px_0px_#aaafaf] text-white">
                <h3 className="game-font text-xl sm:text-2xl font-semibold mb-3 text-center">
                  Eksplorasi Interaktif
                </h3>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => { playClick(); setShowJaring(true); }}
                    className={`rounded-[18px] border-[4px] border-white py-2.5 game-font text-base font-semibold shadow transition-all cursor-pointer ${
                      showJaring
                        ? "bg-amber-400 text-amber-950 scale-102"
                        : "bg-white text-[#2a2830] hover:brightness-105"
                    }`}
                  >
                    Buka Jaring-Jaring
                  </button>

                  <button
                    onClick={() => { playClick(); setShowJaring(false); }}
                    className={`rounded-[18px] border-[4px] border-white py-2.5 game-font text-base font-semibold shadow transition-all cursor-pointer ${
                      !showJaring
                        ? "bg-white text-[#2a2830] hover:brightness-105"
                        : "bg-white/80 text-gray-700"
                    }`}
                  >
                    Tutup Jaring-Jaring
                  </button>

                  <button
                    onClick={handleReset}
                    className="rounded-[18px] border-[4px] border-white bg-white py-2.5 game-font text-base font-semibold text-[#2a2830] shadow transition-all hover:brightness-105 active:scale-98 cursor-pointer"
                  >
                    Reset Objek
                  </button>
                </div>

                {/* Rumus Cepat Bangun Terpilih */}
                <div className="mt-4 pt-3 border-t border-white/30 flex flex-col gap-2 text-xs">
                  <div className="rounded-xl bg-black/25 p-2.5">
                    <span className="text-amber-200 font-bold block">Rumus Volume:</span>
                    <span className="font-semibold text-white">{currentMateri.rumusVol}</span>
                  </div>
                  <div className="rounded-xl bg-black/25 p-2.5">
                    <span className="text-emerald-200 font-bold block">Rumus Luas Permukaan:</span>
                    <span className="font-semibold text-white">{currentMateri.rumusLP}</span>
                  </div>
                  <button
                    onClick={() => { playClick(); setActiveViewTab("materi"); }}
                    className="mt-1 rounded-xl bg-amber-300 text-amber-950 font-bold py-2 px-3 hover:brightness-105 cursor-pointer transition-all text-center"
                  >
                    📖 Baca Materi &amp; Contoh Soal &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
          )}

          {/* TAB 2: MATERI KONSEP, RUMUS & CONTOH SOAL */}
          {activeViewTab === "materi" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              {/* Pilihan Bentuk Bangun */}
              <div className="flex flex-wrap gap-2 justify-center bg-white/75 p-3 rounded-2xl border-2 border-white shadow-xs">
                {(["kubus", "balok", "prisma", "limas", "tabung", "kerucut", "bola"] as ShapeType[]).map((shape) => {
                  const isSel = selectedShape === shape;
                  return (
                    <button
                      key={shape}
                      onClick={() => {
                        handleSelectShape(shape);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 ${
                        isSel
                          ? "bg-[#5e65e9] text-white border-[#5e65e9] shadow"
                          : "bg-white text-[#2a2830] border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      {SHAPES_CONFIG[shape].name}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kiri: Pengertian, Sifat, Rumus */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="rounded-[28px] border-4 border-white bg-white p-5 sm:p-6 shadow">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-semibold">
                        {currentCfg.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          currentCfg.category === "datar"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {currentCfg.category === "datar" ? "Bangun Ruang Sisi Datar" : "Bangun Ruang Sisi Lengkung"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
                      {currentMateri.definisi}
                    </p>

                    <div className="rounded-2xl bg-purple-50 border border-purple-200 p-4 mb-4">
                      <h4 className="font-bold text-sm text-[#422376] mb-2">✨ Ciri-Ciri &amp; Sifat Utama:</h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-gray-800">
                        {currentMateri.sifatUtama.map((sifat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#5e65e9] font-bold">•</span>
                            <span>{sifat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-3.5">
                        <span className="text-xs font-bold text-emerald-800 block mb-1">📦 Rumus Volume:</span>
                        <span className="game-font text-base sm:text-lg font-semibold text-emerald-950">
                          {currentMateri.rumusVol}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3.5">
                        <span className="text-xs font-bold text-sky-800 block mb-1">🎨 Rumus Luas Permukaan:</span>
                        <span className="game-font text-base sm:text-lg font-semibold text-sky-950">
                          {currentMateri.rumusLP}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
                      <span className="text-xs font-bold text-amber-900 block mb-0.5">
                        ⭐ {currentMateri.rumusKhususLabel}:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-amber-950">
                        {currentMateri.rumusKhusus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kanan: Contoh Benda Nyata & Contoh Soal Interaktif */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="rounded-[28px] border-4 border-white bg-[#f8f298] p-5 shadow">
                    <h4 className="font-bold text-sm text-[#422376] mb-1">🏠 Contoh Benda di Sekitar:</h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#2a2830]">
                      {currentMateri.bendaNyata}
                    </p>
                  </div>

                  <div className="rounded-[28px] border-4 border-white bg-white p-5 shadow flex flex-col gap-3 flex-1">
                    {/* Header Tantangan */}
                    <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#e05f1e] text-white px-3 py-1 text-xs font-bold">
                          🎯 Tantangan Hitung {currentCfg.name}
                        </span>
                        <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[11px] font-bold">
                          Soal {curChallengeIdx + 1} dari {currentChallenges.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNextChallenge}
                          className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs font-bold shadow-sm transition-all cursor-pointer"
                          title="Generate soal baru dengan angka berbeda"
                        >
                          <span>🎲</span>
                          <span>Buat Soal Baru</span>
                        </button>
                        <button
                          onClick={() => { playClick(); setShowExampleSteps((prev) => !prev); }}
                          className="text-xs font-bold text-[#5e65e9] hover:underline cursor-pointer"
                        >
                          {showExampleSteps ? "Tutup Pembahasan" : "Buka Pembahasan"}
                        </button>
                      </div>
                    </div>

                    {/* Soal Cerita */}
                    <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Pertanyaan Soal #{curChallengeIdx + 1}:
                      </span>
                      <p className="text-sm font-bold text-[#2a2830] leading-relaxed">
                        {currentChallenge.story}
                      </p>
                    </div>

                    {/* Mini Interactive Challenge Input (Bisa Jawab Keduanya: Volume + Luas Permukaan!) */}
                    <div className="rounded-2xl bg-purple-50 border border-purple-200 p-3.5 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Input Jawaban A */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-[#422376]">
                            1. {currentChallenge.fieldA.label}:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={challengeInputA}
                              onChange={(e) => {
                                setChallengeInputA(e.target.value);
                                setChallengeStatus("idle");
                              }}
                              placeholder={currentChallenge.fieldA.placeholder || "Ketik jawaban..."}
                              className="w-full rounded-xl border-2 border-purple-300 bg-white px-3 py-1.5 text-sm font-bold text-[#2a2830] focus:outline-none focus:border-purple-600"
                            />
                            <span className="text-xs font-bold text-gray-600 shrink-0">{currentChallenge.fieldA.unit}</span>
                          </div>
                        </div>

                        {/* Input Jawaban B (Jika ada, seperti Luas Permukaan) */}
                        {currentChallenge.fieldB && (
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#422376]">
                              2. {currentChallenge.fieldB.label}:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={challengeInputB}
                                onChange={(e) => {
                                  setChallengeInputB(e.target.value);
                                  setChallengeStatus("idle");
                                }}
                                placeholder={currentChallenge.fieldB.placeholder || "Ketik jawaban..."}
                                className="w-full rounded-xl border-2 border-purple-300 bg-white px-3 py-1.5 text-sm font-bold text-[#2a2830] focus:outline-none focus:border-purple-600"
                              />
                              <span className="text-xs font-bold text-gray-600 shrink-0">{currentChallenge.fieldB.unit}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-200/60">
                        <div className="flex-1">
                          {challengeStatus === "both_right" && (
                            <span className="text-xs font-bold text-emerald-700 animate-in fade-in">
                              🎉 Luar biasa! Semua jawaban kamu benar ({currentChallenge.fieldA.answer} {currentChallenge.fieldA.unit}
                              {currentChallenge.fieldB ? ` & ${currentChallenge.fieldB.answer} ${currentChallenge.fieldB.unit}` : ""})!
                            </span>
                          )}
                          {challengeStatus === "a_right" && (
                            <span className="text-xs font-bold text-amber-700 animate-in fade-in">
                              👍 Jawaban {currentChallenge.fieldA.label} sudah benar! Namun jawaban kedua belum tepat, coba cek lagi!
                            </span>
                          )}
                          {challengeStatus === "b_right" && (
                            <span className="text-xs font-bold text-amber-700 animate-in fade-in">
                              👍 Jawaban {currentChallenge.fieldB?.label} sudah benar! Namun jawaban pertama belum tepat, coba cek lagi!
                            </span>
                          )}
                          {challengeStatus === "wrong" && (
                            <span className="text-xs font-bold text-rose-700 animate-in fade-in">
                              ✗ Jawaban belum tepat, silakan hitung kembali atau klik &ldquo;Buka Pembahasan&rdquo; di atas!
                            </span>
                          )}
                          {challengeStatus === "idle" && (
                            <span className="text-[11px] text-gray-500 font-medium">
                              Ketik jawaban lalu klik Cek Jawaban!
                            </span>
                          )}
                        </div>

                        <button
                          onClick={handleCheckChallenge}
                          className="rounded-xl bg-[#5e65e9] hover:bg-[#4b52d4] text-white px-4 py-1.5 text-xs font-bold cursor-pointer transition-all shrink-0 shadow-sm"
                        >
                          Cek Jawaban!
                        </button>
                      </div>
                    </div>

                    {/* Langkah Pembahasan Dinamis Sesuai Soal Aktif */}
                    {showExampleSteps && (
                      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5 flex flex-col gap-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                          <span className="text-xs font-bold text-emerald-900">
                            📖 Langkah Pembahasan Soal #{curChallengeIdx + 1}:
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700">Lengkap</span>
                        </div>
                        {currentChallenge.pembahasan.map((step, i) => (
                          <div key={i} className="text-xs sm:text-sm font-medium text-gray-800 flex items-start gap-2">
                            <span className="font-bold text-emerald-700 shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleLoadChallengeToLab}
                      className="mt-auto rounded-2xl border-2 border-white bg-[#126b7c] hover:bg-[#0e5664] text-white font-bold py-2.5 px-4 shadow cursor-pointer text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>🔬</span>
                      <span>Muat Angka Soal #{curChallengeIdx + 1} Ini ke Lab 3D &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERBANDINGAN 7 BANGUN RUANG + FILTER + KUIS CEPAT */}
          {activeViewTab === "perbandingan" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              {/* Filter & Kuis Cepat Interaktif */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                <div className="md:col-span-5 rounded-[24px] border-4 border-white bg-[#f8f298] p-4 shadow flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#422376]">⚡ Tebak Cepat Rumus!</span>
                    <p className="text-xs sm:text-sm font-bold text-[#2a2830] mt-1">
                      Jika sebuah kerucut dan tabung memiliki jari-jari (r) serta tinggi (t) yang persis sama, maka Volume Kerucut = ... × Volume Tabung?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "⅓ kali", ok: true },
                      { label: "½ kali", ok: false },
                      { label: "⅔ kali", ok: false },
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (opt.ok) playCorrect(); else playClick();
                          setQuickQuizPick(idx);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-white cursor-pointer transition-all ${
                          quickQuizPick !== null
                            ? opt.ok
                              ? "bg-emerald-400 text-emerald-950"
                              : quickQuizPick === idx
                              ? "bg-rose-200 border-rose-400 text-rose-900"
                              : "bg-rose-50/90 border-rose-200 text-rose-800/80"
                            : "bg-white text-[#2a2830] hover:bg-purple-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => { playClick(); setCatFilter(catFilter === "datar" ? "all" : "datar"); }}
                    className={`text-left rounded-[24px] border-4 border-white p-4 shadow cursor-pointer transition-all ${
                      catFilter === "datar" ? "bg-sky-200 ring-2 ring-sky-600 scale-102" : "bg-sky-50 hover:bg-sky-100"
                    }`}
                  >
                    <h4 className="game-font text-base font-semibold text-sky-900 mb-1">
                      🧊 Sisi Datar (Klik untuk Filter)
                    </h4>
                    <p className="text-xs font-medium text-gray-700">
                      Kubus, Balok, Prisma, Limas. Sisi berupa bidang datar poligon.
                    </p>
                  </button>
                  <button
                    onClick={() => { playClick(); setCatFilter(catFilter === "lengkung" ? "all" : "lengkung"); }}
                    className={`text-left rounded-[24px] border-4 border-white p-4 shadow cursor-pointer transition-all ${
                      catFilter === "lengkung" ? "bg-rose-200 ring-2 ring-rose-600 scale-102" : "bg-rose-50 hover:bg-rose-100"
                    }`}
                  >
                    <h4 className="game-font text-base font-semibold text-rose-900 mb-1">
                      🎈 Sisi Lengkung (Klik untuk Filter)
                    </h4>
                    <p className="text-xs font-medium text-gray-700">
                      Tabung, Kerucut, Bola. Menggunakan π (22/7 atau 3,14).
                    </p>
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border-4 border-white bg-white p-4 sm:p-5 shadow overflow-x-auto">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="font-bold text-xs sm:text-sm text-[#422376]">
                    Tabel Perbandingan Bangun Ruang
                  </span>
                  <div className="flex gap-1.5">
                    {(["all", "datar", "lengkung"] as const).map((cf) => (
                      <button
                        key={cf}
                        onClick={() => { playClick(); setCatFilter(cf); }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                          catFilter === cf ? "bg-[#5e65e9] text-white" : "bg-purple-100 text-purple-900"
                        }`}
                      >
                        {cf === "all" ? "Semua (7)" : cf === "datar" ? "Sisi Datar (4)" : "Sisi Lengkung (3)"}
                      </button>
                    ))}
                  </div>
                </div>
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-purple-200 text-[#422376]">
                      <th className="py-2.5 px-3 font-bold">Bangun Ruang</th>
                      <th className="py-2.5 px-3 font-bold">Kategori</th>
                      <th className="py-2.5 px-3 font-bold">Rumus Volume</th>
                      <th className="py-2.5 px-3 font-bold">Rumus Luas Permukaan</th>
                      <th className="py-2.5 px-3 font-bold text-center">Simulasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["kubus", "balok", "prisma", "limas", "tabung", "kerucut", "bola"] as ShapeType[])
                      .filter((sh) => catFilter === "all" || SHAPES_CONFIG[sh].category === catFilter)
                      .map((sh) => (
                      <tr key={sh} className="border-b border-gray-100 hover:bg-purple-50/60">
                        <td className="py-2.5 px-3 font-bold text-[#2a2830]">{SHAPES_CONFIG[sh].name}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${SHAPES_CONFIG[sh].category === "datar" ? "bg-sky-100 text-sky-800" : "bg-rose-100 text-rose-800"}`}>
                            {SHAPES_CONFIG[sh].category === "datar" ? "Sisi Datar" : "Sisi Lengkung"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-800">{SHAPE_MATERI[sh].rumusVol}</td>
                        <td className="py-2.5 px-3 font-semibold text-sky-800">{SHAPE_MATERI[sh].rumusLP}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              handleSelectShape(sh);
                              setActiveViewTab("lab3d");
                            }}
                            className="rounded-lg bg-[#126b7c] text-white px-2.5 py-1 text-xs font-bold hover:brightness-110 cursor-pointer"
                          >
                            Buka 3D
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Back & Navigation (Tanpa link salah ke SPLDV) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-200">
            <Link
              href="/materi"
              className="flex items-center gap-2 rounded-2xl border-4 border-white bg-[#5e65e9] px-6 py-2.5 text-white game-font text-base font-semibold shadow hover:scale-103"
            >
              &larr; Pilih Materi Lain
            </Link>

            <Link
              href={dashboardUrl}
              className="flex items-center gap-2 rounded-2xl border-4 border-white bg-[#1cd8a4] px-6 py-2.5 text-[#144837] game-font text-base font-semibold shadow hover:scale-103"
            >
              🏠 Kembali ke Dashboard
            </Link>
          </div>

        </div>
      </div>
    </GameShell>
  );
}
