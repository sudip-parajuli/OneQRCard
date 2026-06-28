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
  const bcCustomFields = bcSettings.custom_fields || [];
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

  // Draw background texture overlay AFTER theme overlays so it's visible
  if (bcBgTexture && bcBgTexture !== "none") {
    const isLightBC = bcTheme === "minimal_light";
    ctx.save();
    ctx.globalAlpha = 0.22;
    if (bcBgTexture === "metal") {
      ctx.strokeStyle = isLightBC ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < canvas.width + canvas.height; i += 8) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - canvas.height, canvas.height); ctx.stroke();
      }
    } else if (bcBgTexture === "wood") {
      ctx.strokeStyle = isLightBC ? "rgba(101,63,30,0.5)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2.5;
      for (let i = -100; i < canvas.width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 20, canvas.height * 0.3, i - 30, canvas.height * 0.7, i + 10, canvas.height);
        ctx.stroke();
      }
    } else if (bcBgTexture === "geometric") {
      ctx.strokeStyle = isLightBC ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.8;
      for (let r = 50; r < canvas.width * 1.1; r += 60) {
        ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (bcBgTexture === "marble") {
      ctx.strokeStyle = isLightBC ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 100); ctx.bezierCurveTo(200, 150, 400, 50, 1050, 450);
      ctx.moveTo(300, 0); ctx.bezierCurveTo(500, 300, 700, 400, 1050, 100);
      ctx.moveTo(100, 300); ctx.bezierCurveTo(350, 250, 600, 450, 1050, 200);
      ctx.stroke();
    } else if (bcBgTexture === "linen") {
      ctx.strokeStyle = isLightBC ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.22)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < canvas.width; i += 12) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 12) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }
    } else if (bcBgTexture === "dots") {
      ctx.fillStyle = isLightBC ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)";
      ctx.globalAlpha = 0.3;
      for (let x = 25; x < canvas.width; x += 25) {
        for (let y = 25; y < canvas.height; y += 25) {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (bcBgTexture === "diagonal") {
      ctx.strokeStyle = isLightBC ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      for (let i = -canvas.height; i < canvas.width * 2; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + canvas.height, canvas.height); ctx.stroke();
      }
    }
    ctx.restore();
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
    ctx.shadowBlur = 0;
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

  // Draw custom fields if any
  if (bcCustomFields.length > 0) {
    let cfY = currentY + 10;
    ctx.font = "22px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    bcCustomFields.slice(0, 3).forEach((field: { label: string; value: string }) => {
      if (!field.label || !field.value) return;
      ctx.fillStyle = mutedTextColor;
      ctx.fillText(`${field.label}: `, startX, cfY);
      const labelW = ctx.measureText(`${field.label}: `).width;
      ctx.fillStyle = textColor;
      ctx.fillText(field.value, startX + labelW, cfY);
      cfY += 40;
    });
  }

  if (bcBorderRadius !== "none") {
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = "#FBBC05"; // Official Google star yellow
  ctx.fill();
  ctx.restore();
}

