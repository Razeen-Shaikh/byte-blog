import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/api";
import { getUserById, updateUser } from "@/lib/services/users";
import { profileUpdateSchema } from "@/lib/validations/auth";
import { userAdminUpdateSchema } from "@/lib/validations/user";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    const isSelf = session?.user?.id === id;
    const isAdmin = session?.user?.role === UserRole.ADMIN;
    if (!isSelf && !isAdmin) throw new Error("Forbidden");

    const user = await getUserById(id);
    if (!user) throw new ApiError("User not found", 404);
    return jsonOk({ user });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const isAdmin = session.user.role === UserRole.ADMIN;
    const isSelf = session.user.id === id;
    if (!isSelf && !isAdmin) throw new Error("Forbidden");

    const body = await request.json();

    if (isAdmin) {
      const adminData = userAdminUpdateSchema.parse(body);
      const user = await updateUser(id, adminData);
      return jsonOk({ user });
    }

    if (isSelf) {
      const profileData = profileUpdateSchema.parse(body);
      const user = await updateUser(id, {
        name: profileData.name,
        bio: profileData.bio,
        website: profileData.website || null,
        twitter: profileData.twitter,
        github: profileData.github,
        linkedin: profileData.linkedin,
        image: profileData.image || null,
      });
      return jsonOk({ user });
    }

    throw new ApiError("No valid fields to update", 400);
  } catch (error) {
    return jsonError(error);
  }
}