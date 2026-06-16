"use client";

import CardPreview from "@/components/CardPreview";
import { CardData } from "@/lib/types";
import { buildVCard } from "@/lib/utils";

export default function LiveCard({ data }: { data: CardData }) {
  function handleSaveContact() {
    const vcard = buildVCard(data);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.business_name}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return <CardPreview data={data} onSaveContact={handleSaveContact} />;
}
