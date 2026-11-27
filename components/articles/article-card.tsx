import Image from "next/image";
import Link from "next/link";
import { Clock, Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

export type ArticleCardProps = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: Date | string | null;
  author: {
    name: string;
    username: string;
    image: string | null;
  };
  category: { name: string; slug: string } | null;
  featured?: boolean;
  className?: string;
};

export function ArticleCard({
  title,
  slug,
  excerpt,
  coverImage,
  readingTime,
  viewCount,
  publishedAt,
  author,
  category,
  featured,
  className,
}: ArticleCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/80 bg-card transition-shadow hover:shadow-md",
        featured && "md:col-span-2 md:grid md:grid-cols-2",
        className,
      )}
    >
      <Link href={`/blog/${slug}`} className={cn("block", featured && "md:contents")}>
        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden bg-muted",
            featured && "md:aspect-auto md:min-h-full",
          )}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              sizes={
                featured
                  ? "(min-width: 768px) 50vw, 100vw"
                  : "(min-width: 768px) 33vw, 100vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full min-h-[10rem] items-center justify-center bg-gradient-to-br from-muted to-secondary text-muted-foreground">
              <span className="font-display text-lg">Byte</span>
            </div>
          )}
          {category ? (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 bg-background/90 backdrop-blur-sm"
            >
              {category.name}
            </Badge>
          ) : null}
        </div>

        <CardContent
          className={cn("flex flex-col gap-3 p-5", featured && "md:justify-center md:p-8")}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {publishedAt ? <time dateTime={String(publishedAt)}>{formatDate(publishedAt)}</time> : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {viewCount.toLocaleString()}
            </span>
          </div>

          <h3
            className={cn(
              "font-display text-xl font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary",
              featured && "md:text-2xl lg:text-3xl",
            )}
          >
            {title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>

          <div className="mt-auto flex items-center gap-2 pt-1">
            <Avatar className="size-7">
              <AvatarImage src={author.image ?? undefined} alt={author.name} />
              <AvatarFallback className="text-[10px]">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-sm">
              <span className="font-medium text-foreground">{author.name}</span>
              <span className="text-muted-foreground"> · @{author.username}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}