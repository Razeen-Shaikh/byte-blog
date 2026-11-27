import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { createCategory, listCategories } from "@/lib/services/categories";
import { categorySchema } from "@/lib/validations/taxonomy";

export async function GET() {
  try {
    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isStaff(session.user.role)) {
      throw new Error("Forbidden");
    }

    const body = await request.json();
    const data = categorySchema.parse(body);
    const category = await createCategory(data);
    return jsonCreated({ category });
  } catch (error) {
    return jsonError(error);
  }
}