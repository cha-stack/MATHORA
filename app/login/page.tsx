"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PilihanLogin() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4 sm:p-8">
            <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: "url('/images/math-formula.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "460px 460px",
        }}
      />

            <div className="w-full h-2 sm:h-6 shrink-0" />

            <div className="relative z-10 my-auto flex w-full max-w-4xl flex-col items-center justify-center text-center px-4">
                <h1 className="game-title-mathora text-5xl sm:text-7xl md:text-8xl lg:text-[104px] font-bold tracking-wider uppercase leading-none drop-shadow-md">
          MATHORA
        </h1>
        <div className="game-title-sub mt-1.5 sm:mt-2 text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide uppercase leading-tight">
          <p className="m-0">BELAJAR</p>
          <p className="m-0 -mt-1 sm:-mt-2">MATEMATIKA</p>
        </div>

                <div className="mt-8 sm:mt-10 md:mt-12 flex w-full max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8 md:gap-10">
                    <Link
            href="/login/guru"
            className="group relative flex h-16 sm:h-20 md:h-[82px] w-full max-w-[320px] sm:w-64 md:w-80 items-center justify-center rounded-[18px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#3499d0] shadow-[0px_6px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[4px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
            <span className="game-font text-2xl sm:text-3xl md:text-[34px] font-bold text-white drop-shadow-[0px_2px_0px_rgba(0,0,0,0.25)]">
              Guru
            </span>
          </Link>

                    <Link
            href="/login/siswa"
            className="group relative flex h-16 sm:h-20 md:h-[82px] w-full max-w-[320px] sm:w-64 md:w-80 items-center justify-center rounded-[18px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#d4ae2f] shadow-[0px_6px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[4px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
            <span className="game-font text-2xl sm:text-3xl md:text-[34px] font-bold text-white drop-shadow-[0px_2px_0px_rgba(0,0,0,0.25)]">
              Siswa
            </span>
          </Link>
        </div>
      </div>

            <div className="relative z-10 flex w-full max-w-7xl items-end justify-between px-2 sm:px-6 mb-2 sm:mb-4">
        <div className="flex flex-col items-start gap-4">
                    <Link
            href="/"
            aria-label="Kembali ke halaman utama"
            className="group relative flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-full border-[5px] sm:border-[6px] border-white bg-[#e05f1e] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
                        <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-7 sm:size-8 md:size-9 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]"
            >
                            <rect x="4" y="5" width="3" height="14" rx="1" />
              <path d="M20 5.5v13a1 1 0 01-1.55.83L9.5 12.83a1 1 0 010-1.66L18.45 4.67A1 1 0 0120 5.5z" />
            </svg>
          </Link>
        </div>

                <div className="w-14 sm:w-16 md:w-[68px]" />
      </div>
    </main>
  );
}
