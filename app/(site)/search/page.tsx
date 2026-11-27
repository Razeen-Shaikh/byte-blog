import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import { Container } from "@/components/layout/container";
import { listArticles } from "@/lib/services/articles";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const results = q
    ? await listArticles({ q, page, limit: 12 })
    : { items: [], page: 1, totalPages: 0, total: 0, limit: 12 };

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Search</h1>
        <p className="mt-3 text-muted-foreground">
          {q ? (
            <>
              Results for <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
              {results.total > 0 ? (
                <span className="text-muted-foreground"> — {results.total} hits</span>
              ) : null}
            </>
          ) : (
            "Enter a query from the header search or use the blog filters."
          )}
        </p>
      </header>

      {!q ? (
        <p className="text-muted-foreground">
          Try <Link href="/blog" className="underline">browsing articles</Link> or press{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs">⌘K</kbd> to open search.
        </p>
      ) : results.items.length === 0 ? (
        <p className="text-muted-foreground">No articles matched your search.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {results.items.map((article) => (
            <ArticleCard key={article.id} article={article} variant="list" />
          ))}
        </div>
      )}

      {q && results.totalPages > 1 ? (
        <Pagination
          className="mt-12"
          page={results.page}
          totalPages={results.totalPages}
          buildHref={(p) => {
            const sp = new URLSearchParams({ q });
            sp.set("page", String(p));
            return `/search?${sp.toString()}`;
          }}
        />
      ) : null}
    </Container>
  );
}