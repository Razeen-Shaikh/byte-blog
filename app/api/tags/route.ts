import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth-helpers";
import { jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { createTag, listTags } from "@/lib/services/tags";
import { tagSchema } from "@/lib/validations/taxonomy";

export async function GET() {
  try {
    const tags = await listTags();
    return jsonOk({ tags });
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
    const data = tagSchema.parse(body);
    const tag = await createTag(data);
    return jsonCreated({ tag });
  } catch (error) {
    return jsonError(error);
  }
}