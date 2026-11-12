/**
 * questionGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Procedural / Template-Based Question Generator
 * Menghasilkan soal SPLDV & Bangun Ruang secara algoritmik:
 * - Angka selalu bilangan bulat positif (tidak ada pecahan rumit)
 * - Jawaban benar dijamin akurat (dihitung langsung dari parameter)
 * - Tanpa AI, tanpa API key, bisa offline, 0 ms delay
 * - Bisa menghasilkan soal tak terbatas dengan seed acak
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { QuestionItem } from "./questions";

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Acak integer dalam rentang [min, max] inklusif */
function randInt(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pilih satu elemen acak dari array */
function pick<T>(arr: T[], rng: () => number = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Buat 3 pilihan salah yang wajar (bukan sama dengan benar, bukan duplikat) */
function makeWrongOptions(correct: number, delta: number[] = [1, 2, 3]): number[] {
  const wrongs: number[] = [];
  for (const d of delta) {
    const candidate = correct + d;
    if (candidate !== correct) wrongs.push(candidate);
  }
  return wrongs.slice(0, 3);
}

/** Format angka menjadi string Rupiah (misal: 150000 → "Rp 150.000") */
function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

/** Shuffle array secara in-place (Fisher–Yates) */
function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Buat Simple LCG RNG dari seed agar soal reprodusibel saat seed yang sama dipakai.
 * Jika seed = undefined, gunakan Math.random biasa.
 */
function makeRng(seed?: number): () => number {
  if (seed === undefined) return Math.random;
  let s = seed;
  return () => {
    // LCG parameters (Numerical Recipes)
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Tipe Soal ───────────────────────────────────────────────────────────────

export type QuestionTopic =
  | "spldv_eliminasi"       // Himpunan penyelesaian SPLDV angka bulat
  | "spldv_cerita"          // Soal cerita (harga barang, usia, panjang)
  | "spldv_identifikasi"    // Mana yang bentuk SPLDV / koefisien / variabel
  | "bangun_tabung"         // Volume & luas tabung
  | "bangun_kerucut"        // Volume & luas kerucut
  | "bangun_bola"           // Volume & luas bola
  | "bangun_limas";         // Volume & luas limas persegi

export interface GenerateOptions {
  topic?: QuestionTopic;   // Topik soal (default: acak semua)
  seed?: number;           // Seed untuk reprodusibilitas (default: acak)
  count?: number;          // Jumlah soal yang dibuat (default: 1)
  difficulty?: "easy" | "medium" | "hard"; // Tingkat kesulitan (default: medium)
}

// ─── Konteks Soal Cerita SPLDV ──────────────────────────────────────────────

interface StoryContext {
  varA: string;  // nama barang A (misal: "pensil")
  varB: string;  // nama barang B (misal: "penghapus")
  unitA: string; // satuan (default: "buah")
  unitB: string;
}

const STORY_CONTEXTS: StoryContext[] = [
  { varA: "pensil", varB: "penghapus", unitA: "buah", unitB: "buah" },
  { varA: "buku tulis", varB: "pena", unitA: "buah", unitB: "buah" },
  { varA: "mangga", varB: "jeruk", unitA: "buah", unitB: "buah" },
  { varA: "tiket wahana A", varB: "tiket wahana B", unitA: "lembar", unitB: "lembar" },
  { varA: "nasi goreng", varB: "mie goreng", unitA: "porsi", unitB: "porsi" },
  { varA: "apel", varB: "pisang", unitA: "buah", unitB: "buah" },
  { varA: "kaos", varB: "celana", unitA: "buah", unitB: "buah" },
  { varA: "batagor", varB: "siomay", unitA: "porsi", unitB: "porsi" },
];

// ─── Generator Per Topik ──────────────────────────────────────────────────────

/**
 * SPLDV Eliminasi:
 * Menghasilkan sistem persamaan ax + by = C1 dan cx + dy = C2
 * dengan x0, y0 bilangan bulat positif yang tertentu terlebih dahulu,
 * lalu koefisien dipilih agar C1 dan C2 bulat positif.
 */
function genSpldvEliminasi(id: string, rng: () => number, difficulty: string): QuestionItem {
  // Pilih solusi dulu: x0, y0 ∈ {1..9}
  const range = difficulty === "easy" ? [1, 5] : difficulty === "hard" ? [3, 12] : [1, 9];
  const x0 = randInt(range[0], range[1], rng);
  const y0 = randInt(range[0], range[1], rng);

  // Koefisien: a, b ∈ {1..5}, c ≠ a atau d ≠ b
  const a = randInt(1, 5, rng);
  const b = randInt(1, 5, rng);
  let c = randInt(1, 5, rng);
  let d = randInt(1, 5, rng);
  // Pastikan dua persamaan tidak identik (det ≠ 0)
  while (a * d === b * c) {
    c = randInt(1, 5, rng);
    d = randInt(1, 5, rng);
  }

  const C1 = a * x0 + b * y0;
  const C2 = c * x0 + d * y0;

  const eq1 = `${a}x + ${b}y = ${C1}`;
  const eq2 = `${c}x + ${d}y = ${C2}`;

  const correctAnswer = `(${x0}, ${y0})`;

  // Buat 3 distraktor (salah dengan pertukaran nilai atau ±1)
  const wrongs = [
    `(${y0}, ${x0})`,
    `(${x0 + 1}, ${y0 - 1})`,
    `(${x0 - 1}, ${y0 + 1})`,
  ].filter((s) => s !== correctAnswer);

  const optionsRaw = shuffle([correctAnswer, ...wrongs.slice(0, 3)], rng);
  const correctIndex = optionsRaw.indexOf(correctAnswer);

  return {
    id,
    section: 1,
    question: `Tentukan himpunan penyelesaian (x, y) dari sistem persamaan berikut!`,
    context: "Eliminasi SPLDV",
    equations: { eq1, label1: "Persamaan 1", eq2, label2: "Persamaan 2" },
    needsScratchpad: true,
    options: optionsRaw,
    correctIndex,
    explanation:
      `Kalikan Pers. 1 dengan ${d} dan Pers. 2 dengan ${b}: ` +
      `${a * d}x + ${b * d}y = ${C1 * d} dan ${c * b}x + ${d * b}y = ${C2 * b}. ` +
      `Kurangkan: ${a * d - c * b}x = ${C1 * d - C2 * b} → x = ${x0}. ` +
      `Substitusi ke Pers. 1: ${a}(${x0}) + ${b}y = ${C1} → y = ${y0}. ` +
      `Jadi (x, y) = (${x0}, ${y0}).`,
  };
}

/**
 * SPLDV Cerita:
 * "Andi membeli a buah X dan b buah Y seharga Rp C1.
 *  Budi membeli c buah X dan d buah Y seharga Rp C2.
 *  Harga 1 X adalah..."
 */
function genSpldvCerita(id: string, rng: () => number, difficulty: string): QuestionItem {
  const ctx = pick(STORY_CONTEXTS, rng);

  // Harga satuan X dan Y (ribuan rupiah, bilangan bulat cantik)
  const basePrice = difficulty === "easy" ? 1000 : difficulty === "hard" ? 5000 : 2000;
  const priceX = randInt(1, 8, rng) * basePrice;
  const priceY = randInt(1, 8, rng) * basePrice;

  // Koefisien pembelian
  const a = randInt(1, 5, rng);
  const b = randInt(1, 5, rng);
  let c = randInt(1, 5, rng);
  let d = randInt(1, 5, rng);
  while (a * d === b * c) { c = randInt(1, 5, rng); d = randInt(1, 5, rng); }

  const C1 = a * priceX + b * priceY;
  const C2 = c * priceX + d * priceY;

  // Variasi pertanyaan
  const qType = pick(["hargaX", "hargaY", "kombinasi"], rng);
  let questionText = "";
  let correctAnswer = 0;
  let questionSuffix = "";

  if (qType === "hargaX") {
    questionText = `Berapakah harga 1 ${ctx.varA}?`;
    correctAnswer = priceX;
    questionSuffix = `1 ${ctx.varA}`;
  } else if (qType === "hargaY") {
    questionText = `Berapakah harga 1 ${ctx.varB}?`;
    correctAnswer = priceY;
    questionSuffix = `1 ${ctx.varB}`;
  } else {
    const qa = randInt(1, 3, rng);
    const qb = randInt(1, 3, rng);
    questionText = `Berapakah total harga ${qa} ${ctx.varA} dan ${qb} ${ctx.varB}?`;
    correctAnswer = qa * priceX + qb * priceY;
    questionSuffix = `${qa} ${ctx.varA} dan ${qb} ${ctx.varB}`;
  }

  const wrongPrices = makeWrongOptions(correctAnswer, [
    basePrice, -basePrice, basePrice * 2,
  ]);
  const optionsRaw = shuffle(
    [formatRupiah(correctAnswer), ...wrongPrices.map(formatRupiah)],
    rng
  );
  const correctIndex = optionsRaw.indexOf(formatRupiah(correctAnswer));

  return {
    id,
    section: 1,
    question: `Andi membeli ${a} ${ctx.varA} dan ${b} ${ctx.varB} seharga ${formatRupiah(C1)}. Budi membeli ${c} ${ctx.varA} dan ${d} ${ctx.varB} seharga ${formatRupiah(C2)}. ${questionText}`,
    context: "SPLDV Kontekstual",
    needsScratchpad: true,
    options: optionsRaw,
    correctIndex,
    explanation:
      `Misalkan harga 1 ${ctx.varA} = x dan 1 ${ctx.varB} = y. ` +
      `Persamaan: ${a}x + ${b}y = ${formatRupiah(C1)} dan ${c}x + ${d}y = ${formatRupiah(C2)}. ` +
      `Harga x = ${formatRupiah(priceX)}, y = ${formatRupiah(priceY)}. ` +
      `Maka harga ${questionSuffix} = ${formatRupiah(correctAnswer)}.`,
  };
}

/**
 * SPLDV Identifikasi:
 * Soal konseptual tentang koefisien, variabel, atau identifikasi SPLDV.
 */
function genSpldvIdentifikasi(id: string, rng: () => number): QuestionItem {
  const qType = pick(["koefisien", "konstanta", "variabel", "mana_spldv"], rng);

  const a = randInt(2, 9, rng);
  const b = randInt(2, 9, rng);
  const c = randInt(5, 30, rng);

  const eq = `${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}y = ${c}`;

  if (qType === "koefisien") {
    const correctAnswer = `${a} dan ${b}`;
    const options = shuffle([
      correctAnswer,
      `x dan y`,
      `${c}`,
      `${a}x dan ${b}y`,
    ], rng);
    return {
      id, section: 2,
      question: `Pada persamaan ${eq}, manakah yang disebut koefisien?`,
      context: "Identifikasi Koefisien",
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: `Koefisien adalah bilangan yang mengali variabel. Pada ${eq}, koefisiennya adalah ${a} (untuk x) dan ${b} (untuk y).`,
    };
  } else if (qType === "konstanta") {
    const correctAnswer = `${c}`;
    const options = shuffle([
      correctAnswer,
      `${a}`,
      `${b}`,
      `x dan y`,
    ], rng);
    return {
      id, section: 2,
      question: `Pada persamaan ${eq}, bilangan manakah yang berperan sebagai konstanta?`,
      context: "Identifikasi Konstanta",
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: `Konstanta adalah bilangan tetap yang tidak mengandung variabel. Pada ${eq}, konstantanya adalah ${c}.`,
    };
  } else if (qType === "variabel") {
    const correctAnswer = "x dan y";
    const options = shuffle([
      correctAnswer,
      `${a} dan ${b}`,
      `${c}`,
      `${a}x dan ${b}y`,
    ], rng);
    return {
      id, section: 2,
      question: `Pada persamaan ${eq}, manakah yang disebut variabel?`,
      context: "Identifikasi Variabel",
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: `Variabel adalah huruf/simbol pengganti nilai yang belum diketahui. Pada ${eq}, variabelnya adalah x dan y.`,
    };
  } else {
    // mana_spldv
    const correctAnswer = `${a}x + ${b}y = ${c} dan 3x - 2y = 7`;
    const options = shuffle([
      correctAnswer,
      `x² + y = 10 dan 2x + y = 5`,
      `xy = 12 dan x + y = 8`,
      `x + y + z = 15 dan x - y = 2`,
    ], rng);
    return {
      id, section: 1,
      question: "Manakah di bawah ini yang merupakan bentuk SPLDV yang benar?",
      context: "Identifikasi SPLDV",
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: "SPLDV hanya memuat dua variabel (x dan y) berderajat 1 (tidak ada kuadrat x² atau perkalian variabel xy).",
    };
  }
}

/**
 * Bangun Ruang: Tabung
 * Volume = πr²t  |  Luas Permukaan = 2πr(r + t)
 * Gunakan π = 22/7, r kelipatan 7 agar jawaban bulat
 */
function genBangunTabung(id: string, rng: () => number, difficulty: string): QuestionItem {
  // r kelipatan 7 agar π×r² bulat dengan 22/7
  const rMultiplier = randInt(1, difficulty === "hard" ? 3 : 2, rng);
  const r = 7 * rMultiplier;          // 7, 14, atau 21
  const t = randInt(5, 20, rng);
  const pi = 22 / 7;

  const qType = pick(["volume", "luas"], rng);
  if (qType === "volume") {
    const vol = Math.round(pi * r * r * t);
    const wrongs = makeWrongOptions(vol, [pi * r * t, pi * r * r, vol / 2]).map(Math.round);
    const optionsRaw = shuffle([`${vol} cm³`, ...wrongs.map((w) => `${w} cm³`)], rng);
    return {
      id, section: 1,
      question: `Sebuah tabung memiliki jari-jari ${r} cm dan tinggi ${t} cm (π = 22/7). Berapakah volume tabung tersebut?`,
      context: "Volume Tabung",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${vol} cm³`),
      explanation: `V = πr²t = 22/7 × ${r}² × ${t} = 22/7 × ${r * r} × ${t} = ${vol} cm³.`,
    };
  } else {
    const luas = Math.round(2 * pi * r * (r + t));
    const wrongs = makeWrongOptions(luas, [
      Math.round(pi * r * r), Math.round(2 * pi * r * t), Math.round(luas / 2),
    ]);
    const optionsRaw = shuffle([`${luas} cm²`, ...wrongs.map((w) => `${w} cm²`)], rng);
    return {
      id, section: 1,
      question: `Sebuah tabung memiliki jari-jari ${r} cm dan tinggi ${t} cm (π = 22/7). Berapakah luas seluruh permukaannya?`,
      context: "Luas Permukaan Tabung",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${luas} cm²`),
      explanation: `L = 2πr(r + t) = 2 × 22/7 × ${r} × (${r} + ${t}) = 2 × 22/7 × ${r} × ${r + t} = ${luas} cm².`,
    };
  }
}

/**
 * Bangun Ruang: Kerucut
 * Pilih r (kelipatan 7) dan t sehingga s = √(r²+t²) bilangan bulat (tripel Pythagoras)
 * Tripel Pythagoras cepat: (3,4,5), (5,12,13), (7,24,25), (8,15,17), dll.
 */
const PYTHAGORAS_TRIPLES = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15],
];

function genBangunKerucut(id: string, rng: () => number, difficulty: string): QuestionItem {
  const triple = pick(PYTHAGORAS_TRIPLES, rng);
  const scale = randInt(1, difficulty === "hard" ? 3 : 2, rng);
  const r = triple[0] * scale;
  const t = triple[1] * scale;
  const s = triple[2] * scale;
  const pi = 22 / 7;

  const qType = pick(["volume", "luas", "garis_pelukis"], rng);
  if (qType === "garis_pelukis") {
    const wrongs = makeWrongOptions(s, [t, r, r + t]);
    const optionsRaw = shuffle([`${s} cm`, ...wrongs.map((w) => `${w} cm`)], rng);
    return {
      id, section: 1,
      question: `Kerucut memiliki jari-jari alas ${r} cm dan tinggi ${t} cm. Berapakah panjang garis pelukis (s)?`,
      context: "Garis Pelukis Kerucut",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${s} cm`),
      explanation: `s = √(r² + t²) = √(${r}² + ${t}²) = √(${r*r} + ${t*t}) = √${s*s} = ${s} cm.`,
    };
  } else if (qType === "volume") {
    // Gunakan r kelipatan 7 agar pembulatan bersih
    const r7 = 7;
    const t7 = 24;
    const s7 = 25;
    const vol = Math.round((1 / 3) * pi * r7 * r7 * t7);
    const wrongs = makeWrongOptions(vol, [vol / 2, vol * 2, vol - 100]).map(Math.round);
    const optionsRaw = shuffle([`${vol} cm³`, ...wrongs.map((w) => `${w} cm³`)], rng);
    return {
      id, section: 1,
      question: `Kerucut memiliki jari-jari alas ${r7} cm dan tinggi ${t7} cm (π = 22/7). Berapakah volume kerucut?`,
      context: "Volume Kerucut",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${vol} cm³`),
      explanation: `V = 1/3 × π × r² × t = 1/3 × 22/7 × ${r7}² × ${t7} = 1/3 × 22/7 × 49 × ${t7} = ${vol} cm³.`,
    };
  } else {
    // luas permukaan
    const ls = Math.round(pi * r * (r + s));
    const wrongs = makeWrongOptions(ls, [
      Math.round(pi * r * s), Math.round(pi * r * r), ls + 50,
    ]);
    const optionsRaw = shuffle([`${ls} cm²`, ...wrongs.map((w) => `${w} cm²`)], rng);
    return {
      id, section: 1,
      question: `Kerucut memiliki jari-jari ${r} cm dan garis pelukis ${s} cm (π = 22/7). Berapakah luas seluruh permukaan kerucut?`,
      context: "Luas Permukaan Kerucut",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${ls} cm²`),
      explanation: `L = πr(r + s) = 22/7 × ${r} × (${r} + ${s}) = 22/7 × ${r} × ${r + s} = ${ls} cm².`,
    };
  }
}

/**
 * Bangun Ruang: Bola
 * Volume = 4/3 πr³  |  Luas = 4πr²
 * r kelipatan 7 agar jawaban bulat
 */
function genBangunBola(id: string, rng: () => number, difficulty: string): QuestionItem {
  const rMultiplier = randInt(1, difficulty === "hard" ? 3 : 2, rng);
  const r = 7 * rMultiplier;
  const pi = 22 / 7;

  const qType = pick(["volume", "luas"], rng);
  if (qType === "volume") {
    const vol = Math.round((4 / 3) * pi * r * r * r);
    const wrongs = makeWrongOptions(vol, [
      Math.round(pi * r * r), Math.round((4 / 3) * pi * r * r), vol / 2,
    ]);
    const optionsRaw = shuffle([`${vol} cm³`, ...wrongs.map((w) => `${w} cm³`)], rng);
    return {
      id, section: 1,
      question: `Sebuah bola memiliki jari-jari ${r} cm (π = 22/7). Berapakah volume bola tersebut?`,
      context: "Volume Bola",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${vol} cm³`),
      explanation: `V = 4/3 × π × r³ = 4/3 × 22/7 × ${r}³ = 4/3 × 22/7 × ${r*r*r} = ${vol} cm³.`,
    };
  } else {
    const luas = Math.round(4 * pi * r * r);
    const wrongs = makeWrongOptions(luas, [
      Math.round(pi * r * r), luas / 2, luas + 100,
    ]);
    const optionsRaw = shuffle([`${luas} cm²`, ...wrongs.map((w) => `${w} cm²`)], rng);
    return {
      id, section: 1,
      question: `Sebuah bola memiliki jari-jari ${r} cm (π = 22/7). Berapakah luas permukaan bola tersebut?`,
      context: "Luas Permukaan Bola",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${luas} cm²`),
      explanation: `L = 4 × π × r² = 4 × 22/7 × ${r}² = 4 × 22/7 × ${r*r} = ${luas} cm².`,
    };
  }
}

/**
 * Bangun Ruang: Limas Persegi
 * Pilih sisi alas s dan tinggi t sehingga apotema = √(t² + (s/2)²) itu bilangan bulat.
 */
function genBangunLimas(id: string, rng: () => number, difficulty: string): QuestionItem {
  // Tripel Pythagoras untuk (tinggi, setengah_sisi → apotema)
  // Misal tripel (t, s/2, apotema): (3,4,5) → t=3, s/2=4 → s=8
  const triple = pick(PYTHAGORAS_TRIPLES, rng);
  const scale = randInt(2, difficulty === "hard" ? 5 : 3, rng);
  const t = triple[0] * scale;
  const halfS = triple[1] * scale;
  const apotema = triple[2] * scale;
  const sisi = halfS * 2;

  const qType = pick(["volume", "luas"], rng);
  if (qType === "volume") {
    const vol = Math.round((1 / 3) * sisi * sisi * t);
    const wrongs = makeWrongOptions(vol, [sisi * sisi, vol / 3, vol * 2]).map(Math.round);
    const optionsRaw = shuffle([`${vol} cm³`, ...wrongs.map((w) => `${w} cm³`)], rng);
    return {
      id, section: 1,
      question: `Sebuah limas persegi memiliki sisi alas ${sisi} cm dan tinggi ${t} cm. Berapakah volume limas?`,
      context: "Volume Limas Persegi",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${vol} cm³`),
      explanation: `V = 1/3 × sisi² × t = 1/3 × ${sisi}² × ${t} = 1/3 × ${sisi*sisi} × ${t} = ${vol} cm³.`,
    };
  } else {
    const luasAlas = sisi * sisi;
    const luasSelimut = 4 * (1 / 2) * sisi * apotema;
    const luasTotal = Math.round(luasAlas + luasSelimut);
    const wrongs = makeWrongOptions(luasTotal, [luasAlas, luasSelimut, luasTotal - 50]);
    const optionsRaw = shuffle([`${luasTotal} cm²`, ...wrongs.map((w) => `${w} cm²`)], rng);
    return {
      id, section: 1,
      question: `Sebuah limas persegi memiliki sisi alas ${sisi} cm dan tinggi sisi tegak (apotema) ${apotema} cm. Berapakah luas seluruh permukaannya?`,
      context: "Luas Permukaan Limas",
      needsScratchpad: true,
      options: optionsRaw,
      correctIndex: optionsRaw.indexOf(`${luasTotal} cm²`),
      explanation: `Luas alas = ${sisi}² = ${luasAlas} cm². Luas 4 segitiga = 4 × (1/2 × ${sisi} × ${apotema}) = ${luasSelimut} cm². Total = ${luasAlas} + ${luasSelimut} = ${luasTotal} cm².`,
    };
  }
}

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

