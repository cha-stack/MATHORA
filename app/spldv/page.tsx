"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getMateriProgress, SectionProgress, getCurrentUser } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

export default function SpldvMenuPage() {
  const { playClick } = useSound();
  const [isGuru, setIsGuru] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.role === "guru";
    }
    return false;
  });
  const [progress, setProgress] = useState<SectionProgress>({
    section1_pretest: false,
    section1_materi: false,
    section1_posttest: false,
    section2_unlocked: false,
    section2_pretest: false,
    section2_materi: false,
    section2_posttest: false,
  });

  useEffect(() => {
    const cur = getMateriProgress();
    setProgress(cur);
    const u = getCurrentUser();
    setIsGuru(u?.role === "guru");
  }, []);

  return (
    <GameShell backUrl="/materi" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Glass/Soft Card Container (Konsisten dengan konsep awal MATHORA) */}
        <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          
          {/* Header Title */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-block rounded-full bg-[#f8f298] px-4 py-1 text-xs sm:text-sm font-bold text-[#422376] mb-2 shadow">
              {isGuru ? "Modul Materi Guru" : "Alur Pembelajaran Bertingkat"}
            </span>
            <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] font-bold">
              Tahapan Materi SPLDV
            </h2>
            <p className="text-[#2a2830]/80 text-xs sm:text-base font-semibold mt-1">
              {isGuru
                ? "Sebagai guru, Anda dapat langsung meninjau modul materi atau menguji latihan soal di kelas melalui Bank Soal."
                : "Ikuti alur terstruktur: Pre-Test ➔ Materi Interaktif ➔ Post-Test untuk membuka tingkatan selanjutnya."}
            </p>
          </div>

          {/* List Section Berjejer ke Bawah */}
          <div className="flex flex-col gap-5 sm:gap-6 w-full">
            
            {/* --- SECTION 1: PENGERTIAN SPLDV --- */}
            <div className="w-full rounded-[24px] border-[5px] border-white bg-[#f8f7fc] p-5 sm:p-6 shadow-[0px_5px_0px_0px_#aaafaf] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-2xl bg-[#5e65e9] text-white font-bold game-font text-xl shadow">
                    1
                  </div>
                  <div>
                    <h3 className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                      Pengertian &amp; Metode SPLDV
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      Konsep dasar, lab grafik, metode eliminasi, substitusi, campuran, &amp; soal cerita
                    </p>
                  </div>
                </div>
                
                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                    {isGuru ? "Akses Penuh Guru" : progress.section1_posttest ? "✓ Selesai Semua" : "Tahap 1 Aktif"}
                  </span>
                </div>
              </div>

              {/* TAMPILAN GURU: Langsung tombol Materi (Pre-test & Post-test tidak perlu di Guru) */}
              {isGuru ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/spldv/materi?section=1"
                    onClick={playClick}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border-3 border-white bg-[#e05f1e] py-3 text-white font-bold text-base shadow-[0px_4px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                  >
                    <span>💡</span>
                    <span>Buka Modul Materi 1 (Pengertian SPLDV)</span>
                  </Link>
                </div>
              ) : (
                /* TAMPILAN SISWA: 3 Langkah (Pre-Test -> Materi -> Post-Test) */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Pre-Test 1 */}
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href="/spldv/pretest?section=1"
                      onClick={playClick}
                      className="flex items-center justify-between rounded-xl border-3 border-white bg-[#5e65e9] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#3d43ab] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">📝</span>
                        <span>1. Pre-Test</span>
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                        {progress.section1_pretest ? "✓ Selesai" : "Mulai"}
                      </span>
                    </Link>

                    {/* Tombol Lihat Hasil Pre-Test jika sudah selesai */}
                    {progress.section1_pretest && (
                      <Link
                        href="/spldv/hasil?section=1&type=pre"
                        onClick={playClick}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-300 bg-purple-100/90 py-1 px-2 text-xs font-bold text-purple-900 hover:bg-purple-200 transition-colors"
                      >
                        <span>📊</span>
                        <span>Lihat Hasil Pre-Test ({progress.section1_pretest_score ?? 100} Poin)</span>
                      </Link>
                    )}
                  </div>

                  {/* 2. Materi 1 */}
                  {progress.section1_pretest ? (
                    <Link
                      href="/spldv/materi?section=1"
                      onClick={playClick}
                      className="flex items-center justify-between rounded-xl border-3 border-white bg-[#e05f1e] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">💡</span>
                        <span>2. Materi</span>
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                        {progress.section1_materi ? "✓ Dipelajari" : "Buka"}
                      </span>
                    </Link>
                  ) : (
                    <div
                      title="Selesaikan Pre-Test terlebih dahulu"
                      className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔒</span>
                        <span>2. Materi</span>
                      </div>
                      <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                        Terkunci
                      </span>
                    </div>
                  )}

                  {/* 3. Post-Test 1 */}
                  <div className="flex flex-col gap-1.5">
                    {progress.section1_materi ? (
                      <Link
                        href="/spldv/posttest?section=1"
                        onClick={playClick}
                        className="flex items-center justify-between rounded-xl border-3 border-white bg-[#16a34a] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#0e6b30] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎯</span>
                          <span>3. Post-Test</span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                          {progress.section1_posttest ? "✓ Tuntas" : "Evaluasi"}
                        </span>
                      </Link>
                    ) : (
                      <div
                        title="Selesaikan Pre-Test dan pelajari Materi terlebih dahulu"
                        className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔒</span>
                          <span>3. Post-Test</span>
                        </div>
                        <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                          Terkunci
                        </span>
                      </div>
                    )}

                    {/* Tombol Lihat Hasil Post-Test jika sudah selesai */}
                    {progress.section1_posttest && (
                      <Link
                        href="/spldv/hasil?section=1&type=post"
                        onClick={playClick}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100/90 py-1 px-2 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition-colors"
                      >
                        <span>🏆</span>
                        <span>Lihat Hasil Post-Test ({progress.section1_posttest_score ?? 100} Poin)</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- SECTION 2: VARIABEL & KOEFISIEN --- */}
            <div
              className={`w-full rounded-[24px] border-[5px] p-5 sm:p-6 shadow-[0px_5px_0px_0px_#aaafaf] flex flex-col gap-4 transition-all ${
                isGuru || progress.section2_unlocked
                  ? "border-white bg-[#f8f7fc]"
                  : "border-gray-300 bg-gray-100/80 opacity-80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 sm:size-12 items-center justify-center rounded-2xl font-bold game-font text-xl shadow ${
                      isGuru || progress.section2_unlocked
                        ? "bg-[#34b2cc] text-white"
                        : "bg-gray-400 text-gray-200"
                    }`}
                  >
                    {isGuru || progress.section2_unlocked ? "2" : "🔒"}
                  </div>
                  <div>
                    <h3 className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                      Variabel, Koefisien &amp; Analisis Solusi
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      Suku aljabar, jebakan tanda negatif, uji titik (x, y), &amp; rasio koefisien solusi
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isGuru ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                      Akses Penuh Guru
                    </span>
                  ) : progress.section2_unlocked ? (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 border border-sky-300">
                      {progress.section2_posttest ? "✓ Selesai Semua" : "Tahap 2 Terbuka"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                      🔒 Terkunci (Selesaikan Post-Test 1)
                    </span>
                  )}
                </div>
              </div>

              {/* TAMPILAN GURU: Langsung tombol Materi 2 */}
              {isGuru ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link
                    href="/spldv/materi?section=2"
                    onClick={playClick}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border-3 border-white bg-[#e05f1e] py-3 text-white font-bold text-base shadow-[0px_4px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                  >
                    <span>💡</span>
                    <span>Buka Modul Materi 2 (Variabel, Koefisien & Konstanta)</span>
                  </Link>
                </div>
              ) : (
                /* TAMPILAN SISWA: 3 Langkah Section 2 */
                progress.section2_unlocked ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Pre-Test 2 */}
                    <div className="flex flex-col gap-1.5">
                      <Link
                        href="/spldv/pretest?section=2"
                        onClick={playClick}
                        className="flex items-center justify-between rounded-xl border-3 border-white bg-[#5e65e9] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#3d43ab] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📝</span>
                          <span>1. Pre-Test 2</span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                          {progress.section2_pretest ? "✓ Selesai" : "Mulai"}
                        </span>
                      </Link>

                      {/* Tombol Lihat Hasil Pre-Test 2 */}
                      {progress.section2_pretest && (
                        <Link
                          href="/spldv/hasil?section=2&type=pre"
                          onClick={playClick}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-300 bg-purple-100/90 py-1 px-2 text-xs font-bold text-purple-900 hover:bg-purple-200 transition-colors"
                        >
                          <span>📊</span>
                          <span>Lihat Hasil Pre-Test 2 ({progress.section2_pretest_score ?? 100} Poin)</span>
                        </Link>
                      )}
                    </div>

                    {/* Materi 2 */}
                    {progress.section2_pretest ? (
                      <Link
                        href="/spldv/materi?section=2"
                        onClick={playClick}
                        className="flex items-center justify-between rounded-xl border-3 border-white bg-[#e05f1e] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">💡</span>
                          <span>2. Materi 2</span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                          {progress.section2_materi ? "✓ Dipelajari" : "Buka"}
                        </span>
                      </Link>
                    ) : (
                      <div
                        title="Selesaikan Pre-Test 2 terlebih dahulu"
                        className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔒</span>
                          <span>2. Materi 2</span>
                        </div>
                        <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                          Terkunci
                        </span>
                      </div>
                    )}

                    {/* Post-Test 2 */}
                    <div className="flex flex-col gap-1.5">
                      {progress.section2_materi ? (
                        <Link
                          href="/spldv/posttest?section=2"
                          onClick={playClick}
                          className="flex items-center justify-between rounded-xl border-3 border-white bg-[#16a34a] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#0e6b30] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎯</span>
                            <span>3. Post-Test 2</span>
                          </div>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                            {progress.section2_posttest ? "✓ Tuntas" : "Evaluasi"}
                          </span>
                        </Link>
                      ) : (
                        <div
                          title="Selesaikan Pre-Test 2 dan Materi 2 terlebih dahulu"
                          className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔒</span>
                            <span>3. Post-Test 2</span>
                          </div>
                          <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                            Terkunci
                          </span>
                        </div>
                      )}

                      {/* Tombol Lihat Hasil Post-Test 2 */}
                      {progress.section2_posttest && (
                        <Link
                          href="/spldv/hasil?section=2&type=post"
                          onClick={playClick}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100/90 py-1 px-2 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition-colors"
                        >
                          <span>🏆</span>
                          <span>Lihat Hasil Post-Test 2 ({progress.section2_posttest_score ?? 100} Poin)</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl bg-gray-200/90 border-2 border-gray-300 py-3 px-4 text-xs sm:text-sm font-bold text-gray-600 text-center">
                    ⚠️ Tingkatan ini terkunci. Tuntaskan <b>Pre-Test, Materi, dan Post-Test pada Section 1</b> untuk membuka akses!
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      </div>
    </GameShell>
  );
}
