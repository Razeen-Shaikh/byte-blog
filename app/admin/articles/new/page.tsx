import { ArticleEditor } from "@/components/editor/article-editor";
import { prisma } from "@/lib/prisma";

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">New article</h1>
        <p className="text-muted-foreground">
          Draft in TipTap with autosave after the first save.
        </p>
      </div>
      <ArticleEditor categories={categories} tags={tags} />
    </div>
  );
}
