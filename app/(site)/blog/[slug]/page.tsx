import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/article/article-content";
import { RecordArticleView } from "@/components/article/record-article-view";
import { ArticleActions } from "@/components/blog/article-actions";
import { ArticleCard } from "@/components/blog/article-card";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ArticleComments } from "@/components/comments/article-comments";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import {
  getAdjacentArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles";
import { listApprovedComments } from "@/lib/services/comments";
import { getUserArticleEngagement } from "@/lib/services/engagement";
import { articleJsonLd } from "@/lib/seo";
import { extractTocFromHtml, injectHeadingIds } from "@/lib/toc";
import { absoluteUrl, formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.excerpt ?? undefined;
  const url = absoluteUrl(`/blog/${article.slug}`);
  const image = article.ogImage ?? article.coverImage ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl ?? url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [related, adjacent, comments, engagement] = await Promise.all([
    getRelatedArticles(article.id, article.categoryId),
    getAdjacentArticles(article.publishedAt),
    listApprovedComments(article.id),
    session?.user?.id
      ? getUserArticleEngagement(session.user.id, article.id)
      : Promise.resolve({ liked: false, bookmarked: false }),
  ]);

  const toc = extractTocFromHtml(article.content);
  const contentHtml = injectHeadingIds(article.content, toc);
  const shareUrl = absoluteUrl(`/blog/${article.slug}`);
  const jsonLd = articleJsonLd({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    coverImage: article.coverImage,
    author: article.author,
  });

  return (
    <>
      <RecordArticleView articleId={article.id} />
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {article.coverImage ? (
        <div className="relative aspect-[21/9] w-full bg-muted">
          <Image src={article.coverImage} alt="" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      ) : null}

      <Container className="py-12">
        <hr className="sr-only" />
        <div className="mx-auto max-w-3xl">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {article.category ? (
                <Link href={`/categories/${article.category.slug}`}>
                  <Badge variant="secondary">{article.category.name}</Badge>
                </Link>
              ) : null}
              {article.publishedAt ? <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time> : null}
              <span>{article.readingTime} min read</span>
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{article.title}</h1>
            {article.excerpt ? <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p> : null}
            <Link
              href={`/authors/${article.author.username}`}
              className="inline-flex items-center gap-3 pt-2 text-sm font-medium"
            >
              <AuthorAvatar name={article.author.name} username={article.author.username} image={article.author.image} />
              {article.author.name ?? article.author.username}
            </Link>
          </header>

          <div className="my-10 h-px bg-border/60" aria-hidden />

          <div className="grid gap-12 lg:grid-cols-[1fr_220px] lg:gap-16">
            <div>
              <ArticleContent html={contentHtml} />
              <div className="mt-12 space-y-6 border-t border-border/60 pt-10">
                <ArticleActions
                  articleId={article.id}
                  initialLiked={engagement.liked}
                  initialBookmarked={engagement.bookmarked}
                  likeCount={article.likeCount}
                  isAuthenticated={!!session?.user}
                />
                <ShareButtons title={article.title} url={shareUrl} />
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(({ tag }) => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                      <Badge variant="outline">#{tag.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <TableOfContents items={toc} />
              </div>
            </aside>
          </div>

          <AuthorBio author={article.author} className="mt-16" />

          <nav className="mt-12 grid gap-4 border-y border-border/60 py-8 sm:grid-cols-2">
            {adjacent.previous ? (
              <Link href={`/blog/${adjacent.previous.slug}`} className="text-sm">
                <span className="text-muted-foreground">Previous</span>
                <p className="mt-1 font-medium hover:underline">{adjacent.previous.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next ? (
              <Link href={`/blog/${adjacent.next.slug}`} className="text-right text-sm sm:ml-auto">
                <span className="text-muted-foreground">Next</span>
                <p className="mt-1 font-medium hover:underline">{adjacent.next.title}</p>
              </Link>
            ) : null}
          </nav>

          {related.length ? (
            <section className="mt-16">
              <h2 className="font-serif text-2xl font-semibold">Related reading</h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-16">
            <ArticleComments
              articleId={article.id}
              comments={comments.map((c) => ({
                ...c,
                createdAt: new Date(c.createdAt),
                replies: c.replies.map((r) => ({ ...r, createdAt: new Date(r.createdAt) })),
              }))}
              isAuthenticated={!!session?.user}
            />
          </div>
        </div>
      </Container>
    </>
  );
}

function AuthorAvatar({
  name,
  username,
  image,
}: {
  name: string | null;
  username: string;
  image: string | null;
}) {
  const fallback = (name ?? username).slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted text-xs">
      {image ? (
        <Image src={image} alt="" width={36} height={36} className="size-9 object-cover" />
      ) : (
        fallback
      )}
    </span>
  );
}

function AuthorBio({
  author,
  className,
}: {
  author: {
    name: string | null;
    username: string;
    bio: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    linkedin: string | null;
    image: string | null;
  };
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="font-serif text-xl font-semibold">About the author</h2>
      <div className="mt-4 flex gap-4">
        <AuthorAvatar name={author.name} username={author.username} image={author.image} />
        <div>
          <Link href={`/authors/${author.username}`} className="font-medium hover:underline">
            {author.name ?? author.username}
          </Link>
          {author.bio ? <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{author.bio}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {author.website ? (
              <a href={author.website} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
            {author.twitter ? <span className="text-muted-foreground">@{author.twitter}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
