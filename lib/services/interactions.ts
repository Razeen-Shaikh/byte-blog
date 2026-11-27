import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { articleCardSelect } from "@/lib/services/articles";

export const bookmarkSelect = {
  id: true,
  createdAt: true,
  article: { select: articleCardSelect },
} satisfies Prisma.BookmarkSelect;

export async function likeArticle(userId: string, articleId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });
  if (existing) {
    return { liked: true, id: existing.id };
  }

  const like = await prisma.$transaction(async (tx) => {
    const created = await tx.like.create({
      data: { userId, articleId },
    });
    await tx.article.update({
      where: { id: articleId },
      data: { likeCount: { increment: 1 } },
    });
    return created;
  });

  return { liked: true, id: like.id };
}

export async function unlikeArticle(userId: string, articleId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });
  if (!existing) {
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.delete({ where: { id: existing.id } }),
    prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { decrement: 1 } },
    }),
  ]);

  return { liked: false };
}

export async function listBookmarks(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      select: bookmarkSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function addBookmark(userId: string, articleId: string) {
  return prisma.bookmark.upsert({
    where: { userId_articleId: { userId, articleId } },
    create: { userId, articleId },
    update: {},
    select: bookmarkSelect,
  });
}

export async function removeBookmark(userId: string, bookmarkId: string) {
  const bookmark = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  });
  if (!bookmark) return null;
  await prisma.bookmark.delete({ where: { id: bookmarkId } });
  return bookmark;
}

export async function followAuthor(followerId: string, followingUsername: string) {
  const author = await prisma.user.findUnique({
    where: { username: followingUsername.toLowerCase() },
    select: { id: true, username: true },
  });
  if (!author) return null;
  if (author.id === followerId) {
    throw new Error("Cannot follow yourself");
  }

  return prisma.authorFollow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId: author.id,
      },
    },
    create: { followerId, followingId: author.id },
    update: {},
    select: {
      id: true,
      createdAt: true,
      following: {
        select: { id: true, username: true, name: true, image: true },
      },
    },
  });
}

export async function unfollowAuthor(followerId: string, followingUsername: string) {
  const author = await prisma.user.findUnique({
    where: { username: followingUsername.toLowerCase() },
    select: { id: true },
  });
  if (!author) return null;

  const follow = await prisma.authorFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: author.id,
      },
    },
  });
  if (!follow) return null;

  await prisma.authorFollow.delete({ where: { id: follow.id } });
  return { unfollowed: true };
}