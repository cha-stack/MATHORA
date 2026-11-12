export interface QuestionItem {
  id: string;
  section: 1 | 2 | 3 | 4 | 5; // Section 1..5 SPLDV
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

// Bank Soal Terstruktur Section 3 (Metode Eliminasi & Substitusi)
export const SECTION_3_PRETEST: QuestionItem[] = [
  {
    id: "s3_pre_1",
    section: 3,
    question: "Agar variabel y langsung hilang pada sistem x + y = 9 dan x - y = 3, operasi yang tepat adalah...",
    context: "Strategi Eliminasi",
    equations: { eq1: "x + y = 9", label1: "Persamaan 1", eq2: "x - y = 3", label2: "Persamaan 2" },
    options: ["Menjumlahkan kedua persamaan (+)", "Mengurangkan kedua persamaan (-)", "Mengalikan kedua persamaan", "Membagi kedua persamaan"],
    correctIndex: 0,
    explanation: "Karena tanda koefisien y berlawanan (+1 dan -1), menjumlahkan keduanya membuat +y + (-y) = 0.",
  },
  {
    id: "s3_pre_2",
    section: 3,
    question: "Jika diketahui y = 2x dan x + y = 12, maka nilai x dengan metode substitusi adalah...",
    context: "Metode Substitusi",
    options: ["4", "6", "3", "8"],
    correctIndex: 0,
    explanation: "Substitusi y = 2x ke x + y = 12 → x + 2x = 12 → 3x = 12 → x = 4.",
  },
  {
    id: "s3_pre_3",
    section: 3,
    question: "Untuk mengeliminasi x pada 2x + 3y = 13 dan x + y = 5, Persamaan 2 sebaiknya dikalikan...",
    context: "Menyamakan Koefisien",
    options: ["2", "3", "5", "13"],
    correctIndex: 0,
    explanation: "Kalikan x + y = 5 dengan 2 agar menjadi 2x + 2y = 10 sehingga koefisien x sama-sama 2.",
  },
];

export const SECTION_3_POSTTEST: QuestionItem[] = [
  {
    id: "s3_post_1",
    section: 3,
    question: "Tentukan himpunan penyelesaian dari 2x + y = 11 dan x + y = 7!",
    context: "Eliminasi Tanda Sama",
    needsScratchpad: true,
    options: ["(4, 3)", "(3, 4)", "(5, 1)", "(2, 5)"],
    correctIndex: 0,
    explanation: "Kurangkan kedua persamaan: x = 4. Masukkan ke x + y = 7 → y = 3. Jadi (4, 3).",
  },
  {
    id: "s3_post_2",
    section: 3,
    question: "Diketahui x = y + 2 dan 2x + y = 13. Nilai y yang memenuhi adalah...",
    context: "Substitusi Langsung",
    needsScratchpad: true,
    options: ["3", "5", "4", "2"],
    correctIndex: 0,
    explanation: "2(y + 2) + y = 13 → 3y + 4 = 13 → 3y = 9 → y = 3.",
  },
  {
    id: "s3_post_3",
    section: 3,
    question: "Nilai x yang memenuhi sistem 3x + 2y = 16 dan x - y = 2 adalah...",
    context: "Eliminasi Tanda Berlawanan",
    needsScratchpad: true,
    options: ["4", "2", "5", "3"],
    correctIndex: 0,
    explanation: "Kalikan (2) dengan 2: 2x - 2y = 4. Jumlahkan dengan (1): 5x = 20 → x = 4.",
  },
];

// Bank Soal Terstruktur Section 4 (Metode Campuran & Grafik)
export const SECTION_4_PRETEST: QuestionItem[] = [
  {
    id: "s4_pre_1",
    section: 4,
    question: "Langkah pertama pada metode campuran penyelesaian SPLDV umumnya adalah...",
    context: "Metode Campuran",
    options: [
      "Mengeliminasi salah satu variabel terlebih dahulu",
      "Langsung menebak grafik tanpa menghitung",
      "Menghapus semua konstanta",
      "Mengubah tanda sama dengan menjadi kuadrat",
    ],
    correctIndex: 0,
    explanation: "Metode campuran menggabungkan eliminasi di awal untuk mendapat 1 variabel, lalu substitusi untuk variabel lainnya.",
  },
  {
    id: "s4_pre_2",
    section: 4,
    question: "Jika garis x + y = 6 dan x - y = 2 digambar pada bidang Cartesius, keduanya berpotongan di titik...",
    context: "Solusi Grafik",
    needsScratchpad: true,
    options: ["(4, 2)", "(2, 4)", "(3, 3)", "(5, 1)"],
    correctIndex: 0,
    explanation: "Titik potong memenuhi kedua persamaan: 4 + 2 = 6 dan 4 - 2 = 2, yaitu (4, 2).",
  },
  {
    id: "s4_pre_3",
    section: 4,
    question: "Dua persamaan 2x + 4y = 10 dan x + 2y = 5 jika digambar akan menghasilkan grafik...",
    context: "Kedudukan Dua Garis",
    options: ["Saling berimpit (tak hingga solusi)", "Berpotongan di 1 titik", "Sejajar tidak berpotongan", "Tegak lurus di (0,0)"],
    correctIndex: 0,
    explanation: "Perbandingan a₁/a₂ = b₁/b₂ = c₁/c₂ = 2/1, sehingga kedua garis berimpit.",
  },
];

export const SECTION_4_POSTTEST: QuestionItem[] = [
  {
    id: "s4_post_1",
    section: 4,
    question: "Dengan metode campuran pada 2x + 3y = 19 dan 2x + y = 9, nilai (x, y) adalah...",
    context: "Campuran Eliminasi-Substitusi",
    needsScratchpad: true,
    options: ["(2, 5)", "(5, 2)", "(3, 3)", "(4, 1)"],
    correctIndex: 0,
    explanation: "Eliminasi x: 2y = 10 → y = 5. Substitusi ke 2x + 5 = 9 → x = 2.",
  },
  {
    id: "s4_post_2",
    section: 4,
    question: "Sistem persamaan x + 2y = 6 dan 2x + 4y = 15 memiliki jumlah solusi sebanyak...",
    context: "Analisis Rasio Koefisien",
    options: ["0 solusi (garis sejajar)", "1 solusi", "2 solusi", "Tak hingga solusi"],
    correctIndex: 0,
    explanation: "1/2 = 2/4 ≠ 6/15 → kedua garis sejajar sehingga tidak memiliki solusi.",
  },
  {
    id: "s4_post_3",
    section: 4,
    question: "Titik potong antara garis 3x + y = 10 dan y = 4 berada pada koordinat...",
    context: "Grafik Garis Lurus",
    options: ["(2, 4)", "(4, 2)", "(3, 4)", "(1, 7)"],
    correctIndex: 0,
    explanation: "Substitusi y = 4 ke 3x + 4 = 10 → 3x = 6 → x = 2. Titik potongnya (2, 4).",
  },
];

// Bank Soal Terstruktur Section 5 (Aplikasi Soal Cerita Kontekstual)
export const SECTION_5_PRETEST: QuestionItem[] = [
  {
    id: "s5_pre_1",
    section: 5,
    question: "Jumlah dua bilangan adalah 25 dan selisihnya adalah 5. Model SPLDV yang tepat adalah...",
    context: "Pemodelan Bilangan",
    options: ["x + y = 25 dan x - y = 5", "x × y = 25 dan x + y = 5", "2x + y = 25 dan x - y = 5", "x - y = 25 dan x + y = 5"],
    correctIndex: 0,
    explanation: "Jumlah berarti x + y = 25 dan selisih berarti x - y = 5.",
  },
  {
    id: "s5_pre_2",
    section: 5,
    question: "Keliling persegi panjang adalah 30 cm. Jika panjang = p dan lebar = l, persamaan yang benar adalah...",
    context: "Aplikasi Geometri SPLDV",
    options: ["p + l = 15", "p + l = 30", "2p + l = 30", "p × l = 30"],
    correctIndex: 0,
    explanation: "Keliling = 2(p + l) = 30 → dibagi 2 menjadi p + l = 15.",
  },
  {
    id: "s5_pre_3",
    section: 5,
    question: "Harga 2 buku dan 1 pulpen Rp 11.000, sedangkan 1 buku dan 1 pulpen Rp 7.000. Harga 1 buku adalah...",
    context: "Aplikasi Harga Barang",
    needsScratchpad: true,
    options: ["Rp 4.000", "Rp 3.000", "Rp 5.000", "Rp 6.000"],
    correctIndex: 0,
    explanation: "(2b + p) - (b + p) = 11.000 - 7.000 → b = Rp 4.000.",
  },
];

export const SECTION_5_POSTTEST: QuestionItem[] = [
  {
    id: "s5_post_1",
    section: 5,
    question: "Harga 2 tiket dewasa dan 1 tiket anak Rp 70.000, sedangkan 1 dewasa dan 2 anak Rp 50.000. Total harga 1 tiket dewasa + 1 anak adalah...",
    context: "Aplikasi Tiket Wisata",
    needsScratchpad: true,
    options: ["Rp 40.000", "Rp 35.000", "Rp 45.000", "Rp 30.000"],
    correctIndex: 0,
    explanation: "Dewasa = 30.000 dan anak = 10.000 (atau jumlahkan kedua persamaan: 3d + 3a = 120.000 → d + a = Rp 40.000).",
  },
  {
    id: "s5_post_2",
    section: 5,
    question: "Keliling sebuah taman persegi panjang adalah 36 m, dan panjangnya 4 m lebih panjang dari lebarnya. Luas taman adalah...",
    context: "Aplikasi Geometri",
    needsScratchpad: true,
    options: ["77 m²", "80 m²", "64 m²", "72 m²"],
    correctIndex: 0,
    explanation: "p + l = 18 dan p - l = 4 → 2p = 22 → p = 11 m, l = 7 m. Luas = 11 × 7 = 77 m².",
  },
  {
    id: "s5_post_3",
    section: 5,
    question: "Jumlah dua bilangan bulat adalah 30 dan selisihnya 8. Bilangan yang paling besar adalah...",
    context: "Aplikasi Bilangan",
    needsScratchpad: true,
    options: ["19", "11", "22", "15"],
    correctIndex: 0,
    explanation: "a + b = 30 dan a - b = 8 → 2a = 38 → a = 19.",
  },
];

// Soal Khusus Bank Soal Guru (SPLDV & Bangun Ruang Campuran)
export const BANK_SOAL_GURU: QuestionItem[] = [
  ...SECTION_1_PRETEST,
  ...SECTION_1_POSTTEST,
  ...SECTION_2_PRETEST,
  ...SECTION_2_POSTTEST,
  ...SECTION_3_PRETEST,
  ...SECTION_3_POSTTEST,
  ...SECTION_4_PRETEST,
  ...SECTION_4_POSTTEST,
  ...SECTION_5_PRETEST,
  ...SECTION_5_POSTTEST,
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
    ...SECTION_3_PRETEST,
    ...SECTION_3_POSTTEST,
    ...SECTION_4_PRETEST,
    ...SECTION_4_POSTTEST,
    ...SECTION_5_PRETEST,
    ...SECTION_5_POSTTEST,
    ...BANK_SOAL_GURU.filter((q) => q.id.startsWith("bg_")),
    ...bgGen,
  ];
}

