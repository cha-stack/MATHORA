"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loginUser } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

export default function LoginSiswa() {
  const router = useRouter();
  const { playClick } = useSound();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Timer hitung mundur rate limit (Too many requests cooldown)
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClick();
    setErrorMessage("");

    if (cooldown > 0) {
      setErrorMessage(`Terlalu banyak permintaan (Too many requests). Harap tunggu ${cooldown} detik.`);
      return;
    }

    if (!username.trim() || !password) {
      setErrorMessage("Harap masukkan username dan password!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser(username, password, "siswa");
      if (!result.success) {
        setErrorMessage(result.message);
        if (result.retryAfter && result.retryAfter > 0) {
          setCooldown(result.retryAfter);
        }
        setIsLoading(false);
        return;
      }

      // Login Berhasil -> menuju Dashboard Siswa
      router.push("/dashboard/siswa");
    } catch {
      setErrorMessage("Terjadi kendala saat login. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4 sm:p-8">
      {/* Background Math Formula Doodles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-85">
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
        <div className="absolute top-[12%] -left-16 w-56 sm:w-72 md:w-80 -rotate-[21deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 3"
            width={420}
            height={280}
            className="w-full object-contain"
          />
        </div>
        <div className="absolute bottom-[22%] left-[10%] hidden sm:block w-36 md:w-48 -rotate-[10deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 4"
            width={260}
            height={180}
            className="w-full object-contain"
          />
        </div>
        <div className="absolute -bottom-16 right-[-2%] w-64 sm:w-96 md:w-[400px] -rotate-[136deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 5"
            width={450}
            height={320}
            className="w-full object-contain"
          />
        </div>
        <div className="absolute -bottom-12 left-[15%] w-60 sm:w-80 md:w-[420px] rotate-[22deg]">
          <Image
            src="/images/math-formula.png"
            alt="Math Doodle 6"
            width={450}
            height={280}
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* Header Title Section */}
      <div className="relative z-10 mt-6 sm:mt-10 md:mt-12 flex flex-col items-center text-center">
        <h1 className="game-title-mathora text-6xl sm:text-8xl md:text-9xl lg:text-[130px] font-bold tracking-wider uppercase leading-none">
          MATHORA
        </h1>
      </div>

      {/* Center Card Login Siswa */}
      <div className="relative z-10 my-auto flex w-full max-w-xl flex-col items-center px-4 py-4">
        {/* Soft Purple/Grey Card Container */}
        <div className="w-full rounded-[32px] sm:rounded-[38px] bg-[#d5cfeb]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] mb-6 sm:mb-8 font-bold">
            Login Siswa
          </h2>

          {errorMessage && (
            <div className="mb-4 w-full rounded-2xl bg-red-500/90 border-2 border-white px-4 py-2 text-center text-white font-bold text-sm sm:text-base shadow">
              {errorMessage}
            </div>
          )}

          <form id="login-siswa-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5">
            {/* Username Input */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-[20px] sm:rounded-[22px] bg-[#f8f7fc] px-6 py-4 sm:py-5 text-xl sm:text-2xl font-bold game-font text-[#333] placeholder:text-[#555]/80 placeholder:font-bold focus:outline-none focus:ring-4 focus:ring-[#8e78ca] transition-all shadow-inner"
              />
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-[20px] sm:rounded-[22px] bg-[#f8f7fc] pl-6 pr-14 py-4 sm:py-5 text-xl sm:text-2xl font-bold game-font text-[#333] placeholder:text-[#555]/80 placeholder:font-bold focus:outline-none focus:ring-4 focus:ring-[#8e78ca] transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                className="absolute right-4 p-2 text-[#474451] hover:text-black transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7 sm:size-8"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7 sm:size-8"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Action Buttons Below Card (Regis & Login) */}
        <div className="mt-8 flex w-full justify-center gap-6 sm:gap-10">
          {/* Regis Button */}
          <Link
            href="/login/siswa/regist"
            onClick={playClick}
            className="group relative flex h-16 sm:h-[72px] flex-1 max-w-[210px] items-center justify-center rounded-[20px] sm:rounded-[22px] border-[5px] sm:border-[6px] border-white bg-[#3499d0] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
            <span className="game-font text-2xl sm:text-3xl font-bold text-white drop-shadow-[0px_2px_0px_#aaafaf]">
              Regis
            </span>
          </Link>

          {/* Login Button with Rate Limiting Shield */}
          <button
            type="submit"
            form="login-siswa-form"
            onClick={handleSubmit}
            disabled={isLoading || cooldown > 0}
            className={`group relative flex h-16 sm:h-[72px] flex-1 max-w-[210px] items-center justify-center rounded-[20px] sm:rounded-[22px] border-[5px] sm:border-[6px] border-white shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 touch-manipulation ${
              cooldown > 0
                ? "bg-gray-400 cursor-not-allowed opacity-80"
                : "bg-[#1cd8a4] hover:brightness-105 hover:scale-103 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
            }`}
          >
            <span className="game-font text-2xl sm:text-3xl font-bold text-white drop-shadow-[0px_2px_0px_#aaafaf]">
              {isLoading ? "Masuk..." : cooldown > 0 ? `Tunggu (${cooldown}s)` : "Login"}
            </span>
          </button>
        </div>

        {/* Lupa Password Link */}
        <div className="mt-3 text-center">
          <Link
            href="/login/lupa-password"
            className="text-xs sm:text-sm font-bold text-white/90 hover:text-white underline drop-shadow-sm"
          >
            Lupa Password? Reset Disini
          </Link>
        </div>
      </div>

      {/* Bottom Left Controls (Back Button) */}
      <div className="relative z-10 flex w-full max-w-7xl items-end justify-between px-2 sm:px-6 mb-2 sm:mb-4">
        <div className="flex flex-col items-start gap-4">
          {/* Back Button -> Kembali ke /login */}
          <Link
            href="/login"
            onClick={playClick}
            aria-label="Kembali ke pilihan login"
            className="group relative flex size-14 sm:size-16 md:size-[68px] items-center justify-center rounded-full border-[5px] sm:border-[6px] border-white bg-[#e05f1e] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
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
