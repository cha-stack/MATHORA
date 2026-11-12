"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameShell from "@/components/GameShell";
import { getSectionState, SingleSectionProgress, getCurrentUser } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

interface SectionMeta {
  num: 1 | 2 | 3 | 4 | 5;
  title: string;
  desc: string;
  badgeColor: string;
  guruBtnLabel: string;
}

const SPLDV_SECTIONS: SectionMeta[] = [
  {
    num: 1,
    title: "Pengertian & Konsep SPLDV",
    desc: "Konsep dasar persamaan linear dua variabel, ciri SPLDV vs bukan SPLDV, & simulasi koperasi",
    badgeColor: "bg-[#5e65e9]",
    guruBtnLabel: "Buka Modul Materi 1 (Pengertian SPLDV)",
  },
  {
    num: 2,
    title: "Variabel, Koefisien & Konstanta",
    desc: "Anatomi bentuk baku ax + by = c, jebakan tanda negatif, bentuk tak baku, & uji solusi (x, y)",
    badgeColor: "bg-[#34b2cc]",
    guruBtnLabel: "Buka Modul Materi 2 (Variabel, Koefisien & Konstanta)",
  },
  {
    num: 3,
    title: "Metode Eliminasi & Substitusi",
    desc: "Menyamakan koefisien, aturan 'Sama Kurang Beda Tambah', & metode substitusi langkah demi langkah",
    badgeColor: "bg-[#e05f1e]",
    guruBtnLabel: "Buka Modul Materi 3 (Eliminasi & Substitusi)",
  },
  {
    num: 4,
    title: "Metode Campuran & Grafik",
    desc: "Gabungan eliminasi-substitusi, lab grafik Cartesius, serta analisis 1 solusi, sejajar, & berimpit",
    badgeColor: "bg-[#8b5cf6]",
    guruBtnLabel: "Buka Modul Materi 4 (Campuran & Grafik)",
  },
  {
    num: 5,
    title: "Aplikasi Soal Cerita Kontekstual",
    desc: "Pemodelan masalah nyata: harga barang, tiket wisata, selisih bilangan, umur, & keliling geometri",
    badgeColor: "bg-[#16a34a]",
    guruBtnLabel: "Buka Modul Materi 5 (Soal Cerita SPLDV)",
  },
];

