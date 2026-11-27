import type { Article } from "@prisma/client";

type SessionUser = {
  id: string;
  role: "USER" | "AUTHOR" | "EDITOR" | "ADMIN";
};

export function isStaff(role: SessionUser["role"]) {
  return role === "ADMIN" || role === "EDITOR";
}

export function canManageContent(user: SessionUser) {
  return user.role === "ADMIN" || user.role === "EDITOR" || user.role === "AUTHOR";
}

export function canEditArticle(user: SessionUser, article: Pick<Article, "authorId">) {
  if (user.role === "ADMIN" || user.role === "EDITOR") return true;
  return user.role === "AUTHOR" && article.authorId === user.id;
}

export function canViewDrafts(user: SessionUser | null) {
  return !!user && canManageContent(user);
}