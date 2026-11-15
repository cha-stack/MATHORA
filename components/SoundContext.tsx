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
    title: "Petualangan Ceria",
    desc: "Musik ceria bertema petualangan edukatif, membangkitkan semangat belajar.",
    tag: "Ceria & Fun",
  },
  {
    id: "bgm-lofi",
    title: "Belajar Santai & Fokus",
    desc: "Melodi santai dan menyejukkan, cocok untuk konsentrasi mengerjakan soal.",
    tag: "Fokus & Tenang",
  },
  {
    id: "bgm-retro",
    title: "Arkade 8-Bit Retro",
    desc: "Nuansa game klasik 8-bit yang penuh energi, seru, dan kompetitif.",
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
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mathora_sound_muted");
      if (saved !== null) return saved === "true";
    }
    return false;
  });
  const [bgmVolume, setBgmVolumeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mathora_bgm_volume");
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return val;
      }
    }
    return 50;
  });
  const [sfxVolume, setSfxVolumeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mathora_sfx_volume");
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return val;
      }
    }
    return 80;
  });
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>("bgm-ceria");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Inisialisasi Audio Track BGM dari storage & auto-play yang ramah browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTrack = localStorage.getItem("mathora_bgm_track") as BgmTrack;
      if (savedTrack && AVAILABLE_TRACKS.some((t) => t.id === savedTrack)) {
        setCurrentTrack(savedTrack);
      }
    }

    const audio = new Audio("/audio/bgm.mp3");
    audio.loop = true;
    audio.volume = isMuted ? 0 : bgmVolume / 100;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Coba putar langsung (berhasil jika user sudah pernah mengizinkan autoplay di situs ini)
    if (!isMuted) {
      audio.play().catch(() => {
        // Autoplay terblokir sementara oleh kebijakan browser hingga ada gestur pengguna
      });
    }

    // Listener gestur pertama pengguna (klik / sentuh / tekan tombol apapun di layar)
    const handleUserInteraction = () => {
      if (audioRef.current && !isMutedRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            cleanupInteraction();
          })
          .catch(() => {
            // Jika masih terblokir, pertahankan listener sampai sentuhan berikutnya berhasil
          });
      } else if (audioRef.current && !audioRef.current.paused) {
        cleanupInteraction();
      }
    };

    const cleanupInteraction = () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction, { passive: true });

    return () => {
      cleanupInteraction();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
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
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("mathora_sound_muted", String(next));
      }
      if (!next && audioRef.current) {
        audioRef.current.play().catch(() => {});
      } else if (next && audioRef.current) {
        audioRef.current.pause();
      }
      return next;
    });
  };

  const setBgmVolume = (val: number) => {
    setBgmVolumeState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mathora_bgm_volume", String(val));
    }
    if (val === 0) {
      setIsMuted(true);
      if (typeof window !== "undefined") localStorage.setItem("mathora_sound_muted", "true");
    } else if (isMuted) {
      setIsMuted(false);
      if (typeof window !== "undefined") localStorage.setItem("mathora_sound_muted", "false");
    }
  };

  const setSfxVolume = (val: number) => {
    setSfxVolumeState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mathora_sfx_volume", String(val));
    }
  };

  // SFX Klik Tombol Kartun
  const playClick = () => {
    // Jika BGM tertahan kebijakan autoplay browser, lanjutkan otomatis
    if (audioRef.current && !isMuted && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
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
