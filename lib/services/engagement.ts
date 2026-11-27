import { prisma } from "@/lib/prisma";

export async function getUserArticleEngagement(userId: string, articleId: string) {
  const [like, bookmark] = await Promise.all([
    prisma.like.findUnique({
      where: { userId_articleId: { userId, articleId } },
    }),
    prisma.bookmark.findUnique({
      where: { userId_articleId: { userId, articleId } },
    }),
  ]);

  return { liked: !!like, bookmarked: !!bookmark };
}

export async function toggleLike(userId: string, articleId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, articleId } }),
    prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);

  return { liked: true };
}

export async function toggleBookmark(userId: string, articleId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, articleId } });
  return { bookmarked: true };
}