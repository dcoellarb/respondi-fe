import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const publicPaths = [
  "/",
  "/acerca",
  "/terminos",
  "/privacidad",
  "/registro",
  "/iniciar-sesion",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
