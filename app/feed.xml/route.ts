import { ArticleStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  const site = absoluteUrl();
  const items = articles
    .map((article) => {
      const link = absoluteUrl(`/blog/${article.slug}`);
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${(article.publishedAt ?? article.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt ?? ""}]]></description>
      <author>${article.author.email ?? "editors@byteblog.dev"} (${article.author.name ?? "Byte Blog"})</author>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Byte Blog</title>
    <link>${site}</link>
    <description>Premium editorial stories for modern builders.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
