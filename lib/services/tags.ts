import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { tagSchema } from "@/lib/validations/taxonomy";
import type { z } from "zod";

type TagInput = z.infer<typeof tagSchema>;

export const tagSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { articles: true } },
} satisfies Prisma.TagSelect;

export async function listTags() {
  return prisma.tag.findMany({
    select: tagSelect,
    orderBy: { name: "asc" },
  });
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    select: tagSelect,
  });
}

export async function createTag(data: TagInput) {
  return prisma.tag.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
    },
    select: tagSelect,
  });
}

export async function updateTag(id: string, data: Partial<TagInput>) {
  return prisma.tag.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
    },
    select: tagSelect,
  });
}

export async function deleteTag(id: string) {
  return prisma.tag.delete({ where: { id } });
}