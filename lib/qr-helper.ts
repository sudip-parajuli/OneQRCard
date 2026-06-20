import QRCode from "qrcode";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function isFinderPattern(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return true; // Top-Left
  if (r < 7 && c >= size - 7) return true; // Top-Right
  if (r >= size - 7 && c < 7) return true; // Bottom-Left
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

/**
 * Generates a QR code data URL with a custom logo or initials embedded in the center,
 * with custom styling options (dot shape, corner eye shape).
 */
export async function generateQRCodeWithLogo(
  url: string,
  brandColor: string,
  logoDataUrl: string | null,
  businessName: string,
  embedLogo: boolean = false,
  customization?: {
    dotStyle?: "square" | "rounded" | "dots" | "waves" | "teardrops";
    cornerStyle?: "square" | "rounded" | "custom_frame";
    logoEnabled?: boolean;
    centerLogoType?: "standard" | "pixelated";
    colorStyle?: "solid" | "gradient" | "spotlight";
    gradientColor1?: string;
    gradientColor2?: string;
    spotlightColor?: string;
    custom_cta_frame?: string;
    bg_texture?: "none" | "wood" | "geometric" | "marble" | "linen" | null;
    threeDStyle?: "none" | "raised" | "embossed" | null;
    cta_style?: "default" | "arrow" | "hand" | "star" | null;
  } | null
): Promise<string> {
  const dotStyle = customization?.dotStyle || "square";
  const cornerStyle = customization?.cornerStyle || "square";
  const hasCta = customization?.custom_cta_frame && customization.custom_cta_frame.trim().length > 0;

  // 1. Create raw QR code matrix with High error correction
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const { modules } = qr;
  const size = modules.size;
  const data = modules.data;

  // 2. Setup canvas
  const canvasWidth = 400;
  const canvasHeight = hasCta ? 460 : 400;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context");
  }

  // Draw background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw background texture
  const bgTexture = customization?.bg_texture || "none";
  if (bgTexture && bgTexture !== "none") {
    ctx.save();
    ctx.globalAlpha = 0.08; // very light to keep scannability!
    if (bgTexture === "wood") {
      ctx.strokeStyle = "#8b5a2b";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvasWidth; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 8, canvasHeight * 0.3, i - 12, canvasHeight * 0.6, i + 4, canvasHeight);
        ctx.stroke();
      }
    } else if (bgTexture === "geometric") {
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = 0.5;
      for (let r = 20; r < canvasWidth * 1.2; r += 24) {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasWidth / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (bgTexture === "marble") {
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.bezierCurveTo(100, 80, 200, 20, 400, 180);
      ctx.moveTo(150, 0);
      ctx.bezierCurveTo(220, 200, 310, 250, 400, 390);
      ctx.stroke();
    } else if (bgTexture === "linen") {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvasWidth; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Calculate cell size
  const cellSize = canvasWidth / size;

  // Determine center clear region for logo (7x7 modules)
  const centerStart = Math.floor(size / 2) - 3;
  const centerEnd = Math.floor(size / 2) + 3;

  // Setup color styles
  const isSpotlight = customization?.colorStyle === "spotlight";
  const finderPatternColor = isSpotlight && customization?.spotlightColor ? customization.spotlightColor : brandColor;

  let mainModulesStyle: string | CanvasGradient = brandColor;
  if (customization?.colorStyle === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasWidth);
    grad.addColorStop(0, customization.gradientColor1 || brandColor);
    grad.addColorStop(1, customization.gradientColor2 || "#10b981");
    mainModulesStyle = grad;
  } else if (isSpotlight) {
    mainModulesStyle = brandColor + "a0"; // softer tint for body cells
  }

  // Setup 3D raised style shadows
  const threeDStyle = customization?.threeDStyle || "none";
  const has3D = threeDStyle !== "none";
  if (has3D) {
    ctx.save();
    if (threeDStyle === "raised") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;
    } else if (threeDStyle === "embossed") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }
  }

  // Draw modules
  ctx.fillStyle = mainModulesStyle;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns (drawn separately)
      if (isFinderPattern(r, c, size)) continue;

      // Skip center region if embedding logo
      if (embedLogo && r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
        continue;
      }

      // Check if module is active
      const isActive = data[r * size + c] === 1;
      if (!isActive) continue;

      const x = c * cellSize;
      const y = r * cellSize;

      if (dotStyle === "dots") {
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (dotStyle === "rounded") {
        drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.25);
      } else if (dotStyle === "waves") {
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = cellSize * 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize / 2);
        ctx.quadraticCurveTo(x + cellSize / 2, y, x + cellSize, y + cellSize / 2);
        ctx.stroke();
      } else if (dotStyle === "teardrops") {
        ctx.beginPath();
        ctx.moveTo(x + cellSize / 2, y);
        ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + cellSize / 2);
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI, false);
        ctx.quadraticCurveTo(x, y, x + cellSize / 2, y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  // Draw Finder Patterns (Corners)
  const drawEye = (startRow: number, startCol: number) => {
    const x = startCol * cellSize;
    const y = startRow * cellSize;
    const outerSize = 7 * cellSize;
    const innerOffset = 1 * cellSize;
    const middleSize = 5 * cellSize;
    const eyeOffset = 2 * cellSize;
    const eyeSize = 3 * cellSize;

    const eyeColor = isSpotlight && customization?.spotlightColor 
      ? customization.spotlightColor 
      : (customization?.colorStyle === "gradient" ? customization.gradientColor1 || brandColor : brandColor);

    ctx.fillStyle = eyeColor;
    if (cornerStyle === "rounded") {
      drawRoundedRect(ctx, x, y, outerSize, outerSize, 1.5 * cellSize);
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, x + innerOffset, y + innerOffset, middleSize, middleSize, 1.0 * cellSize);
      ctx.fillStyle = eyeColor;
      drawRoundedRect(ctx, x + eyeOffset, y + eyeOffset, eyeSize, eyeSize, 0.5 * cellSize);
    } else if (cornerStyle === "custom_frame") {
      ctx.beginPath();
      ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2 - cellSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2 - 2 * cellSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, outerSize, outerSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + innerOffset, y + innerOffset, middleSize, middleSize);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
    }
  };

  drawEye(0, 0);
  drawEye(0, size - 7);
  drawEye(size - 7, 0);

  if (has3D) {
    ctx.restore();
  }

  // 3. Draw central logo or initials overlay
  if (embedLogo) {
    const logoSize = 88;
    const x = (canvasWidth - logoSize) / 2;
    const y = (canvasWidth - logoSize) / 2;
    const isPixelated = customization?.centerLogoType === "pixelated";

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    if (isPixelated) {
      ctx.rect(x - 4, y - 4, logoSize + 8, logoSize + 8);
    } else {
      ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2 + 4, 0, Math.PI * 2);
    }
    ctx.fill();

    if (logoDataUrl) {
      return new Promise((resolve) => {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          if (isPixelated) {
            ctx.rect(x, y, logoSize, logoSize);
          } else {
            ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2, 0, Math.PI * 2);
          }
          ctx.clip();
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          ctx.restore();

          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (isPixelated) {
            ctx.rect(x, y, logoSize, logoSize);
          } else {
            ctx.arc(canvasWidth / 2, canvasWidth / 2, logoSize / 2, 0, Math.PI * 2);
          }
          ctx.stroke();

          // CTA Frame if present
          if (hasCta && customization?.custom_cta_frame) {
            drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
          }

          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.onerror = () => {
          drawInitials(ctx, x, y, logoSize, brandColor, businessName, isPixelated);
          if (hasCta && customization?.custom_cta_frame) {
            drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
          }
          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.src = logoDataUrl;
      });
    } else {
      drawInitials(ctx, x, y, logoSize, brandColor, businessName, isPixelated);
    }
  }

  // Draw bottom CTA Frame if present
  if (hasCta && customization?.custom_cta_frame) {
    drawCtaFrame(ctx, brandColor, customization.custom_cta_frame, canvasWidth, customization.cta_style);
  }

  return canvas.toDataURL("image/png");
}

function drawCtaFrame(
  ctx: CanvasRenderingContext2D,
  brandColor: string,
  text: string,
  width: number,
  ctaStyle?: "default" | "arrow" | "hand" | "star" | null
) {
  ctx.fillStyle = brandColor;
  ctx.fillRect(0, 400, width, 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let formatted = text;
  if (ctaStyle === "arrow") {
    formatted = `⬇️  ${text}  ⬇️`;
  } else if (ctaStyle === "hand") {
    formatted = `👉  ${text}`;
  } else if (ctaStyle === "star") {
    formatted = `⚡  ${text}  ⚡`;
  }
  ctx.fillText(formatted.toUpperCase(), width / 2, 430);
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  brandColor: string,
  businessName: string,
  isPixelated?: boolean
) {
  ctx.fillStyle = brandColor;
  ctx.beginPath();
  if (isPixelated) {
    ctx.rect(x, y, size, size);
  } else {
    ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
  }
  ctx.fill();

  const initials = getInitials(businessName);
  ctx.fillStyle = "#ffffff";
  ctx.font = isPixelated ? "bold 26px monospace" : "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 200, 200);
}
