import { auth } from "@/lib/auth";
import { getPagination, jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { addBookmark, listBookmarks } from "@/lib/services/interactions";
import { bookmarkSchema } from "@/lib/validations/taxonomy";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { searchParams } = new URL(request.url);
    const { page, limit } = getPagination(searchParams);
    const result = await listBookmarks(session.user.id, page, limit);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const body = await request.json();
    const { articleId } = bookmarkSchema.parse(body);
    const bookmark = await addBookmark(session.user.id, articleId);
    return jsonCreated({ bookmark });
  } catch (error) {
    return jsonError(error);
  }
}