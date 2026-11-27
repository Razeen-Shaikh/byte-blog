"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArticleCard } from "@/components/blog/article-card";
import type { ArticleCard as ArticleCardType } from "@/lib/services/articles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryOption = { slug: string; name: string };
type TagOption = { slug: string; name: string };

type Props = {
  articles: ArticleCardType[];
  categories: CategoryOption[];
  tags: TagOption[];
};

export function BlogListing({ articles, categories, tags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if (!updates.page) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateParams({ q: (fd.get("q") as string) || null, page: null });
          }}
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Search articles…"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
          />
          <select
            name="category"
            value={category}
            onChange={(e) => updateParams({ category: e.target.value || null })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="tag"
            value={tag}
            onChange={(e) => updateParams({ tag: e.target.value || null })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex gap-1 self-end">
          <Button
            type="button"
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Grid view"
            onClick={() => updateParams({ view: null })}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            aria-label="List view"
            onClick={() => updateParams({ view: "list" })}
          >
            <LayoutList className="size-4" />
          </Button>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No articles match your filters.</p>
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              : "divide-y divide-border/60",
          )}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant={view} />
          ))}
        </div>
      )}
    </div>
  );
}