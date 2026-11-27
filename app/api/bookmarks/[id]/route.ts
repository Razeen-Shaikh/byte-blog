import { auth } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import { removeBookmark } from "@/lib/services/interactions";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const bookmark = await removeBookmark(session.user.id, id);
    if (!bookmark) throw new ApiError("Bookmark not found", 404);

    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}