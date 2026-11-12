"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  isConfetti: boolean;
}

const COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#facc15",
  "#ffffff"
];

interface CelebrationEffectsProps {
  zIndexClass?: string;
}

export default function CelebrationEffects({ zIndexClass = "z-[100]" }: CelebrationEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Gunakan resolusi 1x (tanpa DPR berlebih) agar FPS konstan 60 FPS & 0% lag
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Suara Fanfare Kemenangan Ringan (Hanya sekali saat popup muncul)
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        if (actx.state === "suspended") actx.resume();

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, actx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(actx.currentTime + idx * 0.1);
          osc.stop(actx.currentTime + idx * 0.1 + 0.36);
        });

        setTimeout(() => {
          if (actx.state !== "closed") actx.close();
        }, 1500);
      }
    } catch {}

    const particles: Particle[] = [];
    const MAX_PARTICLES = 120; // Batasi total partikel agar super ringan dan tidak lag!

    // Fungsi ledakan petasan ringkas & cepat
    const burst = (originX: number, originY: number, count = 35) => {
      if (particles.length > MAX_PARTICLES) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: Math.random() * 5 + 3,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          gravity: 0.12,
          isConfetti: Math.random() > 0.5,
        });
      }
    };

    // Ledakan awal (Kiri, Kanan, Tengah)
    burst(width * 0.25, height * 0.35, 30);
    burst(width * 0.75, height * 0.35, 30);
    burst(width * 0.5, height * 0.25, 40);

    // Burst berkala ringan (hanya sekali setiap 900ms)
    const intervalId = setInterval(() => {
      const rx = Math.random() * width * 0.7 + width * 0.15;
      const ry = Math.random() * height * 0.35 + height * 0.15;
      burst(rx, ry, 25);
    }, 900);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render semua partikel secara langsung tanpa save/restore/shadowBlur agar 0 ms delay
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.isConfetti) {
          // Kotak confetti
          ctx.fillRect(p.x, p.y, p.size * 1.6, p.size);
        } else {
          // Titik petasan bulat cepat
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 ${zIndexClass} size-full`}
      style={{ touchAction: "none" }}
    />
  );
}
