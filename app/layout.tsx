import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `Digital Cards — ${SITE.name}`,
  description: "Create a digital business card with QR code in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-50 text-stone-900 font-sans">{children}</body>
    </html>
  );
}
