import Image from "next/image";
import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ArticleCard as ArticleCardType } from "@/lib/services/articles";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  article: ArticleCardType;
  variant?: "grid" | "list" | "compact";
  className?: string;
};

export function ArticleCard({ article, variant = "grid", className }: Props) {
  const isList = variant === "list";

  return (
    <article
      className={cn(
        "group relative",
        isList
          ? "flex gap-5 border-b border-border/60 py-6 last:border-0"
          : "flex flex-col",
        className,
      )}
    >
      {article.coverImage ? (
        <Link
          href={`/blog/${article.slug}`}
          className={cn(
            "relative overflow-hidden rounded-lg bg-muted",
            isList ? "h-28 w-40 shrink-0 sm:h-32 sm:w-48" : "mb-4 aspect-[16/10] w-full",
          )}
        >
          <Image
            src={article.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes={isList ? "200px" : "(max-width:768px) 100vw, 33vw"}
          />
        </Link>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {article.category ? (
            <Link href={`/categories/${article.category.slug}`}>
              <Badge variant="secondary" className="font-normal">
                {article.category.name}
              </Badge>
            </Link>
          ) : null}
          {article.publishedAt ? (
            <time dateTime={new Date(article.publishedAt).toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          ) : null}
          <span className="text-muted-foreground/80">{article.readingTime} min read</span>
        </div>

        <h2
          className={cn(
            "font-serif font-semibold tracking-tight text-foreground group-hover:underline decoration-border underline-offset-4",
            isList ? "text-xl" : "text-lg sm:text-xl",
          )}
        >
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h2>

        {article.excerpt ? (
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-muted-foreground",
              isList ? "line-clamp-2" : "line-clamp-3",
            )}
          >
            {article.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {article.author ? (
            <Link
              href={`/authors/${article.author.username}`}
              className="text-sm font-medium text-foreground/90 hover:underline"
            >
              {article.author.name ?? article.author.username}
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {article.viewCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}