function drawGoogleG(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  ctx.save();
  // Center is at (12, 12) for a 24x24 viewBox.
  ctx.translate(cx, cy);
  const scale = size / 24;
  ctx.scale(scale, scale);

  const bluePath = new Path2D("M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z");
  const greenPath = new Path2D("M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z");
  const yellowPath = new Path2D("M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z");
  const redPath = new Path2D("M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z");

  ctx.fillStyle = "#4285F4";
  ctx.fill(bluePath);
  ctx.fillStyle = "#34A853";
  ctx.fill(greenPath);
  ctx.fillStyle = "#FBBC05";
  ctx.fill(yellowPath);
  ctx.fillStyle = "#EA4335";
  ctx.fill(redPath);

  ctx.restore();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function drawListIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, type: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  let color = "#f97316";
  if (type === "services") color = "#f97316";
  else if (type === "location") color = "#3b82f6";
  else if (type === "whatsapp") color = "#25d366";
  else if (type === "socials") color = "#1d4ed8";
  else if (type === "contact") color = "#a855f7";
  ctx.fillStyle = color;
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const size = r * 1.0;
  const x = cx - size / 2;
  const y = cy - size / 2;

  if (type === "services") {
    for (let i = 0; i < 3; i++) {
      const yy = y + size * 0.2 + i * size * 0.3;
      ctx.beginPath();
      ctx.arc(x + size * 0.2, yy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.45, yy);
      ctx.lineTo(x + size * 0.9, yy);
      ctx.stroke();
    }
  } else if (type === "location") {
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy - r * 0.2);
    ctx.quadraticCurveTo(cx - r * 0.4, cy + r * 0.2, cx, cy + r * 0.7);
    ctx.quadraticCurveTo(cx + r * 0.4, cy + r * 0.2, cx + r * 0.4, cy - r * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "whatsapp") {
    // Phone bubble
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.05, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.35, cy + r * 0.22);
    ctx.lineTo(cx - r * 0.5, cy + r * 0.45);
    ctx.lineTo(cx - r * 0.15, cy + r * 0.35);
    ctx.stroke();
    // telephone handle
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.05, r * 0.2, -Math.PI / 4, Math.PI * 3 / 4);
    ctx.stroke();
  } else if (type === "socials") {
    ctx.beginPath();
    ctx.rect(x + size * 0.15, y + size * 0.4, size * 0.2, size * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.35, y + size * 0.5);
    ctx.lineTo(x + size * 0.65, y + size * 0.5);
    ctx.quadraticCurveTo(x + size * 0.8, y + size * 0.5, x + size * 0.8, y + size * 0.65);
    ctx.lineTo(x + size * 0.75, y + size * 0.85);
    ctx.lineTo(x + size * 0.35, y + size * 0.85);
    ctx.stroke();
  } else if (type === "contact") {
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.5, r * 0.45, Math.PI, 0, false);
    ctx.stroke();
  }

  ctx.restore();
}

function drawShieldIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r, cy - r * 0.9, cx + r, cy);
  ctx.quadraticCurveTo(cx + r, cy + r * 0.7, cx, cy + r);
  ctx.quadraticCurveTo(cx - r, cy + r * 0.7, cx - r, cy);
  ctx.quadraticCurveTo(cx - r, cy - r * 0.9, cx, cy - r);
  ctx.closePath();
  ctx.stroke();

  // Keyhole
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.1, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.08, cy);
  ctx.lineTo(cx + r * 0.08, cy);
  ctx.lineTo(cx + r * 0.15, cy + r * 0.42);
  ctx.lineTo(cx - r * 0.15, cy + r * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSocialFooterIcons(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, type: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  let color = "#3b82f6";
  if (type === "facebook") color = "#1877f2";
  else if (type === "instagram") color = "#c13584";
  else if (type === "tiktok") color = "#010101";
  else if (type === "youtube") color = "#ff0000";
  ctx.fillStyle = color;
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.5;

  const size = r * 1.0;

  if (type === "facebook") {
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("f", cx, cy + 1);
  } else if (type === "instagram") {
    ctx.strokeRect(cx - r * 0.4, cy - r * 0.4, r * 0.8, r * 0.8);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + r * 0.22, cy - r * 0.22, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "tiktok") {
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("d", cx, cy);
  } else if (type === "youtube") {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.3, cy);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.25);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawFlyerTexture(ctx: CanvasRenderingContext2D, width: number, height: number, texture: string, isLight: boolean) {
  ctx.save();
  if (texture === "geometric") {
    ctx.fillStyle = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.09)";
    const dotSpacing = 30;
    for (let x = 40; x < width - 40; x += dotSpacing) {
      for (let y = 40; y < height - 40; y += dotSpacing) {
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (texture === "linen") {
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    const spacing = 12;
    for (let x = 40; x < width - 40; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, height - 40); ctx.stroke();
    }
    for (let y = 40; y < height - 40; y += spacing) {
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(width - 40, y); ctx.stroke();
    }
  } else if (texture === "wood") {
    ctx.strokeStyle = isLight ? "rgba(120, 80, 40, 0.08)" : "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 2.5;
    for (let y = 50; y < height - 45; y += 18) {
      ctx.beginPath(); ctx.moveTo(40, y);
      ctx.bezierCurveTo(
        width * 0.25, y - 5 + Math.sin(y) * 4,
        width * 0.75, y + 5 - Math.cos(y) * 4,
        width - 40, y + Math.sin(y * 0.5) * 3
      );
      ctx.stroke();
    }
  } else if (texture === "marble") {
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(100, 100); ctx.bezierCurveTo(300, 400, 400, 800, 900, 1300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(800, 100); ctx.bezierCurveTo(700, 500, 300, 900, 200, 1300); ctx.stroke();
  } else if (texture === "hexagon") {
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    const size = 20;
    const h = size * Math.sqrt(3);
    for (let y = 40; y < height; y += h) {
      for (let x = 40; x < width; x += size * 3) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const xx = x + size * Math.cos(angle);
          const yy = y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
  } else if (texture === "noise") {
    ctx.fillStyle = isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
    for (let i = 0; i < 2000; i++) {
      const rx = 40 + Math.random() * (width - 80);
      const ry = 40 + Math.random() * (height - 80);
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
  }
  ctx.restore();
}

/**
 * Generates an A6-sized premium Google Review Stand Flyer (1050x1485 px).
 * If the wifi section is added and enabled, includes both Business QR and WiFi QR side-by-side.
 */
export async function generateQRFlyer(data: CardData): Promise<string> {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const cardUrl = `https://${baseDomain}/card/${data.slug}`;
  const brandColor = data.brand_color || "#085041";
  // The business QR on the flyer always links to the card page, not a review link.

  // Check if wifi section is enabled and has SSID configured
  const wifiSection = data.sections?.find((s: any) => s.type === "wifi" && s.enabled !== false);
  const wifiData = wifiSection?.data;
  const hasWifi = !!(wifiData && wifiData.ssid);

  // 1. Generate Business QR Code
  const qrCodeDataUrl = await generateQRCodeWithLogo(
    cardUrl,
    brandColor,
    data.logo_data_url,
    data.business_name,
    data.plan !== "basic"
  );

  // 2. Generate WiFi QR Code (if wifi is enabled)
  let wifiQrCodeDataUrl = "";
  if (hasWifi) {
    const wifiString = `WIFI:S:${wifiData.ssid};T:WPA;P:${wifiData.password || ""};;`;
    wifiQrCodeDataUrl = await generateQRCodeWithLogo(
      wifiString,
      brandColor,
      null,
      "",
      false
    );
  }

  // Pre-load all images
  const imageSources: Record<string, string> = { qr: qrCodeDataUrl };
  if (data.logo_data_url) {
    imageSources.logo = data.logo_data_url;
  }
  if (hasWifi && wifiQrCodeDataUrl) {
    imageSources.wifiQr = wifiQrCodeDataUrl;
  }

  const loadedImages: Record<string, HTMLImageElement | null> = {};
  await Promise.all(
    Object.entries(imageSources).map(async ([key, src]) => {
      try {
        loadedImages[key] = await loadImage(src);
      } catch (err) {
        console.error(`Error preloading image ${key} for flyer:`, err);
        loadedImages[key] = null;
      }
    })
  );

  // 3. Setup canvas: 1050x1485 px (A6 proportions @ high res)
  const canvas = document.createElement("canvas");
  canvas.width = 1050;
  canvas.height = 1485;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }

  const sfSettings = data.design_settings?.stand_flyer || {};
  const flyerTheme = sfSettings.theme || "dark_matte";
  const flyerTexture = sfSettings.bg_texture || "none";
  const showLogo = sfSettings.show_logo !== false;

  let bgColor = "#1e2025";
  let titleColor = "#ffffff";
  let subtitleColor = "#f97316"; // Accent orange
  let isLightTheme = false;
  let outerBorderColor = brandColor;
  let innerBorderColor = "rgba(255, 255, 255, 0.05)";

  if (flyerTheme === "light_elegant") {
    bgColor = "#faf8f5";
    titleColor = "#1e2025";
    subtitleColor = brandColor;
    isLightTheme = true;
    outerBorderColor = brandColor;
    innerBorderColor = "rgba(0, 0, 0, 0.05)";
  } else if (flyerTheme === "brand_accent") {
    bgColor = brandColor;
    titleColor = "#ffffff";
    subtitleColor = "#fef08a"; // Bright yellow/gold accent
    isLightTheme = false;
    outerBorderColor = "#ffffff";
    innerBorderColor = "rgba(255, 255, 255, 0.15)";
  } else if (flyerTheme === "forest_dark") {
    bgColor = "#064e3b";
    titleColor = "#ffffff";
    subtitleColor = "#34d399";
    isLightTheme = false;
    outerBorderColor = "#34d399";
    innerBorderColor = "rgba(255, 255, 255, 0.1)";
  } else if (flyerTheme === "ocean_dark") {
    bgColor = "#0f172a";
    titleColor = "#ffffff";
    subtitleColor = "#38bdf8";
    isLightTheme = false;
    outerBorderColor = brandColor;
    innerBorderColor = "rgba(255, 255, 255, 0.08)";
  } else if (flyerTheme === "warm_sunset") {
    bgColor = "#fef3c7";
    titleColor = "#78350f";
    subtitleColor = "#d97706";
    isLightTheme = true;
    outerBorderColor = "#78350f";
    innerBorderColor = "rgba(120, 53, 15, 0.1)";
  } else if (flyerTheme === "rose_gold") {
    bgColor = "#fff1f2";
    titleColor = "#881337";
    subtitleColor = "#be185d";
    isLightTheme = true;
    outerBorderColor = "#db2777";
    innerBorderColor = "rgba(136, 19, 55, 0.08)";
  } else if (flyerTheme === "slate_blue") {
    bgColor = "#334155";
    titleColor = "#ffffff";
    subtitleColor = "#38bdf8";
    isLightTheme = false;
    outerBorderColor = "#ffffff";
    innerBorderColor = "rgba(255, 255, 255, 0.12)";
  }

  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background texture overlay
  drawFlyerTexture(ctx, canvas.width, canvas.height, flyerTexture, isLightTheme);

  // Outer border with Brand/Theme color
  const outerBorderWidth = 16;
  ctx.strokeStyle = outerBorderColor;
  ctx.lineWidth = outerBorderWidth;
  ctx.strokeRect(outerBorderWidth / 2, outerBorderWidth / 2, canvas.width - outerBorderWidth, canvas.height - outerBorderWidth);

  // Inner thin border
  ctx.strokeStyle = innerBorderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  let currentY = (showLogo && loadedImages.logo) ? 110 : 160;

  // 4. Logo Header
  if (showLogo && loadedImages.logo) {
    const logoSize = 130;
    const logoX = (canvas.width - logoSize) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, currentY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(loadedImages.logo, logoX, currentY, logoSize, logoSize);
    ctx.restore();

    ctx.strokeStyle = isLightTheme ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, currentY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    currentY += logoSize + 25;
  }

  // Business Name / Title
  ctx.fillStyle = titleColor;
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const flyerTitle = sfSettings.business_flyer_title || data.business_name || "Our Business";
  ctx.fillText(flyerTitle, canvas.width / 2, currentY);
  currentY += 65;

  // Scan Connect Explore text / Subtitle
  ctx.fillStyle = subtitleColor;
  ctx.font = "bold 26px sans-serif";
  const flyerSubtitle = sfSettings.business_flyer_subtitle || "SCAN • CONNECT • EXPLORE";
  ctx.fillText(flyerSubtitle.toUpperCase(), canvas.width / 2, currentY);
  currentY += 65;

  // Build active bullet items dynamically based on user sections and toggles
  const listItems: { type: string; title: string; desc: string }[] = [];
  
  const showMenu = sfSettings.show_menu !== false;
  const showLocation = sfSettings.show_contact !== false; // contact maps to location/hours/general contact
  const showWhatsapp = sfSettings.show_whatsapp !== false;
  const showSocials = sfSettings.show_socials !== false;
  const showContact = sfSettings.show_contact !== false;

  const hasMenu = data.sections?.some((s: any) => s.type === "menu" && s.enabled !== false);
  const hasServices = data.sections?.some((s: any) => s.type === "services" && s.enabled !== false);
  const hasCourses = data.sections?.some((s: any) => s.type === "courses" && s.enabled !== false);

  if (showMenu && (hasMenu || hasServices || hasCourses)) {
    let title = "SERVICES";
    let desc = "View all services";
    if (hasMenu && (hasServices || hasCourses)) {
      title = "SERVICES & MENU";
      desc = "View all services & menu list";
    } else if (hasMenu) {
      title = "OUR MENU";
      desc = "View our menu & prices";
    } else {
      title = "OUR SERVICES";
      desc = "View our list of services";
    }
    listItems.push({ type: "services", title, desc });
  }

  const hasLocation = data.sections?.some((s: any) => s.type === "location" && s.enabled !== false);
  const hasHours = data.sections?.some((s: any) => s.type === "hours" && s.enabled !== false);

  if (showLocation && (hasLocation || hasHours)) {
    let title = "LOCATION";
    let desc = "Find us easily";
    if (hasLocation && hasHours) {
      title = "LOCATION & HOURS";
      desc = "Find us & check opening hours";
    } else if (hasHours) {
      title = "OPENING HOURS";
      desc = "Check our business hours";
    }
    listItems.push({ type: "location", title, desc });
  }

  if (showWhatsapp && data.whatsapp) {
    listItems.push({ type: "whatsapp", title: "WHATSAPP CHAT", desc: "Chat with us instantly" });
  }
  const socialSection = data.sections?.find((s: any) => s.type === "socials");
  const socialsEnabled = socialSection ? socialSection.enabled !== false : true;
  const socialKeys = ["facebook", "instagram", "tiktok", "youtube", "viber", "x_twitter", "threads", "linkedin", "telegram"];
  const hasSocials = socialsEnabled && socialKeys.some(key => !!(data as any)[key]);
  if (showSocials && hasSocials) {
    listItems.push({ type: "socials", title: "SOCIAL MEDIA", desc: "Follow us on all platforms" });
  }
  const contactSection = data.sections?.find((s: any) => s.type === "contact");
  const contactEnabled = contactSection ? contactSection.enabled !== false : true;
  if (showContact && contactEnabled && (data.phone || data.email)) {
    listItems.push({ type: "contact", title: "CONTACT US", desc: "Call, Email & More" });
  }

  const showFooterBar = sfSettings.show_footer_bar !== false; // default ON
  const showWifiCredentials = sfSettings.show_wifi_credentials !== false; // default ON

  // Calculate card heights dynamically based on content to prevent excessive empty space
  let cardH = 0;
  if (hasWifi) {
    const leftRequiredH = 20 + 56 + 20 + 60 + 250 + (listItems.slice(0, 5).length * 68) + 20;
    const wifiDataH = showWifiCredentials ? (wifiData.password ? 240 : 140) : 150;
    const rightRequiredH = 20 + 56 + 20 + 60 + 250 + 20 + wifiDataH + 20;
    cardH = Math.max(leftRequiredH, rightRequiredH);
  } else {
    cardH = 30 + 70 + 30 + 40 + 320 + 20 + (Math.ceil(listItems.slice(0, 6).length / 2) * 76) + 30;
  }

  // Calculate remaining vertical space to distribute margins evenly
  const footerRequiredSpace = showFooterBar ? 220 : 100;
  const totalContentH = currentY + cardH + footerRequiredSpace;
  const remainingSpace = Math.max(0, 1485 - totalContentH);

  // Position cards and footer bar dynamically
  const cardsY = currentY + (remainingSpace * 0.35);
  const barY = cardsY + cardH + (remainingSpace * 0.35);

  if (hasWifi) {
    // LAYOUT A: Dual column side-by-side cards (WiFi + Business)
    const cardW = 440;
    const leftX = 60;
    const rightX = 550;

    // LEFT CARD: Business QR Card
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    drawRoundedRect(ctx, leftX, cardsY, cardW, cardH, 32);
    ctx.fill();
    ctx.restore();

    // Left Banner Header: Business QR
    ctx.fillStyle = brandColor;
    ctx.beginPath();
    drawRoundedRect(ctx, leftX + 20, cardsY + 20, cardW - 40, 56, 14);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bCardTitle = sfSettings.business_card_title || "BUSINESS QR";
    ctx.fillText(bCardTitle, leftX + cardW / 2, cardsY + 48);

    // Left Subtitle
    ctx.fillStyle = "#334155";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const subL1 = sfSettings.business_flyer_subtitle_l1 || "Scan to Explore";
    ctx.fillText(subL1, leftX + cardW / 2, cardsY + 94);
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#64748b";
    const subL2 = sfSettings.business_flyer_subtitle_l2 || "Our Services & More";
    ctx.fillText(subL2, leftX + cardW / 2, cardsY + 118);

    // Left QR code
    if (loadedImages.qr) {
      const qrSize = 230;
      ctx.drawImage(loadedImages.qr, leftX + (cardW - qrSize) / 2, cardsY + 150, qrSize, qrSize);
    }

    // Left bullet points list below QR
    let itemY = cardsY + 396;
    listItems.slice(0, 5).forEach((item) => {
      if (itemY + 60 > cardsY + cardH - 16) return; // guard overflow
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      drawRoundedRect(ctx, leftX + 20, itemY, cardW - 40, 58, 14);
      ctx.fill();

      drawListIcon(ctx, leftX + 54, itemY + 29, 16, item.type);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(item.title, leftX + 86, itemY + 20);

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(item.desc, leftX + 86, itemY + 38);

      itemY += 68;
    });

    // RIGHT CARD: WiFi QR Card
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    drawRoundedRect(ctx, rightX, cardsY, cardW, cardH, 32);
    ctx.fill();
    ctx.restore();

    // Right Banner Header: WiFi QR
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    drawRoundedRect(ctx, rightX + 20, cardsY + 20, cardW - 40, 56, 14);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const wCardTitle = sfSettings.wifi_card_title || "WiFi QR";
    ctx.fillText(wCardTitle, rightX + cardW / 2, cardsY + 48);

    // Right Subtitle
    ctx.fillStyle = "#334155";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const wCardSub = sfSettings.wifi_card_subtitle || "Scan to Connect";
    ctx.fillText(wCardSub, rightX + cardW / 2, cardsY + 94);
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Network: ${wifiData.ssid || "WiFi"}`, rightX + cardW / 2, cardsY + 118);

    // Right WiFi QR code
    if (loadedImages.wifiQr) {
      const qrSize = 230;
      ctx.drawImage(loadedImages.wifiQr, rightX + (cardW - qrSize) / 2, cardsY + 150, qrSize, qrSize);
    }

    // Right: WiFi credentials info box (replaces shield/lock icon)
    const credBoxY = cardsY + 390;
    const credBoxH = cardH - 390 - 20;
    if (credBoxH > 60) {
      ctx.fillStyle = "#eff6ff";
      ctx.beginPath();
      drawRoundedRect(ctx, rightX + 20, credBoxY, cardW - 40, Math.min(credBoxH, 280), 20);
      ctx.fill();

      // WiFi icon circle (simple arc-based wifi symbol)
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(rightX + cardW / 2, credBoxY + 48, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("WiFi", rightX + cardW / 2, credBoxY + 48);

      if (showWifiCredentials) {
        // Show SSID and Password
        ctx.fillStyle = "#1e40af";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Network Name:", rightX + cardW / 2, credBoxY + 86);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 20px sans-serif";
        const ssidDisplay = wifiData.ssid || "";
        ctx.fillText(ssidDisplay, rightX + cardW / 2, credBoxY + 110);

        if (wifiData.password) {
          // Divider line
          ctx.strokeStyle = "rgba(37, 99, 235, 0.15)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rightX + 60, credBoxY + 150);
          ctx.lineTo(rightX + cardW - 60, credBoxY + 150);
          ctx.stroke();

          ctx.fillStyle = "#1e40af";
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText("Password:", rightX + cardW / 2, credBoxY + 162);
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 20px sans-serif";
          const pwDisplay = wifiData.show_password !== false ? wifiData.password : "••••••••";
          ctx.fillText(pwDisplay, rightX + cardW / 2, credBoxY + 186);
        }

        ctx.fillStyle = "#6b7280";
        ctx.font = "12px sans-serif";
        ctx.fillText("Scan QR above to auto-connect", rightX + cardW / 2, credBoxY + Math.min(credBoxH - 36, 228));
      } else {
        // Simple "Scan QR above" message when credentials are hidden
        ctx.fillStyle = "#1e40af";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Scan to Connect!", rightX + cardW / 2, credBoxY + 88);
        ctx.fillStyle = "#475569";
        ctx.font = "15px sans-serif";
        ctx.fillText(`Network: ${wifiData.ssid || ""}`, rightX + cardW / 2, credBoxY + 120);
        ctx.fillStyle = "#6b7280";
        ctx.font = "12px sans-serif";
        ctx.fillText("Point your camera at the QR code", rightX + cardW / 2, credBoxY + 150);
      }
    }

  } else {
    // LAYOUT B: Single wider card layout (Business QR only)
    const cardW = 760;
    const leftX = (canvas.width - cardW) / 2;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    drawRoundedRect(ctx, leftX, cardsY, cardW, cardH, 36);
    ctx.fill();
    ctx.restore();

    // Banner Header
    ctx.fillStyle = brandColor;
    ctx.beginPath();
    drawRoundedRect(ctx, leftX + 40, cardsY + 28, cardW - 80, 66, 18);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bCardTitleSingle = sfSettings.business_card_title || "BUSINESS QR";
    ctx.fillText(bCardTitleSingle, leftX + cardW / 2, cardsY + 61);

    // Subtitle
    ctx.fillStyle = "#334155";
    ctx.font = "bold 21px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const subCombined = sfSettings.business_flyer_subtitle_l1
      ? `${sfSettings.business_flyer_subtitle_l1}${sfSettings.business_flyer_subtitle_l2 ? " " + sfSettings.business_flyer_subtitle_l2 : ""}`
      : "Scan to Explore Our Services & More";
    ctx.fillText(subCombined, leftX + cardW / 2, cardsY + 112);

    // Large Business QR code
    if (loadedImages.qr) {
      const qrSize = 320;
      ctx.drawImage(loadedImages.qr, leftX + (cardW - qrSize) / 2, cardsY + 162, qrSize, qrSize);
    }

    // Two-column list items layout below QR code
    let col1Y = cardsY + 500;
    let col2Y = cardsY + 500;
    listItems.slice(0, 6).forEach((item, index) => {
      const isCol1 = index % 2 === 0;
      const itemX = isCol1 ? leftX + 36 : leftX + cardW / 2 + 10;
      const itemY = isCol1 ? col1Y : col2Y;
      if (itemY + 64 > cardsY + cardH - 16) return;

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      drawRoundedRect(ctx, itemX, itemY, 330, 62, 14);
      ctx.fill();

      drawListIcon(ctx, itemX + 36, itemY + 31, 16, item.type);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(item.title, itemX + 68, itemY + 22);

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(item.desc, itemX + 68, itemY + 40);

      if (isCol1) col1Y += 76;
      else col2Y += 76;
    });
  }

  // 6. Bottom Horizontal Bar: Socials and website info
  if (showFooterBar) {
    const barW = 930;
    const barH = 80; // reduced from 110 to 80
    const barX = (canvas.width - barW) / 2;

    ctx.save();
    ctx.fillStyle = isLightTheme ? "rgba(0,0,0,0.08)" : "#272a30";
    ctx.beginPath();
    drawRoundedRect(ctx, barX, barY, barW, barH, 18);
    ctx.fill();
    ctx.restore();

    // Social icons on the left
    const socialSec = data.sections?.find((s: any) => s.type === "socials");
    const footerSocialsEnabled = socialSec ? socialSec.enabled !== false : true;
    const activeFooterPlatforms = footerSocialsEnabled
      ? ["facebook", "instagram", "tiktok", "youtube"].filter(p => !!(data as any)[p])
      : [];
    let fIconX = barX + 28;
    const fIconY = barY + barH / 2;
    activeFooterPlatforms.forEach((p) => {
      drawSocialFooterIcons(ctx, fIconX + 18, fIconY, 18, p);
      fIconX += 52;
    });

    // Website text on the right
    if (data.website) {
      let displayWeb = data.website.replace(/^https?:\/\/(www\.)?/, "");
      if (displayWeb.length > 30) displayWeb = displayWeb.substring(0, 27) + "...";

      ctx.fillStyle = isLightTheme ? "#6b7280" : "#94a3b8";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText("VISIT OUR WEBSITE", barX + barW - 28, barY + 16);

      ctx.fillStyle = isLightTheme ? "#0f172a" : "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(displayWeb, barX + barW - 28, barY + 36);
    }

    // 7. Footer: Platform branding
    ctx.fillStyle = isLightTheme ? "#475569" : "#94a3b8";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Powered by OneQR Card", canvas.width / 2, barY + barH + 26);
    ctx.fillStyle = isLightTheme ? "#52525b" : "#64748b";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("www.oneqrcard.com", canvas.width / 2, barY + barH + 50);
  } else {
    // No footer bar — just the branding text
    ctx.fillStyle = isLightTheme ? "#475569" : "#94a3b8";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Powered by OneQR Card", canvas.width / 2, 1420);
    ctx.fillStyle = isLightTheme ? "#52525b" : "#64748b";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("www.oneqrcard.com", canvas.width / 2, 1444);
  }

  return canvas.toDataURL("image/png");
}