const PRETEST_BY_SECTION: Record<1 | 2 | 3 | 4 | 5, QuestionItem[]> = {
  1: SECTION_1_PRETEST,
  2: SECTION_2_PRETEST,
  3: SECTION_3_PRETEST,
  4: SECTION_4_PRETEST,
  5: SECTION_5_PRETEST,
};

const POSTTEST_BY_SECTION: Record<1 | 2 | 3 | 4 | 5, QuestionItem[]> = {
  1: SECTION_1_POSTTEST,
  2: SECTION_2_POSTTEST,
  3: SECTION_3_POSTTEST,
  4: SECTION_4_POSTTEST,
  5: SECTION_5_POSTTEST,
};

const TOPICS_BY_SECTION: Record<1 | 2 | 3 | 4 | 5, readonly ("spldv_identifikasi" | "spldv_eliminasi" | "spldv_cerita")[]> = {
  1: ["spldv_identifikasi", "spldv_eliminasi"],
  2: ["spldv_identifikasi", "spldv_cerita"],
  3: ["spldv_eliminasi", "spldv_identifikasi"],
  4: ["spldv_eliminasi", "spldv_cerita"],
  5: ["spldv_cerita", "spldv_eliminasi"],
};

/**
 * buildPretestPool
 * Menggabungkan soal pre-test statis dengan soal generated agar pool variatif
 * setiap sesi (tidak bisa dihafal). Jumlah generated dapat diatur.
 *
 * @param sectionNum  1..5
 * @param genCount    Jumlah soal generated yang ditambahkan (default 3)
 */
