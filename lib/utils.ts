export function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

/** Lighten a hex color by `amt` (0-1) toward white */
export function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.round(r + (255 - r) * amt);
  const ng = Math.round(g + (255 - g) * amt);
  const nb = Math.round(b + (255 - b) * amt);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/** Darken a hex color by `amt` (0-1) toward black */
export function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.round(r * (1 - amt));
  const ng = Math.round(g * (1 - amt));
  const nb = Math.round(b * (1 - amt));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Normalize a phone number for tel: / wa.me links — strips spaces, dashes, parens */
export function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

interface VCardInput {
  business_name: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  address?: string | null;
}

export function buildVCard(d: VCardInput) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${d.business_name}`, `ORG:${d.business_name}`];
  if (d.phone) lines.push(`TEL;TYPE=CELL:${normalizePhone(d.phone)}`);
  if (d.whatsapp) lines.push(`TEL;TYPE=CELL,WHATSAPP:${normalizePhone(d.whatsapp)}`);
  if (d.email) lines.push(`EMAIL:${d.email}`);
  if (d.website) lines.push(`URL:${d.website}`);
  if (d.address) lines.push(`ADR;TYPE=WORK:;;${d.address};;;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

/** Generates a URL-safe slug from a business name, e.g. "Easy Moto Pvt Ltd" -> "easy-moto-pvt-ltd" */
export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
