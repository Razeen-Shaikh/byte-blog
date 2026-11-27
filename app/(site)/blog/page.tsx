import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogListing } from "@/components/blog/blog-listing";
import { Pagination } from "@/components/blog/pagination";
import { Container } from "@/components/layout/container";
import { listArticles } from "@/lib/services/articles";
import { listCategoriesWithCounts, listTagsWithCounts } from "@/lib/services/categories";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse essays, guides, and field notes from Byte Blog.",
  alternates: { canonical: absoluteUrl("/blog") },
};

type SearchParams = Promise<{
  page?: string;
  q?: string;
  category?: string;
  tag?: string;
  sort?: string;
}>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort =
    params.sort === "oldest" || params.sort === "popular" ? params.sort : "newest";

  const [listing, categories, tags] = await Promise.all([
    listArticles({
      page,
      q: params.q,
      category: params.category,
      tag: params.tag,
      sort,
      limit: 12,
    }),
    listCategoriesWithCounts(),
    listTagsWithCounts(),
  ]);

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.tag) sp.set("tag", params.tag);
    if (sort !== "newest") sp.set("sort", sort);
    sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-3 text-muted-foreground">
          Deep dives on engineering, design systems, and the habits behind great teams.
        </p>
      </header>

      <Suspense fallback={<p className="text-muted-foreground">Loading filters…</p>}>
        <BlogListing
          articles={listing.items}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          tags={tags.map((t) => ({ slug: t.slug, name: t.name }))}
        />
      </Suspense>

      <Pagination
        className="mt-12"
        page={listing.page}
        totalPages={listing.totalPages}
        buildHref={buildHref}
      />
    </Container>
  );
}