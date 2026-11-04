"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GameShell from "@/components/GameShell";
import { useSound } from "@/components/SoundContext";
import { getCurrentUser, updateUserProfile, UserAccount } from "@/lib/auth";

const AVATAR_OPTIONS = [
  { id: "avatar-default", path: "/images/avatar.png", label: "Dardar Classic" },
  { id: "avatar-1", path: "/images/avatar-1.svg", label: "Si Kucing Ceria" },
  { id: "avatar-2", path: "/images/avatar-2.svg", label: "Kacamata Pintar" },
  { id: "avatar-3", path: "/images/avatar-3.svg", label: "Bintang Juara" },
  { id: "avatar-guru", path: "/images/avatar-guru.svg", label: "Topi Toga" },
];

export default function SettingsPage() {
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume, isMuted, toggleMute, playClick } = useSound();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("/images/avatar.png");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const active = getCurrentUser();
    if (active) {
      setUser(active);
      setUsernameInput(active.username);
      setSelectedAvatar(active.avatar || "/images/avatar.png");
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSaveMessage("");
    setSaveError("");

    if (!usernameInput.trim()) {
      setSaveError("Username tidak boleh kosong!");
      return;
    }

    const res = updateUserProfile(usernameInput, selectedAvatar);
    if (!res.success) {
      setSaveError(res.message);
    } else {
      setSaveMessage("Profil berhasil disimpan!");
      setUser(res.user || null);
      // Trigger update visual jika perlu
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const backUrl = user?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa";

  return (
    <GameShell backUrl={backUrl} showBack={true}>
      <div className="flex w-full flex-col items-center">
        {/* Settings Box */}
        <div className="relative w-full max-w-3xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/85 p-6 sm:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] mb-6 font-bold">
            Pengaturan Game
          </h2>

          <div className="flex flex-col gap-6 w-full max-w-xl">
            {/* SECTION 1: EDIT PROFIL */}
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 rounded-3xl border-4 border-white bg-white/95 p-5 shadow">
              <span className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                Profil Pemain
              </span>

              {/* Status Banner */}
              {saveMessage && (
                <div className="rounded-xl bg-emerald-100 border-2 border-emerald-400 p-2.5 text-center text-sm font-bold text-emerald-800">
                  {saveMessage}
                </div>
              )}
              {saveError && (
                <div className="rounded-xl bg-rose-100 border-2 border-rose-400 p-2.5 text-center text-sm font-bold text-rose-800">
                  {saveError}
                </div>
              )}

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-bold text-[#2a2830]/80 uppercase tracking-wider block mb-2">
                  Pilih Foto Avatar
                </label>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.path);
                        playClick();
                      }}
                      className={`group relative flex flex-col items-center rounded-2xl border-4 p-1.5 transition-all cursor-pointer ${
                        selectedAvatar === av.path
                          ? "border-[#7251a8] bg-[#f8f298] scale-105 shadow-md"
                          : "border-transparent bg-purple-50 hover:bg-purple-100"
                      }`}
                      title={av.label}
                    >
                      <div className="relative size-12 sm:size-14 overflow-hidden rounded-full">
                        <Image src={av.path} alt={av.label} fill className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="text-xs font-bold text-[#2a2830]/80 uppercase tracking-wider block mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan nama baru..."
                  maxLength={25}
                  className="w-full rounded-2xl border-3 border-[#cbb3f5] bg-[#f7f2ff] px-4 py-2 text-base font-semibold text-[#2a2830] outline-none focus:border-[#7251a8]"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="mt-1 flex items-center justify-center rounded-2xl border-4 border-white bg-[#1cd8a4] py-2.5 shadow-[0px_4px_0px_0px_#028560] transition-all hover:scale-102 active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span className="game-font text-base sm:text-lg font-bold text-[#144837]">
                  Simpan Perubahan Profil
                </span>
              </button>
            </form>

            {/* SECTION 2: AUDIO CONTROLS */}
            <div className="flex flex-col gap-4 rounded-3xl border-4 border-white bg-white/95 p-5 shadow">
              <span className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                Audio & Backsound
              </span>

              {/* Setting 1: Suara Musik (BGM) */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#f7f2ff] p-3 border-2 border-purple-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-[#2a2830] font-bold">
                    Volume Musik (BGM)
                  </span>
                  <span className="game-font text-base text-[#7251a8] font-bold">
                    {isMuted ? 0 : bgmVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : bgmVolume}
                  onChange={(e) => {
                    setBgmVolume(Number(e.target.value));
                  }}
                  className="w-full accent-[#7251a8] cursor-pointer h-2.5"
                />
              </div>

              {/* Setting 2: Efek Suara (SFX) */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#f7f2ff] p-3 border-2 border-purple-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-[#2a2830] font-bold">
                    Efek Tombol (SFX)
                  </span>
                  <span className="game-font text-base text-[#7251a8] font-bold">
                    {sfxVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) => {
                    setSfxVolume(Number(e.target.value));
                    playClick();
                  }}
                  className="w-full accent-[#7251a8] cursor-pointer h-2.5"
                />
              </div>

              {/* Setting 3: Toggle Master Mute */}
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f2ff] p-3 border-2 border-purple-100">
                <span className="text-sm sm:text-base text-[#2a2830] font-bold">
                  Status Suara Keseluruhan
                </span>
                <button
                  type="button"
                  onClick={() => {
                    toggleMute();
                    playClick();
                  }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors cursor-pointer ${
                    !isMuted ? "bg-[#1cd8a4]" : "bg-zinc-400"
                  }`}
                >
                  <span
                    className={`inline-block size-6 transform rounded-full bg-white transition-transform ${
                      !isMuted ? "translate-x-9" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
