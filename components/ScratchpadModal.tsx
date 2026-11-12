"use client";

import { useRef, useState, useEffect } from "react";

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ScratchpadModal({
  isOpen,
  onClose,
  title = "Papan Coretan Hitungan (Transparan)",
}: ScratchpadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2563eb"); // Default warna biru terang agar kontras di atas layar
  const [lineWidth, setLineWidth] = useState(4);

  // Stack Undo & Redo (Menyimpan snapshot ImageData)
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Simpan state awal kosong saat canvas pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          // Inisialisasi snapshot kosong pertama
          const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setUndoStack([initialData]);
          setRedoStack([]);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  if (!isOpen) return null;

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Rekam snapshot saat satu tarikan garis selesai digambar
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, snapshot]);
    // Setiap kali menggambar baru, riwayat redo dibersihkan
    setRedoStack([]);
  };

  // Logika Undo: Mundur 1 langkah
  const handleUndo = () => {
    if (undoStack.length <= 1) return; // Menyisakan kanvas awal kosong
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newUndo = [...undoStack];
    const currentSnapshot = newUndo.pop(); // Ambil snapshot terakhir
    if (!currentSnapshot) return;

    // Simpan ke redo stack
    setRedoStack((prev) => [...prev, currentSnapshot]);
    setUndoStack(newUndo);

    // Render snapshot sebelumnya
    const prevSnapshot = newUndo[newUndo.length - 1];
    ctx.putImageData(prevSnapshot, 0, 0);
  };

  // Logika Redo: Maju 1 langkah
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newRedo = [...redoStack];
    const nextSnapshot = newRedo.pop();
    if (!nextSnapshot) return;

    setRedoStack(newRedo);
    setUndoStack((prev) => [...prev, nextSnapshot]);

    // Tampilkan snapshot ke kanvas
    ctx.putImageData(nextSnapshot, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const emptySnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, emptySnapshot]);
    setRedoStack([]);
  };

  const canUndo = undoStack.length > 1;
  const canRedo = redoStack.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between pointer-events-none animate-in fade-in duration-150">
      
      {/* Top Floating Glass Toolbar (Pointer-events aktif) */}
      <div className="pointer-events-auto mx-auto mt-3 w-[95%] max-w-4xl rounded-[26px] border-[5px] border-white bg-[#d5cfeb]/95 p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-[#5e65e9] text-white font-bold text-lg shadow">
            ✏️
          </span>
          <div>
            <h3 className="game-font text-base sm:text-lg text-[#2a2830] font-bold leading-tight">
              Papan Coretan Transparan
            </h3>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              👁️ Soal di belakang tetap terlihat
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Tombol Undo & Redo */}
          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-purple-200 shadow-xs">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Kembalikan 1 langkah)"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                canUndo
                  ? "bg-[#5e65e9] text-white hover:bg-[#4b52c9] cursor-pointer active:scale-95 shadow-xs"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
              </svg>
              <span>Undo</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Maju 1 langkah)"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                canRedo
                  ? "bg-[#5e65e9] text-white hover:bg-[#4b52c9] cursor-pointer active:scale-95 shadow-xs"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <span>Redo</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
              </svg>
            </button>
          </div>

          {/* Warna Pensil */}
          <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-purple-200 shadow-xs">
            {[
              { name: "Biru", hex: "#2563eb" },
              { name: "Merah", hex: "#dc2626" },
              { name: "Kuning", hex: "#f59e0b" },
              { name: "Hijau", hex: "#16a34a" },
              { name: "Putih", hex: "#ffffff" },
              { name: "Hitam", hex: "#18181b" },
            ].map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`size-6 rounded-full border-2 cursor-pointer transition-transform ${
                  color === c.hex ? "border-black scale-125 shadow" : "border-gray-300"
                }`}
                title={c.name}
              />
            ))}
          </div>

          {/* Ketebalan Garis */}
          <div className="hidden sm:flex items-center gap-1 bg-white/80 px-2 py-1 rounded-xl border border-purple-200">
            {[3, 5, 8].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`size-6 rounded-lg border flex items-center justify-center cursor-pointer ${
                  lineWidth === w ? "bg-purple-200 border-purple-600" : "bg-white border-gray-300"
                }`}
                title={`Tebal ${w}px`}
              >
                <div
                  style={{ width: `${w * 1.5}px`, height: `${w * 1.5}px` }}
                  className="rounded-full bg-[#2a2830]"
                />
              </button>
            ))}
          </div>

          {/* Tombol Hapus & Tutup */}
          <button
            onClick={clearCanvas}
            className="rounded-xl border-2 border-white bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-600 cursor-pointer active:scale-95"
          >
            Hapus
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1 rounded-xl border-2 border-white bg-[#fd363a] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-red-600 cursor-pointer active:scale-95"
          >
            <span>Tutup</span>
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Transparent Interactive Canvas */}
      <div
        className="pointer-events-auto relative flex-1 w-full my-1 cursor-crosshair touch-none bg-transparent"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full h-full"
        />

        {/* Small Watermark Hint */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 backdrop-blur-xs px-4 py-1 text-xs font-bold text-white shadow">
          ✍️ Coret di mana saja pada layar untuk menghitung
        </div>
      </div>

      {/* Bottom Minimal Hint */}
      <div className="pointer-events-none h-6" />

    </div>
  );
}
