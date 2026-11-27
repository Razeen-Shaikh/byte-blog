import { Clock, Eye } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type ArticleMetaProps = {
  publishedAt: Date | string | null;
  readingTime: number;
  viewCount: number;
  author: {
    name: string;
    username: string;
    image: string | null;
  };
  category: { name: string; slug: string } | null;
};

export function ArticleMeta({
  publishedAt,
  readingTime,
  viewCount,
  author,
  category,
}: ArticleMetaProps) {
  return (
    <div className="flex flex-col gap-4 border-y border-border/60 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="size-11">
          <AvatarImage src={author.image ?? undefined} alt={author.name} />
          <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <Link
            href={`/authors/${author.username}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {author.name}
          </Link>
          <p className="text-sm text-muted-foreground">@{author.username}</p>
        </div>
      </div>

      <MetaStats
        publishedAt={publishedAt}
        readingTime={readingTime}
        viewCount={viewCount}
        category={category}
      />
    </div>
  );
}

function MetaStats({
  publishedAt,
  readingTime,
  viewCount,
  category,
}: Pick<ArticleMetaProps, "publishedAt" | "readingTime" | "viewCount" | "category">) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {category ? (
        <Link href={`/categories/${category.slug}`}>
          <Badge variant="outline" className="hover:bg-accent">
            {category.name}
          </Badge>
        </Link>
      ) : null}
      {publishedAt ? (
        <time dateTime={String(publishedAt)}>{formatDate(publishedAt)}</time>
      ) : null}
      <span className="inline-flex items-center gap-1">
        <Clock className="size-4" aria-hidden />
        {readingTime} min
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="size-4" aria-hidden />
        {viewCount.toLocaleString()} views
      </span>
    </div>
  );
}