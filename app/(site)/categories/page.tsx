import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore Byte Blog topics by category.",
  alternates: { canonical: absoluteUrl("/categories") },
};

export default async function CategoriesPage() {
  const categories = await listCategoriesWithCounts();

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-3 text-muted-foreground">
          Curated lanes for architecture, craft, and the culture of building.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 transition-colors hover:border-foreground/15"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                {category.description ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                ) : null}
              </div>
              <span className="ml-4 text-sm tabular-nums text-muted-foreground">
                {category._count.articles}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}