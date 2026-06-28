import QRCode from "qrcode";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function isFinderPattern(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= size - 7) return true;
  if (r >= size - 7 && c < 7) return true;
  return false;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean = true,
  stroke: boolean = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export async function generateQRCodeWithLogo(
  url: string,
  brandColor: string,
  logoDataUrl: string | null,
  businessName: string,
  embedLogo: boolean = false,
  customization?: {
    dotStyle?: "square" | "rounded" | "dots" | "waves" | "teardrops";
    cornerStyle?: "square" | "rounded" | "custom_frame" | "star_tips" | "shield";
    logoEnabled?: boolean;
    centerLogoType?: "standard" | "pixelated";
    colorStyle?: "solid" | "gradient" | "spotlight" | "duotone" | "inverse";
    gradientColor1?: string;
    gradientColor2?: string;
    spotlightColor?: string;
    duotoneColor1?: string;
    duotoneColor2?: string;
    custom_cta_frame?: string;
    bg_texture?: "none" | "wood" | "geometric" | "marble" | "linen" | "dots" | "circuit" | null;
    threeDStyle?: "none" | "raised" | "embossed" | "layered" | "chiseled" | "floating" | null;
    cta_style?: "default" | "arrow" | "hand" | "star" | null;
  } | null
): Promise<string> {
  const actualEmbedLogo = embedLogo && (customization?.logoEnabled !== false);
  const dotStyle = customization?.dotStyle || "square";
  const cornerStyle = customization?.cornerStyle || "square";
  const hasCta = customization?.custom_cta_frame && customization.custom_cta_frame.trim().length > 0;

  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const { modules } = qr;
  const size = modules.size;
  const data = modules.data;

  const canvasWidth = 400;
  const canvasHeight = hasCta ? 460 : 400;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  const isInverse = customization?.colorStyle === "inverse";
  ctx.fillStyle = isInverse ? (brandColor || "#085041") : "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const bgTexture = customization?.bg_texture || "none";
  if (bgTexture && bgTexture !== "none") {
    ctx.save();
    ctx.globalAlpha = 0.18;
    if (bgTexture === "wood") {
      ctx.strokeStyle = isInverse ? "rgba(255,255,255,0.6)" : "#8b5a2b";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvasWidth; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 8, canvasHeight * 0.3, i - 12, canvasHeight * 0.6, i + 4, canvasHeight);
        ctx.stroke();
      }
    } else if (bgTexture === "geometric") {
      ctx.strokeStyle = isInverse ? "rgba(255,255,255,0.5)" : brandColor;
      ctx.lineWidth = 0.7;
      for (let r = 20; r < canvasWidth * 1.2; r += 24) {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasWidth / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (bgTexture === "marble") {
      ctx.strokeStyle = isInverse ? "rgba(255,255,255,0.5)" : "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 50); ctx.bezierCurveTo(100, 80, 200, 20, 400, 180);
      ctx.moveTo(150, 0); ctx.bezierCurveTo(220, 200, 310, 250, 400, 390);
      ctx.moveTo(0, 200); ctx.bezierCurveTo(80, 240, 180, 160, 400, 280);
      ctx.stroke();
    } else if (bgTexture === "linen") {
      ctx.strokeStyle = isInverse ? "rgba(255,255,255,0.4)" : "#94a3b8";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < canvasWidth; i += 10) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvasHeight); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvasWidth, i); ctx.stroke();
      }
    } else if (bgTexture === "dots") {
      ctx.fillStyle = isInverse ? "rgba(255,255,255,0.5)" : brandColor;
      for (let x = 20; x < canvasWidth; x += 20) {
        for (let y = 20; y < canvasHeight; y += 20) {
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (bgTexture === "circuit") {
      ctx.strokeStyle = isInverse ? "rgba(255,255,255,0.45)" : brandColor;
      ctx.lineWidth = 0.8;
      for (let y = 40; y < canvasHeight; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x < canvasWidth; x += 40) {
          ctx.lineTo(x + 20, y); ctx.moveTo(x + 20, y);
          if ((x + y) % 80 === 0) { ctx.lineTo(x + 20, y + 20); ctx.moveTo(x + 20, y + 20); }
          ctx.lineTo(x + 40, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  const cellSize = canvasWidth / size;
  const centerStart = Math.floor(size / 2) - 3;
  const centerEnd = Math.floor(size / 2) + 3;
  const colorStyle = customization?.colorStyle || "solid";
  const isSpotlight = colorStyle === "spotlight";
  const isDuotone = colorStyle === "duotone";
  const moduleColor = isInverse ? "#ffffff" : brandColor;

  let mainModulesStyle: string | CanvasGradient = moduleColor;
  if (colorStyle === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasWidth);
    grad.addColorStop(0, customization?.gradientColor1 || brandColor);
    grad.addColorStop(1, customization?.gradientColor2 || "#10b981");
    mainModulesStyle = grad;
  } else if (isSpotlight) {
    mainModulesStyle = moduleColor + "a0";
  }

  const threeDStyle = customization?.threeDStyle || "none";
  const has3D = threeDStyle !== "none";
  if (has3D) {
    ctx.save();
    if (threeDStyle === "raised") {
      ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 3; ctx.shadowOffsetX = 1.5; ctx.shadowOffsetY = 1.5;
    } else if (threeDStyle === "embossed") {
      ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    } else if (threeDStyle === "layered") {
      ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2.5; ctx.shadowOffsetY = 2.5;
    } else if (threeDStyle === "chiseled") {
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 1; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
    } else if (threeDStyle === "floating") {
      ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 4;
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c, size)) continue;
      if (actualEmbedLogo && r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) continue;
      const isActive = data[r * size + c] === 1;
      if (!isActive) continue;
      const x = c * cellSize;
      const y = r * cellSize;

      if (isDuotone) {
        ctx.fillStyle = c < size / 2 ? (customization?.duotoneColor1 || brandColor) : (customization?.duotoneColor2 || "#10b981");
      } else {
        ctx.fillStyle = mainModulesStyle;
      }

      if (dotStyle === "dots") {
        ctx.beginPath(); ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2); ctx.fill();
      } else if (dotStyle === "rounded") {
        drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.25);
      } else if (dotStyle === "waves") {
        ctx.beginPath(); ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = isInverse ? brandColor : "#ffffff";
        ctx.lineWidth = cellSize * 0.2;
        ctx.beginPath(); ctx.moveTo(x, y + cellSize / 2); ctx.quadraticCurveTo(x + cellSize / 2, y, x + cellSize, y + cellSize / 2); ctx.stroke();
      } else if (dotStyle === "teardrops") {
        ctx.beginPath();
        ctx.moveTo(x + cellSize / 2, y);
        ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + cellSize / 2);
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI, false);
        ctx.quadraticCurveTo(x, y, x + cellSize / 2, y);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  const drawEye = (startRow: number, startCol: number) => {
    const x = startCol * cellSize;
    const y = startRow * cellSize;
    const outerSize = 7 * cellSize;
    const innerOffset = 1 * cellSize;
    const middleSize = 5 * cellSize;
    const eyeOffset = 2 * cellSize;
    const eyeSize = 3 * cellSize;
    const bg = isInverse ? brandColor : "#ffffff";
    const eyeColor = isSpotlight && customization?.spotlightColor ? customization.spotlightColor
      : (colorStyle === "gradient" ? customization?.gradientColor1 || brandColor : moduleColor);

    ctx.fillStyle = eyeColor;
    if (cornerStyle === "rounded") {
      drawRoundedRect(ctx, x, y, outerSize, outerSize, 1.5 * cellSize);
      ctx.fillStyle = bg; drawRoundedRect(ctx, x + innerOffset, y + innerOffset, middleSize, middleSize, 1.0 * cellSize);
      ctx.fillStyle = eyeColor; drawRoundedRect(ctx, x + eyeOffset, y + eyeOffset, eyeSize, eyeSize, 0.5 * cellSize);
    } else if (cornerStyle === "custom_frame") {
      ctx.beginPath(); ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2 - cellSize, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = eyeColor; ctx.beginPath(); ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2 - 2 * cellSize, 0, Math.PI * 2); ctx.fill();
    } else if (cornerStyle === "star_tips") {
      const notch = cellSize * 0.7;
      ctx.beginPath();
      ctx.moveTo(x + notch, y); ctx.lineTo(x + outerSize - notch, y); ctx.lineTo(x + outerSize, y + notch);
      ctx.lineTo(x + outerSize, y + outerSize - notch); ctx.lineTo(x + outerSize - notch, y + outerSize);
      ctx.lineTo(x + notch, y + outerSize); ctx.lineTo(x, y + outerSize - notch); ctx.lineTo(x, y + notch);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = bg; drawRoundedRect(ctx, x + innerOffset, y + innerOffset, middleSize, middleSize, cellSize * 0.6);
      ctx.fillStyle = eyeColor; drawRoundedRect(ctx, x + eyeOffset, y + eyeOffset, eyeSize, eyeSize, cellSize * 0.4);
    } else if (cornerStyle === "shield") {
      const hw = outerSize / 2;
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y); ctx.lineTo(x + outerSize - cellSize, y);
      ctx.quadraticCurveTo(x + outerSize, y, x + outerSize, y + cellSize);
      ctx.lineTo(x + outerSize, y + outerSize * 0.65);
      ctx.quadraticCurveTo(x + outerSize, y + outerSize * 0.85, x + hw, y + outerSize);
      ctx.quadraticCurveTo(x, y + outerSize * 0.85, x, y + outerSize * 0.65);
      ctx.lineTo(x, y + cellSize); ctx.quadraticCurveTo(x, y, x + cellSize, y);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = bg; drawRoundedRect(ctx, x + innerOffset, y + innerOffset, middleSize, middleSize, cellSize * 0.8);
      ctx.fillStyle = eyeColor; drawRoundedRect(ctx, x + eyeOffset, y + eyeOffset, eyeSize, eyeSize, cellSize * 0.4);
    } else {
      ctx.fillRect(x, y, outerSize, outerSize);
      ctx.fillStyle = bg; ctx.fillRect(x + innerOffset, y + innerOffset, middleSize, middleSize);
      ctx.fillStyle = eyeColor; ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
    }
  };

  drawEye(0, 0); drawEye(0, size - 7); drawEye(size - 7, 0);
  if (has3D) ctx.restore();

  if (actualEmbedLogo) {
    const logoSize = 88;
    const lx = (canvasWidth - logoSize) / 2;
    const ly = (canvasWidth - logoSize) / 2;
    const isPixelated = customization?.centerLogoType === "pixelated";

    ctx.fillStyle = isInverse ? brandColor : "#ffffff";
    ctx.beginPath();
    if (isPixelated) { ctx.rect(lx - 4, ly - 4, logoSize + 8, logoSize + 8); }
    else { ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2 + 4, 0, Math.PI * 2); }
    ctx.fill();

    if (logoDataUrl) {
      return new Promise((resolve) => {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          if (isPixelated) { ctx.rect(lx, ly, logoSize, logoSize); }
          else { ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2, 0, Math.PI * 2); }
          ctx.clip();
          ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
          ctx.restore();
          ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 2;
          ctx.beginPath();
          if (isPixelated) { ctx.rect(lx, ly, logoSize, logoSize); }
          else { ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2, 0, Math.PI * 2); }
          ctx.stroke();
          if (hasCta && customization?.custom_cta_frame) drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.onerror = () => {
          drawInitials(ctx, lx, ly, logoSize, brandColor, businessName, isPixelated, isInverse);
          if (hasCta && customization?.custom_cta_frame) drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.src = logoDataUrl;
      });
    } else {
      drawInitials(ctx, lx, ly, logoSize, brandColor, businessName, isPixelated, isInverse);
    }
  }

  if (hasCta && customization?.custom_cta_frame) drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
  return canvas.toDataURL("image/png");
}

function drawCtaFrame(ctx: CanvasRenderingContext2D, brandColor: string, text: string, width: number, ctaStyle?: "default" | "arrow" | "hand" | "star" | null) {
  ctx.fillStyle = brandColor;
  ctx.fillRect(0, 400, width, 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let formatted = text;
  if (ctaStyle === "arrow") formatted = `⬇️  ${text}  ⬇️`;
  else if (ctaStyle === "hand") formatted = `👉  ${text}`;
  else if (ctaStyle === "star") formatted = `⚡  ${text}  ⚡`;
  ctx.fillText(formatted.toUpperCase(), width / 2, 430);
}

function drawInitials(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, brandColor: string, businessName: string, isPixelated?: boolean, isInverse?: boolean) {
  ctx.fillStyle = isInverse ? "#ffffff" : brandColor;
  ctx.beginPath();
  if (isPixelated) { ctx.rect(x, y, size, size); }
  else { ctx.arc(200, 200, size / 2, 0, Math.PI * 2); }
  ctx.fill();
  const initials = getInitials(businessName);
  ctx.fillStyle = isInverse ? brandColor : "#ffffff";
  ctx.font = isPixelated ? "bold 26px monospace" : "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 200, 200);
}
