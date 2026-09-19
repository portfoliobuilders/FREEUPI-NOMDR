import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { getPublicEnv } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getPublicEnv().siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FREEUPI — Smart UPI Payment Planner",
    template: "%s · FREEUPI",
  },
  description:
    "Create structured UPI payment requests for invoices, instalments, partial payments and shared settlements.",
  applicationName: "FREEUPI",
  keywords: [
    "UPI",
    "QR code",
    "invoice",
    "instalments",
    "payment planner",
    "India",
  ],
  authors: [{ name: "FREEUPI" }],
  openGraph: {
    title: "FREEUPI — Smart UPI Payment Planner",
    description:
      "Create structured UPI payment requests for invoices, instalments, partial payments and shared settlements.",
    url: siteUrl,
    siteName: "FREEUPI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FREEUPI — Smart UPI Payment Planner",
    description:
      "Create structured UPI payment requests for invoices, instalments, partial payments and shared settlements.",
  },
  appleWebApp: {
    capable: true,
    title: "FREEUPI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#5B5AF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
