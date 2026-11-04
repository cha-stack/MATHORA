"use client";

import Link from "next/link";
import GameShell from "@/components/GameShell";

export default function SpldvTahapan() {
  const tahapanList = [
    { title: "Pengertian SPLDV", active: true, step: 1 },
    { title: "Mengenal Variabel dan Koefisien", active: false, step: 2 },
    { title: "Metode Substitusi", active: false, step: 3 },
    { title: "Metode Eliminasi", active: false, step: 4 },
  ];

  return (
    <GameShell backUrl="/dashboard/siswa" showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Main Glass/Soft Card */}
        <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] mb-8 font-bold">
            Tahapan Materi
          </h2>

          <div className="flex flex-col gap-5 sm:gap-6 w-full">
            {tahapanList.map((item, idx) => (
              <div key={idx} className="w-full">
                {item.active ? (
                  <Link
                    href={`/spldv/materi?step=${item.step}`}
                    className="group flex h-18 sm:h-20 w-full items-center justify-between rounded-[22px] border-[6px] border-white bg-[#34b2cc] px-6 sm:px-8 shadow-[0px_5px_0px_0px_#aaafaf] transition-all hover:scale-102 hover:brightness-105 active:translate-y-1 active:shadow-none cursor-pointer"
                  >
                    <span className="game-font text-2xl sm:text-3xl text-white font-bold drop-shadow-[0px_2px_0px_#aaafaf]">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-white text-sm font-bold">
                      <span>Mulai</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-18 sm:h-20 w-full items-center justify-between rounded-[22px] border-[6px] border-white bg-[#34b2cc]/70 px-6 sm:px-8 shadow-[0px_5px_0px_0px_#aaafaf] opacity-80 cursor-not-allowed">
                    <span className="game-font text-2xl sm:text-3xl text-white/90 font-bold">
                      {item.title}
                    </span>
                    <span className="text-white/80 text-xs sm:text-sm font-bold bg-black/20 px-3 py-1 rounded-full">
                      Terkunci
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
