"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

export default function RegistGuru() {
  const router = useRouter();
  const { playClick } = useSound();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage("Harap lengkapi semua kolom pendaftaran!");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter (bebas angka atau huruf)!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password dan konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(
        username,
        email,
        password,
        "guru",
        "/images/avatar-guru.svg"
      );

      if (!res.success) {
        setErrorMessage(res.message);
        setIsLoading(false);
      } else {
        setSuccessMessage("Pendaftaran akun Guru berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login/guru");
        }, 1500);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4">
      <div className="relative z-10 w-full max-w-md rounded-[32px] border-[6px] border-white bg-white/95 p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center">
        <span className="rounded-full bg-[#1cd8a4] px-4 py-1 text-xs font-bold text-[#144837] mb-2 shadow-xs">
          Panel Pendidik &amp; Pengampu • SMP Islam Parung
        </span>
        <h2 className="game-font text-2xl sm:text-3xl font-bold text-[#2a2830] text-center mb-1">
          Daftar Akun Guru
        </h2>
        <p className="text-xs text-gray-600 text-center mb-5 font-medium">
          Daftarkan akun pendidik untuk mengelola pembelajaran dan bank soal.
        </p>

        {errorMessage && (
          <div className="w-full rounded-2xl bg-rose-100 border-2 border-rose-400 p-2.5 text-center text-xs font-bold text-rose-800 mb-4">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="w-full rounded-2xl bg-emerald-100 border-2 border-emerald-400 p-2.5 text-center text-xs font-bold text-emerald-800 mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Username Guru:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="contoh: pak_budi atau bu_siti"
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Email Guru:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: guru@mathora.sch.id"
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Password (Min. 6 Karakter Bebas):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter (bebas angka / huruf)..."
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Konfirmasi Password:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password..."
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl border-4 border-white bg-[#3499d0] disabled:opacity-80 py-3 game-font text-base font-bold text-white shadow-[0px_4px_0px_0px_#1f6d99] hover:scale-102 active:translate-y-1 cursor-pointer transition-all"
          >
            {isLoading ? "Mendaftarkan Akun Guru..." : "Daftar Akun Guru"}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-gray-200 w-full text-center flex justify-between text-xs font-bold text-[#7251a8]">
          <Link href="/login/guru" onClick={playClick} className="hover:underline">
            Sudah punya akun? Login Guru
          </Link>
          <Link href="/login/lupa-password" onClick={playClick} className="hover:underline text-amber-700">
            Lupa Password?
          </Link>
        </div>
      </div>
    </main>
  );
}

