import { CommentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { ApiError, jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  createComment,
  listArticleComments,
} from "@/lib/services/comments";
import { commentSchema } from "@/lib/validations/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: articleId } = await params;
    const session = await auth();
    const includePending = session?.user ? isStaff(session.user.role) : false;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });
    if (!article) throw new ApiError("Article not found", 404);

    const comments = await listArticleComments(articleId, includePending);
    return jsonOk({ comments });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: articleId } = await params;
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });
    if (!article) throw new ApiError("Article not found", 404);

    const body = await request.json();
    const data = commentSchema.parse(body);
    const autoApprove = isStaff(session.user.role);

    const comment = await createComment({
      articleId,
      authorId: session.user.id,
      content: data.content,
      parentId: data.parentId,
      status: autoApprove ? undefined : CommentStatus.PENDING,
    });

    return jsonCreated({ comment });
  } catch (error) {
    return jsonError(error);
  }
}