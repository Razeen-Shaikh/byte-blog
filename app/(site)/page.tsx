import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/blog/article-card";
import { FadeIn } from "@/components/blog/fade-in";
import { Container } from "@/components/layout/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { listArticles } from "@/lib/services/articles";
import { prisma } from "@/lib/prisma";
import { formatDate, absoluteUrl } from "@/lib/utils";
import { ArticleStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { url: absoluteUrl("/"), title: SITE_NAME, description: SITE_DESCRIPTION },
};

export default async function HomePage() {
  const [featuredList, latest, trending, categories, spotlightAuthor] = await Promise.all([
    listArticles({ featured: true, limit: 1 }),
    listArticles({ limit: 6, sort: "newest" }),
    listArticles({ limit: 4, sort: "popular" }),
    listCategoriesWithCounts(),
    prisma.user.findFirst({
      where: {
        isActive: true,
        role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
        articles: { some: { status: ArticleStatus.PUBLISHED } },
      },
      orderBy: { createdAt: "asc" },
      select: {
        name: true,
        username: true,
        bio: true,
        image: true,
        _count: { select: { articles: true, followers: true } },
      },
    }),
  ]);

  const hero = featuredList.items[0] ?? latest.items[0];
  const recommended = latest.items.slice(0, 3);
  const popularCategories = [...categories]
    .sort((a, b) => b._count.articles - a._count.articles)
    .slice(0, 6);

  return (
    <>
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <Container className="py-16 lg:py-24">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {SITE_TAGLINE}
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Stories at the intersection of craft and code.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{SITE_DESCRIPTION}</p>
          </FadeIn>

          {hero ? (
            <FadeIn delay={0.1} className="mt-14">
              <article className="grid gap-8 overflow-hidden rounded-2xl border border-border/60 bg-card lg:grid-cols-2">
                {hero.coverImage ? (
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]">
                    <Image
                      src={hero.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width:1024px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {hero.featured ? <Badge>Featured</Badge> : null}
                    {hero.category ? (
                      <Link href={`/categories/${hero.category.slug}`} className="hover:text-foreground">
                        {hero.category.name}
                      </Link>
                    ) : null}
                    {hero.publishedAt ? <span>{formatDate(hero.publishedAt)}</span> : null}
                  </div>
                  <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
                    <Link href={`/blog/${hero.slug}`} className="hover:underline">
                      {hero.title}
                    </Link>
                  </h2>
                  {hero.excerpt ? (
                    <p className="mt-4 text-muted-foreground leading-relaxed">{hero.excerpt}</p>
                  ) : null}
                  <Button asChild className="mt-8 w-fit">
                    <Link href={`/blog/${hero.slug}`}>Read the story</Link>
                  </Button>
                </div>
              </article>
            </FadeIn>
          ) : null}
        </Container>
      </section>

      <Container className="py-16 space-y-20">
        <section>
          <SectionHeading title="Latest" href="/blog" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latest.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Trending" href="/blog?sort=popular" />
          <SectionList className="mt-8 grid gap-6 sm:grid-cols-2">
            {trending.items.map((article, index) => (
              <FadeIn key={article.id} delay={index * 0.05}>
                <ArticleCard article={article} variant="list" className="border-0 py-0" />
              </FadeIn>
            ))}
          </SectionList>
        </section>

        <section>
          <SectionHeading title="Popular categories" href="/categories" />
          <div className="mt-6 flex flex-wrap gap-3">
            {popularCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-sm transition-colors hover:border-foreground/20 hover:bg-muted"
              >
                {cat.name}
                <span className="ml-2 text-muted-foreground">{cat._count.articles}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Recommended" href="/blog" />
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {recommended.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-muted/30 px-6 py-10 sm:px-10">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-semibold">The Sunday letter</h2>
            <p className="mt-2 text-muted-foreground">
              One thoughtful essay each week. No noise, no funnels.
            </p>
            <NewsletterForm className="mt-6" />
          </div>
        </section>

        {spotlightAuthor ? (
          <section className="grid gap-8 border-t border-border/60 pt-16 lg:grid-cols-[auto_1fr] lg:items-center">
            {spotlightAuthor.image ? (
              <Image
                src={spotlightAuthor.image}
                alt=""
                width={120}
                height={120}
                className="size-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-28 items-center justify-center rounded-full bg-muted font-serif text-2xl">
                {(spotlightAuthor.name ?? spotlightAuthor.username).slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Editor&apos;s desk</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">
                <Link href={`/authors/${spotlightAuthor.username}`} className="hover:underline">
                  {spotlightAuthor.name ?? spotlightAuthor.username}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
                {spotlightAuthor.bio ??
                  `${spotlightAuthor._count.articles} published essays on architecture, tooling, and product taste.`}
              </p>
              <Button variant="outline" asChild className="mt-6">
                <Link href={`/authors/${spotlightAuthor.username}`}>Meet the author</Link>
              </Button>
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>
      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
        View all
      </Link>
    </div>
  );
}

function SectionList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}