import { ArticleStatus } from "@prisma/client";
import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  featured: z.boolean().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable().or(z.literal("")),
  ogImage: z.string().url().optional().nullable().or(z.literal("")),
  scheduledAt: z.coerce.date().optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const articleCreateSchema = articleInputSchema.extend({
  slug: articleInputSchema.shape.slug.optional(),
});

export const articleUpdateSchema = articleInputSchema.partial();

export const articleQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  sort: z.enum(["newest", "oldest", "popular"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
