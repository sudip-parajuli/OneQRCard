"use client";

import { useEffect, useState } from "react";
import { CardData, THEME_LABELS, ThemeId } from "@/lib/types";
import { darken, getInitials, lighten, normalizePhone } from "@/lib/utils";
import { motion } from "framer-motion";
import ShareQR from "@/components/ShareQR";
import DownloadBusinessCard from "@/components/DownloadBusinessCard";
import { SITE } from "@/lib/config";
import { 
  MenuSectionRenderer, 
  GallerySectionRenderer, 
  ServicesSectionRenderer,
  HoursSectionRenderer,
  LocationSectionRenderer,
  ReviewSectionRenderer,
  BookingSectionRenderer,
  WifiSectionRenderer,
  LeadCaptureSectionRenderer,
  AmenitiesSectionRenderer,
  ScheduleSectionRenderer,
  PricingTableSectionRenderer,
  FeaturedProductsSectionRenderer,
  CoursesSectionRenderer,
  ContactSectionRenderer,
  SocialsSectionRenderer
} from "@/components/SectionRenderers";

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
  viber: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M8 10.5c.5-1.5 2-2 3.5-1.5" />
    </svg>
  ),
  x_twitter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2a10 10 0 1 0 10 10c0-2.5-2.5-4-5-4s-4 1.5-4 4 1.5 4 4 4 5-1.5 5-4" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
  if (data.whatsapp) {
    items.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${normalizePhone(data.whatsapp)}?text=Hello!%20I%20saw%20your%20digital%20business%20card%20and%20wanted%20to%20reach%2520out.`,
      icon: icons.whatsapp,
    });
  }
  if (data.website) items.push({ key: "website", label: "Website", href: data.website, icon: icons.website });
  if (data.facebook) items.push({ key: "facebook", label: "Facebook", href: data.facebook, icon: icons.facebook });
  if (data.instagram) items.push({ key: "instagram", label: "Instagram", href: data.instagram, icon: icons.instagram });
  if (data.tiktok) items.push({ key: "tiktok", label: "TikTok", href: data.tiktok, icon: icons.tiktok });
  if (data.youtube) items.push({ key: "youtube", label: "YouTube", href: data.youtube, icon: icons.youtube });
  
  if (data.viber) {
    items.push({
      key: "viber",
      label: "Viber",
      href: `viber://chat?number=%2B${normalizePhone(data.viber)}`,
      icon: icons.viber,
    });
  }
  if (data.x_twitter) {
    const href = data.x_twitter.startsWith("http") ? data.x_twitter : `https://x.com/${data.x_twitter}`;
    items.push({ key: "x_twitter", label: "X (Twitter)", href, icon: icons.x_twitter });
  }
  if (data.threads) {
    const href = data.threads.startsWith("http") ? data.threads : `https://threads.net/@${data.threads}`;
    items.push({ key: "threads", label: "Threads", href, icon: icons.threads });
  }
  if (data.linkedin) {
    const href = data.linkedin.startsWith("http") ? data.linkedin : `https://linkedin.com/in/${data.linkedin}`;
    items.push({ key: "linkedin", label: "LinkedIn", href, icon: icons.linkedin });
  }
  if (data.telegram) {
    const href = data.telegram.startsWith("http") ? data.telegram : `https://t.me/${data.telegram.replace("@", "")}`;
    items.push({ key: "telegram", label: "Telegram", href, icon: icons.telegram });
  }

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

