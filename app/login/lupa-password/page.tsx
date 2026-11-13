"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetPasswordByEmail } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

export default function LupaPasswordPage() {
  const router = useRouter();
  const { playClick } = useSound();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email.trim() || !newPassword || !confirmPassword) {
      setErrorMessage("Harap lengkapi semua kolom!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordByEmail(email, newPassword);
      if (!res.success) {
        setErrorMessage(res.message);
        setIsLoading(false);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setErrorMessage("Gagal mereset password. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#482b78] via-[#65439e] to-[#916dcb] select-none p-4">
      <div className="relative z-10 w-full max-w-md rounded-[32px] border-[6px] border-white bg-white/95 p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center">
        <span className="rounded-full bg-purple-100 px-4 py-1 text-xs font-bold text-purple-800 mb-2">
          Pemulihan Akun PKM
        </span>
        <h2 className="game-font text-2xl sm:text-3xl font-bold text-[#2a2830] text-center mb-1">
          Lupa Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 text-center mb-6">
          Masukkan email terdaftar untuk memperbarui kata sandi akunmu.
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

        <form onSubmit={handleReset} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Email Terdaftar:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: siswa@smpislamparung.sch.id"
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2.5 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Password Baru:
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru..."
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2.5 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
              Konfirmasi Password Baru:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru..."
              className="w-full rounded-2xl border-2 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2.5 text-sm font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl border-4 border-white bg-[#1cd8a4] disabled:opacity-80 py-3 game-font text-base font-bold text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:scale-102 active:translate-y-1 cursor-pointer"
          >
            {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 w-full text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-[#7251a8] hover:underline"
          >
            &larr; Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </main>
  );
}
