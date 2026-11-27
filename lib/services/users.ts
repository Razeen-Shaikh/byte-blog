import { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  bio: true,
  website: true,
  twitter: true,
  github: true,
  linkedin: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      articles: true,
      followers: true,
      following: true,
    },
  },
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

export function stripPassword<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export async function listUsers(params: {
  q?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};
  if (params.role) where.role = params.role;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { username: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userPublicSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: userPublicSelect,
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    role?: UserRole;
    isActive?: boolean;
    bio?: string | null;
    website?: string | null;
    twitter?: string | null;
    github?: string | null;
    linkedin?: string | null;
    image?: string | null;
  },
) {
  return prisma.user.update({
    where: { id },
    data,
    select: userPublicSelect,
  });
}

export async function createLocalUser(data: {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}) {
  const email = data.email.toLowerCase();
  return prisma.user.create({
    data: {
      name: data.name,
      username: data.username.toLowerCase(),
      email,
      passwordHash: data.passwordHash,
      role: data.role ?? UserRole.USER,
    },
    select: userPublicSelect,
  });
}

export function suggestUsernameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "user";
  return slugify(local).replace(/-/g, "_").slice(0, 32) || "user";
}