const ALL_TOPICS: QuestionTopic[] = [
  "spldv_eliminasi",
  "spldv_cerita",
  "spldv_identifikasi",
  "bangun_tabung",
  "bangun_kerucut",
  "bangun_bola",
  "bangun_limas",
];

/**
 * generateQuestions
 * ─────────────────
 * Fungsi utama untuk membuat soal secara prosedural.
 *
 * Contoh penggunaan:
 *   // 1 soal acak (mix topik):
 *   const soal = generateQuestions();
 *
 *   // 10 soal SPLDV eliminasi:
 *   const soalList = generateQuestions({ topic: "spldv_eliminasi", count: 10 });
 *
 *   // 5 soal reprodusibel (pakai seed):
 *   const soalFixed = generateQuestions({ seed: 42, count: 5 });
 */
let _globalSeq = 0;

export function generateQuestions(options: GenerateOptions = {}): QuestionItem[] {
  const { topic, seed, count = 1, difficulty = "medium" } = options;
  const rng = makeRng(seed);
  const result: QuestionItem[] = [];

  for (let i = 0; i < count; i++) {
    const chosenTopic: QuestionTopic = topic ?? pick(ALL_TOPICS, rng);
    const id = `gen_${chosenTopic}_${seed !== undefined ? seed : ++_globalSeq}_${i}`;

    let q: QuestionItem;
    switch (chosenTopic) {
      case "spldv_eliminasi":
        q = genSpldvEliminasi(id, rng, difficulty);
        break;
      case "spldv_cerita":
        q = genSpldvCerita(id, rng, difficulty);
        break;
      case "spldv_identifikasi":
        q = genSpldvIdentifikasi(id, rng);
        break;
      case "bangun_tabung":
        q = genBangunTabung(id, rng, difficulty);
        break;
      case "bangun_kerucut":
        q = genBangunKerucut(id, rng, difficulty);
        break;
      case "bangun_bola":
        q = genBangunBola(id, rng, difficulty);
        break;
      case "bangun_limas":
        q = genBangunLimas(id, rng, difficulty);
        break;
      default:
        q = genSpldvEliminasi(id, rng, difficulty);
    }
    result.push(q);
  }

  return result;
}

/**
 * generateInfiniteQuestion
 * ─────────────────────────
 * Shorthand: generate 1 soal acak tanpa seed.
 * Cocok untuk fitur "Soal Berikutnya" di game Tarik Tambang.
 */
export function generateInfiniteQuestion(topic?: QuestionTopic): QuestionItem {
  return generateQuestions({ topic, count: 1 })[0];
}

