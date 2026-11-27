import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/lib/services/categories";
import { categorySchema } from "@/lib/validations/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);
    if (!category) throw new ApiError("Category not found", 404);
    return jsonOk({ category });
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
    const data = categorySchema.partial().parse(body);
    const category = await updateCategory(id, data);
    return jsonOk({ category });
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

    await deleteCategory(id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}