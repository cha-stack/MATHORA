"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import GameShell from "@/components/GameShell";
import CelebrationEffects from "@/components/CelebrationEffects";
import { useSound } from "@/components/SoundContext";
import { getCurrentUser } from "@/lib/auth";

// ─── TIPE & DATA MATERI (FIGMA 85:131) ────────────────────────────────────────

interface MateriOption {
  id: string;
  name: string;
  icon: string;
  symbol?: string;
  bgColor?: string;
}

const MATERI_LIST: MateriOption[] = [
  { id: "CAMPURAN",           name: "Semua Materi (Acak)", icon: "🎲", bgColor: "bg-[#8b5cf6]" },
  { id: "SPLDV",              name: "SPLDV",             icon: "xy",  bgColor: "bg-[#34b2cb]" },
  { id: "BANGUN_RUANG",       name: "Bangun Ruang",      icon: "🧊",  bgColor: "bg-[#34b2cb]" },
  { id: "BANGUN_DATAR",       name: "Bangun Datar",      icon: "📐",  bgColor: "bg-[#34b2cb]" },
  { id: "BENTUK_ALJABAR",     name: "Bentuk Aljabar",    icon: "2a",  bgColor: "bg-[#34b2cb]" },
  { id: "PERSAMAAN_KUADRAT",  name: "Persamaan Kuadrat", icon: "x²",  bgColor: "bg-[#34b2cb]" },
  { id: "PENJUMLAHAN",        name: "Penjumlahan",       icon: "+",   bgColor: "bg-[#4fd74f]" },
  { id: "PENGURANGAN",        name: "Pengurangan",       icon: "-",   bgColor: "bg-[#34b2cb]" },
  { id: "PERKALIAN",          name: "Perkalian",         icon: "×",   bgColor: "bg-[#34b2cb]" },
  { id: "PEMBAGIAN",          name: "Pembagian",         icon: "÷",   bgColor: "bg-[#34b2cb]" },
  { id: "PANGKAT",            name: "Pangkat & Akar",    icon: "xⁿ",  bgColor: "bg-[#34b2cb]" },
  { id: "PERSENTASE",         name: "Persentase",        icon: "%",   bgColor: "bg-[#34b2cb]" },
  { id: "PECAHAN",            name: "Pecahan",           icon: "½",   bgColor: "bg-[#34b2cb]" },
];

let _qSeq = 1000;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MathQuestion {
  id: string;
  categoryTag: string;
  question: string;
  equationDisplay?: string[];
  answer: number;
  explanation: string;
}

const INITIAL_QUESTION: MathQuestion = {
  id: "init",
  categoryTag: "SPLDV",
  question: "",
  answer: 0,
  explanation: "",
};

