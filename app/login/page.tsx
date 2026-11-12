"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PilihanLogin() {
  const router = useRouter();

  const handleLoginGuru = () => {
    // Navigasi atau action untuk Guru
    console.log("Login Guru clicked");
    alert("Menuju halaman Login Guru");
  };

  const handleLoginSiswa = () => {
    // Navigasi atau action untuk Siswa
    console.log("Login Siswa clicked");
    alert("Menuju halaman Login Siswa");
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4 sm:p-8">
      {/* Background Math Formula Doodles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-85">
        {/* Top-right formula */}
        <div className="absolute top-10 -right-8 w-60 sm:w-80 md:w-[420px] rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 1"
            width={450}
            height={280}
            className="w-full object-contain"
            priority
          />
        </div>

        {/* Top-left formula */}
        <div className="absolute -top-16 -left-12 w-64 sm:w-96 md:w-[480px] -rotate-[30deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 2"
            width={500}
            height={300}
            className="w-full object-contain"
            priority
          />
        </div>

        {/* Top middle formula */}
        <div className="absolute -top-10 left-[20%] w-48 sm:w-64 md:w-80 -rotate-[12deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 3"
            width={380}
            height={240}
            className="w-full object-contain"
          />
        </div>

        {/* Left middle graph */}
        <div className="absolute top-[10%] -left-20 w-60 sm:w-80 md:w-[400px] -rotate-[21deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 4"
            width={450}
            height={320}
            className="w-full object-contain"
          />
        </div>

        {/* Middle bottom formula */}
        <div className="absolute bottom-[20%] left-[45%] hidden sm:block w-36 md:w-48 -rotate-[28deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 5"
            width={260}
            height={180}
            className="w-full object-contain"
          />
        </div>

        {/* Bottom right coordinate graph */}
        <div className="absolute -bottom-16 right-[-2%] w-64 sm:w-96 md:w-[400px] -rotate-[136deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 6"
            width={450}
            height={320}
            className="w-full object-contain"
          />
        </div>

        {/* Bottom left graph */}
        <div className="absolute -bottom-12 left-[15%] w-60 sm:w-80 md:w-[420px] rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 7"
            width={450}
            height={280}
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* Header Title Section */}
      <div className="relative z-10 mt-4 sm:mt-8 md:mt-10 flex flex-col items-center text-center">
        <h1 className="game-title-mathora text-5xl sm:text-7xl md:text-8xl lg:text-[104px] font-bold tracking-wider uppercase leading-none">
          MATHORA
        </h1>
        <div className="game-title-sub mt-1 sm:mt-3 text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide uppercase leading-tight">
          <p className="m-0">BELAJAR</p>
          <p className="m-0 -mt-1 sm:-mt-2">MATEMATIKA</p>
        </div>
      </div>

      {/* Center Role Buttons (Login Guru & Login Siswa) */}
      <div className="relative z-10 my-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8 md:gap-10 px-4 py-4 sm:py-6">
        {/* Tombol Login Guru */}
        <Link
          href="/login/guru"
          className="group relative flex h-16 sm:h-20 md:h-[82px] w-full max-w-[320px] sm:w-64 md:w-80 items-center justify-center rounded-[18px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#3499d0] shadow-[0px_6px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[4px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
        >
          <span className="game-font text-2xl sm:text-3xl md:text-[34px] font-bold text-white drop-shadow-[0px_2px_0px_rgba(0,0,0,0.25)]">
            Guru
          </span>
        </Link>

        {/* Tombol Login Siswa */}
        <Link
          href="/login/siswa"
          className="group relative flex h-16 sm:h-20 md:h-[82px] w-full max-w-[320px] sm:w-64 md:w-80 items-center justify-center rounded-[18px] sm:rounded-[20px] border-[4px] sm:border-[5px] border-white bg-[#d4ae2f] shadow-[0px_6px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[4px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
        >
          <span className="game-font text-2xl sm:text-3xl md:text-[34px] font-bold text-white drop-shadow-[0px_2px_0px_rgba(0,0,0,0.25)]">
            Siswa
          </span>
        </Link>
      </div>

      {/* Bottom Left Controls (Back Button) */}
      <div className="relative z-10 flex w-full max-w-7xl items-end justify-between px-2 sm:px-6 mb-2 sm:mb-4">
        <div className="flex flex-col items-start gap-4">
          {/* Back Button (Bulat Oranye dengan icon reverse/back) */}
          <Link
            href="/"
            aria-label="Kembali ke halaman utama"
            className="group relative flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-full border-[5px] sm:border-[6px] border-white bg-[#e05f1e] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
            {/* Reverse / Previous Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-7 sm:size-8 md:size-9 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]"
            >
              {/* Vertical bar on the left + left-pointing triangle */}
              <rect x="4" y="5" width="3" height="14" rx="1" />
              <path d="M20 5.5v13a1 1 0 01-1.55.83L9.5 12.83a1 1 0 010-1.66L18.45 4.67A1 1 0 0120 5.5z" />
            </svg>
          </Link>
        </div>

        {/* Placeholder kanan bawah agar seimbang */}
        <div className="w-14 sm:w-16 md:w-[68px]" />
      </div>
    </main>
  );
}
