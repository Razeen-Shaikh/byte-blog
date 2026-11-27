import { CommentStatus } from "@prisma/client";
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).optional().nullable(),
});

export const tagSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const bookmarkSchema = z.object({
  articleId: z.string().uuid(),
});

export const commentSchema = z.object({
  content: z.string().min(2).max(2000),
  parentId: z.string().uuid().optional().nullable(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().email().optional(),
  token: z.string().uuid().optional(),
});

export const commentUpdateSchema = z.object({
  content: z.string().min(2).max(2000).optional(),
  status: z.nativeEnum(CommentStatus).optional(),
});
