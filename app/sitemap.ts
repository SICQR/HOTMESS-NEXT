import type { MetadataRoute } from "next";

// Generates sitemap.xml
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const lastModified = new Date();

  const routes = [
    "/",
    "/about",
    "/care",
    "/community",
    "/legal",
    "/legal/privacy",
    "/legal/terms",
    "/legal/care-disclaimer",
    "/radio",
    "/records",
    "/shop",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