// Generator soal dengan variasi model soal yang kaya & dinamis
function makeQuestion(materi: string, diff: "easy" | "medium" | "hard"): MathQuestion {
  _qSeq++;

  // Jika opsi "CAMPURAN", pilih secara acak dari semua topik
  const allTopics = [
    "SPLDV", "BANGUN_RUANG", "BANGUN_DATAR", "BENTUK_ALJABAR",
    "PERSAMAAN_KUADRAT", "PENJUMLAHAN", "PENGURANGAN", "PERKALIAN",
    "PEMBAGIAN", "PANGKAT", "PERSENTASE", "PECAHAN",
  ];
  const effectiveMateri = materi === "CAMPURAN" ? pick(allTopics) : materi;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SPLDV (5 VARIASI: ELIMINASI, SUBSTITUSI, SOAL CERITA PARKIR, BELANJA, UMUR)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "SPLDV") {
    const variant = randInt(0, 4);

    if (variant === 0) {
      // Variasi 1: Eliminasi Standar dengan berbagai target yang ditanya
      const x0 = randInt(1, diff === "easy" ? 5 : diff === "hard" ? 9 : 6);
      const y0 = randInt(1, diff === "easy" ? 5 : diff === "hard" ? 9 : 6);
      const a = randInt(1, 3);
      const b = randInt(1, 3);
      let c = randInt(1, 4);
      let d = randInt(1, 3);
      while (a * d === b * c) { c = randInt(1, 4); d = randInt(1, 3); }
      const C1 = a * x0 + b * y0;
      const C2 = c * x0 + d * y0;

      const target = pick(["x", "y", "x+y", "x-y", "2x+y"]);
      let ans = x0;
      let targetLabel = "nilai x";
      if (target === "y") { ans = y0; targetLabel = "nilai y"; }
      else if (target === "x+y") { ans = x0 + y0; targetLabel = "nilai (x + y)"; }
      else if (target === "x-y") { ans = x0 - y0; targetLabel = "nilai (x - y)"; }
      else if (target === "2x+y") { ans = 2 * x0 + y0; targetLabel = "nilai (2x + y)"; }

      return {
        id: `spldv_${_qSeq}`,
        categoryTag: "SPLDV Eliminasi",
        question: `Diketahui sistem persamaan berikut:\nBerapakah ${targetLabel} ?`,
        equationDisplay: [`① ${a}x + ${b}y = ${C1}`, `② ${c}x + ${d}y = ${C2}`],
        answer: ans,
        explanation: `Diperoleh x = ${x0} dan y = ${y0}. Maka ${targetLabel} = ${ans}.`,
      };
    } else if (variant === 1) {
      // Variasi 2: Substitusi Cepat
      const x = randInt(2, 6);
      const k = randInt(2, 4); // y = k*x
      const y = k * x;
      const a = randInt(2, 4);
      const C = a * x + y; // a*x + k*x = (a+k)*x

      return {
        id: `spldv_sub_${_qSeq}`,
        categoryTag: "SPLDV Substitusi",
        question: `Diketahui:\nBerapakah nilai x ?`,
        equationDisplay: [`y = ${k}x`, `${a}x + y = ${C}`],
        answer: x,
        explanation: `Substitusi y = ${k}x ke persamaan kedua: ${a}x + ${k}x = ${C} → ${a + k}x = ${C} → x = ${x}.`,
      };
    } else if (variant === 2) {
      // Variasi 3: Soal Cerita Parkir Kendaraan (Klasik SMP)
      const cars = randInt(3, diff === "easy" ? 6 : 10);
      const bikes = randInt(4, diff === "easy" ? 8 : 15);
      const totalVehicles = cars + bikes;
      const totalWheels = cars * 4 + bikes * 2;
      const askCars = Math.random() > 0.5;

      return {
        id: `spldv_parkir_${_qSeq}`,
        categoryTag: "Soal Cerita SPLDV",
        question: `Di tempat parkir terdapat ${totalVehicles} kendaraan (motor dan mobil).\nTotal seluruh roda adalah ${totalWheels} buah.\nBerapakah jumlah ${askCars ? "MOBIL" : "SEPEDA MOTOR"} di parkiran tersebut ?`,
        answer: askCars ? cars : bikes,
        explanation: `Misal mobil = c, motor = m. c + m = ${totalVehicles} dan 4c + 2m = ${totalWheels}. Maka mobil = ${cars}, motor = ${bikes}.`,
      };
    } else if (variant === 3) {
      // Variasi 4: Soal Cerita Belanja Alat Tulis
      const pBuku = randInt(2, 5) * 1000;
      const pPensil = randInt(1, 3) * 1000;
      const bCount = randInt(2, 3);
      const pCount = randInt(2, 4);
      const total = bCount * pBuku + pCount * pPensil;

      return {
        id: `spldv_belanja_${_qSeq}`,
        categoryTag: "Soal Cerita Belanja",
        question: `Harga ${bCount} buku tulis dan ${pCount} pensil adalah Rp ${total.toLocaleString("id-ID")}.\nJika harga 1 buku tulis Rp ${pBuku.toLocaleString("id-ID")},\nberapakah harga 1 PENSIL (Rupiah) ?`,
        answer: pPensil,
        explanation: `Harga ${bCount} buku = Rp ${(bCount * pBuku).toLocaleString("id-ID")}. Sisa untuk ${pCount} pensil = Rp ${(pCount * pPensil).toLocaleString("id-ID")}. Maka 1 pensil = Rp ${pPensil.toLocaleString("id-ID")}.`,
      };
    } else {
      // Variasi 5: Soal Cerita Selisih Usia
      const budiAge = randInt(8, 14);
      const k = randInt(2, 4);
      const ayahAge = k * budiAge;
      const diffAge = ayahAge - budiAge;

      return {
        id: `spldv_usia_${_qSeq}`,
        categoryTag: "Soal Cerita Usia",
        question: `Umur Ayah saat ini ${k} kali umur Budi.\nJika selisih umur mereka adalah ${diffAge} tahun,\nberapakah umur BUDI sekarang (tahun) ?`,
        answer: budiAge,
        explanation: `Ayah = ${k}B. Ayah - Budi = ${diffAge} → (${k} - 1)B = ${diffAge} → B = ${budiAge} tahun.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BANGUN RUANG (6 VARIASI: VOLUME, MENCARI RUSUK, LUAS PERMUKAAN, TABUNG, KERUCUT, SIFAT)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "BANGUN_RUANG") {
    const variant = randInt(0, 5);

    if (variant === 0) {
      // Variasi 1: Volume Balok
      const p = randInt(4, 8);
      const l = randInt(3, 5);
      const t = randInt(2, 4);
      const ans = p * l * t;
      return {
        id: `bg_balok_${_qSeq}`,
        categoryTag: "Volume Balok",
        question: `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm.\nBerapakah volume balok tersebut (cm³) ?`,
        answer: ans,
        explanation: `Volume balok = p × l × t = ${p} × ${l} × ${t} = ${ans} cm³.`,
      };
    } else if (variant === 1) {
      // Variasi 2: Mencari Rusuk dari Volume Kubus
      const s = pick([3, 4, 5, 6, 7, 8, 10]);
      const vol = s * s * s;
      return {
        id: `bg_rusuk_${_qSeq}`,
        categoryTag: "Kubus & Akar Pangkat 3",
        question: `Sebuah wadah kubus memiliki volume ${vol} cm³.\nBerapakah panjang rusuk kubus tersebut (cm) ?`,
        answer: s,
        explanation: `Panjang rusuk = ∛${vol} = ${s} cm.`,
      };
    } else if (variant === 2) {
      // Variasi 3: Luas Permukaan Kubus
      const s = randInt(3, diff === "easy" ? 6 : 9);
      const ans = 6 * s * s;
      return {
        id: `bg_luas_k_${_qSeq}`,
        categoryTag: "Luas Permukaan Kubus",
        question: `Sebuah kubus memiliki panjang rusuk s = ${s} cm.\nBerapakah luas seluruh permukaannya (cm²) ?`,
        answer: ans,
        explanation: `Luas permukaan = 6 × s² = 6 × ${s * s} = ${ans} cm².`,
      };
    } else if (variant === 3) {
      // Variasi 4: Volume & Luas Selimut Tabung
      const isVolume = Math.random() > 0.5;
      const t = randInt(3, diff === "easy" ? 6 : 10);
      if (isVolume) {
        const ans = 154 * t;
        return {
          id: `bg_tabung_v_${_qSeq}`,
          categoryTag: "Volume Tabung",
          question: `Sebuah tabung memiliki jari-jari r = 7 cm dan tinggi t = ${t} cm (π = 22/7).\nBerapakah volumenya (cm³) ?`,
          answer: ans,
          explanation: `Volume = π × r² × t = (22/7) × 49 × ${t} = ${ans} cm³.`,
        };
      } else {
        const ans = 44 * t;
        return {
          id: `bg_tabung_ls_${_qSeq}`,
          categoryTag: "Luas Selimut Tabung",
          question: `Berapakah luas selimut tabung dengan jari-jari r = 7 cm dan tinggi t = ${t} cm (π = 22/7) dalam cm² ?`,
          answer: ans,
          explanation: `Luas selimut = 2 × π × r × t = 2 × (22/7) × 7 × ${t} = ${ans} cm².`,
        };
      }
    } else if (variant === 4) {
      // Variasi 5: Volume Kerucut
      const k = randInt(1, diff === "easy" ? 3 : 5);
      const t = 3 * k;
      const ans = 154 * k;
      return {
        id: `bg_kerucut_${_qSeq}`,
        categoryTag: "Volume Kerucut",
        question: `Sebuah kerucut memiliki jari-jari r = 7 cm dan tinggi t = ${t} cm (π = 22/7).\nBerapakah volume kerucut tersebut (cm³) ?`,
        answer: ans,
        explanation: `Volume = 1/3 × π × r² × t = 1/3 × (22/7) × 49 × ${t} = ${ans} cm³.`,
      };
    } else {
      // Variasi 6: Karakteristik Bangun Ruang
      const traits = [
        { q: "Berapakah banyak rusuk pada sebuah balok atau kubus ?", a: 12 },
        { q: "Berapakah banyak titik sudut pada sebuah kubus ?", a: 8 },
        { q: "Berapakah banyak sisi pada sebuah limas segi empat ?", a: 5 },
        { q: "Berapakah banyak rusuk pada sebuah prisma segitiga ?", a: 9 },
      ];
      const item = pick(traits);
      return {
        id: `bg_trait_${_qSeq}`,
        categoryTag: "Sifat Bangun Ruang",
        question: item.q,
        answer: item.a,
        explanation: `Karakteristik bangun ruang: jawaban yang tepat adalah ${item.a}.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BANGUN DATAR (PYTHAGORAS, LINGKARAN, SEGITIGA, PERSEGI PANJANG, BELAH KETUPAT)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "BANGUN_DATAR") {
    const variant = randInt(0, 4);

    if (variant === 0) {
      // Variasi 1: Teorema Pythagoras (Triple Pythagoras Siku-Siku)
      const triples = [
        [3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15],
      ];
      const [a, b, c] = pick(triples);
      const askHypotenuse = Math.random() > 0.4;

      if (askHypotenuse) {
        return {
          id: `bd_pyth_${_qSeq}`,
          categoryTag: "Teorema Pythagoras",
          question: `Sebuah segitiga siku-siku memiliki alas a = ${a} cm dan tinggi b = ${b} cm.\nBerapakah panjang sisi miringnya (hipotenusa) dalam cm ?`,
          answer: c,
          explanation: `c² = a² + b² = ${a * a} + ${b * b} = ${c * c} → c = ${c} cm.`,
        };
      } else {
        return {
          id: `bd_pyth_base_${_qSeq}`,
          categoryTag: "Teorema Pythagoras",
          question: `Segitiga siku-siku memiliki sisi miring c = ${c} cm dan tinggi b = ${b} cm.\nBerapakah panjang sisi alasnya (cm) ?`,
          answer: a,
          explanation: `a² = c² - b² = ${c * c} - ${b * b} = ${a * a} → a = ${a} cm.`,
        };
      }
    } else if (variant === 1) {
      // Variasi 2: Luas & Keliling Lingkaran
      const r = pick([7, 14]);
      const askLuas = Math.random() > 0.5;
      if (askLuas) {
        const ans = r === 7 ? 154 : 616;
        return {
          id: `bd_lingkaran_l_${_qSeq}`,
          categoryTag: "Luas Lingkaran",
          question: `Sebuah taman berbentuk lingkaran memiliki jari-jari r = ${r} m (π = 22/7).\nBerapakah luas taman tersebut (m²) ?`,
          answer: ans,
          explanation: `Luas = π × r² = (22/7) × ${r * r} = ${ans} m².`,
        };
      } else {
        const ans = r === 7 ? 44 : 88;
        return {
          id: `bd_lingkaran_k_${_qSeq}`,
          categoryTag: "Keliling Lingkaran",
          question: `Berapakah keliling lingkaran dengan jari-jari r = ${r} cm (π = 22/7) dalam cm ?`,
          answer: ans,
          explanation: `Keliling = 2 × π × r = 2 × (22/7) × ${r} = ${ans} cm.`,
        };
      }
    } else if (variant === 2) {
      // Variasi 3: Luas Segitiga
      const a = randInt(4, 16) * 2; // genap
      const t = randInt(3, 10);
      const ans = (a * t) / 2;
      return {
        id: `bd_segitiga_${_qSeq}`,
        categoryTag: "Luas Segitiga",
        question: `Sebuah segitiga memiliki alas ${a} cm dan tinggi ${t} cm.\nBerapakah luas segitiga tersebut (cm²) ?`,
        answer: ans,
        explanation: `Luas = (alas × tinggi) / 2 = (${a} × ${t}) / 2 = ${ans} cm².`,
      };
    } else if (variant === 3) {
      // Variasi 4: Luas Belah Ketupat
      const d1 = randInt(4, 12) * 2;
      const d2 = randInt(3, 10);
      const ans = (d1 * d2) / 2;
      return {
        id: `bd_ketupat_${_qSeq}`,
        categoryTag: "Belah Ketupat",
        question: `Sebuah belah ketupat memiliki diagonal d1 = ${d1} cm dan d2 = ${d2} cm.\nBerapakah luasnya (cm²) ?`,
        answer: ans,
        explanation: `Luas = (d1 × d2) / 2 = (${d1} × ${d2}) / 2 = ${ans} cm².`,
      };
    } else {
      // Variasi 5: Keliling Persegi Panjang
      const p = randInt(8, 20);
      const l = randInt(4, 12);
      const ans = 2 * (p + l);
      return {
        id: `bd_keliling_${_qSeq}`,
        categoryTag: "Keliling Bangun Datar",
        question: `Sebuah lapangan berukuran panjang ${p} meter dan lebar ${l} meter.\nBerapakah keliling lapangan tersebut (meter) ?`,
        answer: ans,
        explanation: `Keliling = 2 × (p + l) = 2 × (${p} + ${l}) = ${ans} meter.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. BENTUK ALJABAR (PERSAMAAN 1 & 2 RUAS, NILAI FUNGSI, SOAL CERITA LOGIKA)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "BENTUK_ALJABAR") {
    const variant = randInt(0, 3);

    if (variant === 0) {
      // Persamaan 1 ruas: ax + b = c
      const a = randInt(2, 6);
      const x = randInt(2, 9);
      const b = randInt(3, 15);
      const c = a * x + b;
      return {
        id: `alj_1_${_qSeq}`,
        categoryTag: "Persamaan Linear",
        question: `Tentukan nilai x yang memenuhi persamaan berikut:`,
        equationDisplay: [`${a}x + ${b} = ${c}`],
        answer: x,
        explanation: `${a}x = ${c} - ${b} = ${c - b} → x = ${x}.`,
      };
    } else if (variant === 1) {
      // Persamaan 2 ruas: ax - b = cx + d
      const c = randInt(1, 3);
      const a = c + randInt(2, 4); // a > c
      const x = randInt(2, 8);
      const d = randInt(2, 12);
      const b = (a - c) * x - d; // ax - cx = b + d
      return {
        id: `alj_2ruas_${_qSeq}`,
        categoryTag: "Aljabar 2 Ruas",
        question: `Tentukan nilai x dari persamaan berikut:`,
        equationDisplay: [`${a}x - ${b} = ${c}x + ${d}`],
        answer: x,
        explanation: `${a}x - ${c}x = ${d} + ${b} → ${a - c}x = ${d + b} → x = ${x}.`,
      };
    } else if (variant === 2) {
      // Nilai Fungsi f(x)
      const a = randInt(2, 5);
      const b = randInt(3, 9);
      const n = randInt(2, 8);
      const ans = a * n - b;
      return {
        id: `alj_fungsi_${_qSeq}`,
        categoryTag: "Nilai Fungsi Aljabar",
        question: `Diketahui suatu fungsi:\nBerapakah nilai dari f(${n}) ?`,
        equationDisplay: [`f(x) = ${a}x - ${b}`],
        answer: ans,
        explanation: `f(${n}) = ${a}(${n}) - ${b} = ${a * n} - ${b} = ${ans}.`,
      };
    } else {
      // Soal Cerita Bilangan
      const n = randInt(3, 12);
      const mul = randInt(2, 4);
      const add = randInt(3, 10);
      const res = mul * n + add;
      return {
        id: `alj_cerita_${_qSeq}`,
        categoryTag: "Soal Cerita Logika",
        question: `${mul} kali suatu bilangan jika ditambah ${add} menghasilkan ${res}.\nBerapakah bilangan tersebut ?`,
        answer: n,
        explanation: `${mul}x + ${add} = ${res} → ${mul}x = ${res - add} → x = ${n}.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PERSAMAAN KUADRAT (AKAR MURNI, FAKTORISASI, JUMLAH/KALI AKAR)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "PERSAMAAN_KUADRAT") {
    const variant = randInt(0, 2);

    if (variant === 0) {
      // Akar Murni: x² - sq = 0
      const x = randInt(3, 12);
      const sq = x * x;
      return {
        id: `pk_murni_${_qSeq}`,
        categoryTag: "Persamaan Kuadrat",
        question: `Berapakah nilai akar positif x dari persamaan:`,
        equationDisplay: [`x² - ${sq} = 0`],
        answer: x,
        explanation: `x² = ${sq} → x = √${sq} = ${x}.`,
      };
    } else if (variant === 1) {
      // Akar Terbesar Pemfaktoran (x - p)(x - q) = 0
      const p = randInt(2, 6);
      const q = p + randInt(1, 5); // q > p
      const b = -(p + q);
      const c = p * q;
      return {
        id: `pk_faktor_${_qSeq}`,
        categoryTag: "Faktorisasi Kuadrat",
        question: `Berapakah nilai akar TERBESAR dari persamaan kuadrat berikut:`,
        equationDisplay: [`x² ${b}x + ${c} = 0`],
        answer: q,
        explanation: `Faktorisasi: (x - ${p})(x - ${q}) = 0 → x1 = ${p}, x2 = ${q}. Akar terbesar = ${q}.`,
      };
    } else {
      // Jumlah Akar-Akar (x1 + x2 = -b/a)
      const sum = randInt(5, 15);
      const prod = randInt(6, 24);
      return {
        id: `pk_rumus_${_qSeq}`,
        categoryTag: "Sifat Akar Kuadrat",
        question: `Jika x1 dan x2 adalah akar-akar dari persamaan kuadrat berikut:\nBerapakah nilai dari (x1 + x2) ?`,
        equationDisplay: [`x² - ${sum}x + ${prod} = 0`],
        answer: sum,
        explanation: `Berdasarkan rumus Vieta: x1 + x2 = -b/a = -(-${sum})/1 = ${sum}.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. OPERASI ARITMATIKA & KABATAKU (CAMPURAN, SOAL CERITA, HITUNG CEPAT)
  // ═══════════════════════════════════════════════════════════════════════════
  if (
    effectiveMateri === "PENJUMLAHAN" ||
    effectiveMateri === "PENGURANGAN" ||
    effectiveMateri === "PERKALIAN" ||
    effectiveMateri === "PEMBAGIAN"
  ) {
    const isKabata = Math.random() > 0.4;

    if (isKabata) {
      // Operasi campuran prioritas (KABATAKU)
      const a = randInt(5, 25);
      const b = randInt(2, 8);
      const c = randInt(2, 6);
      const type = pick(["plus_mul", "mul_sub", "parenthesis"]);

      if (type === "plus_mul") {
        const ans = a + b * c;
        return {
          id: `ari_kbt_${_qSeq}`,
          categoryTag: "Operasi Campuran",
          question: `Berapakah hasil dari operasi berikut:\n(Ingat dahulukan perkalian!)`,
          equationDisplay: [`${a} + ${b} × ${c} = ?`],
          answer: ans,
          explanation: `Dahulukan perkalian: ${b} × ${c} = ${b * c}. Kemudian ${a} + ${b * c} = ${ans}.`,
        };
      } else if (type === "mul_sub") {
        const ans = a * b - c;
        return {
          id: `ari_kbt2_${_qSeq}`,
          categoryTag: "Operasi Campuran",
          question: `Berapakah hasil dari:`,
          equationDisplay: [`${a} × ${b} - ${c} = ?`],
          answer: ans,
          explanation: `${a} × ${b} = ${a * b}. Lalu ${a * b} - ${c} = ${ans}.`,
        };
      } else {
        const ans = (a + b) * c;
        return {
          id: `ari_kbt3_${_qSeq}`,
          categoryTag: "Operasi Campuran",
          question: `Berapakah hasil dari:`,
          equationDisplay: [`(${a} + ${b}) × ${c} = ?`],
          answer: ans,
          explanation: `Kerjakan dalam kurung: ${a} + ${b} = ${a + b}. Lalu ${a + b} × ${c} = ${ans}.`,
        };
      }
    } else {
      // Soal Cerita Logika Aritmatika
      const boxes = randInt(3, 7);
      const perBox = randInt(8, 15);
      const rotten = randInt(4, 12);
      const ans = boxes * perBox - rotten;
      return {
        id: `ari_cerita_${_qSeq}`,
        categoryTag: "Soal Cerita Berhitung",
        question: `Pak Rudi memanen ${boxes} keranjang mangga, setiap keranjang berisi ${perBox} buah.\nJika ${rotten} mangga rusak/busuk,\nberapakah sisa mangga yang masih segar ?`,
        answer: ans,
        explanation: `Total mangga = ${boxes} × ${perBox} = ${boxes * perBox}. Sisa segar = ${boxes * perBox} - ${rotten} = ${ans} buah.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PANGKAT & AKAR (KUADRAT, KUBIK, AKAR KUADRAT, OPERASI PANGKAT)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "PANGKAT") {
    const variant = randInt(0, 3);

    if (variant === 0) {
      // Akar Pangkat Dua
      const root = pick([11, 12, 13, 14, 15, 16, 20, 25]);
      const sq = root * root;
      return {
        id: `pow_akar_${_qSeq}`,
        categoryTag: "Akar Kuadrat",
        question: `Berapakah nilai dari √${sq} ?`,
        answer: root,
        explanation: `√${sq} = ${root} (karena ${root}² = ${sq}).`,
      };
    } else if (variant === 1) {
      // Pangkat Dua Belasan
      const a = randInt(11, diff === "easy" ? 16 : 22);
      const ans = a * a;
      return {
        id: `pow_kuadrat_${_qSeq}`,
        categoryTag: "Pangkat Dua",
        question: `Berapakah nilai dari ${a}² ?`,
        answer: ans,
        explanation: `${a}² = ${a} × ${a} = ${ans}.`,
      };
    } else if (variant === 2) {
      // Pangkat Tiga
      const a = pick([2, 3, 4, 5, 6]);
      const ans = a * a * a;
      return {
        id: `pow_kubik_${_qSeq}`,
        categoryTag: "Pangkat Tiga",
        question: `Berapakah nilai dari ${a}³ ?`,
        answer: ans,
        explanation: `${a}³ = ${a} × ${a} × ${a} = ${ans}.`,
      };
    } else {
      // Penjumlahan Kuadrat
      const a = pick([3, 6, 5]);
      const b = pick([4, 8, 12]);
      const ans = a * a + b * b;
      return {
        id: `pow_sum_${_qSeq}`,
        categoryTag: "Operasi Pangkat",
        question: `Berapakah nilai dari:`,
        equationDisplay: [`${a}² + ${b}² = ?`],
        answer: ans,
        explanation: `${a}² = ${a * a}, ${b}² = ${b * b}. Maka ${a * a} + ${b * b} = ${ans}.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. PERSENTASE (PERSEN DASAR, DISKON HARGA, KEUNTUNGAN)
  // ═══════════════════════════════════════════════════════════════════════════
  if (effectiveMateri === "PERSENTASE") {
    const isDiskon = Math.random() > 0.5;

    if (isDiskon) {
      const hargaRibu = pick([50, 80, 100, 120, 200]);
      const pct = pick([10, 20, 25, 50]);
      const diskonRibu = (pct / 100) * hargaRibu;
      return {
        id: `pct_diskon_${_qSeq}`,
        categoryTag: "Diskon Persentase",
        question: `Sebuah barang seharga Rp ${hargaRibu}.000 mendapat diskon ${pct}%.\nBerapakah potongan harga yang didapat (dalam ribu rupiah) ?`,
        answer: diskonRibu,
        explanation: `Diskon = (${pct}/100) × Rp ${hargaRibu}.000 = Rp ${diskonRibu}.000. Maka jawabannya ${diskonRibu}.`,
      };
    } else {
      const p = pick([10, 20, 25, 50, 75]);
      const n = randInt(2, 10) * (p === 75 ? 40 : 20);
      const ans = (p / 100) * n;
      return {
        id: `pct_dasar_${_qSeq}`,
        categoryTag: "Persentase",
        question: `Berapakah ${p}% dari ${n} ?`,
        answer: ans,
        explanation: `(${p}/100) × ${n} = ${ans}.`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. PECAHAN (SENILAI, PERKALIAN, SOAL CERITA BAGIAN)
  // ═══════════════════════════════════════════════════════════════════════════
  const variantPecahan = randInt(0, 2);
  if (variantPecahan === 0) {
    const c = randInt(2, 6);
    const mul = randInt(2, 5);
    const b = 5;
    const d = b * mul;
    const ans = c * mul;
    return {
      id: `pec_senilai_${_qSeq}`,
      categoryTag: "Pecahan Senilai",
      question: `Tentukan nilai x jika pecahan berikut senilai:`,
      equationDisplay: [`${c} / ${b}  =  x / ${d}`],
      answer: ans,
      explanation: `x = (${c} × ${d}) / ${b} = ${ans}.`,
    };
  } else if (variantPecahan === 1) {
    const b = pick([2, 4, 5]);
    const a = randInt(1, b - 1);
    const total = b * randInt(6, 15);
    const ans = (a * total) / b;
    return {
      id: `pec_bagian_${_qSeq}`,
      categoryTag: "Soal Cerita Pecahan",
      question: `Di suatu kelas terdapat ${total} siswa.\nJika ${a}/${b} dari seluruh siswa gemar matematika,\nberapakah banyak siswa yang gemar matematika ?`,
      answer: ans,
      explanation: `Banyak siswa = (${a}/${b}) × ${total} = ${ans} siswa.`,
    };
  } else {
    const b = pick([2, 3, 4, 5]);
    const a = randInt(1, 3);
    const c = b * randInt(3, 8);
    const ans = (a * c) / b;
    return {
      id: `pec_kali_${_qSeq}`,
      categoryTag: "Operasi Pecahan",
      question: `Berapakah hasil dari:`,
      equationDisplay: [`(${a} / ${b}) × ${c} = ?`],
      answer: ans,
      explanation: `(${a} × ${c}) / ${b} = ${ans}.`,
    };
  }
}

export default function GameKompetitifPage() {
  const { playClick, playCorrect, playWrong } = useSound();

  const [backDashboard, setBackDashboard] = useState("/dashboard/siswa");
  useEffect(() => {
    const u = getCurrentUser();
    setBackDashboard(u?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa");
  }, []);

  // ─── STATE UTAMA GAME ───────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");

  // Pengaturan dari Lobby
  const [selectedMateri, setSelectedMateri] = useState<string>("SPLDV");
  const [gameMode, setGameMode] = useState<"1vs1" | "vsAI">("1vs1");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Skor & Ronde
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [roundNum, setRoundNum] = useState(1);

  // Timer 5 Menit (300 Detik) Total Permainan
  const [timeLeft, setTimeLeft] = useState(300);
  const [winner, setWinner] = useState<"Pemain 1" | "Pemain 2" | "AI Bot" | "Seri / Imbang" | null>(null);

  // Soal & Notifikasi
  const [currentQ, setCurrentQ] = useState<MathQuestion>(INITIAL_QUESTION);
  const [lastRoundNotice, setLastRoundNotice] = useState<string | null>(null);
  const [cheerReaction, setCheerReaction] = useState<string>("hebat!");

  // Input Keypad Kalkulator Pemain 1 & Pemain 2
  const [p1Input, setP1Input] = useState<string>("");
  const [p2Input, setP2Input] = useState<string>("");

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── CEK KEMENANGAN AKHIR ──────────────────────────────────────────────────
  const finishGame = useCallback((p1: number, p2: number) => {
    if (p1 > p2) {
      setWinner("Pemain 1");
    } else if (p2 > p1) {
      setWinner(gameMode === "vsAI" ? "AI Bot" : "Pemain 2");
    } else {
      setWinner("Seri / Imbang");
    }
    setGameState("gameover");
  }, [gameMode]);

  // Cek Knockout (Selisih 5 poin atau salah satu mencapai 10 poin)
  const checkEarlyKO = useCallback((p1: number, p2: number) => {
    if (p1 >= 10 || p1 - p2 >= 5) {
      setWinner("Pemain 1");
      setGameState("gameover");
      return true;
    }
    if (p2 >= 10 || p2 - p1 >= 5) {
      setWinner(gameMode === "vsAI" ? "AI Bot" : "Pemain 2");
      setGameState("gameover");
      return true;
    }
    return false;
  }, [gameMode]);

  // ─── PINDAH SOAL BERIKUTNYA ────────────────────────────────────────────────
  const nextRound = useCallback(() => {
    setP1Input("");
    setP2Input("");
    setRoundNum((r) => r + 1);
    setCurrentQ(makeQuestion(selectedMateri, difficulty));
  }, [selectedMateri, difficulty]);

  // ─── MULAI PERMAINAN (5 MENIT) ─────────────────────────────────────────────
  const handleStartGame = () => {
    playClick();
    setScoreP1(0);
    setScoreP2(0);
    setRoundNum(1);
    setTimeLeft(300); // 5 menit = 300 detik
    setWinner(null);
    setLastRoundNotice(null);
    setCheerReaction("hebat!");
    setP1Input("");
    setP2Input("");
    setCurrentQ(makeQuestion(selectedMateri, difficulty));
    setGameState("playing");
  };

  // ─── SUBMIT JAWABAN PEMAIN 1 ───────────────────────────────────────────────
  const handleP1Submit = useCallback(() => {
    if (gameState !== "playing" || winner || !p1Input.trim()) return;

    const userNum = parseFloat(p1Input.trim().replace(",", "."));
    const isCorrect = !isNaN(userNum) && Math.abs(userNum - currentQ.answer) < 0.001;

    if (isCorrect) {
      playCorrect();
      const nextP1 = scoreP1 + 1;
      setScoreP1(nextP1);
      setLastRoundNotice(`✓ Pemain 1 Benar! (${currentQ.answer}) Tali ditarik ke kiri!`);
      setCheerReaction("hebat!");
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (!checkEarlyKO(nextP1, scoreP2)) nextRound();
    } else {
      playWrong();
      setP1Input("");
      setLastRoundNotice(`✗ Jawaban Pemain 1 (${p1Input}) belum tepat! Coba lagi!`);
      setCheerReaction("ayo tarik!");
    }
  }, [gameState, winner, p1Input, currentQ, scoreP1, scoreP2, playCorrect, playWrong, checkEarlyKO, nextRound]);

  // ─── SUBMIT JAWABAN PEMAIN 2 ───────────────────────────────────────────────
  const handleP2Submit = useCallback(() => {
    if (gameState !== "playing" || winner || gameMode === "vsAI" || !p2Input.trim()) return;

    const userNum = parseFloat(p2Input.trim().replace(",", "."));
    const isCorrect = !isNaN(userNum) && Math.abs(userNum - currentQ.answer) < 0.001;

    if (isCorrect) {
      playCorrect();
      const nextP2 = scoreP2 + 1;
      setScoreP2(nextP2);
      setLastRoundNotice(`✓ Pemain 2 Benar! (${currentQ.answer}) Tali ditarik ke kanan!`);
      setCheerReaction("hebat!");
      if (!checkEarlyKO(scoreP1, nextP2)) nextRound();
    } else {
      playWrong();
      setP2Input("");
      setLastRoundNotice(`✗ Jawaban Pemain 2 (${p2Input}) belum tepat! Coba lagi!`);
      setCheerReaction("ayo tarik!");
    }
  }, [gameState, winner, gameMode, p2Input, currentQ, scoreP1, scoreP2, playCorrect, playWrong, checkEarlyKO, nextRound]);

  // ─── LOGIKA AI BOT (BILA MODE vs AI) ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || gameMode !== "vsAI" || winner) return;

    // AI berpikir sesuai tingkat kesulitan:
    // Easy: 7-10s (akurasi 65%), Medium: 4-7s (akurasi 80%), Hard: 3-5s (akurasi 95%)
    const delay =
      difficulty === "easy"
        ? Math.random() * 3000 + 7000
        : difficulty === "medium"
        ? Math.random() * 3000 + 4000
        : Math.random() * 2000 + 2500;

    aiTimerRef.current = setTimeout(() => {
      if (gameState !== "playing" || winner) return;

      const accuracy = difficulty === "easy" ? 0.65 : difficulty === "medium" ? 0.8 : 0.95;
      const isCorrect = Math.random() < accuracy;
      const aiAns = isCorrect ? currentQ.answer : currentQ.answer + (Math.random() > 0.5 ? 2 : -2);

      // Tampilkan angka yang diketik AI
      setP2Input(String(aiAns));

      setTimeout(() => {
        if (gameState !== "playing" || winner) return;

        if (isCorrect) {
          playCorrect();
          const nextP2 = scoreP2 + 1;
          setScoreP2(nextP2);
          setLastRoundNotice(`🤖 AI Bot menjawab tepat! (${currentQ.answer}) Tali ditarik!`);
          setCheerReaction("hebat!");
          if (!checkEarlyKO(scoreP1, nextP2)) nextRound();
        } else {
          playClick();
          setP2Input("");
          setLastRoundNotice(`🤖 AI Bot keliru (${aiAns})! Kesempatan untuk Pemain 1!`);
        }
      }, 500);
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [currentQ, gameState, gameMode, difficulty, winner, scoreP1, scoreP2, checkEarlyKO, nextRound, playCorrect, playClick]);

  // ─── COUNTDOWN TIMER (5 MENIT TOTAL) ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || winner) return;

    if (timeLeft <= 0) {
      playWrong();
      finishGame(scoreP1, scoreP2);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, timeLeft, winner, scoreP1, scoreP2, finishGame, playWrong]);

  // ─── DUKUNGAN KEYBOARD FISIK (UNTUK PEMAIN 1) ──────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || winner) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
        setP1Input((prev) => (prev.length < 8 ? prev + e.key : prev));
      } else if (e.key === "-") {
        setP1Input((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
      } else if (e.key === "." || e.key === ",") {
        setP1Input((prev) => (!prev.includes(".") ? prev + "." : prev));
      } else if (e.key === "Backspace") {
        setP1Input((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape" || e.key.toLowerCase() === "c") {
        setP1Input("");
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleP1Submit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, winner, handleP1Submit]);

  // Handler klik keypad virtual
  const handleKeypadPress = (
    key: string,
    target: "P1" | "P2"
  ) => {
    playClick();
    const setter = target === "P1" ? setP1Input : setP2Input;
    const submit = target === "P1" ? handleP1Submit : handleP2Submit;

    if (key === "ENTER") {
      submit();
    } else if (key === "C") {
      setter("");
    } else if (key === "⌫") {
      setter((prev) => prev.slice(0, -1));
    } else if (key === "-") {
      setter((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
    } else if (key === ".") {
      setter((prev) => (!prev.includes(".") ? prev + "." : prev));
    } else {
      setter((prev) => (prev.length < 8 ? prev + key : prev));
    }
  };

  // Pergeseran visual tali tambang (-130px ke kiri untuk P1, +130px ke kanan untuk P2)
  const ropeShift = Math.max(-130, Math.min(130, (scoreP2 - scoreP1) * 32));

  // Format Timer 5 Menit (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <GameShell backUrl={backDashboard} showBack={true}>
      <div className="flex w-full flex-col items-center">

        {/* ═══════════════════════════════════════════════════════════════════════
            1. LOBBY PEMILIHAN MATERI & MODE (FIGMA 85:131 & 87:277)
           ═══════════════════════════════════════════════════════════════════════ */}
        {gameState === "lobby" && (
          <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-[36px] border-[7px] border-white bg-[#ffd3d3] p-6 shadow-2xl backdrop-blur-xs">
              
              <div className="mb-6 text-center">
                <span className="inline-block rounded-full bg-[#fd363a] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm mb-2">
                  ⚔️ Game Kompetitif Matematika
                </span>
                <h1 className="game-font text-3xl sm:text-5xl text-[#2a2830] font-bold tracking-wider">
                  PILIH MATERI TARIK TAMBANG
                </h1>
                <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-1">
                  Adu cepat mengetik jawaban kalkulator untuk menarik tali lawan!
                </p>
              </div>

              {/* Grid 12 Materi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-6">
                {MATERI_LIST.map((m) => {
                  const isSelected = selectedMateri === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        playClick();
                        setSelectedMateri(m.id);
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-[24px] border-[5px] p-4 text-center transition-all cursor-pointer shadow-md ${
                        isSelected
                          ? "border-[#4fd74f] bg-white scale-104 shadow-lg ring-4 ring-green-300"
                          : "border-white bg-[#d3e9ff] hover:bg-white hover:scale-102"
                      }`}
                    >
                      <div className={`size-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-sm ${m.bgColor || "bg-[#34b2cb]"}`}>
                        {m.icon}
                      </div>
                      <span className="game-font text-base sm:text-lg font-bold text-[#2a2830]">
                        {m.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 size-5 rounded-full bg-[#4fd74f] text-white text-xs flex items-center justify-center font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pilihan Mode & Kesulitan */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t-2 border-white/60 pt-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#2a2830]">Mode:</span>
                  <div className="flex rounded-2xl border-4 border-white bg-white/70 p-1 shadow-sm">
                    <button
                      onClick={() => { playClick(); setGameMode("1vs1"); }}
                      className={`rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        gameMode === "1vs1" ? "bg-[#34cc9e] text-white shadow" : "text-[#2a2830] hover:bg-gray-100"
                      }`}
                    >
                      👥 1 vs 1 (Lokal)
                    </button>
                    <button
                      onClick={() => { playClick(); setGameMode("vsAI"); }}
                      className={`rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        gameMode === "vsAI" ? "bg-[#34cc9e] text-white shadow" : "text-[#2a2830] hover:bg-gray-100"
                      }`}
                    >
                      🤖 vs Komputer (AI)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#2a2830]">Kesulitan:</span>
                  <div className="flex rounded-2xl border-4 border-white bg-white/70 p-1 shadow-sm">
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => { playClick(); setDifficulty(d); }}
                        className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold capitalize transition-all cursor-pointer ${
                          difficulty === d ? "bg-[#fd363a] text-white shadow" : "text-[#2a2830] hover:bg-gray-100"
                        }`}
                      >
                        {d === "easy" ? "Mudah" : d === "medium" ? "Sedang" : "Sulit"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="rounded-full border-[6px] border-white bg-[#55d274] size-16 sm:size-20 flex items-center justify-center text-white shadow-[0px_6px_0px_0px_#2e8e46] hover:scale-110 active:translate-y-1 transition-all cursor-pointer shrink-0"
                  title="Mulai Tarik Tambang"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-8 sm:size-10 ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            2. ARENA TARIK TAMBANG DENGAN KALKULATOR (FIGMA 87:365)
           ═══════════════════════════════════════════════════════════════════════ */}
        {gameState !== "lobby" && (
          <div className="flex w-full max-w-5xl flex-col items-center">

            {/* ARENA VISUAL TARIK TAMBANG DUA KARAKTER (FIGMA 87:365) */}
            <div className="relative w-full rounded-[32px] border-[7px] border-white bg-[#d3e9ff] p-4 shadow-2xl backdrop-blur-xs flex flex-col items-center mb-3 overflow-hidden">
              
              {/* Tombol Selesai Fleksibel di Kiri Atas Arena */}
              <div className="absolute top-3 left-5 z-30">
                <button
                  onClick={() => {
                    playClick();
                    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
                    finishGame(scoreP1, scoreP2);
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border-[3px] border-white bg-[#f59e0b] hover:bg-[#d97706] px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-[0px_3px_0px_0px_#b45309] active:translate-y-0.5 transition-all cursor-pointer"
                  title="Selesaikan permainan sekarang dan tentukan pemenang dari skor saat ini"
                >
                  <span>🏁</span>
                  <span>Selesai</span>
                </button>
              </div>

              {/* Balon Ucapan Komik di Kanan Atas ("hebat!") Sesuai Figma 87:590 */}
              <div className="absolute top-3 right-6 z-30">
                <div className="relative bg-white/95 border-3 border-[#2a2830] px-4 py-1 rounded-2xl shadow-md">
                  <span className="game-font text-lg sm:text-2xl font-bold text-[#2a2830] tracking-wide uppercase">
                    {cheerReaction}
                  </span>
                  {/* Ekor balon kata */}
                  <div className="absolute -bottom-2 right-4 size-3 bg-white border-b-3 border-r-3 border-[#2a2830] rotate-45" />
                </div>
              </div>

              {/* Lintasan Tarik Tambang Stickman */}
              <div className="relative w-full h-32 sm:h-36 flex items-center justify-center overflow-hidden my-1">
                
                {/* Garis Tengah Lapangan Merah (Figma 89:414) */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[#a14343] z-10" />

                {/* Kontainer Karakter & Tali Bergerak Sesuai Skor */}
                <div
                  style={{ transform: `translateX(${ropeShift}px)` }}
                  className="relative z-20 transition-transform duration-500 ease-out flex items-center justify-center w-full max-w-2xl px-8"
                >
                  {/* Stickman Kiri (Pemain 1) */}
                  <div className="flex flex-col items-center shrink-0 -mr-2">
                    <svg width="70" height="90" viewBox="0 0 70 90" className="drop-shadow-sm select-none">
                      {/* Kepala dengan senyuman */}
                      <circle cx="35" cy="20" r="16" fill="#fcd34d" stroke="#0284c7" strokeWidth="3" />
                      <path d="M 28 17 Q 31 14 34 17" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 38 17 Q 41 14 44 17" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 30 24 Q 36 29 42 24" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      {/* Badan miring condong ke kiri menarik tali */}
                      <line x1="35" y1="36" x2="26" y2="62" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      {/* Kaki menjejak kuat ke kiri */}
                      <line x1="26" y1="62" x2="10" y2="86" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      <line x1="26" y1="62" x2="38" y2="86" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      {/* Tangan menggenggam tali ke arah kanan */}
                      <line x1="32" y1="44" x2="55" y2="50" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Tali Tambang & Pita Merah Tengah (Figma 89:378 & 87:585) */}
                  <div className="relative flex-1 h-5 flex items-center justify-center mx-1">
                    {/* Tali Tambang Utama Cokelat Emas */}
                    <div className="absolute inset-x-0 h-3.5 bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] rounded-full border-2 border-[#78350f] shadow-inner" />
                    
                    {/* Pita / Penanda Kain Merah di Tengah Tali (Figma 89:387) */}
                    <div className="relative z-20 flex flex-col items-center">
                      <div className="size-5 rounded-full bg-[#fd363a] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                        🔻
                      </div>
                      <div className="w-1.5 h-3 bg-[#fd363a] rounded-b -mt-0.5" />
                    </div>
                  </div>

                  {/* Stickman Kanan (Pemain 2 / AI) */}
                  <div className="flex flex-col items-center shrink-0 -ml-2">
                    <svg width="70" height="90" viewBox="0 0 70 90" className="drop-shadow-sm select-none">
                      {/* Kepala dengan wajah tekad/marah */}
                      <circle cx="35" cy="20" r="16" fill="#fdba74" stroke="#dc2626" strokeWidth="3" />
                      <path d="M 27 15 L 33 19" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 43 15 L 37 19" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 30 26 Q 35 22 40 26" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      {/* Badan miring condong ke kanan menarik tali */}
                      <line x1="35" y1="36" x2="44" y2="62" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                      {/* Kaki menjejak kuat ke kanan */}
                      <line x1="44" y1="62" x2="60" y2="86" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                      <line x1="44" y1="62" x2="32" y2="86" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                      {/* Tangan menggenggam tali ke arah kiri */}
                      <line x1="38" y1="44" x2="15" y2="50" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Notifikasi Ronde Terakhir (Bila Ada) */}
              {lastRoundNotice && (
                <div className="text-xs font-bold text-[#144837] bg-white/90 px-4 py-1 rounded-full shadow mt-1">
                  {lastRoundNotice}
                </div>
              )}
            </div>

            {/* BAR POIN, PEDANG VS, DAN TIMER 5 MENIT KOTAK MERAH (FIGMA 98:1162) */}
            <div className="flex w-full items-center justify-between px-3 sm:px-6 mb-4">
              {/* Poin Pemain 1 */}
              <div className="flex items-center gap-2">
                <span className="game-font text-2xl sm:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {scoreP1} point
                </span>
              </div>

              {/* Indikator Pedang VS & Kotak Timer 5 Menit di Tengah */}
              <div className="flex flex-col items-center">
                {/* Garis Biru - Pedang ⚔️ - Garis Merah */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-12 sm:w-20 h-1.5 bg-[#36abe5] rounded-full shadow" />
                  <span className="text-2xl filter drop-shadow">⚔️</span>
                  <div className="w-12 sm:w-20 h-1.5 bg-[#d83333] rounded-full shadow" />
                </div>

                {/* Kotak Timer Merah 5 Menit Sesuai Figma 98:1162 */}
                <div className={`rounded-xl border-[5px] border-white px-6 py-1 shadow-lg transition-all ${
                  timeLeft <= 30 ? "bg-red-600 animate-pulse" : "bg-[#fd363a]"
                }`}>
                  <span className="game-font text-2xl sm:text-4xl text-white font-bold tracking-widest">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Poin Pemain 2 / AI */}
              <div className="flex items-center gap-2 flex-row-reverse">
                <span className="game-font text-2xl sm:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {scoreP2} point
                </span>
              </div>
            </div>

            {/* 3 KOLOM BATTLE: KALKULATOR P1 | KARTU SOAL | KALKULATOR P2 (FIGMA 87:365) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
              
              {/* ── 1. KALKULATOR PEMAIN 1 (KIRI, FIGMA 87:398) ── */}
              <div className="lg:col-span-4 rounded-[32px] border-[6px] border-white bg-[rgba(228,211,255,0.85)] p-4 shadow-xl flex flex-col items-center justify-between">
                <div className="w-full text-center mb-2">
                  <h4 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold">
                    Pemain 1
                  </h4>
                </div>

                {/* Layar Input Kalkulator P1 (Figma 87:450) */}
                <div className="w-full h-14 bg-white border-[4px] border-[#7251a8] rounded-xl flex items-center justify-end px-4 text-2xl sm:text-3xl font-mono font-bold text-[#1e1b4b] shadow-inner tracking-wider mb-3 select-none overflow-x-auto">
                  {p1Input ? (
                    p1Input
                  ) : (
                    <span className="text-gray-300 text-sm font-sans font-normal">
                      Ketik angka...
                    </span>
                  )}
                </div>

                {/* Tombol-Tombol Keypad Kalkulator P1 (Figma 87:487) */}
                <div className="grid grid-cols-4 gap-2 w-full">
                  {["1", "2", "3"].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleKeypadPress(n, "P1")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeypadPress("C", "P1")}
                    className="rounded-xl border-2 border-white bg-[#f86f72] hover:bg-[#ef4444] text-white font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Hapus Semua"
                  >
                    C
                  </button>

                  {["4", "5", "6"].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleKeypadPress(n, "P1")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeypadPress("-", "P1")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Minus"
                  >
                    -
                  </button>

                  {["7", "8", "9"].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleKeypadPress(n, "P1")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeypadPress(".", "P1")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                  >
                    .
                  </button>

                  <button
                    onClick={() => handleKeypadPress("0", "P1")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleKeypadPress("⌫", "P1")}
                    className="rounded-xl border-2 border-white bg-[#f86f72] hover:bg-[#ef4444] text-white font-bold text-lg py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Hapus 1 Karakter"
                  >
                    ⌫
                  </button>
                  <button
                    onClick={() => handleKeypadPress("ENTER", "P1")}
                    className="col-span-2 rounded-xl border-2 border-white bg-[#55d274] hover:bg-[#22c55e] text-white font-bold text-base sm:text-lg py-3 shadow-md active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Jawab ✓
                  </button>
                </div>
              </div>

              {/* ── 2. KARTU SOAL DI TENGAH (FIGMA 98:1164) ── */}
              <div className="lg:col-span-4 rounded-[32px] border-[6px] border-white bg-[#fffbd3] p-5 shadow-xl flex flex-col items-center justify-between text-center min-h-[320px]">
                <div className="w-full flex justify-center">
                  <span className="text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
                    {currentQ.categoryTag || selectedMateri} • {difficulty.toUpperCase()}
                  </span>
                </div>

                <div className="my-auto py-2">
                  <p className="game-font text-lg sm:text-2xl font-semibold text-[#2a2830] leading-snug whitespace-pre-line mb-3">
                    {currentQ.question}
                  </p>

                  {/* Display Persamaan Jika Ada (SPLDV / Aljabar) */}
                  {currentQ.equationDisplay && (
                    <div className="bg-white/80 border-2 border-amber-300 rounded-2xl p-3 my-2 shadow-inner inline-block text-left">
                      {currentQ.equationDisplay.map((eq, i) => (
                        <div key={i} className="font-mono text-base sm:text-lg font-bold text-[#1e1b4b]">
                          {eq}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full border-t border-amber-200 pt-3">
                  <p className="text-[11px] text-gray-600 font-semibold">
                    💡 Ketik angka jawaban di kalkulatormu lalu tekan tombol <strong className="text-green-700">Jawab ✓</strong> (atau tekan Enter di keyboard).
                  </p>
                </div>
              </div>

              {/* ── 3. KALKULATOR PEMAIN 2 / AI (KANAN, FIGMA 87:528) ── */}
              <div className="lg:col-span-4 rounded-[32px] border-[6px] border-white bg-[rgba(228,211,255,0.85)] p-4 shadow-xl flex flex-col items-center justify-between">
                <div className="w-full text-center mb-2">
                  <h4 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold">
                    {gameMode === "vsAI" ? "AI Bot 🤖" : "Pemain 2"}
                  </h4>
                </div>

                {/* Layar Input Kalkulator P2 */}
                <div className="w-full h-14 bg-white border-[4px] border-[#7251a8] rounded-xl flex items-center justify-end px-4 text-2xl sm:text-3xl font-mono font-bold text-[#1e1b4b] shadow-inner tracking-wider mb-3 select-none overflow-x-auto">
                  {p2Input ? (
                    p2Input
                  ) : (
                    <span className="text-gray-300 text-sm font-sans font-normal">
                      {gameMode === "vsAI" ? "AI sedang menghitung..." : "Ketik angka..."}
                    </span>
                  )}
                </div>

                {/* Tombol-Tombol Keypad Kalkulator P2 */}
                <div className="grid grid-cols-4 gap-2 w-full">
                  {["1", "2", "3"].map((n) => (
                    <button
                      key={n}
                      disabled={gameMode === "vsAI"}
                      onClick={() => handleKeypadPress(n, "P2")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress("C", "P2")}
                    className="rounded-xl border-2 border-white bg-[#f86f72] hover:bg-[#ef4444] disabled:opacity-80 text-white font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Hapus Semua"
                  >
                    C
                  </button>

                  {["4", "5", "6"].map((n) => (
                    <button
                      key={n}
                      disabled={gameMode === "vsAI"}
                      onClick={() => handleKeypadPress(n, "P2")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress("-", "P2")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Minus"
                  >
                    -
                  </button>

                  {["7", "8", "9"].map((n) => (
                    <button
                      key={n}
                      disabled={gameMode === "vsAI"}
                      onClick={() => handleKeypadPress(n, "P2")}
                      className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress(".", "P2")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                  >
                    .
                  </button>

                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress("0", "P2")}
                    className="rounded-xl border-2 border-white bg-white hover:bg-gray-100 disabled:opacity-80 text-[#2a2830] font-bold text-xl py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress("⌫", "P2")}
                    className="rounded-xl border-2 border-white bg-[#f86f72] hover:bg-[#ef4444] disabled:opacity-80 text-white font-bold text-lg py-3 shadow-md active:translate-y-1 transition-all cursor-pointer"
                    title="Hapus 1 Karakter"
                  >
                    ⌫
                  </button>
                  <button
                    disabled={gameMode === "vsAI"}
                    onClick={() => handleKeypadPress("ENTER", "P2")}
                    className="col-span-2 rounded-xl border-2 border-white bg-[#55d274] hover:bg-[#22c55e] disabled:opacity-80 text-white font-bold text-base sm:text-lg py-3 shadow-md active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Jawab ✓
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            3. POPUP MODAL KEMENANGAN (FIGMA 90:608)
           ═══════════════════════════════════════════════════════════════════════ */}
        {gameState === "gameover" && winner && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(127,114,150,0.75)] p-4 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg rounded-[36px] border-[7px] border-white bg-[#fffbd3] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                
                {/* Teks Kemenangan Sesuai Figma 90:747 dengan Highlight Nama Juara */}
                <h3 className="game-font text-3xl sm:text-4xl text-black font-bold mb-3 leading-tight">
                  {winner === "Seri / Imbang" ? (
                    <>
                      Permainan Selesai!
                      <span className="block mt-1 text-2xl text-amber-600">Skor Seri / Imbang!</span>
                    </>
                  ) : (
                    <>
                      Selamat{" "}
                      <span
                        className={`inline-flex items-center gap-1.5 px-4 py-1 my-1 rounded-2xl border-[4px] border-white text-white font-extrabold shadow-lg transition-transform hover:scale-105 ${
                          winner === "Pemain 1"
                            ? "bg-[#0284c7] shadow-[0px_4px_14px_rgba(2,132,199,0.5)]"
                            : winner === "Pemain 2"
                            ? "bg-[#dc2626] shadow-[0px_4px_14px_rgba(220,38,38,0.5)]"
                            : "bg-[#7c3aed] shadow-[0px_4px_14px_rgba(124,58,237,0.5)]"
                        }`}
                      >
                        <span>👑</span>
                        <span>{winner}</span>
                      </span>
                      !
                      <span className="block mt-2 text-2xl sm:text-3xl text-[#15803d]">
                        Kamu Menang!
                      </span>
                    </>
                  )}
                </h3>

                {/* Trophy & Emojis Kemenangan */}
                <div className="my-4 text-7xl flex items-center gap-3 animate-bounce">
                  <span>🏆</span>
                  <span>🎉</span>
                  <span className="text-5xl animate-pulse">✨</span>
                </div>

                {/* Skor Akhir dengan Highlight Pemenang */}
                <div className="flex items-center justify-center gap-2 text-sm font-semibold mb-6 bg-white/70 px-4 py-1.5 rounded-full border border-amber-200 shadow-xs">
                  <span className="text-gray-600">Skor akhir:</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      winner === "Pemain 1"
                        ? "bg-[#0284c7] text-white shadow-xs"
                        : "text-gray-700"
                    }`}
                  >
                    Pemain 1 ({scoreP1})
                  </span>
                  <span className="text-gray-400 font-bold">-</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      winner !== "Pemain 1" && winner !== "Seri / Imbang"
                        ? "bg-[#dc2626] text-white shadow-xs"
                        : "text-gray-700"
                    }`}
                  >
                    {gameMode === "vsAI" ? "AI Bot" : "Pemain 2"} ({scoreP2})
                  </span>
                </div>

                {/* 2 Tombol Sesuai Figma 90:744 & 90:745 */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button
                    onClick={handleStartGame}
                    className="rounded-[28px] border-[6px] border-white bg-[#94f291] py-3.5 px-6 game-font text-xl font-bold text-black shadow-[0px_5px_0px_0px_#aaafaf] hover:scale-105 active:translate-y-1 transition-all cursor-pointer flex-1"
                  >
                    Main lagi
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      setGameState("lobby");
                    }}
                    className="rounded-[28px] border-[6px] border-white bg-[#7bc6f4] py-3.5 px-6 game-font text-xl font-bold text-black shadow-[0px_5px_0px_0px_#aaafaf] hover:scale-105 active:translate-y-1 transition-all cursor-pointer flex-1"
                  >
                    Kembali ke lobby
                  </button>
                </div>

              </div>
            </div>

            {/* Efek Petasan & Kembang Api Kemenangan Heboh di DEPAN Modal (z-[100]) */}
            {winner !== "Seri / Imbang" && <CelebrationEffects zIndexClass="z-[100]" />}
          </>
        )}

      </div>
    </GameShell>
  );
}
