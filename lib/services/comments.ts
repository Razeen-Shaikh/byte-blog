import { CommentStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const commentSelect = {
  id: true,
  content: true,
  status: true,
  articleId: true,
  parentId: true,
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
} satisfies Prisma.CommentSelect;

export async function listApprovedComments(articleId: string) {
  return prisma.comment.findMany({
    where: {
      articleId,
      status: CommentStatus.APPROVED,
      parentId: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      replies: {
        where: { status: CommentStatus.APPROVED },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

export async function listArticleComments(
  articleId: string,
  includePending = false,
) {
  if (!includePending) {
    return listApprovedComments(articleId);
  }

  return prisma.comment.findMany({
    where: { articleId, parentId: null },
    select: {
      ...commentSelect,
      replies: {
        select: commentSelect,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createComment(params: {
  articleId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  status?: CommentStatus;
}) {
  const status = params.status ?? CommentStatus.APPROVED;

  return prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        articleId: params.articleId,
        authorId: params.authorId,
        content: params.content,
        parentId: params.parentId ?? null,
        status,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (status === CommentStatus.APPROVED) {
      await tx.article.update({
        where: { id: params.articleId },
        data: { commentCount: { increment: 1 } },
      });
    }

    return created;
  });
}

export async function getCommentById(id: string) {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      author: { select: { id: true } },
    },
  });
}

export async function updateComment(
  id: string,
  data: { content?: string; status?: CommentStatus },
) {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.comment.update({
      where: { id },
      data,
      select: commentSelect,
    });

    if (data.status && data.status !== existing.status) {
      const wasApproved = existing.status === CommentStatus.APPROVED;
      const isApproved = data.status === CommentStatus.APPROVED;
      if (!wasApproved && isApproved) {
        await tx.article.update({
          where: { id: existing.articleId },
          data: { commentCount: { increment: 1 } },
        });
      } else if (wasApproved && !isApproved) {
        await tx.article.update({
          where: { id: existing.articleId },
          data: { commentCount: { decrement: 1 } },
        });
      }
    }

    return updated;
  });
}

export async function deleteComment(id: string) {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) return null;

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.comment.delete({ where: { id } }),
  ];
  if (existing.status === CommentStatus.APPROVED) {
    ops.push(
      prisma.article.update({
        where: { id: existing.articleId },
        data: { commentCount: { decrement: 1 } },
      }),
    );
  }
  await prisma.$transaction(ops);

  return existing;
}