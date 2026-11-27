import { notFound } from "next/navigation";

import { ArticleEditor } from "@/components/editor/article-editor";
import { prisma } from "@/lib/prisma";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Edit article</h1>
        <p className="text-muted-foreground">{article.title}</p>
      </div>
      <ArticleEditor
        articleId={article.id}
        categories={categories}
        tags={tags}
        initial={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          status: article.status,
          featured: article.featured,
          categoryId: article.categoryId,
          tagIds: article.tags.map((item) => item.tagId),
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          canonicalUrl: article.canonicalUrl,
          ogImage: article.ogImage,
          scheduledAt: article.scheduledAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
