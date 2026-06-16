import QRCode from "qrcode";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Generates a QR code data URL with a custom logo or initials embedded in the center.
 */
export async function generateQRCodeWithLogo(
  url: string,
  brandColor: string,
  logoDataUrl: string | null,
  businessName: string,
  embedLogo: boolean = false
): Promise<string> {
  // 1. Generate the base QR code
  const baseQrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 1,
    color: { dark: brandColor, light: "#ffffff" },
  });

  if (!embedLogo) {
    return baseQrDataUrl;
  }

  // 2. Load the base QR code into a canvas to draw the overlay
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(baseQrDataUrl);
      return;
    }

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      // Draw QR Code
      ctx.drawImage(qrImg, 0, 0, 400, 400);

      // Determine logo overlay dimensions (approx 22% of QR code width)
      const size = 88;
      const x = (400 - size) / 2;
      const y = (400 - size) / 2;

      // Draw white circular background block to clear QR patterns
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(200, 200, size / 2 + 4, 0, Math.PI * 2);
      ctx.fill();

      if (logoDataUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, x, y, size, size);
          ctx.restore();

          // Draw subtle border around inner logo
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(200, 200, size / 2, 0, Math.PI * 2);
          ctx.stroke();

          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.onerror = () => {
          // Fallback to initials if logo image fails
          drawInitials(ctx, x, y, size, brandColor, businessName);
          resolve(canvas.toDataURL("image/png"));
        };
        logoImg.src = logoDataUrl;
      } else {
        // Draw initials overlay
        drawInitials(ctx, x, y, size, brandColor, businessName);
        resolve(canvas.toDataURL("image/png"));
      }
    };
    qrImg.onerror = () => resolve(baseQrDataUrl);
    qrImg.src = baseQrDataUrl;
  });
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
