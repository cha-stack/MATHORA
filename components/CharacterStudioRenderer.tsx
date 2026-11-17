"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  CharacterConfig,
  HAIR_OPTIONS,
  EYE_OPTIONS,
  EAR_OPTIONS,
  EYEBROW_OPTIONS,
  NOSE_OPTIONS,
  MOUTH_OPTIONS,
  BLUSH_OPTIONS,
  OUTFIT_OPTIONS,
  ACCESSORY_OPTIONS,
} from "@/lib/characterConfig";

export interface CharacterRendererHandle {
  exportDataUrl: () => string;
  downloadPng: (fileName?: string) => void;
}

interface CharacterStudioRendererProps {
  config: CharacterConfig;
  className?: string;
  zoom?: number;
}

// Global image cache agar rendering instan saat ganti warna atau gaya
const imageCache: Record<string, HTMLImageElement> = {};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  if (imageCache[src] && imageCache[src].complete) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

function drawTinted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  color: string,
  width: number,
  height: number,
  alpha = 1.0
) {
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const oCtx = offscreen.getContext("2d");
  if (!oCtx) return;

  oCtx.drawImage(img, 0, 0, width, height);
  oCtx.globalCompositeOperation = "source-in";
  oCtx.fillStyle = color;
  oCtx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(offscreen, 0, 0, width, height);
  ctx.restore();
}

const CharacterStudioRenderer = forwardRef<CharacterRendererHandle, CharacterStudioRendererProps>(
  ({ config, className = "", zoom = 1.0 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    const renderCharacter = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setIsRendering(true);

      const size = 1000;
      ctx.clearRect(0, 0, size, size);

      // 1. Latar Belakang
      if (config.bgColor && config.bgColor !== "transparent") {
        ctx.fillStyle = config.bgColor;
        ctx.fillRect(0, 0, size, size);
      }

      // 2. Base Kulit & Outline Badan
      const [baseFill, baseLine] = await Promise.all([
        loadImage("/characters/Base/color_id230.png"),
        loadImage("/characters/Base/Base_id6.png"),
      ]);
      if (baseFill) drawTinted(ctx, baseFill, config.skinColor, size, size);
      if (baseLine) ctx.drawImage(baseLine, 0, 0, size, size);

      // 3. Telinga
      const curEar = EAR_OPTIONS.find((e) => e.id === config.earStyle) || EAR_OPTIONS[0];
      const [earFill, earLine] = await Promise.all([loadImage(curEar.fill), loadImage(curEar.line)]);
      if (earFill) drawTinted(ctx, earFill, config.skinColor, size, size);
      if (earLine) ctx.drawImage(earLine, 0, 0, size, size);

      // 4. Mata
      const curEye = EYE_OPTIONS.find((e) => e.id === config.eyeStyle) || EYE_OPTIONS[0];
      const [eyeSclera, eyeIris, eyeLine] = await Promise.all([
        loadImage(curEye.sclera),
        loadImage(curEye.iris),
        loadImage(curEye.line),
      ]);
      if (eyeSclera) ctx.drawImage(eyeSclera, 0, 0, size, size);
      if (eyeIris) drawTinted(ctx, eyeIris, config.eyeColor, size, size);
      if (eyeLine) ctx.drawImage(eyeLine, 0, 0, size, size);

      // 5. Alis
      const curEyebrow = EYEBROW_OPTIONS.find((e) => e.id === config.eyebrowStyle) || EYEBROW_OPTIONS[0];
      const eyebrowImg = await loadImage(curEyebrow.line);
      if (eyebrowImg) drawTinted(ctx, eyebrowImg, config.hairColor, size, size);

      // 6. Hidung
      const curNose = NOSE_OPTIONS.find((n) => n.id === config.noseStyle) || NOSE_OPTIONS[0];
      const noseImg = await loadImage(curNose.line);
      if (noseImg) ctx.drawImage(noseImg, 0, 0, size, size);

      // 7. Mulut
      const curMouth = MOUTH_OPTIONS.find((m) => m.id === config.mouthStyle) || MOUTH_OPTIONS[0];
      const mouthImg = await loadImage(curMouth.line);
      if (mouthImg) ctx.drawImage(mouthImg, 0, 0, size, size);

      // 8. Blush (Rona Pipi)
      if (config.blushStyle && config.blushStyle !== "none") {
        const curBlush = BLUSH_OPTIONS.find((b) => b.id === config.blushStyle);
        if (curBlush && curBlush.line) {
          const blushImg = await loadImage(curBlush.line);
          if (blushImg) drawTinted(ctx, blushImg, config.blushColor, size, size, 0.85);
        }
      }

      // 9. Outfit
      const curOutfit = OUTFIT_OPTIONS.find((o) => o.id === config.outfitStyle) || OUTFIT_OPTIONS[0];
      if (curOutfit.id === "vest") {
        const [vestLine, vestCollar, vestFill] = await Promise.all([
          loadImage(curOutfit.line),
          curOutfit.collar ? loadImage(curOutfit.collar) : null,
          curOutfit.vestFill ? loadImage(curOutfit.vestFill) : null,
        ]);
        if (vestCollar) ctx.drawImage(vestCollar, 0, 0, size, size);
        if (vestFill) drawTinted(ctx, vestFill, config.outfitColor, size, size);
        if (vestLine) ctx.drawImage(vestLine, 0, 0, size, size);
      } else {
        const [outfitLine, outfitFill] = await Promise.all([
          loadImage(curOutfit.line),
          curOutfit.fill ? loadImage(curOutfit.fill) : null,
        ]);
        if (outfitFill) drawTinted(ctx, outfitFill, config.outfitColor, size, size);
        if (outfitLine) ctx.drawImage(outfitLine, 0, 0, size, size);
      }

      // 10. Rambut
      const curHair = HAIR_OPTIONS.find((h) => h.id === config.hairStyle) || HAIR_OPTIONS[0];
      const [hairFill, hairLine] = await Promise.all([loadImage(curHair.fill), loadImage(curHair.line)]);
      if (hairFill) drawTinted(ctx, hairFill, config.hairColor, size, size);
      if (hairLine) ctx.drawImage(hairLine, 0, 0, size, size);

      // 11. Aksesoris
      if (config.accessoryStyle && config.accessoryStyle !== "none") {
        const curAcc = ACCESSORY_OPTIONS.find((a) => a.id === config.accessoryStyle);
        if (curAcc && curAcc.file) {
          const accImg = await loadImage(curAcc.file);
          if (accImg) {
            // Jika pita rambut, warnai dengan accessoryColor jika bukan none
            if (curAcc.id === "hair_bow" && config.accessoryColor) {
              drawTinted(ctx, accImg, config.accessoryColor, size, size);
            } else {
              ctx.drawImage(accImg, 0, 0, size, size);
            }
          }
        }
      }

      setIsRendering(false);
    }, [config]);

    useEffect(() => {
      renderCharacter();
    }, [renderCharacter]);

    useImperativeHandle(ref, () => ({
      exportDataUrl: () => {
        if (!canvasRef.current) return "";
        return canvasRef.current.toDataURL("image/png");
      },
      downloadPng: (fileName = "karakter-mathora.png") => {
        if (!canvasRef.current) return;
        const url = canvasRef.current.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
    }));

    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          className="w-full h-full object-contain transition-transform duration-150 drop-shadow-md"
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-2xl pointer-events-none">
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-md">
              Memperbarui...
            </span>
          </div>
        )}
      </div>
    );
  }
);

CharacterStudioRenderer.displayName = "CharacterStudioRenderer";

export default CharacterStudioRenderer;
