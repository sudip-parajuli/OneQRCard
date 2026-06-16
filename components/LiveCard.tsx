"use client";

import CardPreview from "@/components/CardPreview";
import { CardData } from "@/lib/types";
import { buildVCard } from "@/lib/utils";
import { generateBusinessCard } from "@/lib/business-card";

export default function LiveCard({ data }: { data: CardData }) {
  function handleSaveContact() {
    const vcard = buildVCard(data);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.business_name || "card"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownloadCard() {
    try {
      const dataUrl = await generateBusinessCard(data);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${data.business_name || "business"}_card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate business card:", err);
      alert("Failed to generate your business card. Please try again.");
    }
  }

  const showDownload = data.plan !== "basic";

  return (
    <CardPreview
      data={data}
      onSaveContact={handleSaveContact}
      onDownloadCard={showDownload ? handleDownloadCard : undefined}
    />
  );
}
