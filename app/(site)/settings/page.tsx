import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProfileSettingsForm } from "@/components/forms/profile-settings-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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

  if (!user) redirect("/login");

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Update your public profile details.
          </p>
        </div>
        <ProfileSettingsForm user={user} />
      </div>
    </Container>
  );
}
