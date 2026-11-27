import { prisma } from "@/lib/prisma";

export async function subscribeNewsletter(email: string) {
  const normalized = email.toLowerCase();
  return prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    create: { email: normalized, isActive: true },
    update: { isActive: true, updatedAt: new Date() },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function unsubscribeNewsletter(params: {
  email?: string;
  token?: string;
}) {
  if (params.token) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: params.token },
    });
    if (!subscriber) return null;
    return prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  }

  if (params.email) {
    const normalized = params.email.toLowerCase();
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });
    if (!subscriber) return null;
    return prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  }

  return null;
}