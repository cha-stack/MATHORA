export interface Question {
  id: string;
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Koleksi Bank Soal SPLDV Terstruktur & Variatif
const BASE_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "Manakah yang merupakan variabel pada persamaan 2x + 3y = 12?",
    context: "Kenali komponen pembentuk persamaan linear",
    options: ["x dan y", "2 dan 3", "12 dan +", "2x dan 3y"],
    correctIndex: 0,
    explanation: "Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya, biasanya berupa huruf seperti x dan y.",
  },
  {
    id: "q2",
    question: "Koefisien dari variabel y pada persamaan 5x - 4y = 20 adalah...",
    context: "Perhatikan tanda positif/negatif di depan angka",
    options: ["-4", "4", "5", "20"],
    correctIndex: 0,
    explanation: "Koefisien adalah angka pengali yang berada tepat di depan variabel. Karena persamaannya 5x - 4y = 20, maka angka di depan y adalah -4.",
  },
  {
    id: "q3",
    question: "Konstanta dari persamaan linear 3a + 2b - 15 = 0 jika diubah ke bentuk baku (3a + 2b = ...) adalah...",
    context: "Konstanta adalah bilangan tetap tanpa variabel",
    options: ["15", "-15", "3", "2"],
    correctIndex: 0,
    explanation: "Jika -15 dipindah ke ruas kanan, persamaannya menjadi 3a + 2b = 15. Jadi konstantanya adalah 15.",
  },
  {
    id: "q4",
    question: "Andi membeli 2 buku dan 1 pensil seharga Rp 8.000. Jika buku = b dan pensil = p, model matematikanya adalah...",
    context: "Terjemahkan kalimat sehari-hari ke dalam simbol matematika",
    options: ["2b + p = 8.000", "b + 2p = 8.000", "2b - p = 8.000", "2b + 2p = 8.000"],
    correctIndex: 0,
    explanation: "2 buku dimodelkan sebagai 2b dan 1 pensil sebagai p. Total belanja 8.000, sehingga persamaannya 2b + p = 8.000.",
  },
  {
    id: "q5",
    question: "Jika nilai x = 3 disubstitusikan ke persamaan x + y = 10, maka nilai y adalah...",
    context: "Metode substitusi nilai langsung",
    options: ["7", "6", "13", "30"],
    correctIndex: 0,
    explanation: "x + y = 10 -> 3 + y = 10 -> y = 10 - 3 = 7.",
  },
  {
    id: "q6",
    question: "Himpunan penyelesaian dari sistem persamaan x + y = 5 dan x - y = 1 adalah...",
    context: "Cari pasangan (x, y) yang memenuhi kedua persamaan",
    options: ["x = 3, y = 2", "x = 4, y = 1", "x = 2, y = 3", "x = 5, y = 0"],
    correctIndex: 0,
    explanation: "Jumlahkan kedua persamaan: (x+y) + (x-y) = 5 + 1 -> 2x = 6 -> x = 3. Maka y = 5 - 3 = 2.",
  },
  {
    id: "q7",
    question: "Metode yang menyelesaikan SPLDV dengan cara menghilangkan salah satu variabel disebut metode...",
    context: "Metode penyelesaian SPLDV",
    options: ["Eliminasi", "Substitusi", "Grafik", "Campuran"],
    correctIndex: 0,
    explanation: "Metode eliminasi bertujuan untuk menghilangkan (mengeliminasi) salah satu variabel agar variabel lainnya dapat dihitung.",
  },
  {
    id: "q8",
    question: "Grafik dari persamaan linear dua variabel berbentuk...",
    context: "Karakteristik visual persamaan berderajat satu",
    options: ["Garis lurus", "Kurva parabola", "Lingkaran", "Garis zig-zag"],
    correctIndex: 0,
    explanation: "Kata 'linear' berasal dari garis lurus. Semua persamaan berderajat satu jika digambar pada bidang kartesius akan membentuk garis lurus.",
  },
];

// Generator soal procedural dinamis (membuat soal tak terbatas secara otomatis)
export function generateProceduralQuestions(count: number = 5): Question[] {
  const generated: Question[] = [];

  // Acak template belanja SPLDV
  const items = [
    { a: "buku", b: "pensil" },
    { a: "apel", b: "jeruk" },
    { a: "roti", b: "susu" },
    { a: "donat", b: "kopi" },
  ];

  for (let i = 0; i < count; i++) {
    // Pilih acak dari BASE_QUESTIONS atau buat dinamis
    if (i < BASE_QUESTIONS.length && Math.random() > 0.4) {
      const q = BASE_QUESTIONS[i % BASE_QUESTIONS.length];
      generated.push(q);
      continue;
    }

    // Generator angka acak
    const item = items[i % items.length];
    const xVal = Math.floor(Math.random() * 5) + 2; // misal harga satuan 2.000 - 6.000 (skala ribu)
    const yVal = Math.floor(Math.random() * 4) + 1; // 1.000 - 4.000

    const qty1A = Math.floor(Math.random() * 2) + 1;
    const qty1B = Math.floor(Math.random() * 2) + 1;
    const total1 = qty1A * xVal + qty1B * yVal;

    const askItem = Math.random() > 0.5 ? item.a : item.b;
    const correctAns = askItem === item.a ? xVal * 1000 : yVal * 1000;

    const distractor1 = correctAns + 1000;
    const distractor2 = Math.max(1000, correctAns - 1000);
    const distractor3 = correctAns + 2000;

    const allOpts = [
      `Rp ${correctAns.toLocaleString("id-ID")}`,
      `Rp ${distractor1.toLocaleString("id-ID")}`,
      `Rp ${distractor2.toLocaleString("id-ID")}`,
      `Rp ${distractor3.toLocaleString("id-ID")}`,
    ].sort(() => Math.random() - 0.5);

    const cIndex = allOpts.indexOf(`Rp ${correctAns.toLocaleString("id-ID")}`);

    generated.push({
      id: `dyn_${i}_${Date.now()}`,
      question: `Harga ${qty1A} ${item.a} dan ${qty1B} ${item.b} adalah Rp ${(total1 * 1000).toLocaleString("id-ID")}. Jika harga 1 ${item.b} adalah Rp ${(yVal * 1000).toLocaleString("id-ID")}, berapakah harga 1 ${item.a}?`,
      context: "Soal Cerita Aplikasi SPLDV Sehari-hari",
      options: allOpts,
      correctIndex: cIndex,
      explanation: `Substitusikan harga ${item.b}: ${qty1A}(${item.a}) + ${qty1B}(${yVal * 1000}) = ${total1 * 1000}. Maka 1 ${item.a} = Rp ${(xVal * 1000).toLocaleString("id-ID")}.`,
    });
  }

  // Shuffle hasil akhir
  return generated.sort(() => Math.random() - 0.5);
}
