import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/article-card";
import { Container } from "@/components/layout/container";
import { listArticles } from "@/lib/services/articles";
import { getUserByUsername } from "@/lib/services/users";
import { absoluteUrl } from "@/lib/utils";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "Author" };

  const name = user.name ?? user.username;
  return {
    title: name,
    description: user.bio ?? `Articles by ${name} on Byte Blog`,
    alternates: { canonical: absoluteUrl(`/authors/${user.username}`) },
    openGraph: {
      title: name,
      description: user.bio ?? undefined,
      url: absoluteUrl(`/authors/${user.username}`),
      images: user.image ? [{ url: user.image }] : undefined,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user || !user.isActive) notFound();

  const articles = await listArticles({ author: username, limit: 24 });

  const displayName = user.name ?? user.username;

  return (
    <Container className="py-12">
      <header className="flex flex-col gap-6 border-b border-border/60 pb-10 sm:flex-row sm:items-start">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={112}
            height={112}
            className="size-28 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-28 items-center justify-center rounded-full bg-muted font-serif text-3xl">
            {displayName.slice(0, 1)}
          </div>
        )}
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">{displayName}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio ? <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{user.bio}</p> : null}
          <dl className="mt-6 flex flex-wrap gap-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Articles</dt>
              <dd className="font-medium tabular-nums">{user._count.articles}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Followers</dt>
              <dd className="font-medium tabular-nums">{user._count.followers}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {user.website ? (
              <a href={user.website} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
            {user.github ? (
              <Link href={`https://github.com/${user.github}`} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">
                GitHub
              </Link>
            ) : null}
            {user.twitter ? <span className="text-muted-foreground">@{user.twitter}</span> : null}
          </div>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">Published work</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {articles.items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No published articles yet.</p>
        ) : null}
      </section>
    </Container>
  );
}