"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import GameShell from "@/components/GameShell";
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
import { getCurrentUser, updateUserProfile } from "@/lib/auth";
import { useSound } from "@/components/SoundContext";

type CategoryType =
  | "badan"
  | "rambut"
  | "mata"
  | "outfit"
  | "aksesoris"
  | "blush"
  | "telinga"
  | "alis"
  | "hidung"
  | "mulut"
  | "latar";

interface CategoryMeta {
  id: CategoryType;
  label: string;
  icon: string;
  hasColor: boolean;
  colorField?: keyof CharacterConfig;
  paletteKey?: keyof typeof COLOR_PALETTES;
}

const CATEGORIES: CategoryMeta[] = [
  { id: "badan", label: "Badan", icon: "🧑", hasColor: true, colorField: "skinColor", paletteKey: "skin" },
  { id: "rambut", label: "Rambut", icon: "💇", hasColor: true, colorField: "hairColor", paletteKey: "hair" },
  { id: "mata", label: "Mata", icon: "👁️", hasColor: true, colorField: "eyeColor", paletteKey: "eye" },
  { id: "outfit", label: "Outfit", icon: "👕", hasColor: true, colorField: "outfitColor", paletteKey: "outfit" },
  { id: "aksesoris", label: "Aksesoris", icon: "🎀", hasColor: true, colorField: "accessoryColor", paletteKey: "accessory" },
  { id: "blush", label: "Blush", icon: "💖", hasColor: true, colorField: "blushColor", paletteKey: "blush" },
  { id: "telinga", label: "Telinga", icon: "🧝", hasColor: false },
  { id: "alis", label: "Alis", icon: "✏️", hasColor: false },
  { id: "hidung", label: "Hidung", icon: "👃", hasColor: false },
  { id: "mulut", label: "Mulut", icon: "👄", hasColor: false },
  { id: "latar", label: "Latar", icon: "🎨", hasColor: true, colorField: "bgColor", paletteKey: "bg" },
];

