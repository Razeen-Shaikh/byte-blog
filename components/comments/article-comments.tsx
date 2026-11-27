"use client";

import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { commentSchema } from "@/lib/validations/taxonomy";

type CommentAuthor = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
};

export type CommentTree = {
  id: string;
  content: string;
  createdAt: Date;
  author: CommentAuthor;
  replies: {
    id: string;
    content: string;
    createdAt: Date;
    author: CommentAuthor;
  }[];
};

type FormValues = z.infer<typeof commentSchema>;

type Props = {
  articleId: string;
  comments: CommentTree[];
  isAuthenticated: boolean;
};

export function ArticleComments({ articleId, comments, isAuthenticated }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(commentSchema),
  });

  async function onSubmit(values: FormValues) {
    if (!isAuthenticated) {
      toast.error("Sign in to comment");
      router.push("/login");
      return;
    }

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, articleId }),
    });

    if (!res.ok) {
      toast.error("Could not post comment");
      return;
    }

    toast.success("Comment posted");
    reset();
    router.refresh();
  }

  return (
    <section className="space-y-8">
      <h2 className="font-serif text-2xl font-semibold tracking-tight">Discussion</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Textarea
          placeholder={isAuthenticated ? "Share your thoughts…" : "Sign in to join the conversation"}
          rows={4}
          disabled={!isAuthenticated}
          {...register("content")}
        />
        {errors.content ? (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !isAuthenticated}>
          {isSubmitting ? "Posting…" : "Post comment"}
        </Button>
      </form>

      <ul className="space-y-6">
        {comments.map((comment) => (
          <li key={comment.id} className="space-y-4 border-b border-border/60 pb-6 last:border-0">
            <CommentItem comment={comment} />
            {comment.replies.length ? (
              <ul className="ml-4 space-y-4 border-l border-border/60 pl-4">
                {comment.replies.map((reply) => (
                  <li key={reply.id}>
                    <CommentItem comment={reply} />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Start the thread.</p>
        ) : null}
      </ul>
    </section>
  );
}

function CommentItem({ comment }: { comment: CommentTree | CommentTree["replies"][number] }) {
  const initials =
    comment.author.name?.slice(0, 2) ?? comment.author.username.slice(0, 2).toUpperCase();

  return (
    <CommentRow>
      <Avatar className="size-9">
        <AvatarImage src={comment.author.image ?? undefined} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium">{comment.author.name ?? comment.author.username}</span>
          <time className="text-xs text-muted-foreground" dateTime={new Date(comment.createdAt).toISOString()}>
            {formatDate(comment.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{comment.content}</p>
      </div>
    </CommentRow>
  );
}

function CommentRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-3">{children}</div>;
}