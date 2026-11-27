import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import { Container } from "@/components/layout/container";
import { listArticles } from "@/lib/services/articles";
import { getCategoryBySlug } from "@/lib/services/categories";
import { absoluteUrl } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };

  return {
    title: category.name,
    description: category.description ?? `Articles in ${category.name}`,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}`) },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const listing = await listArticles({ category: slug, page, limit: 12 });

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Category</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">{category.name}</h1>
        {category.description ? (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">{category._count.articles} articles</p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listing.items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Pagination
        className="mt-12"
        page={listing.page}
        totalPages={listing.totalPages}
        buildHref={(p) => (p > 1 ? `/categories/${slug}?page=${p}` : `/categories/${slug}`)}
      />
    </Container>
  );
}