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
    dotStyle?: "square" | "rounded" | "dots";
    cornerStyle?: "square" | "rounded";
  } | null
): Promise<string> {
  const dotStyle = customization?.dotStyle || "square";
  const cornerStyle = customization?.cornerStyle || "square";

  // 1. Create raw QR code matrix with High error correction
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const { modules } = qr;
  const size = modules.size;
  const data = modules.data;

  // 2. Setup canvas
  const canvasWidth = 400;
  const canvasHeight = 400;
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

  // Calculate cell size
  const cellSize = canvasWidth / size;

  // Determine center clear region for logo (7x7 modules)
  const centerStart = Math.floor(size / 2) - 3;
  const centerEnd = Math.floor(size / 2) + 3;

  // Draw modules
  ctx.fillStyle = brandColor;
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

    ctx.fillStyle = brandColor;
    if (cornerStyle === "rounded") {
      // Outer ring
      drawRoundedRect(ctx, x, y, outerSize, outerSize, 1.5 * cellSize);
      // Cutout inner spacer
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, x + innerOffset, y + innerOffset, middleSize, middleSize, 1.0 * cellSize);
      // Inner eye
      ctx.fillStyle = brandColor;
      drawRoundedRect(ctx, x + eyeOffset, y + eyeOffset, eyeSize, eyeSize, 0.5 * cellSize);
    } else {
      // Outer ring
      ctx.fillRect(x, y, outerSize, outerSize);
      // Cutout inner spacer
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + innerOffset, y + innerOffset, middleSize, middleSize);
      // Inner eye
      ctx.fillStyle = brandColor;
      ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
    }
  };

  // Draw Top-Left, Top-Right, and Bottom-Left eyes
  drawEye(0, 0);
  drawEye(0, size - 7);
  drawEye(size - 7, 0);

  // 3. Draw central logo or initials overlay
  if (embedLogo) {
    const logoSize = 88;
    const x = (canvasWidth - logoSize) / 2;
    const y = (canvasHeight - logoSize) / 2;

    // Draw white circular background block
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, logoSize / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    if (logoDataUrl) {
      return new Promise((resolve) => {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvasWidth / 2, canvasHeight / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          ctx.restore();

          // Subtle inner border
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(canvasWidth / 2, canvasHeight / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.onerror = () => {
          drawInitials(ctx, x, y, logoSize, brandColor, businessName);
          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.src = logoDataUrl;
      });
    } else {
      drawInitials(ctx, x, y, logoSize, brandColor, businessName);
    }
  }

  return canvas.toDataURL("image/png");
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  brandColor: string,
  businessName: string
) {
  // Draw brand color circle
  ctx.fillStyle = brandColor;
  ctx.beginPath();
  ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw initials text
  const initials = getInitials(businessName);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 200, 200);
}
