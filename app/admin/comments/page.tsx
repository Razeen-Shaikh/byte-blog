import { CommentModeration } from "@/components/admin/comment-moderation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { name: true, username: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Comments</h1>
        <p className="text-muted-foreground">Approve, reject, or remove discussion.</p>
      </div>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {comment.author.name ?? comment.author.username} on{" "}
                  {comment.article.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(comment.createdAt)} · {comment.status}
                </p>
                <p className="mt-3 text-sm">{comment.content}</p>
              </div>
              <CommentModeration id={comment.id} status={comment.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
