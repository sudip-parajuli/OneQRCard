"use client";

import { CardData } from "@/lib/types";
import { darken, getInitials, lighten, normalizePhone } from "@/lib/utils";

interface LinkItem {
  key: string;
  label: string;
  href: string;
  icon: JSX.Element;
}

const icons = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  googleReview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  address: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

function buildLinks(data: CardData): LinkItem[] {
  const items: LinkItem[] = [];
  if (data.google_review) items.push({ key: "google_review", label: "Review us on Google", href: data.google_review, icon: icons.googleReview });
  if (data.location_url) {
    items.push({
      key: "address",
      label: data.address || "Location / Map",
      href: data.location_url,
      icon: icons.address,
    });
  } else if (data.address) {
    items.push({
      key: "address",
      label: data.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`,
      icon: icons.address,
    });
  }
  if (data.phone) items.push({ key: "phone", label: `Call — ${data.phone}`, href: `tel:${normalizePhone(data.phone)}`, icon: icons.phone });
  if (data.whatsapp) items.push({ key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${normalizePhone(data.whatsapp)}`, icon: icons.whatsapp });
  if (data.website) items.push({ key: "website", label: "Website", href: data.website, icon: icons.website });
  if (data.facebook) items.push({ key: "facebook", label: "Facebook", href: data.facebook, icon: icons.facebook });
  if (data.instagram) items.push({ key: "instagram", label: "Instagram", href: data.instagram, icon: icons.instagram });
  if (data.tiktok) items.push({ key: "tiktok", label: "TikTok", href: data.tiktok, icon: icons.tiktok });
  if (data.youtube) items.push({ key: "youtube", label: "YouTube", href: data.youtube, icon: icons.youtube });
  if (data.email) items.push({ key: "email", label: "Email", href: `mailto:${data.email}`, icon: icons.email });

  if (data.plan === "business" && data.custom_links && Array.isArray(data.custom_links)) {
    data.custom_links.forEach((link, idx) => {
      if (link.label?.trim() && link.url?.trim()) {
        const href = link.url.trim().startsWith("http") ? link.url.trim() : `https://${link.url.trim()}`;
        items.push({
          key: `custom_${idx}`,
          label: link.label.trim(),
          href,
          icon: icons.link,
        });
      }
    });
  }

  return items;
}

interface Props {
  data: CardData;
  onSaveContact?: () => void;
  onDownloadCard?: () => void;
}

/**
 * Renders the public-facing digital card. Shared between the live editor preview
 * and the actual hosted /card/[slug] page so they always stay visually in sync.
 */
export default function CardPreview({ data, onSaveContact, onDownloadCard }: Props) {
  const links = buildLinks(data);
  const initials = getInitials(data.member_name || data.business_name || "Your Business");
  const color = data.brand_color || "#085041";

  const hasBg = data.plan === "business" && data.background_data_url;
  const bgStyle = hasBg
    ? {
        backgroundImage: `url(${data.background_data_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  const isPaid = data.plan !== "basic";
  const customTextColor = (isPaid && data.text_color) ? data.text_color : null;

  if (data.theme === "glassmorphic") {
    const txtColor = customTextColor || "#ffffff";
    const mutedTxtColor = customTextColor ? `${customTextColor}dd` : "rgba(255, 255, 255, 0.75)";
    const borderCol = customTextColor ? `${customTextColor}26` : "rgba(255, 255, 255, 0.2)";
    const linkBorderCol = customTextColor ? `${customTextColor}1a` : "rgba(255, 255, 255, 0.1)";

    return (
      <div
        className="rounded-3xl p-1.5 max-w-sm w-full mx-auto relative overflow-hidden shadow-xl"
        style={bgStyle}
      >
        {!hasBg && (
          <div className="absolute inset-0 -z-10 bg-stone-950 overflow-hidden">
            <div
              className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-50"
              style={{ backgroundColor: color }}
            ></div>
            <div
              className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-40"
              style={{ backgroundColor: lighten(color, 0.3) }}
            ></div>
          </div>
        )}
        <div 
          style={{ borderColor: borderCol }}
          className="bg-white/10 backdrop-blur-xl border rounded-2xl p-6 text-center shadow-2xl"
        >
          <Logo data={data} initials={initials} color={color} size={76} inverse />
          <div 
            style={{ color: txtColor }}
            className="text-xl font-bold mt-4 drop-shadow-sm"
          >
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-xs mt-1">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <SaveButton color="rgba(255, 255, 255, 0.22)" textColor="#fff" onClick={onSaveContact} />
            {onDownloadCard && <DownloadButton color={txtColor} onClick={onDownloadCard} />}
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: txtColor, borderColor: linkBorderCol }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 hover:bg-white/15 text-sm transition-all"
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.theme === "neonDark") {
    const txtColor = customTextColor || "#ffffff";
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : "#a1a1aa";

    return (
      <div
        className="bg-stone-950 rounded-3xl overflow-hidden max-w-sm w-full mx-auto border-2 p-6 transition-all"
        style={{
          borderColor: color,
          boxShadow: `0 0 20px ${color}33`,
          ...bgStyle,
        }}
      >
        <div className="text-center pb-6 border-b border-stone-800/60 bg-stone-950/70 backdrop-blur-sm rounded-t-xl">
          <Logo data={data} initials={initials} color={color} size={76} />
          <div
            className="text-xl font-extrabold tracking-tight mt-4"
            style={{ textShadow: `0 0 10px ${color}66`, color: txtColor }}
          >
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-xs mt-1.5">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
        </div>
        <div className="pt-6 flex flex-col gap-2 bg-stone-950/70 backdrop-blur-sm rounded-b-xl px-1">
          <button
            onClick={onSaveContact}
            style={{ backgroundColor: color }}
            className="w-full py-3 rounded-xl text-sm font-extrabold text-stone-950 hover:opacity-90 transition-opacity mb-1"
          >
            Save to contacts
          </button>
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : txtColor }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                  isGoogleReview
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10"
                    : "border-stone-800 hover:bg-stone-900"
                }`}
              >
                <span 
                  style={{ color: isGoogleReview ? undefined : mutedTxtColor }}
                  className={isGoogleReview ? "text-amber-400" : ""}
                >
                  {l.icon}
                </span>
                {l.label}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.theme === "minimal") {
    const txtColor = customTextColor || "#0f172a";
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : "#6b7280";

    return (
      <div
        className="bg-white rounded-2xl overflow-hidden border border-stone-200 max-w-sm w-full mx-auto"
        style={bgStyle}
      >
        <div className={`pt-8 px-6 pb-6 text-center ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}>
          <Logo data={data} initials={initials} color={color} size={72} />
          <div style={{ color: txtColor }} className="text-lg font-semibold mt-4">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-sm mt-1">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
        </div>
        <div className={`px-6 pb-6 flex flex-col gap-2 ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}>
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : txtColor }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                  isGoogleReview
                    ? "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 font-medium shadow-sm"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span 
                  style={{ color: isGoogleReview ? undefined : mutedTxtColor }}
                  className={isGoogleReview ? "text-amber-500" : ""}
                >
                  {l.icon}
                </span>
                {l.label}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (data.theme === "bold") {
    const txtColor = customTextColor || lighten(color, 0.92);
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.6);

    return (
      <div
        className="rounded-2xl overflow-hidden max-w-sm w-full mx-auto"
        style={{ backgroundColor: color, ...bgStyle }}
      >
        <div className={`pt-10 px-6 pb-8 text-center ${hasBg ? "bg-black/30 backdrop-blur-[2px]" : ""}`}>
          <Logo data={data} initials={initials} color={color} size={80} inverse />
          <div style={{ color: txtColor }} className="text-xl font-semibold mt-4">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-sm mt-1">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
        </div>
        <div className={`bg-white rounded-t-3xl px-6 py-6 flex flex-col gap-2 ${hasBg ? "bg-white/90 backdrop-blur-md" : ""}`}>
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          {links.map((l) => (
            <LinkRow key={l.key} item={l} variant="outline" />
          ))}
        </div>
      </div>
    );
  }

  if (data.theme === "gradient") {
    const txtColor = customTextColor || lighten(color, 0.92);
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.7);

    return (
      <div
        className="rounded-2xl overflow-hidden max-w-sm w-full mx-auto border border-stone-200 bg-white"
        style={bgStyle}
      >
        <div
          className={`pt-10 px-6 pb-12 text-center relative ${hasBg ? "backdrop-blur-[2px]" : ""}`}
          style={{
            background: hasBg
              ? "rgba(0,0,0,0.3)"
              : `linear-gradient(135deg, ${color} 0%, ${lighten(color, 0.4)} 100%)`,
          }}
        >
          <Logo data={data} initials={initials} color={color} size={76} inverse />
          <div style={{ color: txtColor }} className="text-lg font-semibold mt-4">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-sm mt-1">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
        </div>
        <div className={`px-6 pt-6 pb-6 -mt-6 mx-4 mb-2 bg-white rounded-2xl shadow-sm flex flex-col gap-2 relative ${hasBg ? "bg-white/90 backdrop-blur-md" : ""}`}>
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          {links.map((l) => (
            <LinkRow key={l.key} item={l} variant="outline" />
          ))}
        </div>
      </div>
    );
  }

  // "classic" — default
  const classicHeaderTextColor = customTextColor || lighten(color, 0.92);
  const classicHeaderMutedColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.6);
  const classicBodyTextColor = customTextColor || "#0f172a";
  const classicBodyMutedColor = customTextColor ? `${customTextColor}b3` : "#6b7280";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-stone-200 max-w-sm w-full mx-auto"
      style={bgStyle}
    >
      <div
        className={`pt-8 px-6 pb-10 text-center ${hasBg ? "backdrop-blur-[2px]" : ""}`}
        style={{ backgroundColor: hasBg ? "rgba(0,0,0,0.35)" : color }}
      >
        <Logo data={data} initials={initials} color={color} size={64} inverse />
        <div style={{ color: classicHeaderTextColor }} className="text-base font-semibold mt-3">
          {data.member_name ? data.member_name : (data.business_name || "Your Business")}
        </div>
        {(data.member_role || data.tagline) && (
          <div style={{ color: classicHeaderMutedColor }} className="text-xs mt-1">
            {data.member_name
              ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
              : data.tagline}
          </div>
        )}
      </div>
      <div className={`px-5 py-5 flex flex-col gap-2 ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}>
        <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
        {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
        {links.map((l) => {
          const isGoogleReview = l.key === "google_review";
          return (
            <a
              key={l.key}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isGoogleReview ? undefined : classicBodyTextColor }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                isGoogleReview
                  ? "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 font-medium shadow-sm"
                  : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span 
                style={{ color: isGoogleReview ? undefined : classicBodyMutedColor }}
                className={isGoogleReview ? "text-amber-500" : ""}
              >
                {l.icon}
              </span>
              {l.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Logo({
  data,
  initials,
  color,
  size,
  inverse,
}: {
  data: CardData;
  initials: string;
  color: string;
  size: number;
  inverse?: boolean;
}) {
  if (data.logo_data_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data.logo_data_url}
        alt={`${data.business_name} logo`}
        style={{ width: size, height: size }}
        className="rounded-full object-cover mx-auto border-2"
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: inverse ? lighten(color, 0.15) : darken(color, 0.05),
        color: inverse ? lighten(color, 0.85) : "#fff",
        border: `2px solid ${inverse ? lighten(color, 0.55) : lighten(color, 0.3)}`,
        fontSize: size * 0.32,
      }}
      className="rounded-full flex items-center justify-center font-semibold mx-auto"
    >
      {initials}
    </div>
  );
}

function SaveButton({
  color,
  textColor,
  onClick,
}: {
  color: string;
  textColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color, color: textColor }}
      className="w-full py-3 rounded-xl text-sm font-semibold mb-1"
    >
      Save to contacts
    </button>
  );
}

function DownloadButton({
  color,
  onClick,
}: {
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ borderColor: color, color: color }}
      className="w-full py-3 rounded-xl text-sm font-semibold border-2 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 mb-1"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download Business Card
    </button>
  );
}

function LinkRow({ item, variant }: { item: LinkItem; variant: "outline" }) {
  const isGoogleReview = item.key === "google_review";
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
        isGoogleReview
          ? "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 font-medium shadow-sm"
          : "border-stone-200 text-stone-850 hover:bg-stone-50"
      }`}
    >
      <span className={isGoogleReview ? "text-amber-500" : "text-stone-500"}>{item.icon}</span>
      {item.label}
    </a>
  );
}
