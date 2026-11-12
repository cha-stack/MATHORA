"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type BgmTrack = "bgm-ceria" | "bgm-lofi" | "bgm-retro";

export interface TrackOption {
  id: BgmTrack;
  title: string;
  desc: string;
  tag: string;
}

export const AVAILABLE_TRACKS: TrackOption[] = [
  {
    id: "bgm-ceria",
    title: "Joyful Adventure",
    desc: "Musik ceria khas petualangan kartun edukatif, membangkitkan semangat belajar.",
    tag: "Ceria & Fun",
  },
  {
    id: "bgm-lofi",
    title: "Chill Math Study",
    desc: "Melodi tenang santai dan menyejukkan, cocok untuk fokus mengerjakan soal.",
    tag: "Fokus & Tenang",
  },
  {
    id: "bgm-retro",
    title: "8-Bit Arcade Quest",
    desc: "Nuansa game arcade retro 8-bit klasik yang seru dan kompetitif.",
    tag: "Retro 8-Bit",
  },
];

interface SoundContextType {
  isPlaying: boolean;
  isMuted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  currentTrack: BgmTrack;
  setTrack: (track: BgmTrack) => void;
  toggleMute: () => void;
  setBgmVolume: (val: number) => void;
  setSfxVolume: (val: number) => void;
  playClick: () => void;
  playCorrect: () => void;
  playWrong: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isPlaying: false,
  isMuted: false,
  bgmVolume: 50,
  sfxVolume: 80,
  currentTrack: "bgm-ceria",
  setTrack: () => {},
  toggleMute: () => {},
  setBgmVolume: () => {},
  setSfxVolume: () => {},
  playClick: () => {},
  playCorrect: () => {},
  playWrong: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVolume, setBgmVolumeState] = useState(50);
  const [sfxVolume, setSfxVolumeState] = useState(80);
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>("bgm-ceria");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inisialisasi Audio Track BGM dari storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTrack = localStorage.getItem("mathora_bgm_track") as BgmTrack;
      if (savedTrack && AVAILABLE_TRACKS.some((t) => t.id === savedTrack)) {
        setCurrentTrack(savedTrack);
      }
    }

    const audio = new Audio("/audio/bgm.mp3");
    audio.loop = true;
    audio.volume = bgmVolume / 100;
    audioRef.current = audio;

    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying && !isMuted) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      audio.pause();
    };
  }, []);

  // Update volume & mute state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : bgmVolume / 100;
    if (isMuted) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isMuted, bgmVolume]);

  const setTrack = (track: BgmTrack) => {
    setCurrentTrack(track);
    if (typeof window !== "undefined") {
      localStorage.setItem("mathora_bgm_track", track);
    }
    // Ganti audio source jika ada file berbeda atau looping
    if (audioRef.current) {
      audioRef.current.src = "/audio/bgm.mp3";
      if (!isMuted) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const setBgmVolume = (val: number) => {
    setBgmVolumeState(val);
    if (val === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  const setSfxVolume = (val: number) => {
    setSfxVolumeState(val);
  };

  // SFX Klik Tombol Kartun
  const playClick = () => {
    if (isMuted || sfxVolume === 0) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      const masterGain = (sfxVolume / 100) * 0.3;
      gain.gain.setValueAtTime(masterGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  // SFX Jawaban Benar (Melodi Sukses)
  const playCorrect = () => {
    if (isMuted || sfxVolume === 0) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const masterGain = (sfxVolume / 100) * 0.25;
        gain.gain.setValueAtTime(masterGain, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.12);
      });
    } catch {}
  };

  // SFX Jawaban Salah (Nada Turun / "Buzz")
  const playWrong = () => {
    if (isMuted || sfxVolume === 0) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      [300, 220].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const masterGain = (sfxVolume / 100) * 0.2;
        gain.gain.setValueAtTime(masterGain, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.18);
      });
    } catch {}
  };

  return (
    <SoundContext.Provider
      value={{
        isPlaying,
        isMuted,
        bgmVolume,
        sfxVolume,
        currentTrack,
        setTrack,
        toggleMute,
        setBgmVolume,
        setSfxVolume,
        playClick,
        playCorrect,
        playWrong,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
