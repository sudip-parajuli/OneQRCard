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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Failed to load image: " + src));
    img.src = src;
  });
}

/**
 * Generates a high-resolution 1050x600 px (3.5" x 2" @ 300 DPI) print-ready business card
 * as a PNG data URL.
 */
export async function generateBusinessCard(data: CardData): Promise<string> {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const isSubdomainPlan = false; // Disabled until custom domain is ready
  const cardUrl = `https://${baseDomain}/card/${data.slug}`;

  const brandColor = data.brand_color || "#085041";
  const isPaid = data.plan !== "basic";
  const bcSettings = data.design_settings?.business_card || {};
  const bcTheme = bcSettings.theme || data.card_layout || "classic";
  const bcBgTexture = bcSettings.bg_texture || "none";
  const bcShowLogo = bcSettings.show_logo !== false;
  const bcWatermark = bcSettings.watermark_logo !== false;
  const bcWatermarkOpacity = bcSettings.watermark_opacity ?? 0.06;
  const bcBorderRadius = bcSettings.border_radius || "none";
  const bcBorderGlow = bcSettings.border_glow ?? false;
  const layout = bcTheme; // fallback mapping

  // 1. Generate QR code (embed logo for Pro & Business plans)
  const qrCodeDataUrl = await generateQRCodeWithLogo(
    cardUrl,
    brandColor,
    data.logo_data_url,
    data.business_name,
    isPaid
  );

  // 2. Pre-load all required images in parallel
  const imageSources: Record<string, string> = { qr: qrCodeDataUrl };
  if (data.logo_data_url) {
    imageSources.logo = data.logo_data_url;
  }
  if (data.plan === "business" && data.background_data_url) {
    imageSources.bg = data.background_data_url;
  }

  const loadedImages: Record<string, HTMLImageElement | null> = {};
  await Promise.all(
    Object.entries(imageSources).map(async ([key, src]) => {
      try {
        loadedImages[key] = await loadImage(src);
      } catch (err) {
        console.error(`Error preloading image ${key}:`, err);
        loadedImages[key] = null;
      }
    })
  );

  // 3. Setup canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1050;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }

  // 4. Colors and layout configuration
  let bgColor = brandColor;
  let textColor = "#ffffff";
  let mutedTextColor = "rgba(255, 255, 255, 0.75)";
  let dividerColor = "rgba(255, 255, 255, 0.15)";
  let showBorder = true;
  let borderColor = "rgba(255, 255, 255, 0.08)";

  // Apply rounded card boundary clipping if requested
  if (bcBorderRadius !== "none") {
    let radius = 30;
    if (bcBorderRadius === "small") radius = 15;
    else if (bcBorderRadius === "large") radius = 50;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
  }

  if (bcTheme === "modern_dark") {
    bgColor = "#0f172a";
    textColor = "#ffffff";
    mutedTextColor = "rgba(255, 255, 255, 0.7)";
    dividerColor = "rgba(255, 255, 255, 0.1)";
    borderColor = brandColor;
    showBorder = true;
  } else if (bcTheme === "minimal_light") {
    bgColor = "#ffffff";
    textColor = "#0f172a";
    mutedTextColor = "#475569";
    dividerColor = "rgba(15, 23, 42, 0.08)";
    showBorder = false;
  } else if (bcTheme === "luxury_gold") {
    bgColor = "#1e1e1e";
    textColor = "#d4af37";
    mutedTextColor = "#b5942b";
    dividerColor = "rgba(212, 175, 55, 0.25)";
    borderColor = "#d4af37";
    showBorder = true;
  } else if (bcTheme === "neon_glow") {
    bgColor = "#090d16";
    textColor = "#00f2fe";
    mutedTextColor = "#8b5cf6";
    dividerColor = "rgba(0, 242, 254, 0.2)";
    borderColor = "#00f2fe";
    showBorder = true;
  } else if (bcTheme === "organic_wood") {
    bgColor = "#3e2723";
    textColor = "#f5f5f5";
    mutedTextColor = "#d7ccc8";
    dividerColor = "rgba(215, 204, 200, 0.2)";
    borderColor = "#8d6e63";
    showBorder = true;
  } else {
    // Classic: pick text colors based on brand color contrast
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

  // 5. Draw Background Color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 6. Draw custom background image if available (Business only)
  if (loadedImages.bg) {
    const bgImg = loadedImages.bg;
    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
    const w = bgImg.width * scale;
    const h = bgImg.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(bgImg, x, y, w, h);
  }

  // 7. Draw Logo Watermark in background with opacity
  if (bcWatermark && loadedImages.logo) {
    ctx.save();
    ctx.globalAlpha = bcWatermarkOpacity; // watermark opacity
    const wmSize = 500;
    const wmX = (canvas.width - wmSize) / 2;
    const wmY = (canvas.height - wmSize) / 2;

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, wmSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(loadedImages.logo, wmX, wmY, wmSize, wmSize);
    ctx.restore();
  }

  // Draw background texture overlay if configured
  if (bcBgTexture && bcBgTexture !== "none") {
    ctx.save();
    ctx.globalAlpha = 0.12; // light overlay texture
    if (bcBgTexture === "metal") {
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width + canvas.height; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - canvas.height, canvas.height);
        ctx.stroke();
      }
    } else if (bcBgTexture === "wood") {
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      for (let i = -100; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 20, canvas.height * 0.3, i - 30, canvas.height * 0.7, i + 10, canvas.height);
        ctx.stroke();
      }
    } else if (bcBgTexture === "geometric") {
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5;
      for (let r = 50; r < canvas.width; r += 60) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (bcBgTexture === "marble") {
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.bezierCurveTo(200, 150, 400, 50, 1050, 450);
      ctx.moveTo(300, 0);
      ctx.bezierCurveTo(500, 300, 700, 400, 1050, 100);
      ctx.stroke();
    } else if (bcBgTexture === "linen") {
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 12) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 12) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 8. Draw background styling overlays
  if (bcTheme === "modern_dark") {
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
    ctx.beginPath();
    ctx.arc(0, 0, 450, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow border effect
    ctx.shadowColor = brandColor;
    ctx.shadowBlur = 35;
  } else if (bcTheme === "neon_glow") {
    ctx.fillStyle = "rgba(9, 13, 22, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "#00f2fe";
    ctx.shadowBlur = 40;
  } else if (bcTheme === "luxury_gold") {
    ctx.fillStyle = "rgba(30, 30, 30, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(214, 175, 55, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
  } else if (bcTheme === "classic" && !loadedImages.bg) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.arc(0, 0, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width, canvas.height, 320, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Draw border
  if (showBorder) {
    if (bcBorderGlow || bcTheme === "neon_glow") {
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 35;
    }
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
    ctx.shadowBlur = 0; // reset shadow glow
  }

  // 10. Draw Left Column Text
  const startX = 80;
  let currentY = 120;

  ctx.fillStyle = textColor;
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const displayName = data.member_name || data.business_name || "Your Business";
  ctx.fillText(displayName, startX, currentY);

  if (data.member_name) {
    currentY += 56;
    ctx.fillStyle = mutedTextColor;
    ctx.font = "italic 22px sans-serif";
    const subText = `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`;
    ctx.fillText(subText, startX, currentY);
  } else if (data.tagline) {
    currentY += 56;
    ctx.fillStyle = mutedTextColor;
    ctx.font = "italic 22px sans-serif";
    ctx.fillText(data.tagline, startX, currentY);
  }

  currentY += data.tagline ? 48 : 56;
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, currentY);
  ctx.lineTo(600, currentY);
  ctx.stroke();

  currentY += 32;
  ctx.font = "26px sans-serif";
  ctx.fillStyle = textColor;

  const contactList = [];
  if (data.phone) contactList.push({ icon: "📞", text: data.phone });
  if (data.email) contactList.push({ icon: "✉️", text: data.email });
  if (data.website) {
    let displayWeb = data.website.replace(/^https?:\/\/(www\.)?/, "");
    if (displayWeb.length > 30) displayWeb = displayWeb.substring(0, 27) + "...";
    contactList.push({ icon: "🌐", text: displayWeb });
  }
  if (data.address) {
    let displayAddr = data.address;
    if (displayAddr.length > 35) displayAddr = displayAddr.substring(0, 32) + "...";
    contactList.push({ icon: "📍", text: displayAddr });
  }

  contactList.forEach((item) => {
    if (layout === "modern_dark") {
      ctx.fillStyle = brandColor;
      ctx.fillText(item.icon, startX, currentY);
      ctx.fillStyle = textColor;
      ctx.fillText(`  ${item.text}`, startX + 38, currentY);
    } else {
      ctx.fillText(`${item.icon}  ${item.text}`, startX, currentY);
    }
    currentY += 54;
  });

  // 11. Draw Logo circle (or initials) if show_logo is enabled
  if (bcShowLogo) {
    const logoSize = 100;
    const logoX = 500;
    const logoY = 105;

    if (loadedImages.logo) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(loadedImages.logo, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      ctx.strokeStyle = layout === "minimal_light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Draw Initials Fallback
      ctx.fillStyle = layout === "minimal_light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = layout === "minimal_light" ? brandColor : textColor;
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getInitials(data.member_name || data.business_name), logoX + logoSize / 2, logoY + logoSize / 2);
    }
  }

  // 12. Draw QR code
  const qrSize = 260;
  const qrX = canvas.width - qrSize - 80;
  const qrY = (canvas.height - qrSize) / 2 - 20;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 76, 20);
  } else {
    ctx.rect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 76);
  }
  ctx.fill();

  if (layout !== "minimal_light") {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (loadedImages.qr) {
    ctx.drawImage(loadedImages.qr, qrX, qrY, qrSize, qrSize);
  }

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCAN TO CONNECT", qrX + qrSize / 2, qrY + qrSize + 28);

  if (bcBorderRadius !== "none") {
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
