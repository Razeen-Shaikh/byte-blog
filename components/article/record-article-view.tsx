import { headers } from "next/headers";

import { recordArticleView } from "@/lib/services/articles";
import { auth } from "@/lib/auth";
import { createHash } from "node:crypto";

export async function RecordArticleView({ articleId }: { articleId: string }) {
  const session = await auth();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  const userAgent = h.get("user-agent");

  try {
    await recordArticleView({
      articleId,
      userId: session?.user?.id ?? null,
      ipHash,
      userAgent,
    });
  } catch {
    /* non-blocking */
  }

  return null;
}