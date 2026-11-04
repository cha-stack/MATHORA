"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

export default function RegistSiswa() {
  const router = useRouter();
  const { playClick } = useSound();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClick();
    setErrorMessage("");

    if (!username.trim() || !password || !confirmPassword) {
      setErrorMessage("Harap lengkapi semua kolom!");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("Password minimal 4 karakter!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password dan konfirmasi password tidak cocok!");
      return;
    }

    const result = registerUser(username, password, "siswa");
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    alert(`Pendaftaran berhasil untuk: ${username}! Silakan login.`);
    router.push("/login/siswa");
  };

  const handleDiscord = () => {
    playClick();
    window.open("https://discord.com", "_blank", "noopener,noreferrer");
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
      <div className="relative z-10 mt-4 sm:mt-6 md:mt-8 flex flex-col items-center text-center">
        <h1 className="game-title-mathora text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-bold tracking-wider uppercase leading-none">
          MATHORA
        </h1>
      </div>

      {/* Center Card Regist Siswa */}
      <div className="relative z-10 my-auto flex w-full max-w-xl flex-col items-center px-4 py-2">
        {/* Soft Purple/Grey Card Container */}
        <div className="w-full rounded-[32px] sm:rounded-[38px] bg-[#d5cfeb]/95 p-6 sm:p-9 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <h2 className="game-font text-3xl sm:text-4xl text-[#2a2830] mb-5 sm:mb-7 font-bold">
            Regist Siswa
          </h2>

          {errorMessage && (
            <div className="mb-4 w-full rounded-2xl bg-red-500/90 border-2 border-white px-4 py-2 text-center text-white font-bold text-sm sm:text-base shadow">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="w-full flex flex-col gap-3.5 sm:gap-4">
            {/* Username */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-[18px] sm:rounded-[20px] bg-[#f8f7fc] px-6 py-3.5 sm:py-4 text-xl sm:text-2xl font-bold game-font text-[#333] placeholder:text-[#555]/80 placeholder:font-bold focus:outline-none focus:ring-4 focus:ring-[#8e78ca] transition-all shadow-inner"
              />
            </div>

            {/* Password */}
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-[18px] sm:rounded-[20px] bg-[#f8f7fc] pl-6 pr-14 py-3.5 sm:py-4 text-xl sm:text-2xl font-bold game-font text-[#333] placeholder:text-[#555]/80 placeholder:font-bold focus:outline-none focus:ring-4 focus:ring-[#8e78ca] transition-all shadow-inner"
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
                    className="size-6 sm:size-7"
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
                    className="size-6 sm:size-7"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative w-full flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-[18px] sm:rounded-[20px] bg-[#f8f7fc] pl-6 pr-14 py-3.5 sm:py-4 text-xl sm:text-2xl font-bold game-font text-[#333] placeholder:text-[#555]/80 placeholder:font-bold focus:outline-none focus:ring-4 focus:ring-[#8e78ca] transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                className="absolute right-4 p-2 text-[#474451] hover:text-black transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 sm:size-7"
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
                    className="size-6 sm:size-7"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Action Button Below Card (Regist Button) */}
        <div className="mt-6 flex w-full justify-center">
          <button
            onClick={() => handleRegister()}
            className="group relative flex h-16 sm:h-[72px] w-full max-w-[240px] items-center justify-center rounded-[20px] sm:rounded-[22px] border-[5px] sm:border-[6px] border-white bg-[#3499d0] shadow-[0px_5px_0px_0px_#aaafaf] transition-all duration-150 hover:brightness-105 hover:scale-103 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#aaafaf] cursor-pointer"
          >
            <span className="game-font text-2xl sm:text-3xl font-bold text-white drop-shadow-[0px_2px_0px_#aaafaf]">
              Regist
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Left Controls (Back & Discord) */}
      <div className="relative z-10 flex w-full max-w-7xl items-end justify-between px-2 sm:px-6 mb-2 sm:mb-4">
        <div className="flex flex-col items-start gap-4">
          {/* Back Button -> Kembali ke /login/siswa */}
          <Link
            href="/login/siswa"
            aria-label="Kembali ke Login Siswa"
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

          {/* Discord Button */}
          <button
            onClick={handleDiscord}
            title="Gabung Discord MATHORA"
            aria-label="Discord Community"
            className="group relative flex size-14 sm:size-16 md:size-[68px] items-center justify-center rounded-[18px] sm:rounded-[22px] border-[5px] sm:border-[6px] border-white bg-[#a6acaa] shadow-[0px_5px_0px_0px_#8f9694] transition-all duration-150 hover:brightness-105 hover:scale-105 active:translate-y-[3px] active:shadow-[0px_2px_0px_0px_#8f9694] cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-8 sm:size-9 md:size-10 text-white"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </button>
        </div>

        <div className="w-14 sm:w-16 md:w-[68px]" />
      </div>
    </main>
  );
}
