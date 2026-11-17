# MATHORA - Media Pembelajaran Matematika Interaktif
> **Program Pengabdian kepada Masyarakat (PKM) • Mitra: SMP Islam Parung**  
> **Link Live Demo:** [https://mathora-kpdj.vercel.app](https://mathora-kpdj.vercel.app)

---

## 📌 Deskripsi Proyek
**Mathora** adalah platform media pembelajaran matematika digital berbasis web yang dirancang khusus untuk membantu siswa SMP (khususnya SMP Islam Parung) dalam memahami materi matematika yang bersifat abstrak menjadi konkret dan interaktif.

Platform ini mengintegrasikan dua materi pokok:
1. **Sistem Persamaan Linear Dua Variabel (SPLDV):** Dilengkapi modul bertingkat (5 Section), Simulator Campuran Belanja (metode eliminasi & substitusi), Lab Grafik Interaktif, serta Pre-test dan Post-test dengan pembahasan soal per langkah (*step-by-step review*).
2. **Geometri Bangun Ruang Sisi Lengkung & Datar:** Visualisasi 3D interaktif yang dapat diputar 360°, fitur buka-tutup jaring-jaring secara *real-time*, serta kalkulator simulasi rumus volume dan luas permukaan.
3. **Studio Karakter 2D (ChibiForge):** Fitur kustomisasi avatar pelajar 2D yang terhubung langsung ke profil pengguna.
4. **Game Kompetitif Kelas (Tarik Tambang Online):** Aktivitas interaktif kompetitif kelas untuk menguji kecepatan dan ketepatan siswa menyelesaikan persoalan matematika.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)
* **Frontend Framework:** Next.js 16.4 (App Router) & React 19
* **Styling & UI:** Tailwind CSS v4, Lucide Icons, Custom Retro Arcade UI
* **State & Data Management:** TanStack React Query v5, Zustand, Client Cookie Sync
* **Database & Autentikasi:** PostgreSQL / Supabase Cloud (dengan dukungan Fallback Local Storage Offline)
* **Hosting & Deployment:** Vercel Cloud Platform (CI/CD otomatis)

---

## 📂 Struktur Direktori Proyek

```
edugame/
├── app/                        # Next.js App Router Pages
│   ├── auth/callback/          # Handler OAuth Google Callback
│   ├── bangun-ruang/materi/    # Laboratorium Visualisasi 3D Bangun Ruang
│   ├── bank-soal/              # Modul Bank Soal Guru & Generator Kuis
│   ├── dashboard/guru/         # Panel Dashboard Guru
│   ├── dashboard/siswa/        # Panel Dashboard Siswa
│   ├── game-kompetitif/        # Permainan Tarik Tambang Tim Kelas
│   ├── login/                  # Portal Autentikasi (Guru, Siswa, Registrasi)
│   ├── materi/                 # Gerbang Pemilihan Materi Utama
│   ├── settings/               # Pengaturan Akun, Audio BGM & Studio Karakter
│   └── spldv/                  # Laboratorium SPLDV, Pre-test & Post-test
├── components/                 # Komponen UI Reusable (GameShell, Canvas, Review)
├── lib/                        # Utilitas Logika (Auth, Supabase, Crypto, Questions)
├── public/                     # Aset Statis (Audio BGM/SFX, Gambar, Karakter 2D)
├── supabase/
│   └── schema.sql              # SKRIP SKEMA DATABASE LENGKAP (POSTGRESQL)
├── .env.example                # Panduan Variabel Lingkungan
├── package.json                # Daftar Dependensi Proyek
└── README.md                   # Dokumentasi Proyek Ini
```

---

## 🗄️ Database & Skema (PostgreSQL / Supabase)

Skrip SQL lengkap untuk membuat struktur tabel, indeks, hak akses (*grant*), kebijakan keamanan (*Row Level Security / RLS*), dan data awal (*seed data*) tersimpan di file:
📁 **`supabase/schema.sql`**

### Struktur Tabel Utama:
1. **`public.users`**: Menyimpan kredensial akun pengguna, role (`siswa` / `guru`), email, dan avatar profil.
2. **`public.section_progress`**: Mencatat progres pembelajaran siswa per section SPLDV, status kunci materi, skor pre-test, dan skor post-test.
3. **`public.game_scores`**: Mencatat riwayat pertandingan dan skor aktivitas game kompetitif tarik tambang.

### Akun Uji Coba (Seed Data):
Untuk keperluan testing dan peninjauan oleh dosen/penguji:
* **Akun Guru:** 
  - Username: `adminguru`
  - Password: `guru123`
  - Role: `guru`
* **Akun Siswa:** 
  - Username: `siswa1`
  - Password: `siswa123`
  - Role: `siswa`

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### 1. Prasyarat Sistem
* Node.js versi 18.18 atau lebih baru (disarankan Node.js v20+)
* npm (bawaan Node.js)

### 2. Langkah Instalasi

1. **Ekstrak file ZIP proyek** ke folder pilihan Anda di laptop/komputer.
2. Buka terminal (CMD / PowerShell / Bash) di dalam folder proyek `edugame`.
3. Pasang semua pustaka dependensi:
   ```bash
   npm install
   ```
4. Buat file `.env.local` dengan menyalin contoh dari `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   *(Opsional: Jika ingin menghubungkan ke database Supabase sendiri, masukkan URL dan Anon Key Supabase Anda di file tersebut).*

### 3. Menjalankan Server Pengembangan (Development Mode)
```bash
npm run dev
```
Buka browser dan akses: **`http://localhost:3000`**

### 4. Menjalankan Server Produksi (Production Mode - Disarankan untuk Demo)
Untuk performa paling optimal dan responsif tanpa *hot-reload lag*:
```bash
npm run build
npm run start
```
Buka browser dan akses: **`http://localhost:3000`**

---

## 👥 Tim Pengembang
* **Program:** Pengabdian kepada Masyarakat (PKM)
* **Tahun Kegiatan:** 2026
* **Mitra Pengabdian:** SMP Islam Parung
