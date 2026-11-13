"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import GameShell from "@/components/GameShell";
import { getCurrentUser, getUsers, getMateriProgress } from "@/lib/auth";
import {
  isSupabaseConfigured,
  sbGetAllStudentsForTeacher,
  StudentSummary,
} from "@/lib/supabase";

export default function DashboardGuru() {
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.username || "Guru";
    }
    return "Guru";
  });

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      if (isSupabaseConfigured) {
        const cloudData = await sbGetAllStudentsForTeacher();
        setStudents(cloudData);
      } else {
        // Fallback: ambil dari localStorage jika belum pasang env Supabase
        const localUsers = getUsers().filter((u) => u.role === "siswa");
        const list: StudentSummary[] = localUsers.map((u) => {
          const prog = getMateriProgress(u.username);
          const secMap: Record<number, any> = {};
          [1, 2, 3, 4, 5].forEach((n) => {
            const st = prog.sections?.[n];
            if (st) {
              secMap[n] = {
                section_num: n,
                unlocked: st.unlocked,
                pretest: st.pretest,
                pretest_score: st.pretest_score,
                materi: st.materi,
                posttest: st.posttest,
                posttest_score: st.posttest_score,
              };
            }
          });
          const comp = Object.values(secMap).filter((s) => s.posttest).length;
          return {
            username: u.username,
            email: u.email,
            avatar: u.avatar,
            created_at: u.createdAt,
            sections: secMap,
            totalCompletedSections: comp,
          };
        });
        setStudents(list);
      }
    } catch (err) {
      console.warn("Gagal memuat rekap siswa:", err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      setDisplayName(user.username);
    }
    loadStudents();
  }, [loadStudents]);

  // Ekspor Rekap Nilai ke file CSV untuk dibuka di Microsoft Excel
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("Belum ada data siswa untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama Siswa",
      "Email",
      "Sec 1 Pre",
      "Sec 1 Post",
      "Sec 2 Pre",
      "Sec 2 Post",
      "Sec 3 Pre",
      "Sec 3 Post",
      "Sec 4 Pre",
      "Sec 4 Post",
      "Sec 5 Pre",
      "Sec 5 Post",
      "Total Selesai",
    ];

    const rows = students.map((s, idx) => {
      const g = (sec: number, type: "pre" | "post") => {
        const row = s.sections[sec];
        if (!row) return "-";
        if (type === "pre") return row.pretest ? String(row.pretest_score ?? 0) : "-";
        return row.posttest ? String(row.posttest_score ?? 0) : "-";
      };

      return [
        idx + 1,
        `"${s.username}"`,
        `"${s.email || "-"}"`,
        g(1, "pre"),
        g(1, "post"),
        g(2, "pre"),
        g(2, "post"),
        g(3, "pre"),
        g(3, "post"),
        g(4, "pre"),
        g(4, "post"),
        g(5, "pre"),
        g(5, "post"),
        `${s.totalCompletedSections}/5 Tahap`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_MATHORA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter((s) =>
    s.username.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <GameShell backUrl="/login" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Welcome Header */}
        <div className="w-full text-left px-2 sm:px-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-block rounded-full bg-[#1cd8a4] px-4 py-1 text-xs sm:text-sm font-bold text-[#144837] shadow">
              Panel Pendidik & Pengampu • SMP Islam Parung
            </div>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-800 shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Database: Supabase Cloud Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-bold text-amber-800 shadow-xs">
                <span className="size-2 rounded-full bg-amber-500" />
                Database: Mode Lokal (Belum terhubung ke Supabase)
              </span>
            )}
          </div>
          <h2 className="game-font text-3xl sm:text-5xl text-white font-bold mb-2">
            Halo {displayName},
          </h2>
          <p className="text-white/90 text-lg sm:text-2xl font-medium">
            Kelola pembelajaran kelas, bank soal kuis, dan pantau game kompetitif tim.
          </p>
        </div>

        {/* 3 Main Action Cards for Teacher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-2 mb-10">
          {/* Card 1: Kuis & Bank Soal */}
          <Link
            href="/bank-soal"
            className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#f8f298] p-6 shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-[#e05f1e] px-3 py-1 text-xs font-bold text-white shadow">
                  Fitur Guru
                </span>
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Kuis & Bank Soal
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Akses bank soal lengkap dengan fitur <b>&quot;Tampilkan Hasil&quot;</b> untuk menyorot kunci jawaban benar (warna hijau).
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between font-bold text-[#e05f1e] text-sm group-hover:translate-x-1 transition-transform pt-3 border-t border-amber-300">
              <span>Buka Bank Soal &rarr;</span>
            </div>
          </Link>

          {/* Card 2: Game Kompetitif (Tarik Tambang Online) */}
          <Link
            href="/game-kompetitif"
            className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#ffd3d3] p-6 shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-[#ef4444] px-3 py-1 text-xs font-bold text-white shadow">
                  Aktivitas Tim Kelas
                </span>
                <span className="text-3xl">🚩</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Game Kompetitif
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Tarik Tambang Matematika antar tim siswa. Adu cepat dan tepat menyelesaikan soal SPLDV & Bangun Ruang secara seru!
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between font-bold text-[#ef4444] text-sm group-hover:translate-x-1 transition-transform pt-3 border-t border-rose-300">
              <span>Mulai Tarik Tambang &rarr;</span>
            </div>
          </Link>

          {/* Card 3: Modul Materi (SPLDV & Bangun Ruang) */}
          <Link
            href="/materi"
            className="group relative flex flex-col justify-between rounded-[32px] border-[7px] border-white bg-[#d3e9ff] p-6 shadow-[0px_7px_0px_0px_#aaafaf] transition-all hover:scale-103 active:translate-y-1 active:shadow-none cursor-pointer min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-[#0284c7] px-3 py-1 text-xs font-bold text-white shadow">
                  Kurikulum
                </span>
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="game-font text-2xl sm:text-3xl text-[#2a2830] font-bold mb-2">
                Modul Materi
              </h3>
              <p className="text-[#2a2830]/85 text-xs sm:text-sm font-semibold leading-relaxed">
                Akses materi lengkap berisi kartu SPLDV bertingkat serta visualisasi 3D Bangun Ruang interaktif.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between font-bold text-[#0284c7] text-sm group-hover:translate-x-1 transition-transform pt-3 border-t border-sky-300">
              <span>Lihat Materi &rarr;</span>
            </div>
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            PANEL REKAP PROGRES & NILAI SISWA (SUPABASE LIVE MONITORING)
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-6xl px-2">
          <div className="rounded-[32px] border-[7px] border-white bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xs flex flex-col">
            
            {/* Header Bagian Rekap */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-purple-100">
              <div>
                <span className="inline-block rounded-full bg-purple-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  📊 Evaluasi Pembelajaran Siswa
                </span>
                <h3 className="game-font text-2xl sm:text-3xl font-bold text-[#2a2830]">
                  Rekap Nilai & Progres Siswa
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-0.5">
                  Pantau capaian Pre-Test, pemahaman Materi, dan Post-Test setiap siswa di kelas secara real-time.
                </p>
              </div>

              {/* Tombol Aksi: Refresh & Export CSV */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  className="flex items-center gap-1.5 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 px-4 py-2 text-xs sm:text-sm font-bold text-purple-900 shadow-sm active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
                  title="Muat ulang data terbaru"
                >
                  <span className={loadingStudents ? "animate-spin" : ""}>🔄</span>
                  <span>{loadingStudents ? "Memuat..." : "Segarkan"}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 rounded-2xl border-3 border-white bg-[#55d274] hover:bg-[#3db85c] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0px_3px_0px_0px_#277e3d] active:translate-y-0.5 transition-all cursor-pointer"
                  title="Unduh seluruh rekap nilai dalam format Excel / CSV"
                >
                  <span>📥</span>
                  <span>Unduh Rekap Excel (CSV)</span>
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa..."
                  className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 pl-9 text-xs sm:text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
                />
                <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
              </div>
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                Total: {filteredStudents.length} siswa
              </span>
            </div>

            {/* Tabel Data Rekap Siswa */}
            <div className="w-full overflow-x-auto rounded-2xl border border-purple-200 shadow-inner">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#e5dbf5] text-[#2a2830] font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  <tr>
                    <th className="py-3 px-3">Siswa</th>
                    <th className="py-3 px-2 text-center">Tahap 1</th>
                    <th className="py-3 px-2 text-center">Tahap 2</th>
                    <th className="py-3 px-2 text-center">Tahap 3</th>
                    <th className="py-3 px-2 text-center">Tahap 4</th>
                    <th className="py-3 px-2 text-center">Tahap 5</th>
                    <th className="py-3 px-3 text-center">Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 bg-white">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 font-semibold">
                        ⏳ Menghubungkan ke database Supabase...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 font-semibold">
                        {searchQuery ? "Tidak ada siswa yang cocok dengan pencarian." : "Belum ada siswa yang mendaftar."}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      return (
                        <tr key={s.username} className="hover:bg-purple-50/50 transition-colors">
                          {/* Nama & Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative size-8 sm:size-9 rounded-full overflow-hidden border-2 border-purple-300 bg-purple-100 shrink-0">
                                <Image
                                  src={s.avatar || "/images/avatar-1.svg"}
                                  alt={s.username}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#2a2830] text-sm">
                                  {s.username}
                                </span>
                                {s.email && (
                                  <span className="text-[10px] text-gray-500 truncate max-w-[140px]">
                                    {s.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Section 1 s/d 5 Badges */}
                          {[1, 2, 3, 4, 5].map((secNum) => {
                            const sec = s.sections[secNum];
                            if (!sec) {
                              return (
                                <td key={secNum} className="py-3 px-2 text-center text-gray-300">
                                  -
                                </td>
                              );
                            }

                            return (
                              <td key={secNum} className="py-3 px-2 text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  {sec.posttest ? (
                                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                                      Post: {sec.posttest_score ?? 100}
                                    </span>
                                  ) : sec.materi ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold text-[10px]">
                                      Materi 📖
                                    </span>
                                  ) : sec.pretest ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px]">
                                      Pre: {sec.pretest_score ?? 0}
                                    </span>
                                  ) : sec.unlocked ? (
                                    <span className="text-gray-400 text-xs">Mulai</span>
                                  ) : (
                                    <span className="text-gray-300 text-xs">🔒</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          {/* Status Kelulusan */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                s.totalCompletedSections === 5
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : s.totalCompletedSections > 0
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {s.totalCompletedSections}/5 Selesai
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Petunjuk Penggunaan bagi Guru */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
              <span>
                💡 Nilai terupdate otomatis setiap kali siswa menyelesaikan Pre-Test atau Post-Test dari HP mereka.
              </span>
              <span>
                Format CSV dapat langsung dibuka di Microsoft Excel atau Google Sheets.
              </span>
            </div>

          </div>
        </div>

      </div>
    </GameShell>
  );
}
