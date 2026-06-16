import QRCode from "qrcode";
import { CardData } from "./types";
import { SITE } from "./config";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Generates a high-resolution 1050x600 px (3.5" x 2" @ 300 DPI) print-ready business card
 * as a PNG data URL.
 */
export async function generateBusinessCard(data: CardData): Promise<string> {
  // 1. Determine the digital card URL
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const isSubdomainPlan = data.plan !== "basic";
  const cardUrl = isSubdomainPlan
    ? `https://${data.slug}.${baseDomain}`
    : `https://${baseDomain}/card/${data.slug}`;

  const brandColor = data.brand_color || "#085041";

  // 2. Generate the QR code data URL on the fly
  const qrCodeDataUrl = await QRCode.toDataURL(cardUrl, {
    width: 300,
    margin: 1,
    color: { dark: brandColor, light: "#ffffff" },
  });

  return new Promise((resolve, reject) => {
    // 3. Create a high-res canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1050;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas 2D context"));
      return;
    }

    // 4. Determine luminance for text contrast
    const r = parseInt(brandColor.slice(1, 3), 16) || 0;
    const g = parseInt(brandColor.slice(3, 5), 16) || 0;
    const b = parseInt(brandColor.slice(5, 7), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isDark = luminance < 0.5;

    const textColor = isDark ? "#ffffff" : "#0f172a";
    const mutedTextColor = isDark ? "rgba(255, 255, 255, 0.75)" : "rgba(15, 23, 42, 0.75)";
    const dividerColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)";

    // 5. Fill background with brand color
    ctx.fillStyle = brandColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 6. Add subtle premium background overlays/shapes
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)";
    ctx.beginPath();
    ctx.arc(0, 0, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width, canvas.height, 320, 0, Math.PI * 2);
    ctx.fill();

    // 7. Draw a clean border inside the margin
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // 8. Draw Left Column Content
    const startX = 80;
    let currentY = 120;

    // Draw Business Name
    ctx.fillStyle = textColor;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(data.business_name || "Your Business", startX, currentY);

    // Draw Tagline
    if (data.tagline) {
      currentY += 56;
      ctx.fillStyle = mutedTextColor;
      ctx.font = "italic 22px sans-serif";
      ctx.fillText(data.tagline, startX, currentY);
    }

    // Draw Divider Line
    currentY += data.tagline ? 48 : 56;
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, currentY);
    ctx.lineTo(600, currentY);
    ctx.stroke();

    // Draw Contact Details
    currentY += 32;
    ctx.font = "20px sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const details = [];
    if (data.phone) details.push({ icon: "📞", text: data.phone });
    if (data.email) details.push({ icon: "✉️", text: data.email });
    if (data.website) {
      let displayWeb = data.website.replace(/^https?:\/\/(www\.)?/, "");
      if (displayWeb.length > 30) displayWeb = displayWeb.substring(0, 27) + "...";
      details.push({ icon: "🌐", text: displayWeb });
    }

    details.forEach((item) => {
      ctx.fillText(`${item.icon}  ${item.text}`, startX, currentY);
      currentY += 48;
    });

    // 9. Draw Logo/Initials Circle
    const logoSize = 100;
    const logoX = 500;
    const logoY = 105;

    const renderQRAndComplete = () => {
      // 10. Draw QR Code Frame on the Right Column
      const qrSize = 260;
      const qrX = canvas.width - qrSize - 80;
      const qrY = (canvas.height - qrSize) / 2 - 20;

      // Draw rounded white box for QR Code
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 76, 20);
      } else {
        ctx.rect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 76);
      }
      ctx.fill();

      // Load and draw QR code
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // Draw "SCAN TO CONNECT" text below the QR Code
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SCAN TO CONNECT", qrX + qrSize / 2, qrY + qrSize + 28);

        resolve(canvas.toDataURL("image/png"));
      };
      qrImg.onerror = () => reject(new Error("Failed to load QR code image"));
      qrImg.src = qrCodeDataUrl;
    };

    if (data.logo_data_url) {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Draw subtle ring around logo
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.1)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        renderQRAndComplete();
      };
      logoImg.onerror = () => {
        // Fallback to initials if logo fails to load
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)";
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(getInitials(data.business_name), logoX + logoSize / 2, logoY + logoSize / 2);

        renderQRAndComplete();
      };
      logoImg.src = data.logo_data_url;
    } else {
      // Draw initials instead
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)";
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getInitials(data.business_name), logoX + logoSize / 2, logoY + logoSize / 2);

      renderQRAndComplete();
    }
  });
}
