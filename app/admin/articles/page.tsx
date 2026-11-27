import Link from "next/link";
import { ArticleStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where =
    status && Object.values(ArticleStatus).includes(status as ArticleStatus)
      ? { status: status as ArticleStatus }
      : {};

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true, username: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Articles</h1>
          <p className="text-muted-foreground">Create, edit, and publish stories.</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">New article</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/articles" label="All" active={!status} />
        {Object.values(ArticleStatus).map((value) => (
          <FilterChip
            key={value}
            href={`/admin/articles?status=${value}`}
            label={value}
            active={status === value}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {article.category?.name ?? "Uncategorized"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{article.status}</Badge>
                </td>
                <td className="px-4 py-3">{article.author.name}</td>
                <td className="px-4 py-3">{formatDate(article.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/articles/${article.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteArticleButton id={article.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
          : "rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
      }
    >
      {label}
    </Link>
  );
}
