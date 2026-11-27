import { ArticleCard, type ArticleCardProps } from "@/components/articles/article-card";
import { cn } from "@/lib/utils";

type ArticleGridProps = {
  articles: ArticleCardProps[];
  className?: string;
};

export function ArticleGrid({ articles, className }: ArticleGridProps) {
  if (!articles.length) {
    return (
      <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No articles yet. Check back soon.
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {articles.map((article) => (
        <li
          key={article.slug}
          className={cn(article.featured && "sm:col-span-2 lg:col-span-2")}
        >
          <ArticleCard {...article} />
        </li>
      ))}
    </ul>
  );
}