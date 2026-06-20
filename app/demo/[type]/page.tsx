"use client";

import { notFound } from "next/navigation";
import CardPreview from "@/components/CardPreview";
import { CardData } from "@/lib/types";
import { SITE } from "@/lib/config";
import Link from "next/link";
import { buildVCard } from "@/lib/utils";

const MOCK_CARDS: Record<string, CardData> = {
  restaurant: {
    slug: "demo-restaurant",
    business_name: "The Himalayan Bistro",
    tagline: "Authentic Himalayan Delicacies & Coffee",
    brand_color: "#c0392b",
    theme: "classic",
    logo_data_url: null,
    phone: "9851000000",
    whatsapp: "9779851000000",
    website: "https://himalayanbistro.com",
    facebook: "https://facebook.com/himalayanbistro",
    instagram: "https://instagram.com/himalayanbistro",
    tiktok: "",
    youtube: "",
    email: "info@himalayanbistro.com",
    plan: "pro",
    subdomain: null,
    payment_status: "paid",
    custom_links: [],
    address: "Boudha, Kathmandu",
    google_review: "https://g.page/r/...",
    location_url: "https://maps.app.goo.gl/...",
    sections: [
      {
        type: "menu",
        title: "Our Menu",
        enabled: true,
        data: {
          show_prices: true,
          categories: [
            {
              id: "cat_momo",
              name: "Himalayan Momos",
              items: [
                {
                  id: "m1",
                  name: "Steamed Chicken Momo",
                  price: "Rs 250",
                  description: "Juicy hand-folded dumplings served with traditional tomato-sesame achhar.",
                  is_popular: true
                },
                {
                  id: "m2",
                  name: "Kothey Buff Momo",
                  price: "Rs 280",
                  description: "Pan-fried half-moon shape buffalo dumplings with spicy dipping sauce."
                },
                {
                  id: "m3",
                  name: "Jhol Vegetable Momo",
                  price: "Rs 260",
                  description: "Steamed vegetable dumplings submerged in hot, tangy sesame soup."
                }
              ]
            },
            {
              id: "cat_thali",
              name: "Thakali Delights",
              items: [
                {
                  id: "t1",
                  name: "Traditional Chicken Thakali Set",
                  price: "Rs 450",
                  description: "Local husked rice, black lentils (daal), local ghee, chicken curry, wild mushroom pickles, and papad.",
                  is_popular: true
                },
                {
                  id: "t2",
                  name: "Mutton Thakali Set",
                  price: "Rs 550",
                  description: "Traditional thakali platter served with aromatic slow-cooked Himalayan mutton curry."
                }
              ]
            }
          ]
        }
      },
      {
        type: "hours",
        title: "Opening Hours",
        enabled: true,
        data: {
          hours: {
            monday: { open: "08:00", close: "22:00", isClosed: false },
            tuesday: { open: "08:00", close: "22:00", isClosed: false },
            wednesday: { open: "08:00", close: "22:00", isClosed: false },
            thursday: { open: "08:00", close: "22:00", isClosed: false },
            friday: { open: "08:00", close: "23:00", isClosed: false },
            saturday: { open: "08:00", close: "23:00", isClosed: false },
            sunday: { open: "08:00", close: "22:00", isClosed: false }
          }
        }
      },
      {
        type: "location",
        title: "Our Location",
        enabled: true,
        data: {
          address: "Boudha (Near Stupa), Kathmandu",
          google_maps_url: "https://maps.app.goo.gl/..."
        }
      }
    ]
  },
  salon: {
    slug: "demo-salon",
    business_name: "Glow & Co. Salon",
    tagline: "Your Ultimate Beauty & Hair Experience",
    brand_color: "#6c3483",
    theme: "gradient",
    logo_data_url: null,
    phone: "9841000000",
    whatsapp: "9779841000000",
    website: "https://glowandcosalon.com",
    facebook: "https://facebook.com/glowcosalon",
    instagram: "https://instagram.com/glowcosalon",
    tiktok: "",
    youtube: "",
    email: "book@glowandcosalon.com",
    plan: "pro",
    subdomain: null,
    payment_status: "paid",
    custom_links: [],
    address: "Jhamsikhel, Lalitpur",
    google_review: "https://g.page/r/...",
    location_url: "https://maps.app.goo.gl/...",
    sections: [
      {
        type: "services",
        title: "Services Menu",
        enabled: true,
        data: {
          services: [
            {
              id: "s1",
              name: "Premium Haircut & Styling",
              price: "Rs 800",
              description: "Custom haircut, wash, scalp massage, and professional blow-dry styling.",
              duration: "45 mins"
            },
            {
              id: "s2",
              name: "Hydrating Herbal Hair Spa",
              price: "Rs 1,800",
              description: "Deep conditioning steam spa treatment for dry and damaged hair nourishment.",
              duration: "60 mins"
            },
            {
              id: "s3",
              name: "Signature Glow Facial",
              price: "Rs 2,500",
              description: "Organic fruit-enzyme facial treatment for an instant bright skin glow.",
              duration: "75 mins"
            }
          ]
        }
      },
      {
        type: "gallery",
        title: "Client Portfolio",
        enabled: true,
        data: {
          layout: "grid",
          images: [
            {
              id: "img1",
              url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
              caption: "Hair styling area"
            },
            {
              id: "img2",
              url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
              caption: "Facial therapy room"
            }
          ]
        }
      },
      {
        type: "booking",
        title: "Book Appointment",
        enabled: true,
        data: {
          mode: "form",
          booking_url: ""
        }
      }
    ]
  },
  hotel: {
    slug: "demo-hotel",
    business_name: "Summit View Boutique",
    tagline: "Panoramic mountain views and Himalayan hospitality",
    brand_color: "#1a5276",
    theme: "glassmorphic",
    logo_data_url: null,
    phone: "9801000000",
    whatsapp: "9779801000000",
    website: "https://summitviewboutique.com",
    facebook: "https://facebook.com/summitview",
    instagram: "https://instagram.com/summitview",
    tiktok: "",
    youtube: "",
    email: "stay@summitviewboutique.com",
    plan: "business",
    subdomain: null,
    payment_status: "paid",
    custom_links: [],
    address: "Sarangkot, Pokhara",
    google_review: "https://g.page/r/...",
    location_url: "https://maps.app.goo.gl/...",
    sections: [
      {
        type: "amenities",
        title: "Hotel Amenities",
        enabled: true,
        data: {
          amenities: [
            { id: "a1", name: "Heated Infinity Swimming Pool" },
            { id: "a2", name: "Panoramic Mountain View Rooftop Terrace" },
            { id: "a3", name: "High-Speed Guest WiFi (Fiber)" },
            { id: "a4", name: "Complimentary Organic Buffet Breakfast" },
            { id: "a5", name: "Airport Pick-up & Drop Shuttle Service" }
          ]
        }
      },
      {
        type: "wifi",
        title: "Guest WiFi Connect",
        enabled: true,
        data: {
          ssid: "Summit_Boutique_Guest",
          password: "welcome_to_summit_123",
          show_password: true
        }
      },
      {
        type: "hours",
        title: "Front Desk Service",
        enabled: true,
        data: {
          hours: {
            monday: { open: "00:00", close: "23:59", isClosed: false },
            tuesday: { open: "00:00", close: "23:59", isClosed: false },
            wednesday: { open: "00:00", close: "23:59", isClosed: false },
            thursday: { open: "00:00", close: "23:59", isClosed: false },
            friday: { open: "00:00", close: "23:59", isClosed: false },
            saturday: { open: "00:00", close: "23:59", isClosed: false },
            sunday: { open: "00:00", close: "23:59", isClosed: false }
          }
        }
      }
    ]
  },
  creative: {
    slug: "demo-creative",
    business_name: "Studio Canvas",
    tagline: "Professional Photography & Video Production",
    brand_color: "#2c2c2c",
    theme: "minimal",
    logo_data_url: null,
    phone: "9811000000",
    whatsapp: "9779811000000",
    website: "https://studiocanvas.com",
    facebook: "https://facebook.com/studiocanvas",
    instagram: "https://instagram.com/studiocanvas",
    tiktok: "",
    youtube: "",
    email: "hello@studiocanvas.com",
    plan: "pro",
    subdomain: null,
    payment_status: "paid",
    custom_links: [],
    address: "Lalitpur, Nepal",
    google_review: "https://g.page/r/...",
    location_url: "https://maps.app.goo.gl/...",
    sections: [
      {
        type: "gallery",
        title: "Our Portfolio",
        enabled: true,
        data: {
          layout: "grid",
          images: [
            {
              id: "i1",
              url: "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=600&q=80",
              caption: "Fine Art Portrait"
            },
            {
              id: "i2",
              url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
              caption: "Landscape & Travel Photography"
            }
          ]
        }
      },
      {
        type: "services",
        title: "Photography Packages",
        enabled: true,
        data: {
          services: [
            {
              id: "pkg1",
              name: "Outdoor Portrait Shoot",
              price: "Rs 5,000",
              description: "1-hour session, 2 locations, 15 edited high-resolution digital files.",
              duration: "60 mins"
            },
            {
              id: "pkg2",
              name: "Wedding Event Coverage",
              price: "Rs 50,000",
              description: "Full-day wedding coverage, 2 lead photographers, online album delivery.",
              duration: "Full Day"
            }
          ]
        }
      }
    ]
  },
  consultant: {
    slug: "demo-consultant",
    business_name: "Apex Advisory Group",
    tagline: "Corporate Law, Tax Advisory & Audit Services",
    brand_color: "#2c3e50",
    theme: "bold",
    logo_data_url: null,
    phone: "9821000000",
    whatsapp: "9779821000000",
    website: "https://apexadvisory.com.np",
    facebook: "https://facebook.com/apexadvisory",
    instagram: "https://instagram.com/apexadvisory",
    tiktok: "",
    youtube: "",
    email: "consult@apexadvisory.com",
    plan: "pro",
    subdomain: null,
    payment_status: "paid",
    custom_links: [],
    address: "New Baneshwor, Kathmandu",
    google_review: "https://g.page/r/...",
    location_url: "https://maps.app.goo.gl/...",
    sections: [
      {
        type: "services",
        title: "Our Expertise",
        enabled: true,
        data: {
          services: [
            {
              id: "cs1",
              name: "Private Limited Company Registration",
              price: "Rs 15,000",
              description: "Complete filing of MoA, AoA, OCR approvals, and PAN registration.",
              duration: "7 days"
            },
            {
              id: "cs2",
              name: "Tax Compliance & Auditing",
              price: "Contact for Quote",
              description: "Annual VAT filing, tax advisory, audit preparation, and corporate advisory."
            }
          ]
        }
      },
      {
        type: "lead_capture",
        title: "Book a Free Call",
        enabled: true,
        data: {
          fields: { name: true, phone: true, email: true, message: true },
          success_message: "Thank you! Our advisory consultant will contact you via phone/email."
        }
      }
    ]
  }
};

export default function DemoPage({ params }: { params: { type: string } }) {
  const type = params.type;
  const card = MOCK_CARDS[type];

  if (!card) return notFound();

  function handleSaveContact() {
    if (!card) return;
    const vcard = buildVCard(card);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.business_name || "card"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 bg-stone-50 pb-28 relative">
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 border-b border-stone-200 pb-4">
        <div>
          <Link href="/" className="text-xs text-stone-500 hover:text-stone-900 font-medium">
            &larr; Back to homepage
          </Link>
          <h1 className="text-xl font-bold text-stone-900 mt-1">Live Demo: {card.business_name}</h1>
          <p className="text-xs text-stone-500">This is a realistic demonstration of the {type} layout.</p>
        </div>
        <Link
          href="/create"
          style={{ backgroundColor: card.brand_color }}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all text-center"
        >
          Create your own now &rarr;
        </Link>
      </div>

      <CardPreview
        data={card}
        onSaveContact={handleSaveContact}
        onDownloadCard={() => alert("This is a demo profile. Downloading business card layout is disabled in preview.")}
      />

      <div className="flex flex-col items-center gap-2 mt-4 text-center">
        <Link href="/" className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">
          Made with {SITE.name}
        </Link>
      </div>
    </main>
  );
}
