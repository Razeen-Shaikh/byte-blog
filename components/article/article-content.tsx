import { sanitizeArticleHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

export function ArticleContent({ html, className }: Props) {
  const safe = sanitizeArticleHtml(html);

  return (
    <div
      className={cn("article-body", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}