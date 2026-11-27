import { CommentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import {
  deleteComment,
  getCommentById,
  updateComment,
} from "@/lib/services/comments";
import { commentUpdateSchema } from "@/lib/validations/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user;
    if (!user?.id) throw new Error("Unauthorized");

    const existing = await getCommentById(id);
    if (!existing) throw new ApiError("Comment not found", 404);

    const isAuthor = existing.authorId === user.id;
    const staff = isStaff(user.role);
    if (!isAuthor && !staff) throw new Error("Forbidden");

    const body = await request.json();
    const data = commentUpdateSchema.parse(body);

    if (data.status && !staff) {
      throw new Error("Forbidden");
    }
    if (!staff && data.content === undefined) {
      throw new ApiError("No fields to update", 400);
    }

    const payload: { content?: string; status?: CommentStatus } = {};
    if (data.content !== undefined && isAuthor) payload.content = data.content;
    if (data.status !== undefined && staff) payload.status = data.status;

    const comment = await updateComment(id, payload);
    if (!comment) throw new ApiError("Comment not found", 404);

    return jsonOk({ comment });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user;
    if (!user?.id) throw new Error("Unauthorized");

    const existing = await getCommentById(id);
    if (!existing) throw new ApiError("Comment not found", 404);

    if (existing.authorId !== user.id && !isStaff(user.role)) {
      throw new Error("Forbidden");
    }

    await deleteComment(id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}