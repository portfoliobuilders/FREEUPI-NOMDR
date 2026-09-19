import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicEnv().siteUrl;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/invoice/", "/print/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
