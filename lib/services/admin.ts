import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [
    users,
    articles,
    publishedArticles,
    draftArticles,
    comments,
    pendingComments,
    subscribers,
    categories,
    tags,
    likes,
    bookmarks,
    views,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.like.count(),
    prisma.bookmark.count(),
    prisma.articleView.count(),
  ]);

  const topArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      likeCount: true,
    },
    orderBy: { viewCount: "desc" },
    take: 5,
  });

  return {
    users,
    articles,
    publishedArticles,
    draftArticles,
    comments,
    pendingComments,
    subscribers,
    categories,
    tags,
    likes,
    bookmarks,
    views,
    topArticles,
  };
}