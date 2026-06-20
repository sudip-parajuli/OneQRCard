"use client";

import { useEffect, useState } from "react";
import { CardData } from "@/lib/types";
import { darken, getInitials, lighten, normalizePhone } from "@/lib/utils";
import { motion } from "framer-motion";
import ShareQR from "@/components/ShareQR";
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
function CardMockup({ data, onSaveContact, onDownloadCard }: Props) {
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />

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
            className="mt-6 flex flex-col gap-2"
          >
            <SaveButton color="rgba(255, 255, 255, 0.22)" textColor="#fff" onClick={onSaveContact} />
            {onDownloadCard && <DownloadButton color={txtColor} onClick={onDownloadCard} />}
            
            {data.google_review && (
              <GoogleReviewGate
                cardId={data.id}
                googleReviewUrl={data.google_review}
                brandColor={color}
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
                style={{ color: txtColor, borderColor: linkBorderCol }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 hover:bg-white/15 text-sm transition-all cursor-pointer"
              >
                <span style={{ color: mutedTxtColor }}>{l.icon}</span>
                {l.label}
              </motion.a>
            ))}

            {data.plan === "business" && (
              <>
                <LeadCaptureForm cardId={data.id} brandColor={color} />
                <WalletButton cardId={data.id} brandColor={color} />
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (data.theme === "neonDark") {
    const txtColor = customTextColor || "#ffffff";
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : "#a1a1aa";

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
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
          <SaveButton color={color} textColor="#0c0a09" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={color}
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
                style={{ color: isGoogleReview ? undefined : txtColor }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
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

          {data.plan === "business" && (
            <>
              <LeadCaptureForm cardId={data.id} brandColor={color} />
              <WalletButton cardId={data.id} brandColor={color} />
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "minimal") {
    const txtColor = customTextColor || "#0f172a";
    const mutedTxtColor = customTextColor ? `${customTextColor}b3` : "#6b7280";

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
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
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={color}
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
                style={{ color: isGoogleReview ? undefined : txtColor }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
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

          {data.plan === "business" && (
            <>
              <LeadCaptureForm cardId={data.id} brandColor={color} />
              <WalletButton cardId={data.id} brandColor={color} />
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "bold") {
    const txtColor = customTextColor || lighten(color, 0.92);
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.6);

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
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
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={color}
            />
          )}

          {links.map((l) => (
            <LinkRow key={l.key} item={l} variant="outline" />
          ))}

          {data.plan === "business" && (
            <>
              <LeadCaptureForm cardId={data.id} brandColor={color} />
              <WalletButton cardId={data.id} brandColor={color} />
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (data.theme === "gradient") {
    const txtColor = customTextColor || lighten(color, 0.92);
    const mutedTxtColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.7);

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
          <OpenStatusBadge hours={data.opening_hours} inverse={false} />
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
          <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
          {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
          
          {data.google_review && (
            <GoogleReviewGate
              cardId={data.id}
              googleReviewUrl={data.google_review}
              brandColor={color}
            />
          )}

          {links.map((l) => (
            <LinkRow key={l.key} item={l} variant="outline" />
          ))}

          {data.plan === "business" && (
            <>
              <LeadCaptureForm cardId={data.id} brandColor={color} />
              <WalletButton cardId={data.id} brandColor={color} />
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // "classic" — default
  const classicHeaderTextColor = customTextColor || lighten(color, 0.92);
  const classicHeaderMutedColor = customTextColor ? `${customTextColor}cc` : lighten(color, 0.6);
  const classicBodyTextColor = customTextColor || "#0f172a";
  const classicBodyMutedColor = customTextColor ? `${customTextColor}b3` : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
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
        <OpenStatusBadge hours={data.opening_hours} inverse={false} />
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
        <SaveButton color={color} textColor="#fff" onClick={onSaveContact} />
        {onDownloadCard && <DownloadButton color={color} onClick={onDownloadCard} />}
        
        {data.google_review && (
          <GoogleReviewGate
            cardId={data.id}
            googleReviewUrl={data.google_review}
            brandColor={color}
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
              style={{ color: isGoogleReview ? undefined : classicBodyTextColor }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
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

        {data.plan === "business" && (
          <>
            <LeadCaptureForm cardId={data.id} brandColor={color} />
            <WalletButton cardId={data.id} brandColor={color} />
          </>
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
}: {
  color: string;
  textColor: string;
  onClick?: () => void;
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
      style={{ backgroundColor: color, color: textColor }}
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
}: {
  color: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ borderColor: color, color: color }}
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

function LeadCaptureForm({ cardId, brandColor }: { cardId?: string; brandColor: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 animate-fade-in mt-4 w-full">
        Message sent successfully!
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm mt-4 text-left text-xs w-full">
      <h3 className="font-bold text-stone-850 mb-2">Get in touch</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !phone.trim()) return;
          setSubmitting(true);
          if (cardId) {
            try {
              await fetch(`/api/cards/${cardId}/leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, message }),
              });
            } catch (err) {
              console.error(err);
            }
          }
          setSubmitting(false);
          setSubmitted(true);
        }}
        className="space-y-2.5"
      >
        <div>
          <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-stone-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-brand bg-stone-50/50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Phone Number</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9860000000"
            className="w-full border border-stone-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-brand bg-stone-50/50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Message</label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            className="w-full border border-stone-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-brand bg-stone-50/50"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: brandColor }}
          className="w-full text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-center cursor-pointer"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
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

  switch (section.type) {
    case "menu":
      return <MenuSectionRenderer data={section.data} card={card} />;
    case "gallery":
      return <GallerySectionRenderer data={section.data} card={card} />;
    case "services":
      return <ServicesSectionRenderer data={section.data} card={card} />;
    case "hours":
      return <HoursSectionRenderer data={section.data} card={card} />;
    case "location":
      return <LocationSectionRenderer data={section.data} card={card} />;
    case "review":
      return <ReviewSectionRenderer data={section.data} card={card} />;
    case "booking":
      return <BookingSectionRenderer data={section.data} card={card} />;
    case "wifi":
      return <WifiSectionRenderer data={section.data} card={card} />;
    case "lead_capture":
      return <LeadCaptureSectionRenderer data={section.data} card={card} />;
    case "amenities":
      return <AmenitiesSectionRenderer data={section.data} card={card} />;
    case "schedule":
      return <ScheduleSectionRenderer data={section.data} card={card} />;
    case "pricing_table":
      return <PricingTableSectionRenderer data={section.data} card={card} />;
    case "featured_products":
      return <FeaturedProductsSectionRenderer data={section.data} card={card} />;
    case "courses":
      return <CoursesSectionRenderer data={section.data} card={card} />;
    case "contact":
      return <ContactSectionRenderer card={card} />;
    case "socials":
      return <SocialsSectionRenderer card={card} />;
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

      {/* Mini Brand Header if not on Profile tab */}
      {activeTab !== "profile" && (
        <div className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm mb-1 text-left">
          <Logo data={data} initials={initials} color={color} size={40} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xs font-bold text-stone-900 truncate">{data.business_name || "Your Business"}</h1>
            {data.tagline && <p className="text-[9px] text-stone-500 truncate mt-0.5">{data.tagline}</p>}
          </div>
          <OpenStatusBadge hours={data.opening_hours} inverse={true} />
        </div>
      )}

      {/* Tab Content Display */}
      <div className="w-full flex flex-col gap-4">
        {activeTab === "profile" && (
          <CardMockup data={data} onSaveContact={onSaveContact} onDownloadCard={onDownloadCard} />
        )}
        {activeTab === "menu" && hasSection("menu") && (
          <MenuSectionRenderer data={getSectionData("menu")} card={data} />
        )}
        {activeTab === "services" && (
          <>
            {hasSection("services") && <ServicesSectionRenderer data={getSectionData("services")} card={data} />}
            {hasSection("courses") && <CoursesSectionRenderer data={getSectionData("courses")} card={data} />}
          </>
        )}
        {activeTab === "gallery" && hasSection("gallery") && (
          <GallerySectionRenderer data={getSectionData("gallery")} card={data} />
        )}
        {activeTab === "products" && (
          <>
            {hasSection("featured_products") && <FeaturedProductsSectionRenderer data={getSectionData("featured_products")} card={data} />}
            {hasSection("pricing_table") && <PricingTableSectionRenderer data={getSectionData("pricing_table")} card={data} />}
          </>
        )}
        {activeTab === "wifi" && hasSection("wifi") && (
          <WifiSectionRenderer data={getSectionData("wifi")} card={data} />
        )}
        {activeTab === "location" && (
          <>
            {hasSection("location") && <LocationSectionRenderer data={getSectionData("location")} card={data} />}
            {hasSection("hours") && <HoursSectionRenderer data={getSectionData("hours")} card={data} />}
          </>
        )}
        {activeTab === "booking" && (
          <>
            {hasSection("booking") && <BookingSectionRenderer data={getSectionData("booking")} card={data} />}
            {hasSection("lead_capture") && <LeadCaptureSectionRenderer data={getSectionData("lead_capture")} card={data} />}
          </>
        )}
        {activeTab === "review" && hasSection("review") && (
          <ReviewSectionRenderer data={getSectionData("review")} card={data} />
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
