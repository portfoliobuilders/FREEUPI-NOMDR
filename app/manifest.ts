import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FREEUPI",
    short_name: "FREEUPI",
    description:
      "Create structured UPI payment requests for invoices, instalments, partial payments and shared settlements.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9FC",
    theme_color: "#5B5AF7",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
