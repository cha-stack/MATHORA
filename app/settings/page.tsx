"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import GameShell from "@/components/GameShell";
import { useSound, AVAILABLE_TRACKS, BgmTrack } from "@/components/SoundContext";
import CharacterStudioRenderer, { CharacterRendererHandle } from "@/components/CharacterStudioRenderer";
import {
  CharacterConfig,
  DEFAULT_CHARACTER,
  COLOR_PALETTES,
  HAIR_OPTIONS,
  EYE_OPTIONS,
  EAR_OPTIONS,
  EYEBROW_OPTIONS,
  NOSE_OPTIONS,
  MOUTH_OPTIONS,
  BLUSH_OPTIONS,
  OUTFIT_OPTIONS,
  ACCESSORY_OPTIONS,
  getRandomCharacterConfig,
} from "@/lib/characterConfig";
import {
  getCurrentUser,
  updateUserProfile,
  checkUserHasPassword,
  changeAccountPassword,
  UserAccount,
} from "@/lib/auth";

const AVATAR_OPTIONS = [
  { id: "avatar-1", path: "/images/avatar-1.svg", label: "Kucing Ceria (Edukasi)" },
  { id: "avatar-2", path: "/images/avatar-2.svg", label: "Kacamata Pintar (Cendekia)" },
  { id: "avatar-3", path: "/images/avatar-3.svg", label: "Bintang Juara (Matematika)" },
  { id: "avatar-guru", path: "/images/avatar-guru.svg", label: "Topi Toga (Pendidik)" },
];

type ChibiCategory =
  | "rambut"
  | "mata"
  | "outfit"
  | "aksesoris"
  | "blush"
  | "badan"
  | "telinga"
  | "alis"
  | "hidung"
  | "mulut"
  | "latar";

interface ChibiCategoryMeta {
  id: ChibiCategory;
  label: string;
  icon: string;
  hasColor: boolean;
  colorField?: keyof CharacterConfig;
  paletteKey?: keyof typeof COLOR_PALETTES;
}

const CHIBI_CATEGORIES: ChibiCategoryMeta[] = [
  { id: "rambut", label: "Rambut", icon: "💇", hasColor: true, colorField: "hairColor", paletteKey: "hair" },
  { id: "mata", label: "Mata", icon: "👁️", hasColor: true, colorField: "eyeColor", paletteKey: "eye" },
  { id: "outfit", label: "Outfit", icon: "👕", hasColor: true, colorField: "outfitColor", paletteKey: "outfit" },
  { id: "aksesoris", label: "Aksesoris", icon: "🎀", hasColor: true, colorField: "accessoryColor", paletteKey: "accessory" },
  { id: "blush", label: "Blush", icon: "💖", hasColor: true, colorField: "blushColor", paletteKey: "blush" },
  { id: "badan", label: "Kulit", icon: "🧑", hasColor: true, colorField: "skinColor", paletteKey: "skin" },
  { id: "telinga", label: "Telinga", icon: "🧝", hasColor: false },
  { id: "alis", label: "Alis", icon: "✏️", hasColor: false },
  { id: "hidung", label: "Hidung", icon: "👃", hasColor: false },
  { id: "mulut", label: "Mulut", icon: "👄", hasColor: false },
  { id: "latar", label: "Latar", icon: "🎨", hasColor: true, colorField: "bgColor", paletteKey: "bg" },
];

