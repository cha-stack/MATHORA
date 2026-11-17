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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let c = hex.replace(/^#/, "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
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

function drawTintedIris(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  color: string,
  width: number,
  height: number
) {
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const oCtx = offscreen.getContext("2d");
  if (!oCtx) return;

  oCtx.drawImage(img, 0, 0, width, height);

  try {
    const imgData = oCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const rgb = hexToRgb(color) || { r: 16, g: 185, b: 129 };

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a > 10) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 215 && g > 215 && b > 215) {
          continue;
        }
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      }
    }
    oCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(offscreen, 0, 0, width, height);
  } catch {
    drawTinted(ctx, img, color, width, height);
  }
}

const CharacterStudioRenderer = forwardRef<CharacterRendererHandle, CharacterStudioRendererProps>(
  ({ config, className = "", zoom = 1.0 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const renderIdRef = useRef(0);

    const renderCharacter = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentRenderId = ++renderIdRef.current;
      setIsRendering(true);

      const size = 1000;

      const curEar = EAR_OPTIONS.find((e) => e.id === config.earStyle) || EAR_OPTIONS[0];
      const curEye = EYE_OPTIONS.find((e) => e.id === config.eyeStyle) || EYE_OPTIONS[0];
      const curEyebrow = EYEBROW_OPTIONS.find((e) => e.id === config.eyebrowStyle) || EYEBROW_OPTIONS[0];
      const curNose = NOSE_OPTIONS.find((n) => n.id === config.noseStyle) || NOSE_OPTIONS[0];
      const curMouth = MOUTH_OPTIONS.find((m) => m.id === config.mouthStyle) || MOUTH_OPTIONS[0];
      const curBlush = config.blushStyle && config.blushStyle !== "none" ? BLUSH_OPTIONS.find((b) => b.id === config.blushStyle) : null;
      const curOutfit = OUTFIT_OPTIONS.find((o) => o.id === config.outfitStyle) || OUTFIT_OPTIONS[0];
      const curHair = HAIR_OPTIONS.find((h) => h.id === config.hairStyle) || HAIR_OPTIONS[0];
      const curAcc = config.accessoryStyle && config.accessoryStyle !== "none" ? ACCESSORY_OPTIONS.find((a) => a.id === config.accessoryStyle) : null;

      const [
        baseFill,
        baseLine,
        earFill,
        earLine,
        eyeSclera,
        eyeIris,
        eyeLine,
        eyebrowImg,
        noseImg,
        mouthImg,
        blushImg,
        outfitLine,
        outfitFill,
        outfitCollar,
        outfitVestFill,
        hairFill,
        hairLine,
        accImg,
      ] = await Promise.all([
        loadImage("/characters/Base/color_id230.png"),
        loadImage("/characters/Base/Base_id6.png"),
        curEar?.fill ? loadImage(curEar.fill) : Promise.resolve(null),
        curEar?.line ? loadImage(curEar.line) : Promise.resolve(null),
        curEye?.sclera ? loadImage(curEye.sclera) : Promise.resolve(null),
        curEye?.iris ? loadImage(curEye.iris) : Promise.resolve(null),
        curEye?.line ? loadImage(curEye.line) : Promise.resolve(null),
        curEyebrow?.line ? loadImage(curEyebrow.line) : Promise.resolve(null),
        curNose?.line ? loadImage(curNose.line) : Promise.resolve(null),
        curMouth?.line ? loadImage(curMouth.line) : Promise.resolve(null),
        curBlush?.line ? loadImage(curBlush.line) : Promise.resolve(null),
        curOutfit?.line ? loadImage(curOutfit.line) : Promise.resolve(null),
        curOutfit?.fill ? loadImage(curOutfit.fill) : Promise.resolve(null),
        curOutfit?.collar ? loadImage(curOutfit.collar) : Promise.resolve(null),
        curOutfit?.vestFill ? loadImage(curOutfit.vestFill) : Promise.resolve(null),
        curHair?.fill ? loadImage(curHair.fill) : Promise.resolve(null),
        curHair?.line ? loadImage(curHair.line) : Promise.resolve(null),
        curAcc?.file ? loadImage(curAcc.file) : Promise.resolve(null),
      ]);

      if (currentRenderId !== renderIdRef.current) {
        return;
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = size;
      offscreen.height = size;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      // 1. Background
      if (config.bgColor && config.bgColor !== "transparent") {
        offCtx.fillStyle = config.bgColor;
        offCtx.fillRect(0, 0, size, size);
      }

      // 2. Base Skin & Body Line
      if (baseFill) drawTinted(offCtx, baseFill, config.skinColor, size, size);
      if (baseLine) offCtx.drawImage(baseLine, 0, 0, size, size);

      // 3. Ears
      if (earFill) drawTinted(offCtx, earFill, config.skinColor, size, size);
      if (earLine) offCtx.drawImage(earLine, 0, 0, size, size);

      // 4. Eyes (Sclera -> Iris -> Line)
      if (eyeSclera) offCtx.drawImage(eyeSclera, 0, 0, size, size);
      if (eyeIris) drawTintedIris(offCtx, eyeIris, config.eyeColor, size, size);
      if (eyeLine) offCtx.drawImage(eyeLine, 0, 0, size, size);

      // 5. Eyebrows
      if (eyebrowImg) drawTinted(offCtx, eyebrowImg, config.hairColor, size, size);

      // 6. Nose
      if (noseImg) offCtx.drawImage(noseImg, 0, 0, size, size);

      // 7. Mouth
      if (mouthImg) offCtx.drawImage(mouthImg, 0, 0, size, size);

      // 8. Blush
      if (blushImg) {
        drawTinted(offCtx, blushImg, config.blushColor, size, size, 0.85);
      }

      // 9. Outfit
      if (curOutfit.id === "vest") {
        if (outfitCollar) offCtx.drawImage(outfitCollar, 0, 0, size, size);
        if (outfitVestFill) drawTinted(offCtx, outfitVestFill, config.outfitColor, size, size);
        if (outfitLine) offCtx.drawImage(outfitLine, 0, 0, size, size);
      } else {
        if (outfitFill) drawTinted(offCtx, outfitFill, config.outfitColor, size, size);
        if (outfitLine) offCtx.drawImage(outfitLine, 0, 0, size, size);
      }

      // 10. Hair
      if (hairFill) drawTinted(offCtx, hairFill, config.hairColor, size, size);
      if (hairLine) offCtx.drawImage(hairLine, 0, 0, size, size);

      // 11. Accessories
      if (accImg && curAcc) {
        if (curAcc.id === "hair_bow" && config.accessoryColor) {
          drawTinted(offCtx, accImg, config.accessoryColor, size, size);
        } else {
          offCtx.drawImage(accImg, 0, 0, size, size);
        }
      }

      if (currentRenderId !== renderIdRef.current) {
        return;
      }

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(offscreen, 0, 0, size, size);

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