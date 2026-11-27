import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { getAdminStats } from "@/lib/services/admin";

export async function GET() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== UserRole.ADMIN && role !== UserRole.EDITOR) {
      throw new Error("Forbidden");
    }

    const stats = await getAdminStats();
    return jsonOk({ stats });
  } catch (error) {
    return jsonError(error);
  }
}