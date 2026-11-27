import { auth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations/auth";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const body = await request.json();
    const data = profileUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        bio: data.bio,
        website: data.website || null,
        twitter: data.twitter,
        github: data.github,
        linkedin: data.linkedin,
        image: data.image || null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        image: true,
      },
    });

    return jsonOk({ user });
  } catch (error) {
    return jsonError(error);
  }
}
