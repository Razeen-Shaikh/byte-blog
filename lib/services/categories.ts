import { ArticleStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { categorySchema } from "@/lib/validations/taxonomy";
import type { z } from "zod";

type CategoryInput = z.infer<typeof categorySchema>;

const publishedArticleWhere = {
  status: ArticleStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
} as const;

export const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { articles: true } },
} satisfies Prisma.CategorySelect;

export async function listCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: publishedArticleWhere },
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          articles: { where: publishedArticleWhere },
        },
      },
    },
  });
}

export async function listTagsWithCounts() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: {
            where: { article: publishedArticleWhere },
          },
        },
      },
    },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });
}

export async function createCategory(data: CategoryInput) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description ?? null,
    },
    select: categorySelect,
  });
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
    },
    select: categorySelect,
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}