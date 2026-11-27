import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tags</h1>
        <p className="text-muted-foreground">Manage discovery labels.</p>
      </div>
      <TaxonomyManager
        kind="tags"
        items={tags.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          count: item._count.articles,
        }))}
      />
    </div>
  );
}
