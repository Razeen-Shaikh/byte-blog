import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { listUsers } from "@/lib/services/users";
import { userListQuerySchema } from "@/lib/validations/user";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== UserRole.ADMIN) {
      throw new Error("Forbidden");
    }

    const { searchParams } = new URL(request.url);
    const query = userListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await listUsers({
      q: query.q,
      role: query.role,
      page: query.page,
      limit: query.limit,
    });

    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}