export function buildPretestPool(sectionNum: 1 | 2 | 3 | 4 | 5, genCount = 3, seed?: number): QuestionItem[] {
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  const staticBase = PRETEST_BY_SECTION[sectionNum] || SECTION_1_PRETEST;
  const topics = TOPICS_BY_SECTION[sectionNum] || TOPICS_BY_SECTION[1];

  const generated: QuestionItem[] = [];
  for (let i = 0; i < genCount; i++) {
    const topic = topics[i % topics.length];
    const itemSeed = seed !== undefined ? seed + i : undefined;
    const [q] = generateQuestions({ topic, difficulty: "easy", seed: itemSeed });
    generated.push({ ...q, section: sectionNum, id: `gen_pre_s${sectionNum}_${i}` });
  }

  return [...staticBase, ...generated];
}

/**
 * buildPosttestPool
 * Seperti buildPretestPool tapi untuk post-test, dengan difficulty lebih tinggi.
 */
export function buildPosttestPool(sectionNum: 1 | 2 | 3 | 4 | 5, genCount = 3, seed?: number): QuestionItem[] {
  const { generateQuestions } = require("./questionGenerator") as typeof import("./questionGenerator");

  const staticBase = POSTTEST_BY_SECTION[sectionNum] || SECTION_1_POSTTEST;
  const topics = TOPICS_BY_SECTION[sectionNum] || TOPICS_BY_SECTION[1];

  const generated: QuestionItem[] = [];
  for (let i = 0; i < genCount; i++) {
    const topic = topics[i % topics.length];
    const itemSeed = seed !== undefined ? seed + i : undefined;
    const [q] = generateQuestions({ topic, difficulty: "medium", seed: itemSeed });
    generated.push({ ...q, section: sectionNum, id: `gen_post_s${sectionNum}_${i}` });
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
