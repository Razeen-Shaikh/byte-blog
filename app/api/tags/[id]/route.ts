import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import { deleteTag, getTagById, updateTag } from "@/lib/services/tags";
import { tagSchema } from "@/lib/validations/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const tag = await getTagById(id);
    if (!tag) throw new ApiError("Tag not found", 404);
    return jsonOk({ tag });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || !isStaff(session.user.role)) {
      throw new Error("Forbidden");
    }

    const body = await request.json();
    const data = tagSchema.partial().parse(body);
    const tag = await updateTag(id, data);
    return jsonOk({ tag });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || !isStaff(session.user.role)) {
      throw new Error("Forbidden");
    }

    await deleteTag(id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}