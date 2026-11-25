import type { Metadata } from "next";

type PublicMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export function publicMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PublicMetadataOptions): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: "es_EC",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