export default function SpldvMenuPage() {
  const { playClick } = useSound();
  const [isGuru, setIsGuru] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()?.role === "guru";
    }
    return false;
  });

  const [secStates, setSecStates] = useState<Record<number, SingleSectionProgress>>({
    1: { unlocked: true, pretest: false, materi: false, posttest: false },
    2: { unlocked: false, pretest: false, materi: false, posttest: false },
    3: { unlocked: false, pretest: false, materi: false, posttest: false },
    4: { unlocked: false, pretest: false, materi: false, posttest: false },
    5: { unlocked: false, pretest: false, materi: false, posttest: false },
  });

  useEffect(() => {
    const u = getCurrentUser();
    setIsGuru(u?.role === "guru");
    setSecStates({
      1: getSectionState(1),
      2: getSectionState(2),
      3: getSectionState(3),
      4: getSectionState(4),
      5: getSectionState(5),
    });
  }, []);

  return (
    <GameShell backUrl="/materi" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Glass/Soft Card Container */}
        <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          {/* Header Title */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-block rounded-full bg-[#f8f298] px-4 py-1 text-xs sm:text-sm font-bold text-[#422376] mb-2 shadow">
              {isGuru ? "Modul Materi Guru (5 Tahap)" : "Alur Pembelajaran Bertingkat (5 Tahap)"}
            </span>
            <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] font-semibold">
              Tahapan Materi SPLDV
            </h2>
            <p className="text-[#2a2830]/80 text-xs sm:text-base font-semibold mt-1">
              {isGuru
                ? "Sebagai guru, Anda dapat langsung meninjau seluruh 5 bagian materi atau menguji latihan soal lewat Bank Soal."
                : "Ikuti alur terstruktur: Pre-Test ➔ Materi Interaktif ➔ Post-Test untuk membuka tingkatan berikutnya."}
            </p>
          </div>

          {/* List 5 Section Berjejer ke Bawah */}
          <div className="flex flex-col gap-5 sm:gap-6 w-full">
            {SPLDV_SECTIONS.map((sec) => {
              const st = secStates[sec.num] || {
                unlocked: sec.num === 1,
                pretest: false,
                materi: false,
                posttest: false,
              };
              const isOpen = isGuru || st.unlocked;

              return (
                <div
                  key={sec.num}
                  className={`w-full rounded-[24px] border-[5px] p-5 sm:p-6 shadow-[0px_5px_0px_0px_#aaafaf] flex flex-col gap-4 transition-all ${
                    isOpen
                      ? "border-white bg-[#f8f7fc]"
                      : "border-gray-300 bg-gray-100/80 opacity-85"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-2xl font-bold game-font text-xl shadow ${
                          isOpen ? `${sec.badgeColor} text-white` : "bg-gray-400 text-gray-200"
                        }`}
                      >
                        {isOpen ? sec.num : "🔒"}
                      </div>
                      <div>
                        <h3 className="game-font text-xl sm:text-2xl text-[#2a2830] font-semibold">
                          {sec.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                          {sec.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {isGuru ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                          Akses Penuh Guru
                        </span>
                      ) : st.posttest ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                          ✓ Selesai Semua
                        </span>
                      ) : isOpen ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 border border-sky-300">
                          Tahap {sec.num} Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                          🔒 Terkunci (Selesaikan Post-Test {sec.num - 1})
                        </span>
                      )}
                    </div>
                  </div>

                  {isGuru ? (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Link
                        href={`/spldv/materi?section=${sec.num}`}
                        onClick={playClick}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-3 border-white bg-[#e05f1e] py-3 px-4 text-white font-bold text-sm sm:text-base shadow-[0px_4px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                      >
                        <span>💡</span>
                        <span>{sec.guruBtnLabel}</span>
                      </Link>
                    </div>
                  ) : isOpen ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Pre-Test */}
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/spldv/pretest?section=${sec.num}`}
                          onClick={playClick}
                          className="flex items-center justify-between rounded-xl border-3 border-white bg-[#5e65e9] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#3d43ab] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">📝</span>
                            <span>1. Pre-Test {sec.num}</span>
                          </div>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                            {st.pretest ? "✓ Selesai" : "Mulai"}
                          </span>
                        </Link>

                        {st.pretest && (
                          <Link
                            href={`/spldv/hasil?section=${sec.num}&type=pre`}
                            onClick={playClick}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-300 bg-purple-100/90 py-1 px-2 text-xs font-bold text-purple-900 hover:bg-purple-200 transition-colors"
                          >
                            <span>📊</span>
                            <span>Hasil Pre-Test ({st.pretest_score ?? 100} Poin)</span>
                          </Link>
                        )}
                      </div>

                      {/* 2. Materi */}
                      {st.pretest ? (
                        <Link
                          href={`/spldv/materi?section=${sec.num}`}
                          onClick={playClick}
                          className="flex items-center justify-between rounded-xl border-3 border-white bg-[#e05f1e] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#9c3d0e] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none self-start"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">💡</span>
                            <span>2. Materi {sec.num}</span>
                          </div>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                            {st.materi ? "✓ Dipelajari" : "Buka"}
                          </span>
                        </Link>
                      ) : (
                        <div
                          title={`Selesaikan Pre-Test ${sec.num} terlebih dahulu`}
                          className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed self-start"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔒</span>
                            <span>2. Materi {sec.num}</span>
                          </div>
                          <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                            Terkunci
                          </span>
                        </div>
                      )}

                      {/* 3. Post-Test */}
                      <div className="flex flex-col gap-1.5">
                        {st.materi ? (
                          <Link
                            href={`/spldv/posttest?section=${sec.num}`}
                            onClick={playClick}
                            className="flex items-center justify-between rounded-xl border-3 border-white bg-[#16a34a] px-4 py-3 text-white font-bold text-sm shadow-[0px_3px_0px_0px_#0e6b30] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">🎯</span>
                              <span>3. Post-Test {sec.num}</span>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                              {st.posttest ? "✓ Tuntas" : "Evaluasi"}
                            </span>
                          </Link>
                        ) : (
                          <div
                            title={`Selesaikan Pre-Test ${sec.num} dan Materi ${sec.num} terlebih dahulu`}
                            className="flex items-center justify-between rounded-xl border-3 border-gray-300 bg-gray-200/90 px-4 py-3 text-gray-500 font-bold text-sm opacity-70 cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">🔒</span>
                              <span>3. Post-Test {sec.num}</span>
                            </div>
                            <span className="text-[11px] bg-gray-300 px-2 py-0.5 rounded-md">
                              Terkunci
                            </span>
                          </div>
                        )}

                        {st.posttest && (
                          <Link
                            href={`/spldv/hasil?section=${sec.num}&type=post`}
                            onClick={playClick}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100/90 py-1 px-2 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition-colors"
                          >
                            <span>🏆</span>
                            <span>Hasil Post-Test ({st.posttest_score ?? 100} Poin)</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl bg-gray-200/90 border-2 border-gray-300 py-3 px-4 text-xs sm:text-sm font-bold text-gray-600 text-center">
                      ⚠️ Tingkatan ini terkunci. Tuntaskan <b>Pre-Test, Materi, dan Post-Test pada Section {sec.num - 1}</b> untuk membuka akses!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