export default function SettingsPage() {
  const {
    bgmVolume,
    setBgmVolume,
    sfxVolume,
    setSfxVolume,
    currentTrack,
    setTrack,
    playClick,
    playCorrect,
    playWrong,
  } = useSound();

  const rendererRef = useRef<CharacterRendererHandle | null>(null);

  const [user, setUser] = useState<UserAccount | null>(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser();
    }
    return null;
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("/images/avatar-1.svg");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mode Karakter: ChibiForge vs Maskot Cepat
  const [avatarMode, setAvatarMode] = useState<"chibi" | "maskot">("chibi");
  const [chibiCategory, setChibiCategory] = useState<ChibiCategory>("rambut");
  const [charConfig, setCharConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);

  // State Keamanan Password
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const active = getCurrentUser();
    if (active) {
      setUser(active);
      setUsernameInput(active.username);
      setSelectedAvatar(active.avatar || "/images/avatar-1.svg");

      // Cek apakah user punya config karakter Chibi tersimpan
      try {
        const savedChar = localStorage.getItem(`mathora_char_cfg_${active.username}`);
        if (savedChar) {
          setCharConfig(JSON.parse(savedChar));
          setAvatarMode("chibi");
        } else if (active.avatar?.startsWith("data:image")) {
          setAvatarMode("chibi");
        } else if (active.avatar?.includes("avatar-")) {
          setAvatarMode("maskot");
        }
      } catch {
        // Ignore
      }

      // Cek apakah akun ini belum punya password (misal siswa login via Google OAuth)
      checkUserHasPassword(active.username).then((hasPwd) => {
        setHasPassword(hasPwd);
      });
    }
  }, []);

  const curCatMeta = CHIBI_CATEGORIES.find((c) => c.id === chibiCategory) || CHIBI_CATEGORIES[0];

  const handleRandomizeChibi = () => {
    playClick();
    const randomized = getRandomCharacterConfig();
    setCharConfig((prev) => ({
      ...randomized,
      bgColor: prev.bgColor,
    }));
  };

  const handleResetChibi = () => {
    playClick();
    setCharConfig(DEFAULT_CHARACTER);
  };

  const handleDownloadChibi = () => {
    playClick();
    if (rendererRef.current) {
      rendererRef.current.downloadPng("karakter-mathora.png");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (hasPassword && !oldPasswordInput.trim()) {
      playWrong();
      setPasswordError("Harap masukkan kata sandi saat ini (kata sandi lama) Anda!");
      return;
    }

    if (!newPasswordInput) {
      playWrong();
      setPasswordError("Kata sandi baru tidak boleh kosong!");
      return;
    }

    if (newPasswordInput.length < 6) {
      playWrong();
      setPasswordError("Kata sandi baru minimal harus 6 karakter!");
      return;
    }

    if (/\s/.test(newPasswordInput)) {
      playWrong();
      setPasswordError("Kata sandi tidak boleh mengandung spasi!");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      playWrong();
      setPasswordError("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }

    playClick();
    setIsSavingPassword(true);
    try {
      const res = await changeAccountPassword(newPasswordInput, oldPasswordInput);
      setIsSavingPassword(false);
      if (!res.success) {
        playWrong();
        setPasswordError(res.message);
        if (res.message.toLowerCase().includes("password lama") || res.message.toLowerCase().includes("kata sandi lama")) {
          setHasPassword(true);
        }
      } else {
        playCorrect();
        setPasswordMsg(res.message);
        setHasPassword(true);
        setOldPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
        setTimeout(() => setPasswordMsg(""), 5000);
      }
    } catch {
      setIsSavingPassword(false);
      playWrong();
      setPasswordError("Terjadi kendala saat menyimpan kata sandi. Silakan coba kembali.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage("");
    setSaveError("");

    if (!usernameInput.trim()) {
      playWrong();
      setSaveError("Nama pengguna tidak boleh kosong!");
      return;
    }

    playClick();
    setIsSaving(true);
    try {
      let finalAvatar = selectedAvatar;

      // Jika menggunakan mode ChibiForge, render dan gunakan data URL PNG
      if (avatarMode === "chibi" && rendererRef.current) {
        const dataUrl = rendererRef.current.exportDataUrl();
        if (dataUrl) {
          finalAvatar = dataUrl;
          if (user?.username) {
            localStorage.setItem(`mathora_char_cfg_${user.username}`, JSON.stringify(charConfig));
          }
        }
      }

      const res = await updateUserProfile(usernameInput, finalAvatar);
      setIsSaving(false);
      if (!res.success) {
        playWrong();
        setSaveError(res.message);
      } else {
        playCorrect();
        setSaveMessage("Profil dan karakter avatar berhasil disimpan!");
        setUser(res.user || null);
        setSelectedAvatar(finalAvatar);
        setTimeout(() => setSaveMessage(""), 3500);
      }
    } catch {
      setIsSaving(false);
      playWrong();
      setSaveError("Gagal menyimpan profil.");
    }
  };

  const backUrl = user?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa";

  return (
    <GameShell backUrl={backUrl} showBack={true}>
      <div className="flex w-full flex-col items-center px-2 sm:px-4 py-2">
        {/* Settings Box */}
        <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[42px] border-[7px] border-white bg-[#e4d3ff]/85 p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <h2 className="game-font text-3xl sm:text-5xl text-[#2a2830] mb-6 font-bold text-center">
            Pengaturan Akun &amp; Karakter
          </h2>

          <div className="flex flex-col gap-6 w-full max-w-2xl">
            {/* BAGIAN 1: PENGATURAN PROFIL & KARAKTER (CHIBIFORGE LANGSUNG DISINI) */}
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 rounded-3xl border-4 border-white bg-white/95 p-4 sm:p-6 shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3">
                <span className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                  Profil &amp; Karakter Avatar
                </span>

                {/* Toggle Mode: ChibiForge vs Maskot */}
                <div className="flex items-center rounded-xl bg-purple-100 p-1 border border-purple-200 text-xs font-bold text-[#4c3575]">
                  <button
                    type="button"
                    onClick={() => { playClick(); setAvatarMode("chibi"); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      avatarMode === "chibi" ? "bg-[#7c3aed] text-white shadow-xs" : "hover:bg-purple-200"
                    }`}
                  >
                    ✨ Karakter 2D (ChibiForge)
                  </button>
                  <button
                    type="button"
                    onClick={() => { playClick(); setAvatarMode("maskot"); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      avatarMode === "maskot" ? "bg-[#7c3aed] text-white shadow-xs" : "hover:bg-purple-200"
                    }`}
                  >
                    🐾 Maskot Cepat
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div className="rounded-xl bg-emerald-100 border-2 border-emerald-400 p-2.5 text-center text-xs sm:text-sm font-bold text-emerald-800 animate-pulse">
                  {saveMessage}
                </div>
              )}
              {saveError && (
                <div className="rounded-xl bg-rose-100 border-2 border-rose-400 p-2.5 text-center text-xs sm:text-sm font-bold text-rose-800">
                  {saveError}
                </div>
              )}

              {/* JIKA MODE CHIBIFORGE AKTIF: STUDIO TERTANAM LANGSUNG DI SINI */}
              {avatarMode === "chibi" && (
                <div className="flex flex-col gap-3 rounded-2xl bg-[#f8f5fc] p-3 sm:p-4 border-2 border-[#8e78ca]/30">
                  {/* Top Bar: Preview + Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Canvas Preview Mini */}
                    <div className="relative size-36 sm:size-44 shrink-0 rounded-2xl border-2 border-[#8e78ca]/30 bg-white shadow-inner overflow-hidden flex items-center justify-center">
                      <CharacterStudioRenderer
                        ref={rendererRef}
                        config={charConfig}
                        zoom={1.0}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Kontrol & Aksi Cepat Karakter */}
                    <div className="flex flex-col justify-between h-full gap-2 w-full">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-[#7c3aed]" />
                          <span className="text-xs font-bold text-[#2a2830] uppercase tracking-wider">
                            Kustomisasi Karakter Aktif
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#666] mt-0.5">
                          Ubah rambut, ekspresi wajah, pakaian, dan aksesoris di bawah. Saat klik <b>Simpan Perubahan Profil</b>, avatar ini langsung aktif!
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleRandomizeChibi}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9333ea] text-white text-xs font-bold shadow-xs hover:bg-[#7e22ce] transition-transform active:scale-95 cursor-pointer"
                        >
                          <span>🎲</span>
                          <span>Acak Gaya</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetChibi}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#8e78ca]/40 text-[#4c3575] text-xs font-bold shadow-xs hover:bg-purple-50 transition-transform active:scale-95 cursor-pointer"
                        >
                          <span>🔄</span>
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadChibi}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold shadow-xs hover:bg-[#0369a1] transition-transform active:scale-95 cursor-pointer"
                        >
                          <span>📥</span>
                          <span>Unduh PNG</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kategori Tabs Kustomisasi Karakter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-purple-200/60 scrollbar-thin">
                    {CHIBI_CATEGORIES.map((cat) => {
                      const isActive = chibiCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setChibiCategory(cat.id);
                          }}
                          className={`flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isActive
                              ? "border-[#7c3aed] bg-[#7c3aed] text-white shadow-xs"
                              : "border-[#e0d7f2] bg-white text-[#474451] hover:bg-purple-100"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Palet Warna jika Kategori Mendukung Warna */}
                  {curCatMeta.hasColor && curCatMeta.colorField && curCatMeta.paletteKey && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 bg-white/70 p-2 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold uppercase text-[#6b52b8] mr-1">
                        Warna {curCatMeta.label}:
                      </span>
                      {COLOR_PALETTES[curCatMeta.paletteKey].map((pal) => {
                        const currentColor = charConfig[curCatMeta.colorField!];
                        const isSelected = currentColor.toLowerCase() === pal.hex.toLowerCase();
                        return (
                          <button
                            key={pal.hex}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({
                                ...prev,
                                [curCatMeta.colorField!]: pal.hex,
                              }));
                            }}
                            title={pal.label}
                            style={{ backgroundColor: pal.hex === "transparent" ? "#ffffff" : pal.hex }}
                            className={`size-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                              isSelected ? "border-[#7c3aed] scale-110 ring-2 ring-purple-300" : "border-white hover:scale-105"
                            }`}
                          >
                            {isSelected && (
                              <span
                                className={`text-[9px] font-bold ${
                                  pal.hex === "#FFFFFF" || pal.hex === "#F8FAFC" || pal.hex === "transparent"
                                    ? "text-black"
                                    : "text-white"
                                }`}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Color Input */}
                      <label className="flex items-center gap-1 ml-1 cursor-pointer" title="Warna Kustom">
                        <input
                          type="color"
                          value={
                            charConfig[curCatMeta.colorField] === "transparent"
                              ? "#ffffff"
                              : charConfig[curCatMeta.colorField]
                          }
                          onChange={(e) => {
                            setCharConfig((prev) => ({
                              ...prev,
                              [curCatMeta.colorField!]: e.target.value,
                            }));
                          }}
                          className="size-6 rounded-md border border-gray-300 cursor-pointer p-0"
                        />
                        <span className="text-[10px] text-[#7c3aed] font-bold">Kustom</span>
                      </label>
                    </div>
                  )}

                  {/* Grid Item Sesuai Kategori yang Dipilih */}
                  <div className="max-h-48 overflow-y-auto pr-1 pt-1">
                    {/* RAMBUT */}
                    {chibiCategory === "rambut" && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {HAIR_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, hairStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.hairStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-12 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.hairStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* MATA */}
                    {chibiCategory === "mata" && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {EYE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, eyeStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.eyeStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-12 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.eyeStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* OUTFIT */}
                    {chibiCategory === "outfit" && (
                      <div className="grid grid-cols-3 gap-2">
                        {OUTFIT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, outfitStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.outfitStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-14 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.outfitStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AKSESORIS */}
                    {chibiCategory === "aksesoris" && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {ACCESSORY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, accessoryStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.accessoryStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-11 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {opt.file ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={opt.file} alt={opt.label} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-xl text-gray-400">🚫</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.accessoryStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* BLUSH */}
                    {chibiCategory === "blush" && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {BLUSH_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, blushStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.blushStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-11 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {opt.line ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-xl text-gray-400">🚫</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.blushStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* TELINGA */}
                    {chibiCategory === "telinga" && (
                      <div className="grid grid-cols-2 gap-2">
                        {EAR_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, earStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.earStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-12 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.earStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ALIS */}
                    {chibiCategory === "alis" && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {EYEBROW_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, eyebrowStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.eyebrowStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-11 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.eyebrowStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* HIDUNG */}
                    {chibiCategory === "hidung" && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {NOSE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, noseStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.noseStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-11 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.noseStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* MULUT */}
                    {chibiCategory === "mulut" && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {MOUTH_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, mouthStyle: opt.id }));
                            }}
                            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              charConfig.mouthStyle === opt.id
                                ? "border-[#7c3aed] bg-purple-100 shadow-xs ring-1 ring-purple-300"
                                : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                            }`}
                          >
                            <div className="size-11 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                              {opt.label}
                            </span>
                            {charConfig.mouthStyle === opt.id && (
                              <span className="absolute top-1 right-1 size-3.5 rounded-full bg-[#7c3aed] text-white text-[9px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* BADAN & KULIT */}
                    {chibiCategory === "badan" && (
                      <div className="p-3 bg-purple-50 rounded-xl text-center text-xs text-[#555] font-semibold">
                        Gunakan palet warna di atas untuk menyesuaikan warna kulit karakter.
                      </div>
                    )}

                    {/* LATAR */}
                    {chibiCategory === "latar" && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {COLOR_PALETTES.bg.map((opt) => (
                          <button
                            key={opt.hex}
                            type="button"
                            onClick={() => {
                              playClick();
                              setCharConfig((prev) => ({ ...prev, bgColor: opt.hex }));
                            }}
                            className={`p-2 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                              charConfig.bgColor.toLowerCase() === opt.hex.toLowerCase()
                                ? "border-[#7c3aed] bg-purple-100"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <span
                              className="size-5 rounded-md border border-gray-300"
                              style={{ backgroundColor: opt.hex === "transparent" ? "#ffffff" : opt.hex }}
                            />
                            <span className="text-[10px] font-bold text-[#333]">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JIKA MODE MASKOT CEPAT AKTIF */}
              {avatarMode === "maskot" && (
                <div>
                  <label className="text-xs font-bold text-[#2a2830]/80 uppercase tracking-wider block mb-2">
                    Pilihan Maskot Klasik:
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av.path);
                          playClick();
                        }}
                        className={`group relative flex flex-col items-center rounded-2xl border-4 p-2 transition-all cursor-pointer ${
                          selectedAvatar === av.path
                            ? "border-[#7251a8] bg-[#f8f298] scale-105 shadow-md"
                            : "border-transparent bg-purple-50 hover:bg-purple-100"
                        }`}
                        title={av.label}
                      >
                        <div className="relative size-12 sm:size-14 overflow-hidden rounded-full">
                          <Image src={av.path} alt={av.label} fill unoptimized className="object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-[#2a2830] mt-1 text-center truncate w-full">
                          {av.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Username Input */}
              <div className="mt-2">
                <label className="text-xs font-bold text-[#2a2830]/80 uppercase tracking-wider block mb-1">
                  Nama Pengguna (Username):
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan nama pengguna"
                  className="w-full rounded-2xl bg-[#f8f7fc] px-4 py-3 text-lg font-bold game-font text-[#333] border-2 border-[#8e78ca]/40 focus:border-[#7c3aed] focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Tombol Simpan Perubahan Profil */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-2xl bg-[#1cd8a4] border-3 border-white py-3.5 text-center text-lg sm:text-xl font-bold game-font text-[#144837] shadow-[0px_4px_0px_0px_#028560] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
              </button>
            </form>

            {/* BAGIAN 2: KEAMANAN & KATA SANDI */}
            <form onSubmit={handleSavePassword} className="flex flex-col gap-4 rounded-3xl border-4 border-white bg-white/95 p-5 shadow">
              <div className="flex items-center justify-between">
                <span className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                  Keamanan &amp; Kata Sandi
                </span>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                  {hasPassword ? "Kata Sandi Aktif" : "Belum Ada Sandi (Google)"}
                </span>
              </div>

              {passwordMsg && (
                <div className="rounded-xl bg-emerald-100 border-2 border-emerald-400 p-2 text-center text-xs sm:text-sm font-bold text-emerald-800">
                  {passwordMsg}
                </div>
              )}
              {passwordError && (
                <div className="rounded-xl bg-rose-100 border-2 border-rose-400 p-2 text-center text-xs sm:text-sm font-bold text-rose-800">
                  {passwordError}
                </div>
              )}

              {/* Kata Sandi Lama */}
              {hasPassword && (
                <div className="relative flex items-center">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Kata Sandi Saat Ini (Kata Sandi Lama)"
                    className="w-full rounded-2xl bg-[#f8f7fc] pl-4 pr-12 py-3 text-base font-bold game-font text-[#333] border-2 border-[#8e78ca]/40 focus:border-[#7251a8] focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 p-1 text-[#474451] hover:text-black cursor-pointer"
                    aria-label="Lihat kata sandi lama"
                  >
                    {showOldPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Kata Sandi Baru */}
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Kata Sandi Baru (Min. 6 Karakter)"
                  className="w-full rounded-2xl bg-[#f8f7fc] pl-4 pr-12 py-3 text-base font-bold game-font text-[#333] border-2 border-[#8e78ca]/40 focus:border-[#7251a8] focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 p-1 text-[#474451] hover:text-black cursor-pointer"
                  aria-label="Lihat kata sandi baru"
                >
                  {showNewPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <input
                type={showNewPassword ? "text" : "password"}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Ulangi Kata Sandi Baru"
                className="w-full rounded-2xl bg-[#f8f7fc] px-4 py-3 text-base font-bold game-font text-[#333] border-2 border-[#8e78ca]/40 focus:border-[#7251a8] focus:outline-none transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full rounded-2xl bg-[#3499d0] border-3 border-white py-3 text-center text-lg font-bold game-font text-white shadow-[0px_4px_0px_0px_#0284c7] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingPassword ? "Memperbarui Kata Sandi..." : "Perbarui Kata Sandi"}
              </button>
            </form>

            {/* BAGIAN 3: PENGATURAN MUSIK & AUDIO */}
            <div className="flex flex-col gap-5 rounded-3xl border-4 border-white bg-white/95 p-5 shadow">
              <span className="game-font text-xl sm:text-2xl text-[#2a2830] font-bold">
                Audio &amp; Musik Latar
              </span>

              {/* Volume BGM */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#2a2830]">
                  <span>Volume Musik (BGM)</span>
                  <span className="text-purple-700 font-bold">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="accent-[#7251a8] h-3 bg-purple-100 rounded-lg cursor-pointer w-full"
                />
              </div>

              {/* Volume Efek Suara (SFX) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#2a2830]">
                  <span>Volume Efek Suara (SFX)</span>
                  <span className="text-purple-700 font-bold">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="accent-[#7251a8] h-3 bg-purple-100 rounded-lg cursor-pointer w-full"
                />
              </div>

              {/* Pilihan Lagu Latar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-purple-100">
                <span className="text-xs font-bold text-[#2a2830]/80 uppercase tracking-wider">
                  Pilihan Musik Latar:
                </span>
                <div className="flex flex-col gap-2">
                  {AVAILABLE_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setTrack(track.id as BgmTrack);
                        playClick();
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        currentTrack === track.id
                          ? "border-[#7251a8] bg-purple-50 shadow-sm"
                          : "border-transparent bg-[#f8f7fc] hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎵</span>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-[#2a2830]">{track.title}</span>
                          <span className="text-[11px] text-gray-500">{track.desc}</span>
                        </div>
                      </div>
                      {currentTrack === track.id && (
                        <span className="size-3 rounded-full bg-[#7251a8]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
