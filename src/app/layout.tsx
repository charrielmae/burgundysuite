import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Burgundy Suite & Resort | Coastal Luxury Haven & Command Center",
  description:
    "A sanctuary of coastal opulence. Experience unmatched elegance at Burgundy Suite & Resort with world-class suites, private beach seclusion, and bespoke hospitality.",
  keywords: ["Burgundy Suite", "Luxury Resort", "Coastal Opulence", "Boutique Hotel", "Emerald Bay"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#2B0E14] text-[#F5EFEB] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#2B0E14]">
        {children}
      </body>
    </html>
  );
}
