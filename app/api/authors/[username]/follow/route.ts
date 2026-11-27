import { auth } from "@/lib/auth";
import { ApiError, jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { followAuthor, unfollowAuthor } from "@/lib/services/interactions";

type Params = { params: Promise<{ username: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { username } = await params;
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await followAuthor(session.user.id, username);
    if (!result) throw new ApiError("Author not found", 404);

    return jsonCreated({ follow: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Cannot follow yourself") {
      return jsonError(new ApiError(error.message, 400));
    }
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { username } = await params;
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await unfollowAuthor(session.user.id, username);
    if (!result) throw new ApiError("Follow relationship not found", 404);

    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}