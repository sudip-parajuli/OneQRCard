import { CardData } from "./types";
import { SITE } from "./config";
import { generateQRCodeWithLogo } from "./qr-helper";

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
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const isSubdomainPlan = data.plan !== "basic";
  const cardUrl = isSubdomainPlan
    ? `https://${data.slug}.${baseDomain}`
    : `https://${baseDomain}/card/${data.slug}`;

  const brandColor = data.brand_color || "#085041";
  const isBusiness = data.plan === "business";
  const layout = data.card_layout || "classic";

  // 1. Generate QR code (embed logo only for Business plan)
  const qrCodeDataUrl = await generateQRCodeWithLogo(
    cardUrl,
    brandColor,
    data.logo_data_url,
    data.business_name,
    isBusiness // Embed logo if Business plan
  );

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1050;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas 2D context"));
      return;
    }

    // Define color schemes based on layout
    let bgColor = brandColor;
    let textColor = "#ffffff";
    let mutedTextColor = "rgba(255, 255, 255, 0.75)";
    let dividerColor = "rgba(255, 255, 255, 0.15)";
    let showBorder = true;
    let borderColor = "rgba(255, 255, 255, 0.08)";

    if (layout === "modern_dark") {
      bgColor = "#0f172a"; // deep slate
      textColor = "#ffffff";
      mutedTextColor = "rgba(255, 255, 255, 0.7)";
      dividerColor = "rgba(255, 255, 255, 0.1)";
      showBorder = true;
      borderColor = brandColor; // Glowing neon brand color border
    } else if (layout === "minimal_light") {
      bgColor = "#ffffff";
      textColor = "#0f172a";
      mutedTextColor = "#475569"; // slate-600
      dividerColor = "rgba(15, 23, 42, 0.08)";
      showBorder = false;
    } else {
      // Classic: calculate luminance of brand color to pick text color
      const r = parseInt(brandColor.slice(1, 3), 16) || 0;
      const g = parseInt(brandColor.slice(3, 5), 16) || 0;
      const b = parseInt(brandColor.slice(5, 7), 16) || 0;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isDark = luminance < 0.5;

      textColor = isDark ? "#ffffff" : "#0f172a";
      mutedTextColor = isDark ? "rgba(255, 255, 255, 0.75)" : "rgba(15, 23, 42, 0.75)";
      dividerColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)";
      borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)";
    }

    const drawContent = () => {
      // Draw background shapes
      if (layout === "modern_dark") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dynamic circles
        ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
        ctx.beginPath();
        ctx.arc(0, 0, 450, 0, Math.PI * 2);
        ctx.fill();
        
        // Brand color glow
        ctx.shadowColor = brandColor;
        ctx.shadowBlur = 35;
      } else if (layout === "classic") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.beginPath();
        ctx.arc(0, 0, 420, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width, canvas.height, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw border
      if (showBorder) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 14;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
      }

      // Reset shadow for text
      ctx.shadowBlur = 0;

      // Draw Left Column Details
      const startX = 80;
      let currentY = 120;

      // Business Name
      ctx.fillStyle = textColor;
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(data.business_name || "Your Business", startX, currentY);

      // Tagline
      if (data.tagline) {
        currentY += 56;
        ctx.fillStyle = mutedTextColor;
        ctx.font = "italic 22px sans-serif";
        ctx.fillText(data.tagline, startX, currentY);
      }

      // Divider
      currentY += data.tagline ? 48 : 56;
      ctx.strokeStyle = dividerColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, currentY);
      ctx.lineTo(600, currentY);
      ctx.stroke();

      // Contact Details
      currentY += 32;
      ctx.font = "20px sans-serif";
      ctx.fillStyle = textColor;

      const details = [];
      if (data.phone) details.push({ icon: "📞", text: data.phone });
      if (data.email) details.push({ icon: "✉️", text: data.email });
      if (data.website) {
        let displayWeb = data.website.replace(/^https?:\/\/(www\.)?/, "");
        if (displayWeb.length > 30) displayWeb = displayWeb.substring(0, 27) + "...";
        details.push({ icon: "🌐", text: displayWeb });
      }

      details.forEach((item) => {
        // For modern_dark layout, highlight icons with brand color
        if (layout === "modern_dark") {
          ctx.fillStyle = brandColor;
          ctx.fillText(item.icon, startX, currentY);
          ctx.fillStyle = textColor;
          ctx.fillText(`  ${item.text}`, startX + 30, currentY);
        } else {
          ctx.fillText(`${item.icon}  ${item.text}`, startX, currentY);
        }
        currentY += 48;
      });

      // Draw Logo Circle
      const logoSize = 100;
      const logoX = 500;
      const logoY = 105;

      const renderQRAndComplete = () => {
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

        // Add subtle shadow under QR box for premium look (if not minimal)
        if (layout !== "minimal_light") {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw QR code
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          // QR Text Label
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

          ctx.strokeStyle = layout === "minimal_light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          renderQRAndComplete();
        };
        logoImg.onerror = () => {
          drawInitialsFallback(logoX, logoY, logoSize, layout, brandColor, textColor, data.business_name);
          renderQRAndComplete();
        };
        logoImg.src = data.logo_data_url;
      } else {
        drawInitialsFallback(logoX, logoY, logoSize, layout, brandColor, textColor, data.business_name);
        renderQRAndComplete();
      }
    };

    const drawInitialsFallback = (
      lx: number,
      ly: number,
      ls: number,
      lay: string,
      bc: string,
      tc: string,
      bname: string
    ) => {
      ctx.fillStyle = lay === "minimal_light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.arc(lx + ls / 2, ly + ls / 2, ls / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = lay === "minimal_light" ? bc : tc;
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getInitials(bname), lx + ls / 2, ly + ls / 2);
    };

    // Load background image or color
    if (isBusiness && data.background_data_url) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = () => {
        // Draw background image scaled to fill
        const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const w = bgImg.width * scale;
        const h = bgImg.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        ctx.drawImage(bgImg, x, y, w, h);
        drawContent();
      };
      bgImg.onerror = () => {
        // Fallback to solid background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawContent();
      };
      bgImg.src = data.background_data_url;
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawContent();
    }
  });
}
