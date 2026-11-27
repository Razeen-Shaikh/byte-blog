import { createHash } from "crypto";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { canEditArticle, canViewDrafts } from "@/lib/auth-helpers";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  deleteArticle,
  getAdjacentArticles,
  getArticleBySlug,
  getRelatedArticles,
  recordArticleView,
  updateArticle,
} from "@/lib/services/articles";
import { articleUpdateSchema } from "@/lib/validations/article";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${ip}:${process.env.AUTH_SECRET ?? "byte-blog"}`)
    .digest("hex");
}

function isUuid(value: string) {
  return UUID_RE.test(value);
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: slug } = await params;
    const session = await auth();
    const includeDrafts = canViewDrafts(session?.user ?? null);

    const article = await getArticleBySlug(slug, includeDrafts);
    if (!article) {
      throw new ApiError("Article not found", 404);
    }

    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      "unknown";

    await recordArticleView({
      articleId: article.id,
      userId: session?.user?.id,
      ipHash: hashIp(ip),
      userAgent: headerList.get("user-agent"),
    });

    const [related, adjacent] = await Promise.all([
      getRelatedArticles(article.id, article.categoryId),
      getAdjacentArticles(article.publishedAt),
    ]);

    return jsonOk({ article, related, adjacent });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!isUuid(id)) {
      throw new ApiError("Article id must be a UUID", 400);
    }

    const session = await auth();
    const user = session?.user;
    if (!user?.id) throw new Error("Unauthorized");

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Article not found", 404);
    if (!canEditArticle(user, existing)) throw new Error("Forbidden");

    const body = await request.json();
    const data = articleUpdateSchema.parse(body);
    const article = await updateArticle(id, data);
    if (!article) throw new ApiError("Article not found", 404);

    return jsonOk({ article });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!isUuid(id)) {
      throw new ApiError("Article id must be a UUID", 400);
    }

    const session = await auth();
    const user = session?.user;
    if (!user?.id) throw new Error("Unauthorized");

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Article not found", 404);
    if (!canEditArticle(user, existing)) throw new Error("Forbidden");

    await deleteArticle(id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}