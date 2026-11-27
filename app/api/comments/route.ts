import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { createComment } from "@/lib/services/comments";
import { commentSchema } from "@/lib/validations/taxonomy";

const bodySchema = commentSchema.extend({
  articleId: z.string().uuid(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const comment = await createComment({
    articleId: parsed.data.articleId,
    authorId: session.user.id,
    content: parsed.data.content,
    parentId: parsed.data.parentId,
  });

  return NextResponse.json({ comment });
}