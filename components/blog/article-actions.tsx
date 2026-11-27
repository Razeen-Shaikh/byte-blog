"use client";

import { Bookmark, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  articleId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likeCount: number;
  isAuthenticated: boolean;
};

export function ArticleActions({
  articleId,
  initialLiked,
  initialBookmarked,
  likeCount,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likes, setLikes] = useState(likeCount);
  const [pending, setPending] = useState(false);

  async function requireAuth(action: () => Promise<void>) {
    if (!isAuthenticated) {
      toast.error("Sign in to use this feature");
      router.push("/login");
      return;
    }
    setPending(true);
    try {
      await action();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={liked ? "default" : "outline"}
        size="sm"
        disabled={pending}
        onClick={() =>
          requireAuth(async () => {
            const res = await fetch(`/api/articles/${articleId}/like`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            const data = (await res.json()) as { liked: boolean };
            setLiked(data.liked);
            setLikes((n) => (data.liked ? n + 1 : Math.max(0, n - 1)));
          })
        }
      >
        <Heart className={cn("size-3.5", liked && "fill-current")} />
        {likes}
      </Button>
      <Button
        type="button"
        variant={bookmarked ? "secondary" : "outline"}
        size="sm"
        disabled={pending}
        onClick={() =>
          requireAuth(async () => {
            const res = await fetch(`/api/articles/${articleId}/bookmark`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            const data = (await res.json()) as { bookmarked: boolean };
            setBookmarked(data.bookmarked);
            toast.success(data.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
          })
        }
      >
        <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} />
        {bookmarked ? "Saved" : "Save"}
      </Button>
    </div>
  );
}