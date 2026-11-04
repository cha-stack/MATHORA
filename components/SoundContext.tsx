"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundContextType {
  isPlaying: boolean;
  isMuted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  toggleMute: () => void;
  setBgmVolume: (val: number) => void;
  setSfxVolume: (val: number) => void;
  playClick: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isPlaying: false,
  isMuted: false,
  bgmVolume: 50,
  sfxVolume: 80,
  toggleMute: () => {},
  setBgmVolume: () => {},
  setSfxVolume: () => {},
  playClick: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVolume, setBgmVolumeState] = useState(50);
  const [sfxVolume, setSfxVolumeState] = useState(80);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inisialisasi Audio BGM
  useEffect(() => {
    const audio = new Audio("/audio/bgm.mp3");
    audio.loop = true;
    audio.volume = bgmVolume / 100;
    audioRef.current = audio;

    // Browser mengharuskan interaksi pengguna (user gesture) sebelum auto-play audio
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying && !isMuted) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser policy: ignore jika belum ada izin interaksi aktif
          });
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

  // Update volume dan status mute saat state berubah
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

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const setBgmVolume = (val: number) => {
    setBgmVolumeState(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const setSfxVolume = (val: number) => {
    setSfxVolumeState(val);
  };

  // Efek suara klik sintesis via Web Audio API (jernih, instan, zero latency tanpa file eksternal)
  const playClick = () => {
    if (isMuted || sfxVolume === 0) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Frekuensi pop manis khas game kartun edukasi
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      const masterGain = (sfxVolume / 100) * 0.3;
      gain.gain.setValueAtTime(masterGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // fallback safe
    }
  };

  return (
    <SoundContext.Provider
      value={{
        isPlaying,
        isMuted,
        bgmVolume,
        sfxVolume,
        toggleMute,
        setBgmVolume,
        setSfxVolume,
        playClick,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