export default function StudioKarakterPage() {
  const { playClick, playCorrect } = useSound();
  const rendererRef = useRef<CharacterRendererHandle | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryType>("blush");
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [zoom, setZoom] = useState(1.0);
  const [viewMode, setViewMode] = useState<"auto" | "hp" | "desktop">("auto");
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);

  // Muat konfigurasi karakter tersimpan siswa jika ada
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.username) {
      try {
        const saved = localStorage.getItem(`mathora_char_cfg_${user.username}`);
        if (saved) {
          setConfig(JSON.parse(saved));
        }
      } catch {
        // Abaikan jika gagal parse
      }
    }
  }, []);

  const curCatMeta = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  const handleRandomize = () => {
    playClick();
    const randomized = getRandomCharacterConfig();
    setConfig((prev) => ({
      ...randomized,
      bgColor: prev.bgColor, // Pertahankan preferensi latar
    }));
  };

  const handleReset = () => {
    playClick();
    setConfig(DEFAULT_CHARACTER);
  };

  const handleZoomIn = () => {
    playClick();
    setZoom((prev) => Math.min(1.5, prev + 0.1));
  };

  const handleZoomOut = () => {
    playClick();
    setZoom((prev) => Math.max(0.7, prev - 0.1));
  };

  const handleDownload = () => {
    playClick();
    if (rendererRef.current) {
      rendererRef.current.downloadPng("karakter-mathora.png");
    }
  };

  const handleSaveAvatar = async () => {
    playClick();
    if (!rendererRef.current) return;

    setIsSaving(true);
    setSaveNotification(null);

    try {
      const dataUrl = rendererRef.current.exportDataUrl();
      const user = getCurrentUser();

      if (user?.username) {
        // Simpan konfigurasi JSON untuk dapat diedit kembali nanti
        localStorage.setItem(`mathora_char_cfg_${user.username}`, JSON.stringify(config));
        // Update avatar profil user ke data URL gambar
        const res = await updateUserProfile(user.username, dataUrl);
        if (res.success) {
          playCorrect();
          setSaveNotification("Avatar berhasil disimpan! Karakter barumu kini aktif di Mathora.");
        } else {
          setSaveNotification(res.message || "Gagal menyimpan avatar.");
        }
      } else {
        setSaveNotification("Silakan login terlebih dahulu untuk menyimpan avatar.");
      }
    } catch {
      setSaveNotification("Terjadi kendala saat menyimpan avatar.");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveNotification(null);
      }, 5000);
    }
  };

  return (
    <GameShell backUrl="/dashboard/siswa" showBack={true}>
      <div className="flex w-full flex-col items-center px-2 sm:px-4 py-2">
        {/* Main Studio Card Container */}
        <div className="relative w-full max-w-6xl rounded-[28px] sm:rounded-[36px] border-[5px] sm:border-[7px] border-white bg-[#ece7f6] p-3.5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xs flex flex-col gap-4">
          
          {/* Header Bar Studio */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#8e78ca]/30 pb-3">
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 sm:size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white shadow-md border-2 border-white">
                <span className="text-xl sm:text-2xl">✨</span>
              </div>
              <div>
                <h1 className="game-font text-xl sm:text-2xl md:text-3xl font-bold text-[#2a2830] leading-none">
                  ChibiForge Mathora
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#6b52b8] mt-0.5">
                  Studio Kustomisasi Karakter 2D Siswa
                </p>
              </div>
            </div>

            {/* View Mode & Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Device View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-white/80 p-1 border border-[#8e78ca]/40 shadow-xs text-xs font-bold text-[#4c3575]">
                <button
                  type="button"
                  onClick={() => { playClick(); setViewMode("hp"); }}
                  className={`px-2 py-1 rounded-lg transition-colors ${viewMode === "hp" ? "bg-[#7c3aed] text-white" : "hover:bg-purple-100"}`}
                >
                  📱 HP
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setViewMode("auto"); }}
                  className={`px-2 py-1 rounded-lg transition-colors ${viewMode === "auto" ? "bg-[#7c3aed] text-white" : "hover:bg-purple-100"}`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setViewMode("desktop"); }}
                  className={`px-2 py-1 rounded-lg transition-colors ${viewMode === "desktop" ? "bg-[#7c3aed] text-white" : "hover:bg-purple-100"}`}
                >
                  💻 Desktop
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => { playClick(); setShowInfoModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#8e78ca]/40 text-xs font-bold text-[#4c3575] hover:bg-purple-50 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Petunjuk Studio"
              >
                <span>ℹ️</span>
                <span className="hidden md:inline">Info</span>
              </button>

              <button
                type="button"
                onClick={() => { playClick(); setShowLayerModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#8e78ca]/40 text-xs font-bold text-[#4c3575] hover:bg-purple-50 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Daftar Lapisan Karakter"
              >
                <span>📑</span>
                <span className="hidden md:inline">Layer</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#8e78ca]/40 text-xs font-bold text-[#4c3575] hover:bg-purple-50 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Kembalikan ke Karakter Awal"
              >
                <span>🔄</span>
                <span className="hidden md:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9333ea] text-white text-xs font-bold shadow-sm hover:bg-[#7e22ce] transition-transform active:scale-95 cursor-pointer"
                title="Acak Kombinasi Karakter"
              >
                <span>🎲</span>
                <span>Acak</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold shadow-sm hover:bg-[#0369a1] transition-transform active:scale-95 cursor-pointer"
                title="Unduh Gambar PNG"
              >
                <span>📥</span>
                <span className="hidden sm:inline">Unduh</span>
              </button>

              {/* Simpan Avatar Mathora */}
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1cd8a4] border-2 border-white text-emerald-950 text-xs sm:text-sm font-bold shadow-md hover:bg-[#14b88a] transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <span>⭐</span>
                <span>{isSaving ? "Menyimpan..." : "Pakai Avatar"}</span>
              </button>
            </div>
          </div>

          {/* Notifikasi Penyimpanan */}
          {saveNotification && (
            <div className="w-full rounded-2xl bg-emerald-500 text-white p-3 text-center text-sm font-bold shadow-md border-2 border-white animate-bounce">
              {saveNotification}
            </div>
          )}

          {/* Body Workspace: Canvas Preview + Controls Panel */}
          <div
            className={`grid gap-5 items-start ${
              viewMode === "hp"
                ? "grid-cols-1"
                : viewMode === "desktop"
                ? "grid-cols-1 md:grid-cols-12"
                : "grid-cols-1 lg:grid-cols-12"
            }`}
          >
            {/* Sisi Kiri: Live Canvas Preview Stage */}
            <div
              className={`flex flex-col items-center justify-between rounded-3xl border-4 border-white bg-white/90 p-4 shadow-md ${
                viewMode === "hp"
                  ? "w-full max-w-sm mx-auto"
                  : viewMode === "desktop"
                  ? "md:col-span-5"
                  : "lg:col-span-5"
              }`}
            >
              {/* Zoom Controls di Atas Canvas */}
              <div className="w-full flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold text-[#6b52b8] uppercase tracking-wider">
                  Pratinjau Karakter
                </span>
                <div className="flex items-center gap-1 bg-[#f3edf9] rounded-lg px-2 py-0.5 border border-[#8e78ca]/30 text-xs font-bold text-[#4c3575]">
                  <button type="button" onClick={handleZoomOut} className="px-1 hover:text-purple-900 cursor-pointer">
                    🔍 -
                  </button>
                  <span className="px-1">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={handleZoomIn} className="px-1 hover:text-purple-900 cursor-pointer">
                    +
                  </button>
                </div>
              </div>

              {/* Box Kanvas Karakter 2D */}
              <div
                className="relative size-64 sm:size-72 md:size-80 lg:size-96 rounded-2xl border-2 border-[#8e78ca]/20 overflow-hidden flex items-center justify-center shadow-inner"
                style={{
                  backgroundImage:
                    config.bgColor === "transparent"
                      ? "radial-gradient(#c4b5fd 0.75px, transparent 0.75px), radial-gradient(#c4b5fd 0.75px, #fdfbff 0.75px)"
                      : "none",
                  backgroundColor: config.bgColor === "transparent" ? "#fbf8fe" : config.bgColor,
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                }}
              >
                <CharacterStudioRenderer
                  ref={rendererRef}
                  config={config}
                  zoom={zoom}
                  className="w-full h-full"
                />
              </div>

              {/* Status Transparansi & Info di Bawah Canvas */}
              <div className="w-full mt-3 flex items-center justify-between px-2 text-xs font-semibold text-[#555]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.bgColor === "transparent"}
                    onChange={(e) => {
                      playClick();
                      setConfig((prev) => ({
                        ...prev,
                        bgColor: e.target.checked ? "transparent" : "#e5dbf5",
                      }));
                    }}
                    className="accent-[#7c3aed] size-4 rounded cursor-pointer"
                  />
                  <span>Latar Transparan (PNG)</span>
                </label>
                <span className="text-[#8e78ca] font-bold">1000 × 1000 px</span>
              </div>
            </div>

            {/* Sisi Kanan: Panel Pilihan Kategori, Warna & Item */}
            <div
              className={`flex flex-col gap-3 rounded-3xl border-4 border-white bg-white/95 p-4 sm:p-5 shadow-md ${
                viewMode === "hp"
                  ? "w-full"
                  : viewMode === "desktop"
                  ? "md:col-span-7"
                  : "lg:col-span-7"
              }`}
            >
              {/* Navigation Tabs Kategori (Horizontal Scrollable) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#8e78ca] scrollbar-track-purple-50">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setActiveCategory(cat.id);
                      }}
                      className={`flex flex-col items-center justify-center shrink-0 min-w-[62px] sm:min-w-[70px] py-2 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-[#7c3aed] bg-[#7c3aed] text-white shadow-md scale-102"
                          : "border-[#e0d7f2] bg-[#f8f5fc] text-[#474451] hover:bg-purple-100"
                      }`}
                    >
                      <span className="text-xl sm:text-2xl mb-1">{cat.icon}</span>
                      <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Header Kategori: Judul Kategori & Palet Warna */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#f4effa] p-3 border border-[#8e78ca]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#7c3aed]" />
                    <h2 className="game-font text-base sm:text-lg text-[#2a2830] font-bold">
                      {curCatMeta.label}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[#6b52b8] bg-white px-2 py-0.5 rounded-full border border-purple-200">
                    Kustomisasi Aktif
                  </span>
                </div>

                {/* Barisan Palet Warna jika kategori mendukung warna */}
                {curCatMeta.hasColor && curCatMeta.colorField && curCatMeta.paletteKey && (
                  <div className="mt-1 flex flex-col gap-1.5 pt-2 border-t border-purple-200/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b52b8]">
                      Warna {curCatMeta.label}:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_PALETTES[curCatMeta.paletteKey].map((pal) => {
                        const currentColor = config[curCatMeta.colorField!];
                        const isSelected = currentColor.toLowerCase() === pal.hex.toLowerCase();
                        return (
                          <button
                            key={pal.hex}
                            type="button"
                            onClick={() => {
                              playClick();
                              setConfig((prev) => ({
                                ...prev,
                                [curCatMeta.colorField!]: pal.hex,
                              }));
                            }}
                            title={pal.label}
                            style={{
                              backgroundColor: pal.hex === "transparent" ? "#ffffff" : pal.hex,
                              backgroundImage:
                                pal.hex === "transparent"
                                  ? "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)"
                                  : "none",
                              backgroundSize: "8px 8px",
                            }}
                            className={`size-7 sm:size-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                              isSelected
                                ? "border-[#7c3aed] scale-110 ring-2 ring-purple-300"
                                : "border-white hover:scale-105"
                            }`}
                          >
                            {isSelected && (
                              <span
                                className={`text-xs font-bold ${
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

                      {/* Custom Hex Color Picker Pipette */}
                      <div className="relative flex items-center gap-1.5 ml-1 pl-2 border-l border-purple-300">
                        <label className="flex items-center gap-1 cursor-pointer" title="Pilih Warna Kustom">
                          <input
                            type="color"
                            value={
                              config[curCatMeta.colorField] === "transparent"
                                ? "#ffffff"
                                : config[curCatMeta.colorField]
                            }
                            onChange={(e) => {
                              setConfig((prev) => ({
                                ...prev,
                                [curCatMeta.colorField!]: e.target.value,
                              }));
                            }}
                            className="size-7 rounded-lg border-2 border-white shadow-xs cursor-pointer p-0"
                          />
                          <span className="text-[11px] font-bold text-[#6b52b8] hidden sm:inline">Kustom</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Pilihan Gaya / Item sesuai Kategori */}
              <div className="mt-1 max-h-[360px] overflow-y-auto pr-1">
                {/* 1. BADAN / KULIT */}
                {activeCategory === "badan" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => { playClick(); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border-3 border-[#7c3aed] bg-purple-50 shadow-sm cursor-pointer"
                    >
                      <span className="text-3xl mb-1">🧍</span>
                      <span className="text-xs font-bold text-[#2a2830]">Badan Proporsional</span>
                      <span className="text-[10px] text-emerald-600 font-bold mt-1">✓ Aktif</span>
                    </div>
                  </div>
                )}

                {/* 2. RAMBUT */}
                {activeCategory === "rambut" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {HAIR_OPTIONS.map((opt) => {
                      const isSelected = config.hairStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, hairStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-16 sm:size-18 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. MATA */}
                {activeCategory === "mata" && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {EYE_OPTIONS.map((opt) => {
                      const isSelected = config.eyeStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, eyeStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-16 sm:size-18 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. OUTFIT */}
                {activeCategory === "outfit" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {OUTFIT_OPTIONS.map((opt) => {
                      const isSelected = config.outfitStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, outfitStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-18 sm:size-20 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. AKSESORIS */}
                {activeCategory === "aksesoris" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {ACCESSORY_OPTIONS.map((opt) => {
                      const isSelected = config.accessoryStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, accessoryStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-16 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {opt.file ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={opt.file} alt={opt.label} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-2xl text-gray-400">🚫</span>
                            )}
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 6. BLUSH / RONA PIPI */}
                {activeCategory === "blush" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BLUSH_OPTIONS.map((opt) => {
                      const isSelected = config.blushStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, blushStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-16 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {opt.line ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-2xl text-gray-400">🚫</span>
                            )}
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 7. TELINGA */}
                {activeCategory === "telinga" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {EAR_OPTIONS.map((opt) => {
                      const isSelected = config.earStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, earStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-16 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.preview} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 8. ALIS */}
                {activeCategory === "alis" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {EYEBROW_OPTIONS.map((opt) => {
                      const isSelected = config.eyebrowStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, eyebrowStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-14 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 9. HIDUNG */}
                {activeCategory === "hidung" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {NOSE_OPTIONS.map((opt) => {
                      const isSelected = config.noseStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, noseStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-14 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 10. MULUT */}
                {activeCategory === "mulut" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {MOUTH_OPTIONS.map((opt) => {
                      const isSelected = config.mouthStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, mouthStyle: opt.id }));
                          }}
                          className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div className="relative size-14 rounded-xl bg-[#fdfbff] border border-purple-100 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.line} alt={opt.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center line-clamp-1">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#7c3aed] text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 11. LATAR */}
                {activeCategory === "latar" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {COLOR_PALETTES.bg.map((opt) => {
                      const isSelected = config.bgColor.toLowerCase() === opt.hex.toLowerCase();
                      return (
                        <button
                          key={opt.hex}
                          type="button"
                          onClick={() => {
                            playClick();
                            setConfig((prev) => ({ ...prev, bgColor: opt.hex }));
                          }}
                          className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-100 shadow-md ring-2 ring-purple-300"
                              : "border-[#e0d7f2] bg-white hover:bg-purple-50"
                          }`}
                        >
                          <div
                            className="size-12 rounded-xl border border-gray-300 shadow-inner flex items-center justify-center"
                            style={{
                              backgroundColor: opt.hex === "transparent" ? "#ffffff" : opt.hex,
                              backgroundImage:
                                opt.hex === "transparent"
                                  ? "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)"
                                  : "none",
                              backgroundSize: "8px 8px",
                            }}
                          >
                            {isSelected && <span className="text-black font-bold text-sm">✓</span>}
                          </div>
                          <span className="mt-1.5 text-xs font-bold text-[#2a2830] text-center">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Info Studio */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-lg rounded-3xl border-4 border-white bg-white p-6 shadow-2xl flex flex-col gap-3">
              <h3 className="game-font text-2xl font-bold text-[#2a2830] flex items-center gap-2">
                <span>ℹ️</span> Tentang ChibiForge Mathora
              </h3>
              <p className="text-sm text-[#444] leading-relaxed">
                Studio ini memungkinkan siswa mendesain karakter avatar pelajar 2D secara bebas dengan ribuan kombinasi gaya rambut, mata, ekspresi wajah, pakaian sekolah, aksesoris, serta warna pilihan.
              </p>
              <ul className="text-xs text-[#555] flex flex-col gap-1.5 list-disc pl-5">
                <li><strong>Pakai Avatar:</strong> Menyimpan karakter langsung sebagai foto profil aktifmu di seluruh aplikasi Mathora.</li>
                <li><strong>Unduh:</strong> Mengunduh gambar karakter resolusi tinggi 1000×1000px untuk disimpan di galeri perangkat.</li>
                <li><strong>Acak (🎲):</strong> Dapatkan inspirasi kombinasi karakter seru dalam satu kali klik!</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold text-sm hover:bg-[#6b21a8] transition-colors cursor-pointer"
              >
                Mengerti &amp; Tutup
              </button>
            </div>
          </div>
        )}

        {/* Modal Layer */}
        {showLayerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-3xl border-4 border-white bg-white p-6 shadow-2xl flex flex-col gap-3">
              <h3 className="game-font text-2xl font-bold text-[#2a2830] flex items-center gap-2">
                <span>📑</span> Susunan Lapisan Karakter (Layer)
              </h3>
              <p className="text-xs text-[#555]">
                Karakter disusun dari 11 lapisan kanvas transparan bertumpuk dari bawah ke atas:
              </p>
              <ol className="text-xs text-[#444] flex flex-col gap-1 list-decimal pl-5 font-semibold">
                <li>Latar Belakang (Warna / Transparan)</li>
                <li>Badan &amp; Kulit (Line + Fill)</li>
                <li>Telinga (Normal / Peri Elf)</li>
                <li>Mata &amp; Iris (Warna Mata)</li>
                <li>Alis Mata</li>
                <li>Hidung</li>
                <li>Mulut &amp; Ekspresi Wajah</li>
                <li>Rona Pipi (Blush)</li>
                <li>Pakaian / Outfit Sekolah</li>
                <li>Rambut &amp; Poni (Warna Rambut)</li>
                <li>Aksesoris (Pita, Kacamata, Topi, dll.)</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowLayerModal(false)}
                className="mt-2 w-full py-2 rounded-xl bg-[#7c3aed] text-white font-bold text-sm hover:bg-[#6b21a8] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
