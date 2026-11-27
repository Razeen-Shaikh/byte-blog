import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Categories</h1>
        <p className="text-muted-foreground">Organize the editorial library.</p>
      </div>
      <TaxonomyManager
        kind="categories"
        items={categories.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          count: item._count.articles,
        }))}
      />
    </div>
  );
}
