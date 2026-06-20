import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    const db = supabaseAdmin();
    const { data: card } = await db
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .maybeSingle();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.plan !== "business") {
      return NextResponse.json({ error: "Wallet passes are a Lifetime-exclusive feature" }, { status: 403 });
    }

    const mockPass = {
      passTypeIdentifier: "pass.com.allscan.digitalcard",
      serialNumber: card.id,
      teamIdentifier: "ALLSCANPASS",
      organizationName: "AllScan Digital Cards",
      description: `${card.business_name} Digital Business Card`,
      logoText: card.business_name,
      foregroundColor: "#ffffff",
      backgroundColor: card.brand_color || "#085041",
      barcode: {
        message: `https://${card.slug}.allscan.app`,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      },
      generic: {
        primaryFields: [
          {
            key: "businessName",
            label: "Business Name",
            value: card.business_name
          }
        ],
        secondaryFields: [
          {
            key: "tagline",
            label: "Tagline",
            value: card.tagline || ""
          }
        ],
        auxiliaryFields: [
          {
            key: "phone",
            label: "Phone",
            value: card.phone || ""
          },
          {
            key: "email",
            label: "Email",
            value: card.email || ""
          }
        ]
      }
    };

    return new NextResponse(JSON.stringify(mockPass, null, 2), {
      headers: {
        "Content-Disposition": `attachment; filename="${card.slug}_wallet_pass.pkpass"`,
        "Content-Type": "application/vnd.apple.pkpass",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
