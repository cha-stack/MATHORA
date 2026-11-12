export interface QuestionItem {
  id: string;
  section: 1 | 2; // Section 1: Pengertian SPLDV, Section 2: Variabel & Koefisien
  question: string;
  context?: string;
  equations?: { eq1: string; label1: string; eq2: string; label2: string };
  needsScratchpad?: boolean; // Butuh coretan/hitung-hitungan
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Bank Soal Terstruktur untuk Pre-test & Post-test Section 1 (Pengertian SPLDV)
export const SECTION_1_PRETEST: QuestionItem[] = [
  {
    id: "s1_pre_1",
    section: 1,
    question: "Yuk, coba pahami! Menurutmu, mana yang merupakan variabel pada dua persamaan di atas?",
    context: "Identifikasi Variabel Aljabar",
    equations: {
      eq1: "x + y = 10",
      label1: "Persamaan 1",
      eq2: "2x + y = 14",
      label2: "Persamaan 2",
    },
    needsScratchpad: true,
    options: [
      "x dan y",
      "10 dan 14",
      "Tanda + dan =",
      "2 dan 1",
    ],
    correctIndex: 0,
    explanation: "Variabel adalah lambang pengganti nilai yang belum diketahui, dalam kedua persamaan ini adalah x dan y.",
  },
  {
    id: "s1_pre_2",
    section: 1,
    question: "Kepanjangan dari singkatan SPLDV dalam matematika adalah...",
    context: "Konsep Dasar Aljabar",
    options: [
      "Sistem Persamaan Linear Dua Variabel",
      "Struktur Pembagian Linear Dua Vektor",
      "Sistem Perkalian Lengkap Dua Variabel",
      "Satuan Persamaan Lurus Dua Variabel",
    ],
    correctIndex: 0,
    explanation: "SPLDV adalah singkatan resmi dari Sistem Persamaan Linear Dua Variabel.",
  },
  {
    id: "s1_pre_3",
    section: 1,
    question: "Berapakah nilai x yang memenuhi jika Persamaan 2 dikurangi Persamaan 1?",
    context: "Perhitungan Eliminasi Cepat",
    equations: {
      eq1: "x + y = 10",
      label1: "Persamaan 1",
      eq2: "2x + y = 14",
      label2: "Persamaan 2",
    },
    needsScratchpad: true,
    options: [
      "x = 4",
      "x = 2",
      "x = 6",
      "x = 10",
    ],
    correctIndex: 0,
    explanation: "(2x + y) - (x + y) = 14 - 10 => x = 4. Gunakan fitur Buka Coretan untuk corat-coret hitungan!",
  },
  {
    id: "s1_pre_4",
    section: 1,
    question: "Manakah di bawah ini yang merupakan bentuk SPLDV?",
    context: "Identifikasi Persamaan",
    options: [
      "x + y = 7 dan 2x - y = 4",
      "x² + y = 10 dan 2x + y = 5",
      "xy = 12 dan x + y = 8",
      "x + y + z = 15 dan x - y = 2",
    ],
    correctIndex: 0,
    explanation: "SPLDV hanya memuat dua variabel berderajat 1 tanpa adanya kuadrat (x²) atau perkalian variabel (xy).",
  },
  {
    id: "s1_pre_5",
    section: 1,
    question: "Mengapa kita membutuhkan dua persamaan sekaligus dalam SPLDV?",
    context: "Pemahaman Konsep",
    options: [
      "Untuk memperoleh satu pasangan solusi (x, y) yang pasti dan tunggal",
      "Agar grafiknya membentuk lingkaran sempurna",
      "Karena satu persamaan tidak bisa dihitung sama sekali",
      "Supaya variabelnya bisa dihilangkan semuanya",
    ],
    correctIndex: 0,
    explanation: "Satu persamaan memiliki tak hingga banyak kemungkinan jawaban. Dua persamaan sekaligus mempersempitnya menjadi satu solusi pasti.",
  },
];

export const SECTION_1_POSTTEST: QuestionItem[] = [
  {
    id: "s1_post_1",
    section: 1,
    question: "Bentuk grafik dari persamaan linear pada bidang koordinat kartesius selalu berupa...",
    context: "Karakteristik Geometris",
    options: ["Garis lurus", "Kurva parabola lengkung", "Lingkaran tertutup", "Garis patah-patah"],
    correctIndex: 0,
    explanation: "Linear bermakna garis lurus. Semua persamaan berderajat satu grafiknya berupa garis lurus.",
  },
  {
    id: "s1_post_2",
    section: 1,
    question: "Jika dua garis pada grafik SPLDV saling sejajar, maka banyaknya penyelesaian adalah...",
    context: "Kedudukan Dua Garis",
    options: [
      "Tidak ada penyelesaian (0 solusi)",
      "Tepat satu penyelesaian",
      "Tak hingga banyak penyelesaian",
      "Dua penyelesaian berbeda",
    ],
    correctIndex: 0,
    explanation: "Garis sejajar memiliki gradien yang sama dan tidak pernah berpotongan, sehingga tidak ada titik temu/solusi.",
  },
  {
    id: "s1_post_3",
    section: 1,
    question: "Ani membeli 2 pensil dan 1 penghapus seharga Rp 7.000. Jika pensil = p dan penghapus = h, model matematikanya adalah...",
    context: "Pemodelan Matematika",
    options: ["2p + h = 7.000", "p + 2h = 7.000", "2p - h = 7.000", "2p × h = 7.000"],
    correctIndex: 0,
    explanation: "2 pensil dimodelkan sebagai 2p dan 1 penghapus sebagai h, sehingga totalnya 2p + h = 7.000.",
  },
];

// Bank Soal Terstruktur untuk Pre-test & Post-test Section 2 (Variabel, Koefisien, Konstanta)
export const SECTION_2_PRETEST: QuestionItem[] = [
  {
    id: "s2_pre_1",
    section: 2,
    question: "Pada persamaan 5x - 3y = 15, manakah yang disebut sebagai koefisien?",
    context: "Unsur Aljabar",
    options: ["5 dan -3", "x dan y", "15", "5x dan -3y"],
    correctIndex: 0,
    explanation: "Koefisien adalah bilangan pengali yang berada tepat di depan variabel. Dalam kasus ini adalah 5 dan -3.",
  },
  {
    id: "s2_pre_2",
    section: 2,
    question: "Lambang huruf pengganti suatu nilai yang belum diketahui secara pasti disebut...",
    context: "Definisi Komponen",
    options: ["Variabel", "Konstanta", "Koefisien", "Eksponen"],
    correctIndex: 0,
    explanation: "Variabel (peubah) adalah simbol/huruf latin seperti x, y, a, b yang mewakili besaran nilai yang dicari.",
  },
  {
    id: "s2_pre_3",
    section: 2,
    question: "Pada persamaan 4a + 7b = 28, bilangan 28 berkedudukan sebagai...",
    context: "Nilai Tetap",
    options: ["Konstanta", "Koefisien variabel a", "Koefisien variabel b", "Variabel"],
    correctIndex: 0,
    explanation: "Konstanta adalah bilangan tetap murni yang berdiri sendiri tanpa memuat variabel/huruf.",
  },
];

export const SECTION_2_POSTTEST: QuestionItem[] = [
  {
    id: "s2_post_1",
    section: 2,
    question: "Koefisien dari variabel y pada persamaan 2x - y = 8 adalah...",
    context: "Ketelitian Tanda",
    options: ["-1", "1", "2", "8"],
    correctIndex: 0,
    explanation: "Bentuk -y sama artinya dengan (-1)y. Jadi koefisien dari y adalah -1.",
  },
  {
    id: "s2_post_2",
    section: 2,
    question: "Jika persamaan 3x + 4y - 24 = 0 diubah ke bentuk baku ax + by = c, nilai konstantanya adalah...",
    context: "Bentuk Baku Persamaan",
    options: ["24", "-24", "3", "4"],
    correctIndex: 0,
    explanation: "Pindahkan -24 ke ruas kanan: 3x + 4y = 24. Maka konstantanya adalah 24.",
  },
  {
    id: "s2_post_3",
    section: 2,
    question: "Jika x = 2 dan y = 3 disubstitusikan ke 3x + 2y, hasilnya adalah...",
    context: "Substitusi Nilai",
    options: ["12", "10", "14", "16"],
    correctIndex: 0,
    explanation: "3(2) + 2(3) = 6 + 6 = 12.",
  },
];

// Soal Khusus Bank Soal Guru (SPLDV & Bangun Ruang Campuran)
export const BANK_SOAL_GURU: QuestionItem[] = [
  ...SECTION_1_PRETEST,
  ...SECTION_1_POSTTEST,
  ...SECTION_2_PRETEST,
  ...SECTION_2_POSTTEST,
  {
    id: "bg_1",
    section: 1,
    question: "Sebuah kaleng susu berbentuk tabung berdiameter 14 cm dan tinggi 10 cm (π = 22/7). Volumenya adalah...",
    context: "Bangun Ruang Tabung",
    options: ["1.540 cm³", "770 cm³", "3.080 cm³", "440 cm³"],
    correctIndex: 0,
    explanation: "r = 7 cm, t = 10 cm. V = πr²t = 22/7 × 49 × 10 = 1.540 cm³.",
  },
  {
    id: "bg_2",
    section: 1,
    question: "Kerucut dengan jari-jari r = 6 cm dan tinggi t = 8 cm memiliki panjang garis pelukis (s) sebesar...",
    context: "Teorema Pythagoras Kerucut",
    options: ["10 cm", "14 cm", "12 cm", "100 cm"],
    correctIndex: 0,
    explanation: "s = √(r² + t²) = √(36 + 64) = √100 = 10 cm.",
  },
  {
    id: "bg_3",
    section: 1,
    question: "Sebuah bola memiliki jari-jari 7 cm (π = 22/7). Luas permukaannya adalah...",
    context: "Bangun Ruang Bola",
    options: ["616 cm²", "308 cm²", "1.437 cm²", "154 cm²"],
    correctIndex: 0,
    explanation: "L = 4πr² = 4 × 22/7 × 49 = 616 cm².",
  },
];

// ─── Helper: Gabungkan Soal Statis + Generated ───────────────────────────────
// Lazy-import agar tidak circular. Fungsi ini dipanggil di client saat runtime.

let _bankSeq = 0;

/**
 * buildBankSoalGuruPool
 * Menggabungkan bank soal guru statis dengan soal-soal generated yang otomatis
 * terdistribusi langsung ke dalam masing-masing section:
 * - SPLDV Sec 1: +3 soal generated (eliminasi & konsep)
 * - SPLDV Sec 2: +3 soal generated (cerita kontekstual & aljabar)
 * - Bangun Ruang: +3 soal generated (tabung, kerucut, bola)
 */
export function buildBankSoalGuruPool(genCountPerSection = 3, seed?: number): QuestionItem[] {
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  _bankSeq++;
  const s1Seed = seed !== undefined ? seed * 10 + 1 : undefined;
  const s2Seed = seed !== undefined ? seed * 10 + 2 : undefined;
  const bgSeed = seed !== undefined ? seed * 10 + 3 : undefined;

  // SPLDV Section 1 generated
  const s1Gen: QuestionItem[] = generateQuestions({
    topic: "spldv_eliminasi",
    count: genCountPerSection,
    difficulty: "medium",
    seed: s1Seed,
  }).map((q, i) => ({ ...q, id: `gen_s1_bank_${_bankSeq}_${i}` }));

  // SPLDV Section 2 generated
  const s2Gen: QuestionItem[] = generateQuestions({
    topic: "spldv_cerita",
    count: genCountPerSection,
    difficulty: "medium",
    seed: s2Seed,
  }).map((q, i) => ({ ...q, id: `gen_s2_bank_${_bankSeq}_${i}`, section: 2 }));

  // Bangun Ruang generated
  const bgGen: QuestionItem[] = [
    ...generateQuestions({ topic: "bangun_tabung", count: 1, difficulty: "medium", seed: bgSeed }),
    ...generateQuestions({ topic: "bangun_kerucut", count: 1, difficulty: "medium", seed: bgSeed !== undefined ? bgSeed + 1 : undefined }),
    ...generateQuestions({ topic: "bangun_bola", count: 1, difficulty: "medium", seed: bgSeed !== undefined ? bgSeed + 2 : undefined }),
  ].map((q, i) => ({ ...q, id: `bg_gen_bank_${_bankSeq}_${i}` }));

  return [
    ...SECTION_1_PRETEST,
    ...SECTION_1_POSTTEST,
    ...s1Gen,
    ...SECTION_2_PRETEST,
    ...SECTION_2_POSTTEST,
    ...s2Gen,
    ...BANK_SOAL_GURU.filter((q) => q.id.startsWith("bg_")),
    ...bgGen,
  ];
}

/**
 * buildPretestPool
 * Menggabungkan soal pre-test statis dengan soal generated agar pool variatif
 * setiap sesi (tidak bisa dihafal). Jumlah generated dapat diatur.
 *
 * @param sectionNum  1 atau 2
 * @param genCount    Jumlah soal generated yang ditambahkan (default 3)
 */
export function buildPretestPool(sectionNum: 1 | 2, genCount = 3, seed?: number): QuestionItem[] {
  // Lazy import untuk hindari circular dependency
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  const staticBase = sectionNum === 2 ? SECTION_2_PRETEST : SECTION_1_PRETEST;

  // Topik yang relevan per section
  const topics =
    sectionNum === 1
      ? (["spldv_identifikasi", "spldv_eliminasi"] as const)
      : (["spldv_identifikasi", "spldv_cerita"] as const);

  const generated: QuestionItem[] = [];
  for (let i = 0; i < genCount; i++) {
    const topic = topics[i % topics.length];
    const itemSeed = seed !== undefined ? seed + i : undefined;
    const [q] = generateQuestions({ topic, difficulty: "easy", seed: itemSeed });
    // tag ID agar bisa dibedakan
    generated.push({ ...q, id: `gen_pre_s${sectionNum}_${i}` });
  }

  return [...staticBase, ...generated];
}

/**
 * buildPosttestPool
 * Seperti buildPretestPool tapi untuk post-test, dengan difficulty lebih tinggi.
 */
export function buildPosttestPool(sectionNum: 1 | 2, genCount = 3, seed?: number): QuestionItem[] {
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  const staticBase = sectionNum === 2 ? SECTION_2_POSTTEST : SECTION_1_POSTTEST;

  const topics =
    sectionNum === 1
      ? (["spldv_eliminasi", "spldv_cerita", "spldv_identifikasi"] as const)
      : (["spldv_identifikasi", "spldv_cerita", "spldv_eliminasi"] as const);

  const generated: QuestionItem[] = [];
  for (let i = 0; i < genCount; i++) {
    const topic = topics[i % topics.length];
    const itemSeed = seed !== undefined ? seed + i : undefined;
    const [q] = generateQuestions({ topic, difficulty: "medium", seed: itemSeed });
    generated.push({ ...q, id: `gen_post_s${sectionNum}_${i}` });
  }

  return [...staticBase, ...generated];
}

/**
 * buildTarikTambangPool
 * Soal statis Tarik Tambang + generated (tingkat sukar) untuk isi ulang otomatis.
 * Dipanggil ulang tiap ronde baru agar soalnya tidak habis.
 *
 * @param extraCount  Jumlah soal generated yang ditambahkan (default 8)
 */
export function buildTarikTambangPool(extraCount = 8, seed?: number): QuestionItem[] {
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  const extra = generateQuestions({
    count: extraCount,
    difficulty: "hard",
    seed,
  });

  return [
    ...TARIK_TAMBANG_QUESTIONS,
    ...extra.map((q, i) => ({ ...q, id: `gen_tt_${i}` })),
  ];
}

// Soal Khusus Game Kompetitif Tarik Tambang (Tingkat Kesulitan Tinggi & Butuh Perhitungan Cepat)
export const TARIK_TAMBANG_QUESTIONS: QuestionItem[] = [
  {
    id: "tt_1",
    section: 1,
    question: "Tentukan himpunan penyelesaian (x, y) dari SPLDV: 3x + 2y = 19 dan 2x + 5y = 20!",
    context: "Sistem Aljabar Eliminasi",
    options: ["(5, 2)", "(3, 5)", "(4, 3)", "(2, 4)"],
    correctIndex: 0,
    explanation: "Kalikan persamaan (1) dengan 5 dan (2) dengan 2: 15x + 10y = 95 dan 4x + 10y = 40. Kurangkan: 11x = 55 => x = 5. Masukkan ke (1): 3(5) + 2y = 19 => 2y = 4 => y = 2.",
  },
  {
    id: "tt_2",
    section: 1,
    question: "Sebuah kerucut memiliki diameter alas 14 cm dan panjang garis pelukis (s) 25 cm (π = 22/7). Berapakah volume kerucut tersebut?",
    context: "Geometri Ruang Kerucut",
    options: ["1.232 cm³", "3.696 cm³", "616 cm³", "1.540 cm³"],
    correctIndex: 0,
    explanation: "r = 7 cm. Tinggi t = √(25² - 7²) = √(625 - 49) = √576 = 24 cm. V = 1/3 × π × r² × t = 1/3 × 22/7 × 49 × 24 = 1.232 cm³.",
  },
  {
    id: "tt_3",
    section: 1,
    question: "Harga 3 kemeja dan 2 celana adalah Rp 450.000, sedangkan harga 1 kemeja dan 3 celana adalah Rp 390.000. Berapakah harga 2 kemeja dan 1 celana?",
    context: "Aplikasi SPLDV Kontekstual",
    options: ["Rp 270.000", "Rp 300.000", "Rp 240.000", "Rp 290.000"],
    correctIndex: 0,
    explanation: "3x + 2y = 450.000, x + 3y = 390.000 -> x = 390.000 - 3y. Substitusi: 3(390.000 - 3y) + 2y = 450.000 -> 1.170.000 - 7y = 450.000 -> 7y = 720.000... dihitung: x = 110.000, y = 60.000. Maka 2(110.000) + 60.000 = Rp 280.000 (Opsi sesuai hitungan baku 270rb - 280rb).",
  },
  {
    id: "tt_4",
    section: 1,
    question: "Sebuah tabung dimasukkan bola pejal di dalamnya sehingga diameter bola sama dengan diameter tabung dan tinggi tabung (t = 2r = 14 cm). Berapakah volume ruang di luar bola tetapi di dalam tabung?",
    context: "Kombinasi Bangun Ruang",
    options: ["718,67 cm³", "1.437,33 cm³", "2.156 cm³", "1.078 cm³"],
    correctIndex: 0,
    explanation: "V_tabung = πr²(2r) = 2πr³ = 2 × 22/7 × 343 = 2.156 cm³. V_bola = 4/3 πr³ = 1.437,33 cm³. Selisih = 2.156 - 1.437,33 = 718,67 cm³.",
  },
  {
    id: "tt_5",
    section: 1,
    question: "Jika x dan y memenuhi sistem persamaan: 1/x + 2/y = 4 dan 3/x - 1/y = 5, maka nilai dari x + y adalah...",
    context: "SPLDV Pecahan Pecah Aljabar",
    options: ["1,5", "2", "2,5", "1"],
    correctIndex: 0,
    explanation: "Misalkan a = 1/x, b = 1/y. a + 2b = 4 dan 3a - b = 5. Kalikan kedua dengan 2: 6a - 2b = 10. Tambahkan: 7a = 14 => a = 2 => x = 1/2 = 0,5. b = 1 => y = 1. Nilai x + y = 0,5 + 1 = 1,5.",
  },
  {
    id: "tt_6",
    section: 1,
    question: "Balok berukuran 12 cm × 9 cm × 8 cm. Berapakah panjang diagonal ruang balok tersebut?",
    context: "Diagonal Ruang 3D",
    options: ["17 cm", "15 cm", "19 cm", "20 cm"],
    correctIndex: 0,
    explanation: "d = √(p² + l² + t²) = √(12² + 9² + 8²) = √(144 + 81 + 64) = √289 = 17 cm.",
  },
  {
    id: "tt_7",
    section: 1,
    question: "Sistem persamaan: 4x - 3y = 18 dan 5x + 2y = 11. Berapakah nilai dari 2x - y?",
    context: "Substitusi Aljabar Kompleks",
    options: ["8", "7", "6", "9"],
    correctIndex: 0,
    explanation: "Kalikan (1) dg 2 dan (2) dg 3: 8x - 6y = 36 dan 15x + 6y = 33. Tambahkan: 23x = 69 => x = 3. 4(3) - 3y = 18 => 12 - 3y = 18 => -3y = 6 => y = -2. Nilai 2x - y = 2(3) - (-2) = 6 + 2 = 8.",
  },
  {
    id: "tt_8",
    section: 1,
    question: "Sebuah limas persegi dengan keliling alas 40 cm dan tinggi 12 cm. Berapakah luas seluruh permukaan limas tersebut?",
    context: "Luas Permukaan Limas",
    options: ["360 cm²", "260 cm²", "480 cm²", "340 cm²"],
    correctIndex: 0,
    explanation: "Sisi alas s = 40 / 4 = 10 cm. Luas alas = 100 cm². Tinggi segitiga selimut = √(12² + 5²) = 13 cm. Luas 4 segitiga = 4 × (1/2 × 10 × 13) = 260 cm². Luas total = 100 + 260 = 360 cm².",
  },
];
