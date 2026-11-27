import type { MetadataRoute } from "next";
import { ArticleStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors] = await Promise.all([
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
        articles: { some: { status: ArticleStatus.PUBLISHED } },
      },
      select: { username: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/categories",
    "/about",
    "/contact",
    "/search",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...articles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...authors.map((author) => ({
      url: absoluteUrl(`/authors/${author.username}`),
      lastModified: author.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
