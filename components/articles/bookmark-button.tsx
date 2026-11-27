"use client";

import { Bookmark } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  articleId: string;
  initialBookmarked?: boolean;
  className?: string;
};

export function BookmarkButton({
  articleId,
  initialBookmarked = false,
  className,
}: BookmarkButtonProps) {
  const { status } = useSession();
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Bookmark failed");
      return res.json() as Promise<{ bookmarked: boolean }>;
    },
    onMutate: () => setBookmarked((prev) => !prev),
    onError: () => {
      setBookmarked(initialBookmarked);
      toast.error("Could not update bookmark");
    },
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Saved to library" : "Removed from library");
    },
  });

  const onClick = () => {
    if (status !== "authenticated") {
      toast.message("Sign in to save articles");
      return;
    }
    mutation.mutate();
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "outline"}
      size="icon"
      className={cn("size-9", className)}
      onClick={onClick}
      disabled={mutation.isPending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
    >
      <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
    </Button>
  );
}