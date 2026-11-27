import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/taxonomy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: { isActive: true },
  });

  return NextResponse.json({ ok: true });
}