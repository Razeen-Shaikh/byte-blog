import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/i, "Username may only contain letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(1000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  twitter: z.string().max(80).optional().nullable(),
  github: z.string().max(80).optional().nullable(),
  linkedin: z.string().max(80).optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
});
