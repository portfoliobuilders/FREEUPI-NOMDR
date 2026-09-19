import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getPublicEnv().siteUrl;
  return ["", "/calculator", "/compliance", "/login", "/signup"].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date(),
  }));
}
