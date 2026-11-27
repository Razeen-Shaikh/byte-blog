import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userAdminUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const userListQuerySchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});