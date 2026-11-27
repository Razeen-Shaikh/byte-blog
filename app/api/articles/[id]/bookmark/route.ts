import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { toggleBookmark } from "@/lib/services/engagement";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await toggleBookmark(session.user.id, id);
  return NextResponse.json(result);
}