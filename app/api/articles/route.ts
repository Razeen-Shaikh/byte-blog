import { auth } from "@/lib/auth";
import { canManageContent, canViewDrafts } from "@/lib/auth-helpers";
import { jsonCreated, jsonError, jsonOk } from "@/lib/api";
import {
  createArticle,
  listArticles,
} from "@/lib/services/articles";
import {
  articleCreateSchema,
  articleQuerySchema,
} from "@/lib/validations/article";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const query = articleQuerySchema.parse(Object.fromEntries(searchParams));

    const includeDrafts = canViewDrafts(session?.user ?? null);

    const result = await listArticles({
      q: query.q,
      category: query.category,
      tag: query.tag,
      author: query.author,
      sort: query.sort,
      featured:
        query.featured === undefined
          ? undefined
          : query.featured === "true",
      status: includeDrafts ? query.status : undefined,
      page: query.page,
      limit: query.limit,
      includeDrafts,
    });

    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user?.id || !canManageContent(user)) {
      throw new Error("Forbidden");
    }

    const body = await request.json();
    const data = articleCreateSchema.parse(body);
    const article = await createArticle(user.id, data);

    return jsonCreated({ article });
  } catch (error) {
    return jsonError(error);
  }
}