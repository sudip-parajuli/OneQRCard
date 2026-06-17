"use client";

import { CardData } from "@/lib/types";

export default function CardMap({ data }: { data: CardData }) {
  if (!data.address) return null;

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    data.address
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full shadow-sm animate-fade-in">
      <div className="text-sm font-medium mb-3 text-stone-600">Location</div>
      <div className="w-full h-48 rounded-lg overflow-hidden border border-stone-100 shadow-sm relative bg-stone-50">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map Location"
        ></iframe>
      </div>
    </div>
  );
}
