import type { Metadata } from "next";

import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export function articleJsonLd(article: {
  title: string;
  excerpt: string | null;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage: string | null;
  author: { name: string | null; username: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name ?? article.author.username,
      url: absoluteUrl(`/authors/${article.author.username}`),
    },
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
  };
}