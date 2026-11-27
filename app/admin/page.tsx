import Link from "next/link";
import {
  Eye,
  FileText,
  MessageSquare,
  Newspaper,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalUsers,
    totalComments,
    newsletterSubscribers,
    viewsAgg,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
  ]);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalUsers,
    totalComments,
    newsletterSubscribers,
    totalViews: viewsAgg._sum.viewCount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total articles", value: stats.totalArticles, icon: FileText },
    { label: "Published", value: stats.publishedArticles, icon: FileText },
    { label: "Drafts", value: stats.draftArticles, icon: FileText },
    { label: "Users", value: stats.totalUsers, icon: Users },
    { label: "Views", value: stats.totalViews, icon: Eye },
    { label: "Comments", value: stats.totalComments, icon: MessageSquare },
    {
      label: "Newsletter",
      value: stats.newsletterSubscribers,
      icon: Newspaper,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of publishing activity across Byte Blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">New article</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {card.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
