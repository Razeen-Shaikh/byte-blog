import { ArticleStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { articleCardSelect } from "@/lib/services/articles";
import { userPublicSelect } from "@/lib/services/users";

export async function globalSearch(q: string, limit = 10) {
  const perType = Math.min(limit, 20);

  const [articles, categories, tags, authors] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: articleCardSelect,
      orderBy: { publishedAt: "desc" },
      take: perType,
    }),
    prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true, description: true },
      take: perType,
    }),
    prisma.tag.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: perType,
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      select: userPublicSelect,
      take: perType,
    }),
  ]);

  return { articles, categories, tags, authors };
}