function SocialsGrid({ socialLinks, isThemeDark }: { socialLinks: LinkItem[]; isThemeDark: boolean }) {
  if (socialLinks.length === 0) return null;

  const getStyle = (key: string) => {
    switch (key) {
      case "facebook":
        return { bg: "bg-[#1877f2]/10 border border-[#1877f2]/20", text: "text-[#1877f2]" };
      case "instagram":
        return { bg: "bg-[#e4405f]/10 border border-[#e4405f]/20", text: "text-[#e4405f]" };
      case "tiktok":
        return {
          bg: isThemeDark ? "bg-white/10 border border-white/10" : "bg-black/5 border border-black/10",
          text: isThemeDark ? "text-white" : "text-stone-900"
        };
      case "youtube":
        return { bg: "bg-[#ff0000]/10 border border-[#ff0000]/20", text: "text-[#ff0000]" };
      case "viber":
        return { bg: "bg-[#7360f2]/10 border border-[#7360f2]/20", text: "text-[#7360f2]" };
      case "x_twitter":
        return {
          bg: isThemeDark ? "bg-white/10 border border-white/10" : "bg-black/5 border border-black/10",
          text: isThemeDark ? "text-white" : "text-stone-900"
        };
      case "threads":
        return {
          bg: isThemeDark ? "bg-white/10 border border-white/10" : "bg-black/5 border border-black/10",
          text: isThemeDark ? "text-white" : "text-stone-900"
        };
      case "linkedin":
        return { bg: "bg-[#0077b5]/10 border border-[#0077b5]/20", text: "text-[#0077b5]" };
      case "telegram":
        return { bg: "bg-[#229ed9]/10 border border-[#229ed9]/20", text: "text-[#229ed9]" };
      default:
        return { bg: "bg-white/10 border border-white/10", text: "text-white" };
    }
  };

  return (
    <div className="grid grid-cols-5 gap-3.5 mt-4 w-full justify-items-center">
      {socialLinks.map((s) => {
        const style = getStyle(s.key);
        return (
          <motion.a
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${style.bg} ${style.text}`}
          >
            {s.icon}
          </motion.a>
        );
      })}
    </div>
  );
}

interface Props {
  data: CardData;
  onSaveContact?: () => void;
  onDownloadCard?: () => void;
  isEditing?: boolean;
  onChange?: (updatedData: Partial<CardData>) => void;
}

/**
 * Renders the public-facing digital card. Shared between the live editor preview
 * and the actual hosted /card/[slug] page so they always stay visually in sync.
 */
function CardMockup({ data, onSaveContact, onDownloadCard }: Props) {
  const allLinks = buildLinks(data);
  const socialKeys = ["facebook", "instagram", "tiktok", "youtube", "viber", "x_twitter", "threads", "linkedin", "telegram"];
  const links = allLinks.filter(l => !socialKeys.includes(l.key));
  const socialLinks = allLinks.filter(l => socialKeys.includes(l.key));
  const initials = getInitials(data.member_name || data.business_name || "Your Business");

  // Premium design features (Business tier only)
  const isBusiness = data.plan === "business";
  const vibe = isBusiness ? data.design_settings?.vibe : null;
  const texture = isBusiness ? data.design_settings?.bg_texture : null;
  const embossed = isBusiness ? data.design_settings?.embossed_effect : false;
  const alignment = isBusiness ? data.design_settings?.alignment || "center" : "center";
  const anim = isBusiness ? data.design_settings?.animation || "none" : "none";

  let brandColor = data.brand_color || "#085041";
  const isPaid = data.plan !== "basic";
  const customTextColor = (isPaid && data.text_color) ? data.text_color : null;
  let textColor = customTextColor || "#ffffff";

  // Vibe Presets Override
  if (vibe === "corporate") {
    brandColor = "#1e40af"; // Navy
    textColor = customTextColor || "#ffffff";
  } else if (vibe === "luxury") {
    brandColor = "#d4af37"; // Gold accent
    textColor = customTextColor || "#f5f5f5";
  } else if (vibe === "creative") {
    brandColor = "#ec4899"; // Vibrant Pink
    textColor = customTextColor || "#ffffff";
  } else if (vibe === "eco") {
    brandColor = "#15803d"; // Earthy Green
    textColor = customTextColor || "#ffffff";
  }

  const hasBg = isBusiness && data.background_data_url;
  let bgStyle: React.CSSProperties = hasBg
    ? {
        backgroundImage: `url(${data.background_data_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  if (!hasBg) {
    if (vibe === "corporate") {
      bgStyle.backgroundColor = "#0f172a"; // Slate-900
    } else if (vibe === "luxury") {
      bgStyle.backgroundColor = "#121212"; // Matte black
    } else if (vibe === "creative") {
      bgStyle.background = "linear-gradient(135deg, #8b5cf6 0%, #f97316 100%)";
    } else if (vibe === "eco") {
      bgStyle.backgroundColor = "#1c2e1f"; // Dark Forest Green
    }
  }

  // Apply background textures
  if (!hasBg && texture && texture !== "none") {
    if (texture === "metal") {
      bgStyle.background = "linear-gradient(135deg, #334155 0%, #0f172a 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 8px)";
      bgStyle.boxShadow = "inset 0 0 40px rgba(0, 0, 0, 0.5)";
    } else if (texture === "wood") {
      bgStyle.background = "linear-gradient(135deg, #451a03 0%, #78350f 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 4px, transparent 4px, transparent 20px)";
    } else if (texture === "geometric") {
      const gridColor = vibe === "luxury" ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.05)";
      bgStyle.backgroundColor = bgStyle.backgroundColor || (vibe === "corporate" ? "#0f172a" : "#18181b");
      bgStyle.backgroundImage = `radial-gradient(${gridColor} 1px, transparent 1px)`;
      bgStyle.backgroundSize = "16px 16px";
    } else if (texture === "motion") {
      bgStyle.background = "linear-gradient(270deg, #1e1b4b, #2e1065, #030712)";
      bgStyle.backgroundSize = "400% 400%";
      bgStyle.animation = "gradientMotion 12s ease infinite";
    }
  }

  // Neomorphic shadows helper
  const isDarkTheme = data.theme === "neonDark" || vibe === "luxury" || vibe === "corporate" || vibe === "creative" || vibe === "eco" || data.theme === "glassmorphic" || data.theme === "liquidGlass";
  const getNeomorphicStyle = (isButton = false): React.CSSProperties => {
    if (!embossed) return {};
    if (isDarkTheme) {
      return {
        boxShadow: isButton
          ? "inset -1px -1px 3px rgba(255,255,255,0.05), inset 2px 2px 4px rgba(0,0,0,0.6), -2px -2px 6px rgba(255,255,255,0.05), 3px 3px 8px rgba(0,0,0,0.5)"
          : "-4px -4px 12px rgba(255,255,255,0.03), 4px 4px 12px rgba(0,0,0,0.6)",
        border: "none",
      };
    } else {
      return {
        boxShadow: isButton
          ? "inset -1px -1px 3px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(0,0,0,0.08), -2px -2px 6px rgba(255,255,255,0.8), 3px 3px 8px rgba(0,0,0,0.08)"
          : "-5px -5px 12px rgba(255,255,255,0.8), 5px 5px 12px rgba(0,0,0,0.06)",
        border: "none",
      };
    }
  };

  // Alignment classes mapping
  const alignClass = alignment === "left" ? "text-left items-start" : alignment === "right" ? "text-right items-end" : "text-center items-center";
  const alignFlexClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center";

  // Animation variants mapping
  let animVariants = {};
  if (anim === "float") {
    animVariants = {
      animate: { y: [0, -6, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
    };
  } else if (anim === "pulse") {
    animVariants = {
      animate: { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
    };
  } else if (anim === "fade") {
    animVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.8 } }
    };
  }

  const motionProps = anim !== "none" ? {
    variants: animVariants,
    animate: "animate",
    initial: anim === "fade" ? "initial" : undefined
  } : {};

  if (data.theme === "glassmorphic") {
    const txtColor = textColor;
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : (vibe ? `${textColor}cc` : "rgba(255, 255, 255, 0.75)");
    const borderCol = vibe ? `${brandColor}33` : "rgba(255, 255, 255, 0.2)";
    const linkBorderCol = vibe ? `${brandColor}22` : "rgba(255, 255, 255, 0.1)";

    return (
      <motion.div
        {...motionProps}
        className="rounded-3xl p-1.5 max-w-sm w-full mx-auto relative overflow-hidden shadow-xl"
        style={{ ...bgStyle, ...getNeomorphicStyle() }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientMotion {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}} />
        {!hasBg && !vibe && (
          <div className="absolute inset-0 -z-10 bg-stone-950 overflow-hidden">
            <div
              className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-50"
              style={{ backgroundColor: brandColor }}
            ></div>
            <div
              className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-40"
              style={{ backgroundColor: lighten(brandColor, 0.3) }}
            ></div>
          </div>
        )}
        <div 
          style={{ borderColor: borderCol }}
          className={`bg-white/10 backdrop-blur-xl border rounded-2xl p-6 shadow-2xl flex flex-col ${alignClass}`}
        >
          <Logo data={data} initials={initials} color={brandColor} size={76} inverse />
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-col gap-2 w-full"
          >
            <SaveButton color="rgba(255, 255, 255, 0.22)" textColor={customTextColor || "#fff"} onClick={onSaveContact} style={getNeomorphicStyle(true)} />
            {onDownloadCard && <DownloadButton color={txtColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
            
            {data.google_review && (
              <GoogleReviewGate
                cardId={data.id}
                googleReviewUrl={data.google_review}
                brandColor={brandColor}
              />
            )}

            {links.map((l) => (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: txtColor, borderColor: linkBorderCol, ...getNeomorphicStyle(true) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 hover:bg-white/15 text-sm transition-all cursor-pointer ${alignFlexClass}`}
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </motion.a>
            ))}

            <SocialsGrid socialLinks={socialLinks} isThemeDark={true} />

            {data.plan === "business" && (
              <WalletButton cardId={data.id} brandColor={brandColor} />
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "neonDark") {
    const txtColor = textColor;
    const mutedTxtColor = vibe ? `${textColor}cc` : "#a1a1aa";

    return (
      <motion.div
        {...motionProps}
        className="bg-stone-950 rounded-3xl overflow-hidden max-w-sm w-full mx-auto border-2 p-6 transition-all"
        style={{
          borderColor: brandColor,
          boxShadow: embossed ? getNeomorphicStyle().boxShadow : `0 0 20px ${brandColor}33`,
          ...bgStyle,
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientMotion {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}} />
        <div className={`text-center pb-6 border-b border-stone-800/60 bg-stone-950/70 backdrop-blur-sm rounded-t-xl flex flex-col ${alignClass}`}>
          <Logo data={data} initials={initials} color={brandColor} size={76} />
          <div
            className="text-xl font-extrabold tracking-tight mt-4"
            style={{ textShadow: `0 0 10px ${brandColor}66`, color: txtColor }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="pt-6 flex flex-col gap-2 bg-stone-950/70 backdrop-blur-sm rounded-b-xl px-1"
        >
          <SaveButton color={brandColor} textColor="#0c0a09" onClick={onSaveContact} style={getNeomorphicStyle(true)} />
          {onDownloadCard && <DownloadButton color={brandColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={brandColor}
            />
          )}

          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : txtColor, ...getNeomorphicStyle(true) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${alignFlexClass} ${
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
              </motion.a>
            );
          })}

          <SocialsGrid socialLinks={socialLinks} isThemeDark={true} />

          {data.plan === "business" && (
            <WalletButton cardId={data.id} brandColor={brandColor} />
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "minimal") {
    const txtColor = customTextColor || (vibe ? textColor : "#0f172a");
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : (vibe ? `${textColor}cc` : "#6b7280");

    return (
      <motion.div
        {...motionProps}
        className="bg-white rounded-2xl overflow-hidden border border-stone-200 max-w-sm w-full mx-auto"
        style={{ ...bgStyle, ...getNeomorphicStyle() }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientMotion {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}} />
        <div className={`pt-8 px-6 pb-6 flex flex-col ${alignClass} ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}>
          <Logo data={data} initials={initials} color={brandColor} size={72} />
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
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
          className={`px-6 pb-6 flex flex-col gap-2 ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}
        >
          <SaveButton color={brandColor} textColor="#fff" onClick={onSaveContact} style={getNeomorphicStyle(true)} />
          {onDownloadCard && <DownloadButton color={brandColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={brandColor}
            />
          )}

          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : txtColor, ...getNeomorphicStyle(true) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${alignFlexClass} ${
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
              </motion.a>
            );
          })}

          <SocialsGrid socialLinks={socialLinks} isThemeDark={false} />

          {data.plan === "business" && (
            <WalletButton cardId={data.id} brandColor={brandColor} />
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "bold") {
    const txtColor = customTextColor || (vibe ? textColor : lighten(brandColor, 0.92));
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : (vibe ? `${textColor}cc` : lighten(brandColor, 0.6));

    return (
      <motion.div
        {...motionProps}
        className="rounded-2xl overflow-hidden max-w-sm w-full mx-auto"
        style={{ backgroundColor: brandColor, ...bgStyle, ...getNeomorphicStyle() }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientMotion {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}} />
        <div className={`pt-10 px-6 pb-8 flex flex-col ${alignClass} ${hasBg ? "bg-black/30 backdrop-blur-[2px]" : ""}`}>
          <Logo data={data} initials={initials} color={brandColor} size={80} inverse />
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
          {data.bio && (
            <p 
              style={{ color: txtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
          className={`bg-white rounded-t-3xl px-6 py-6 flex flex-col gap-2 ${hasBg ? "bg-white/90 backdrop-blur-md" : ""}`}
        >
          <SaveButton color={brandColor} textColor="#fff" onClick={onSaveContact} style={getNeomorphicStyle(true)} />
          {onDownloadCard && <DownloadButton color={brandColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={brandColor}
            />
          )}

          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : (customTextColor || "#0f172a"), ...getNeomorphicStyle(true) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${alignFlexClass} ${
                  isGoogleReview
                    ? "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 font-medium shadow-sm"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span 
                  style={{ color: isGoogleReview ? undefined : "#6b7280" }}
                  className={isGoogleReview ? "text-amber-505" : ""}
                >
                  {l.icon}
                </span>
                {l.label}
              </motion.a>
            );
          })}

          <SocialsGrid socialLinks={socialLinks} isThemeDark={true} />

          {data.plan === "business" && (
            <WalletButton cardId={data.id} brandColor={brandColor} />
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "claymorphic") {
    const txtColor = customTextColor || "#1e293b";
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : "#475569";
    const clayBgColor = vibe === "luxury" ? "#fef08a" : (vibe === "eco" ? "#dcfce7" : "#e0e7ff");
    const shadowColor = vibe === "luxury" ? "rgba(202,138,4,0.15)" : "rgba(99,102,241,0.15)";
    const borderCol = customTextColor ? `${customTextColor}33` : "rgba(255,255,255,0.4)";

    return (
      <motion.div
        {...motionProps}
        className="rounded-[36px] p-6 max-w-sm w-full mx-auto relative overflow-hidden border-2 transition-all"
        style={{
          backgroundColor: clayBgColor,
          borderColor: borderCol,
          boxShadow: `inset -6px -6px 12px rgba(0,0,0,0.06), inset 6px 6px 12px rgba(255,255,255,0.55), 0 10px 25px ${shadowColor}`,
          ...bgStyle,
        }}
      >
        <div className={`flex flex-col ${alignClass}`}>
          <Logo data={data} initials={initials} color={brandColor} size={80} />
          <div style={{ color: txtColor }} className="text-xl font-bold mt-4 font-sans tracking-wide">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-xs mt-1.5 font-semibold">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line font-medium"
            >
              {data.bio}
            </p>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-col gap-2.5 w-full"
          >
            <SaveButton 
              color={brandColor} 
              textColor={customTextColor || "#ffffff"} 
              onClick={onSaveContact} 
              style={{
                borderRadius: "20px",
                boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.15), inset 2px 2px 4px rgba(255,255,255,0.25), 0 4px 6px rgba(0,0,0,0.05)"
              }} 
            />
            {onDownloadCard && (
              <DownloadButton 
                color={brandColor} 
                onClick={onDownloadCard} 
                style={{
                  borderRadius: "20px",
                  backgroundColor: "rgba(255,255,255,0.4)",
                  boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05)"
                }} 
              />
            )}
            
            {data.google_review && (
              <GoogleReviewGate cardId={data.id} googleReviewUrl={data.google_review} brandColor={brandColor} />
            )}

            {links.map((l) => (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: txtColor, 
                  borderColor: "rgba(255,255,255,0.3)",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255,255,255,0.45)",
                  boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.04)"
                }}
                className={`flex items-center gap-3 px-4 py-3 border text-sm transition-all cursor-pointer ${alignFlexClass}`}
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </motion.a>
            ))}

            <SocialsGrid socialLinks={socialLinks} isThemeDark={false} />

            {data.plan === "business" && (
              <WalletButton cardId={data.id} brandColor={brandColor} />
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "neumorphic") {
    const txtColor = customTextColor || "#1f2937";
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : "#4b5563";
    const neuBgColor = "#e5e7eb";

    return (
      <motion.div
        {...motionProps}
        className="rounded-[32px] p-6 max-w-sm w-full mx-auto border-none transition-all"
        style={{
          backgroundColor: neuBgColor,
          boxShadow: "-9px -9px 16px rgba(255,255,255,0.85), 9px 9px 16px rgba(0,0,0,0.08)",
          ...bgStyle,
        }}
      >
        <div className={`flex flex-col ${alignClass}`}>
          <Logo data={data} initials={initials} color={brandColor} size={76} />
          <div style={{ color: txtColor }} className="text-xl font-bold mt-4">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-xs mt-1.5 font-medium">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-col gap-3 w-full"
          >
            <SaveButton 
              color={brandColor} 
              textColor={customTextColor || "#ffffff"} 
              onClick={onSaveContact} 
              style={{
                borderRadius: "16px",
                boxShadow: "-3px -3px 8px rgba(255,255,255,0.8), 3px 3px 8px rgba(0,0,0,0.08)"
              }} 
            />
            {onDownloadCard && (
              <DownloadButton 
                color={brandColor} 
                onClick={onDownloadCard} 
                style={{
                  borderRadius: "16px",
                  backgroundColor: neuBgColor,
                  borderColor: "transparent",
                  boxShadow: "-3px -3px 8px rgba(255,255,255,0.8), 3px 3px 8px rgba(0,0,0,0.08)"
                }} 
              />
            )}
            
            {data.google_review && (
              <GoogleReviewGate cardId={data.id} googleReviewUrl={data.google_review} brandColor={brandColor} />
            )}

            {links.map((l) => (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: txtColor, 
                  borderRadius: "16px",
                  backgroundColor: neuBgColor,
                  borderColor: "transparent",
                  boxShadow: "-3px -3px 8px rgba(255,255,255,0.85), 3px 3px 8px rgba(0,0,0,0.06)"
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-all cursor-pointer ${alignFlexClass}`}
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </motion.a>
            ))}

            <SocialsGrid socialLinks={socialLinks} isThemeDark={false} />

            {data.plan === "business" && (
              <WalletButton cardId={data.id} brandColor={brandColor} />
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "skeuomorphic") {
    const txtColor = customTextColor || "#0f172a";
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : "#334155";
    const skBorderCol = customTextColor ? `${customTextColor}40` : "rgba(15, 23, 42, 0.12)";

    return (
      <motion.div
        {...motionProps}
        className="rounded-2xl p-6 max-w-sm w-full mx-auto relative overflow-hidden border-2 transition-all"
        style={{
          background: "linear-gradient(145deg, #f8fafc, #e2e8f0)",
          borderColor: skBorderCol,
          boxShadow: "0 15px 35px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.9)",
          ...bgStyle,
        }}
      >
        <div className={`flex flex-col ${alignClass}`}>
          <Logo data={data} initials={initials} color={brandColor} size={76} />
          <div style={{ color: txtColor }} className="text-xl font-extrabold mt-4 tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
            {data.member_name ? data.member_name : (data.business_name || "Your Business")}
          </div>
          {(data.member_role || data.tagline) && (
            <div style={{ color: mutedTxtColor }} className="text-xs mt-1 font-semibold uppercase tracking-wider">
              {data.member_name
                ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                : data.tagline}
            </div>
          )}
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line font-medium"
            >
              {data.bio}
            </p>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-col gap-2.5 w-full"
          >
            <SaveButton 
              color={brandColor} 
              textColor={customTextColor || "#ffffff"} 
              onClick={onSaveContact} 
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.15)",
                background: `linear-gradient(180deg, ${lighten(brandColor, 0.15)} 0%, ${brandColor} 100%)`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)"
              }} 
            />
            {onDownloadCard && (
              <DownloadButton 
                color={brandColor} 
                onClick={onDownloadCard} 
                style={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
                }} 
              />
            )}
            
            {data.google_review && (
              <GoogleReviewGate cardId={data.id} googleReviewUrl={data.google_review} brandColor={brandColor} />
            )}

            {links.map((l) => (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: txtColor, 
                  borderColor: "#cbd5e1",
                  borderRadius: "12px",
                  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
                }}
                className={`flex items-center gap-3 px-4 py-3 border text-sm transition-all cursor-pointer ${alignFlexClass}`}
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </motion.a>
            ))}

            <SocialsGrid socialLinks={socialLinks} isThemeDark={false} />

            {data.plan === "business" && (
              <WalletButton cardId={data.id} brandColor={brandColor} />
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "liquidGlass") {
    const txtColor = customTextColor || "#ffffff";
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : "rgba(255, 255, 255, 0.82)";
    const borderCol = customTextColor ? `${customTextColor}4d` : "rgba(255, 255, 255, 0.4)";
    const linkBorderCol = customTextColor ? `${customTextColor}26` : "rgba(255, 255, 255, 0.18)";

    return (
      <motion.div
        {...motionProps}
        className="rounded-[36px] p-2 max-w-sm w-full mx-auto relative overflow-hidden shadow-2xl"
        style={{
          ...bgStyle,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 4px 10px rgba(255,255,255,0.3)"
        }}
      >
        {!hasBg && !vibe && (
          <div className="absolute inset-0 -z-10 bg-slate-950 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-60 bg-gradient-to-tr from-cyan-400 to-indigo-600"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-50 bg-gradient-to-tr from-purple-500 to-pink-500"></div>
          </div>
        )}
        <div 
          style={{ borderColor: borderCol }}
          className="bg-white/12 backdrop-blur-2xl border-2 rounded-[28px] p-6 shadow-2xl flex flex-col relative overflow-hidden"
        >
          <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] rotate-[35deg] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none -z-10"></div>
          
          <div className={`flex flex-col ${alignClass}`}>
            <Logo data={data} initials={initials} color={brandColor} size={80} inverse />
            <div 
              style={{ color: txtColor, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
              className="text-xl font-black tracking-wide mt-4"
            >
              {data.member_name ? data.member_name : (data.business_name || "Your Business")}
            </div>
            {(data.member_role || data.tagline) && (
              <div style={{ color: mutedTxtColor }} className="text-xs mt-1 font-semibold uppercase tracking-wider">
                {data.member_name
                  ? `${data.member_role || ""}${data.member_role && data.business_name ? " @ " : ""}${data.business_name || ""}`
                  : data.tagline}
              </div>
            )}
            <OpenStatusBadge hours={data.opening_hours} inverse={false} />
            {data.bio && (
              <p 
                style={{ color: mutedTxtColor }} 
                className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line font-medium"
              >
                {data.bio}
              </p>
            )}

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              initial="hidden"
              animate="show"
              className="mt-6 flex flex-col gap-2.5 w-full"
            >
              <SaveButton 
                color="rgba(255, 255, 255, 0.28)" 
                textColor={customTextColor || "#ffffff"} 
                onClick={onSaveContact} 
                style={{
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 15px rgba(255,255,255,0.05), inset 0 2px 4px rgba(255,255,255,0.15)"
                }} 
              />
              {onDownloadCard && (
                <DownloadButton 
                  color={txtColor} 
                  onClick={onDownloadCard} 
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                  }} 
                />
              )}
              
              {data.google_review && (
                <GoogleReviewGate cardId={data.id} googleReviewUrl={data.google_review} brandColor={brandColor} />
              )}

              {links.map((l) => (
                <motion.a
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: txtColor, 
                    borderColor: linkBorderCol,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)"
                  }}
                  className={`flex items-center gap-3 px-4 py-3 border text-sm transition-all cursor-pointer ${alignFlexClass}`}
                >
                  <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                  {l.label}
                </motion.a>
              ))}

              <SocialsGrid socialLinks={socialLinks} isThemeDark={true} />

              {data.plan === "business" && (
                <WalletButton cardId={data.id} brandColor={brandColor} />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "gradient") {
    const txtColor = customTextColor || (vibe ? textColor : lighten(brandColor, 0.92));
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : (vibe ? `${textColor}cc` : lighten(brandColor, 0.7));

    return (
      <motion.div
        {...motionProps}
        className="rounded-2xl overflow-hidden max-w-sm w-full mx-auto border border-stone-200 bg-white"
        style={{ ...bgStyle, ...getNeomorphicStyle() }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientMotion {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}} />
        <div
          className={`pt-10 px-6 pb-12 flex flex-col ${alignClass} relative ${hasBg ? "backdrop-blur-[2px]" : ""}`}
          style={{
            background: hasBg
              ? "rgba(0,0,0,0.3)"
              : `linear-gradient(135deg, ${brandColor} 0%, ${lighten(brandColor, 0.4)} 100%)`,
          }}
        >
          <Logo data={data} initials={initials} color={brandColor} size={76} inverse />
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
          {data.bio && (
            <p 
              style={{ color: mutedTxtColor }} 
              className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
            >
              {data.bio}
            </p>
          )}
        </div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
          className={`px-6 pt-6 pb-6 -mt-6 mx-4 mb-2 bg-white rounded-2xl shadow-sm flex flex-col gap-2 relative ${hasBg ? "bg-white/90 backdrop-blur-md" : ""}`}
        >
          <SaveButton color={brandColor} textColor="#fff" onClick={onSaveContact} style={getNeomorphicStyle(true)} />
          {onDownloadCard && <DownloadButton color={brandColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={brandColor}
            />
          )}

          {links.map((l) => {
            const isGoogleReview = l.key === "google_review";
            return (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isGoogleReview ? undefined : (customTextColor || "#0f172a"), ...getNeomorphicStyle(true) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${alignFlexClass} ${
                  isGoogleReview
                    ? "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60 font-medium shadow-sm"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span 
                  style={{ color: isGoogleReview ? undefined : "#6b7280" }}
                  className={isGoogleReview ? "text-amber-505" : ""}
                >
                  {l.icon}
                </span>
                {l.label}
              </motion.a>
            );
          })}

          <SocialsGrid socialLinks={socialLinks} isThemeDark={true} />

          {data.plan === "business" && (
            <WalletButton cardId={data.id} brandColor={brandColor} />
          )}
        </motion.div>
      </motion.div>
    );
  }

  // "classic" — default
  const classicHeaderTextColor = customTextColor || (vibe ? textColor : lighten(brandColor, 0.92));
  const classicHeaderMutedColor = customTextColor ? `${customTextColor}cc` : (vibe ? `${textColor}cc` : lighten(brandColor, 0.6));
  const classicBodyTextColor = customTextColor || (vibe ? textColor : "#0f172a");
  const classicBodyMutedColor = customTextColor ? `${customTextColor}b3` : (vibe ? `${textColor}b3` : "#6b7280");

  return (
    <motion.div
      {...motionProps}
      className="bg-white rounded-2xl overflow-hidden border border-stone-200 max-w-sm w-full mx-auto"
      style={{ ...bgStyle, ...getNeomorphicStyle() }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradientMotion {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
      `}} />
      <div
        className={`pt-8 px-6 pb-10 flex flex-col ${alignClass} ${hasBg ? "backdrop-blur-[2px]" : ""}`}
        style={{ backgroundColor: hasBg ? "rgba(0,0,0,0.35)" : brandColor }}
      >
        <Logo data={data} initials={initials} color={brandColor} size={64} inverse />
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
        <OpenStatusBadge hours={data.opening_hours} inverse={false} />
        {data.bio && (
          <p 
            style={{ color: classicHeaderMutedColor }} 
            className="text-xs mt-3 px-4 leading-relaxed whitespace-pre-line"
          >
            {data.bio}
          </p>
        )}
      </div>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        initial="hidden"
        animate="show"
        className={`px-5 py-5 flex flex-col gap-2 ${hasBg ? "bg-white/85 backdrop-blur-md" : ""}`}
      >
        <SaveButton color={brandColor} textColor="#fff" onClick={onSaveContact} style={getNeomorphicStyle(true)} />
        {onDownloadCard && <DownloadButton color={brandColor} onClick={onDownloadCard} style={getNeomorphicStyle(true)} />}
        
        {data.google_review && (
          <GoogleReviewGate
            cardId={data.id}
            googleReviewUrl={data.google_review}
            brandColor={brandColor}
          />
        )}

        {links.map((l) => {
          const isGoogleReview = l.key === "google_review";
          return (
            <motion.a
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              key={l.key}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isGoogleReview ? undefined : classicBodyTextColor, ...getNeomorphicStyle(true) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${alignFlexClass} ${
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
            </motion.a>
          );
        })}

        <SocialsGrid socialLinks={socialLinks} isThemeDark={false} />

        {data.plan === "business" && (
          <WalletButton cardId={data.id} brandColor={brandColor} />
        )}
      </motion.div>
    </motion.div>
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
  style,
}: {
  color: string;
  textColor: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (onClick) onClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSave}
      style={{ backgroundColor: color, color: textColor, ...style }}
      className="w-full py-3 rounded-xl text-sm font-semibold mb-1 flex items-center justify-center gap-2 cursor-pointer"
    >
      {saved ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Saved!</span>
        </>
      ) : (
        "Save to contacts"
      )}
    </motion.button>
  );
}

function DownloadButton({
  color,
  onClick,
  style,
}: {
  color: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ borderColor: color, color: color, ...style }}
      className="w-full py-3 rounded-xl text-sm font-semibold border-2 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 mb-1 cursor-pointer"
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
    </motion.button>
  );
}

function LinkRow({ item, variant }: { item: LinkItem; variant: "outline" }) {
  const isGoogleReview = item.key === "google_review";
  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
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
    </motion.a>
  );
}

function GoogleReviewGate({
  cardId,
  googleReviewUrl,
  brandColor,
}: {
  cardId?: string;
  googleReviewUrl: string;
  brandColor: string;
}) {
  const [rated, setRated] = useState<"happy" | "unhappy" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 animate-fade-in my-1 w-full">
        Thank you for your valuable feedback!
      </div>
    );
  }

  if (rated === "unhappy") {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!feedbackText.trim()) return;
          setSubmitting(true);
          if (cardId) {
            try {
              await fetch(`/api/cards/${cardId}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: "unhappy", comments: feedbackText }),
              });
            } catch (err) {
              console.error(err);
            }
          }
          setSubmitting(false);
          setSubmitted(true);
        }}
        className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs space-y-3 animate-fade-in my-1 w-full"
      >
        <p className="font-semibold text-stone-700">We&apos;re sorry to hear that. How can we improve?</p>
        <textarea
          required
          rows={3}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share your experience..."
          className="w-full border border-stone-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: brandColor }}
            className="text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => setRated(null)}
            className="text-stone-500 hover:text-stone-700 font-semibold px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="border border-stone-200 bg-amber-50/20 rounded-xl p-4 text-center text-xs shadow-sm my-1 w-full">
      <p className="font-semibold text-stone-700 mb-2.5">Rate your experience with us</p>
      <div className="flex justify-center gap-6">
        <button
          type="button"
          onClick={() => {
            setRated("happy");
            window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <span className="text-3xl filter transition-transform group-hover:scale-110 duration-200">🙂</span>
          <span className="text-[10px] text-stone-500 font-medium">Happy</span>
        </button>
        <button
          type="button"
          onClick={() => setRated("unhappy")}
          className="flex flex-col items-center gap-1 group"
        >
          <span className="text-3xl filter transition-transform group-hover:scale-110 duration-200">🙁</span>
          <span className="text-[10px] text-stone-500 font-medium">Unhappy</span>
        </button>
      </div>
    </div>
  );
}


function WalletButton({ cardId, brandColor }: { cardId?: string; brandColor: string }) {
  if (!cardId) return null;
  return (
    <a
      href={`/api/cards/${cardId}/wallet`}
      download
      style={{ borderColor: brandColor, color: brandColor }}
      className="flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer mt-4 shadow-sm w-full"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
      Add to Apple/Google Wallet
    </a>
  );
}

function OpenStatusBadge({ hours, inverse }: { hours: any; inverse?: boolean }) {
  const status = getOpenStatus(hours);
  if (!status) return null;
  
  const bgColor = inverse 
    ? "bg-stone-100/80 border-stone-200/50" 
    : "bg-white/10 border-white/5";
    
  const textColor = inverse 
    ? "text-stone-700" 
    : "text-white/90";

  return (
    <div className={`flex items-center justify-center gap-1.5 mt-2 ${bgColor} backdrop-blur-sm px-2.5 py-1 rounded-full w-fit mx-auto border shadow-sm`}>
      <span className={`w-2 h-2 rounded-full ${status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
      <span className={`text-[10px] font-semibold ${textColor} uppercase tracking-wider`}>{status.text}</span>
    </div>
  );
}

function getOpenStatus(hours: any): { isOpen: boolean; text: string } | null {
  if (!hours) return null;
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const dayHours = hours[currentDay];
  
  if (!dayHours || dayHours.isClosed) {
    return { isOpen: false, text: "Closed" };
  }
  
  const [openH, openM] = dayHours.open.split(":").map(Number);
  const [closeH, closeM] = dayHours.close.split(":").map(Number);
  
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;
  const currentTime = currentH * 60 + currentM;
  
  if (currentTime >= openTime && currentTime <= closeTime) {
    return { isOpen: true, text: "Open Now" };
  }
  return { isOpen: false, text: "Closed" };
}

function SectionRenderer({ section, card }: { section: any; card: CardData }) {
  if (!section.enabled) return null;
  const resolvedCard = {
    ...card,
    theme: (card.plan === "business" && section.theme) ? section.theme : card.theme
  };

  switch (section.type) {
    case "menu":
      return <MenuSectionRenderer data={section.data} card={resolvedCard} />;
    case "gallery":
      return <GallerySectionRenderer data={section.data} card={resolvedCard} />;
    case "services":
      return <ServicesSectionRenderer data={section.data} card={resolvedCard} />;
    case "hours":
      return <HoursSectionRenderer data={section.data} card={resolvedCard} />;
    case "location":
      return <LocationSectionRenderer data={section.data} card={resolvedCard} />;
    case "review":
      return <ReviewSectionRenderer data={section.data} card={resolvedCard} />;
    case "booking":
      return <BookingSectionRenderer data={section.data} card={resolvedCard} />;
    case "wifi":
      return <WifiSectionRenderer data={section.data} card={resolvedCard} />;
    case "lead_capture":
      return <LeadCaptureSectionRenderer data={section.data} card={resolvedCard} />;
    case "amenities":
      return <AmenitiesSectionRenderer data={section.data} card={resolvedCard} />;
    case "schedule":
      return <ScheduleSectionRenderer data={section.data} card={resolvedCard} />;
    case "pricing_table":
      return <PricingTableSectionRenderer data={section.data} card={resolvedCard} />;
    case "featured_products":
      return <FeaturedProductsSectionRenderer data={section.data} card={resolvedCard} />;
    case "courses":
      return <CoursesSectionRenderer data={section.data} card={resolvedCard} />;
    case "contact":
      return <ContactSectionRenderer card={resolvedCard} />;
    case "socials":
      return <SocialsSectionRenderer card={resolvedCard} />;
    default:
      return null;
  }
}

export default function CardPreview({ data, onSaveContact, onDownloadCard }: Props) {
  const sections = data.sections || [];
  const hasSection = (type: string) => sections.some((s: any) => s.type === type && s.enabled !== false);
  const getSectionData = (type: string) => {
    const sec = sections.find((s: any) => s.type === type);
    return sec?.data || {};
  };

  const tabs: { id: string; label: string; emoji: string }[] = [
    { id: "profile", label: "About", emoji: "👤" }
  ];

  if (hasSection("menu")) tabs.push({ id: "menu", label: "Menu", emoji: "🍽️" });
  if (hasSection("services") || hasSection("courses")) tabs.push({ id: "services", label: "Services", emoji: "✂️" });
  if (hasSection("gallery")) tabs.push({ id: "gallery", label: "Gallery", emoji: "📷" });
  if (hasSection("featured_products") || hasSection("pricing_table")) tabs.push({ id: "products", label: "Products", emoji: "🛍️" });
  if (hasSection("wifi")) tabs.push({ id: "wifi", label: "WiFi", emoji: "📶" });
  if (hasSection("location") || hasSection("hours")) tabs.push({ id: "location", label: "Location", emoji: "📍" });
  if (hasSection("booking") || hasSection("lead_capture")) tabs.push({ id: "booking", label: "Book", emoji: "📅" });
  if (hasSection("review")) tabs.push({ id: "review", label: "Review", emoji: "⭐" });
  tabs.push({ id: "share", label: "Share", emoji: "🔗" });

  const getLandingTab = () => {
    const activeTabIds = tabs.map(t => t.id);
    const customDefaultTab = data.plan === "business" ? data.design_settings?.default_nav_tab : null;
    if (customDefaultTab && activeTabIds.includes(customDefaultTab)) {
      return customDefaultTab;
    }

    if (data.business_type === "restaurant" && activeTabIds.includes("menu")) return "menu";
    if (["salon", "clinic", "consultancy", "education"].includes(data.business_type || "") && activeTabIds.includes("services")) return "services";
    if (["tattoo", "creative"].includes(data.business_type || "") && activeTabIds.includes("gallery")) return "gallery";
    if (data.business_type === "retail" && activeTabIds.includes("products")) return "products";
    if (data.business_type === "hotel" && activeTabIds.includes("location")) return "location";
    
    // Fallback priorities
    if (activeTabIds.includes("menu")) return "menu";
    if (activeTabIds.includes("services")) return "services";
    if (activeTabIds.includes("gallery")) return "gallery";
    if (activeTabIds.includes("products")) return "products";
    return "profile";
  };

  const initialTab = getLandingTab();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab dynamically on client-side state edits
  useEffect(() => {
    setActiveTab(getLandingTab());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.business_type, sections.length]);

  const initials = getInitials(data.member_name || data.business_name || "Your Business");
  const color = data.brand_color || "#085041";

  const getResolvedCard = (type: string) => {
    const sec = sections.find((s: any) => s.type === type);
    if (!sec || !sec.theme) return data;
    return {
      ...data,
      theme: (data.plan === "business" && sec.theme) ? sec.theme : data.theme
    };
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
      {/* Scrollable Tab Navigation */}
      {tabs.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2.5 scrollbar-none border-b border-stone-200/50 mb-1 snap-x snap-mandatory">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 snap-center ${
                  isActive ? "bg-brand text-white border-brand shadow-sm" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content Display */}
      <div className="w-full flex flex-col gap-4">
        {activeTab === "profile" && (
          <div className="w-full flex flex-col gap-4">
            <CardMockup data={data} onSaveContact={onSaveContact} onDownloadCard={onDownloadCard} />
            <div className="w-full flex justify-center mt-1">
              <DownloadBusinessCard data={data} />
            </div>
          </div>
        )}

        {activeTab !== "profile" && activeTab !== "share" && (
          <div className="w-full flex flex-col gap-3 animate-fade-in">
            {/* Brand Header */}
            <div className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm text-left">
              <Logo data={data} initials={initials} color={color} size={40} />
              <div className="flex-1 min-w-0">
                <h1 className="text-xs font-bold text-stone-900 truncate">{data.business_name || "Your Business"}</h1>
                {data.tagline && <p className="text-[9px] text-stone-500 truncate mt-0.5">{data.tagline}</p>}
              </div>
              <OpenStatusBadge hours={data.opening_hours} inverse={true} />
            </div>

            {/* Tab Content */}
            {activeTab === "menu" && hasSection("menu") && (
              <MenuSectionRenderer data={getSectionData("menu")} card={getResolvedCard("menu")} />
            )}
            {activeTab === "services" && (
              <div className="flex flex-col gap-3">
                {hasSection("services") && <ServicesSectionRenderer data={getSectionData("services")} card={getResolvedCard("services")} />}
                {hasSection("courses") && <CoursesSectionRenderer data={getSectionData("courses")} card={getResolvedCard("courses")} />}
              </div>
            )}
            {activeTab === "gallery" && hasSection("gallery") && (
              <GallerySectionRenderer data={getSectionData("gallery")} card={getResolvedCard("gallery")} />
            )}
            {activeTab === "products" && (
              <div className="flex flex-col gap-3">
                {hasSection("featured_products") && <FeaturedProductsSectionRenderer data={getSectionData("featured_products")} card={getResolvedCard("featured_products")} />}
                {hasSection("pricing_table") && <PricingTableSectionRenderer data={getSectionData("pricing_table")} card={getResolvedCard("pricing_table")} />}
              </div>
            )}
            {activeTab === "wifi" && hasSection("wifi") && (
              <WifiSectionRenderer data={getSectionData("wifi")} card={getResolvedCard("wifi")} />
            )}
            {activeTab === "location" && (
              <div className="flex flex-col gap-3">
                {hasSection("location") && <LocationSectionRenderer data={getSectionData("location")} card={getResolvedCard("location")} />}
                {hasSection("hours") && <HoursSectionRenderer data={getSectionData("hours")} card={getResolvedCard("hours")} />}
              </div>
            )}
            {activeTab === "booking" && (
              <div className="flex flex-col gap-3">
                {hasSection("booking") && <BookingSectionRenderer data={getSectionData("booking")} card={getResolvedCard("booking")} />}
                {hasSection("lead_capture") && <LeadCaptureSectionRenderer data={getSectionData("lead_capture")} card={getResolvedCard("lead_capture")} />}
              </div>
            )}
            {activeTab === "review" && hasSection("review") && (
              <ReviewSectionRenderer data={getSectionData("review")} card={getResolvedCard("review")} />
            )}
          </div>
        )}

        {activeTab === "share" && (
          <div className="w-full flex justify-center">
            <ShareQR data={data} url={`${SITE.baseUrl}/card/${data.slug || ""}`} />
          </div>
        )}
      </div>
    </div>
  );
}
