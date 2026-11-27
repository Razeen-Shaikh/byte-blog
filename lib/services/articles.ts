import { ArticleStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { estimateReadingTime, slugify } from "@/lib/utils";
import type {
  articleCreateSchema,
  articleInputSchema,
} from "@/lib/validations/article";
import type { z } from "zod";

export const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  readingTime: true,
  viewCount: true,
  likeCount: true,
  commentCount: true,
  featured: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.ArticleSelect;

export type ArticleCard = Prisma.ArticleGetPayload<{
  select: typeof articleCardSelect;
}>;

type ArticleInput = z.infer<typeof articleCreateSchema>;
type ArticleUpdateInput = z.infer<typeof articleInputSchema>;

type ListParams = {
  q?: string;
  category?: string;
  tag?: string;
  author?: string;
  sort?: "newest" | "oldest" | "popular";
  featured?: boolean;
  status?: ArticleStatus;
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
};

export async function listArticles(params: ListParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {};

  if (params.includeDrafts) {
    if (params.status) where.status = params.status;
  } else {
    where.status = ArticleStatus.PUBLISHED;
    where.publishedAt = { lte: new Date() };
  }

  if (params.featured !== undefined) where.featured = params.featured;
  if (params.category) where.category = { slug: params.category };
  if (params.author) where.author = { username: params.author };
  if (params.tag) where.tags = { some: { tag: { slug: params.tag } } };
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { excerpt: { contains: params.q, mode: "insensitive" } },
      { content: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ArticleOrderByWithRelationInput =
    params.sort === "oldest"
      ? { publishedAt: "asc" }
      : params.sort === "popular"
        ? { viewCount: "desc" }
        : { publishedAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleCardSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getArticleBySlug(slug: string, includeDrafts = false) {
  return prisma.article.findFirst({
    where: {
      slug,
      ...(includeDrafts
        ? {}
        : { status: ArticleStatus.PUBLISHED, publishedAt: { lte: new Date() } }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          website: true,
          twitter: true,
          github: true,
          linkedin: true,
        },
      },
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
  take = 3,
) {
  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      status: ArticleStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      ...(categoryId ? { categoryId } : {}),
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getAdjacentArticles(publishedAt: Date | null) {
  if (!publishedAt) return { previous: null, next: null };

  const [previous, next] = await Promise.all([
    prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { lt: publishedAt },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { gt: publishedAt },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  return { previous, next };
}

export async function createArticle(authorId: string, data: ArticleInput) {
  const readingTime = estimateReadingTime(data.content);
  const publishedAt =
    data.status === ArticleStatus.PUBLISHED
      ? (data.publishedAt ?? new Date())
      : data.publishedAt ?? null;

  return prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug || slugify(data.title),
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      status: data.status,
      featured: data.featured ?? false,
      readingTime,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl || null,
      ogImage: data.ogImage || null,
      scheduledAt: data.scheduledAt,
      publishedAt,
      authorId,
      categoryId: data.categoryId || null,
      tags: data.tagIds?.length
        ? {
            create: data.tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    select: articleCardSelect,
  });
}

export async function updateArticle(
  id: string,
  data: Partial<ArticleUpdateInput>,
) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return null;

  const readingTime = data.content
    ? estimateReadingTime(data.content)
    : existing.readingTime;

  let publishedAt = existing.publishedAt;
  if (data.status === ArticleStatus.PUBLISHED && !publishedAt) {
    publishedAt = data.publishedAt ?? new Date();
  }
  if (data.publishedAt) publishedAt = data.publishedAt;

  return prisma.$transaction(async (tx) => {
    if (data.tagIds) {
      await tx.articleTag.deleteMany({ where: { articleId: id } });
      if (data.tagIds.length) {
        await tx.articleTag.createMany({
          data: data.tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }

    return tx.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage === "" ? null : data.coverImage,
        status: data.status,
        featured: data.featured,
        readingTime,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl === "" ? null : data.canonicalUrl,
        ogImage: data.ogImage === "" ? null : data.ogImage,
        scheduledAt: data.scheduledAt,
        publishedAt,
        categoryId: data.categoryId === undefined ? undefined : data.categoryId || null,
      },
      select: articleCardSelect,
    });
  });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}

export async function recordArticleView(params: {
  articleId: string;
  userId?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  await prisma.$transaction([
    prisma.articleView.create({
      data: {
        articleId: params.articleId,
        userId: params.userId ?? null,
        ipHash: params.ipHash ?? null,
        userAgent: params.userAgent ?? null,
      },
    }),
    prisma.article.update({
      where: { id: params.articleId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  if (params.userId) {
    await prisma.readingHistory.upsert({
      where: {
        userId_articleId: {
          userId: params.userId,
          articleId: params.articleId,
        },
      },
      create: {
        userId: params.userId,
        articleId: params.articleId,
      },
      update: {
        lastReadAt: new Date(),
      },
    });
  }
}
