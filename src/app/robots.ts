import type { MetadataRoute } from "next";

const SITE_URL = "https://buddascatering.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/corporate-program", "/privacy", "/terms"],
        disallow: ["/app/", "/api/", "/login", "/track/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
