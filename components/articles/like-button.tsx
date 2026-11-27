"use client";

import { Heart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  articleId: string;
  initialCount: number;
  initialLiked?: boolean;
  className?: string;
};

export function LikeButton({
  articleId,
  initialCount,
  initialLiked = false,
  className,
}: LikeButtonProps) {
  const { status } = useSession();
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: liked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Like failed");
      return res.json() as Promise<{ count: number; liked: boolean }>;
    },
    onMutate: () => {
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setLiked(initialLiked);
      setCount(initialCount);
      toast.error("Could not update like");
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setCount(data.count);
    },
  });

  const onClick = () => {
    if (status !== "authenticated") {
      toast.message("Sign in to like this article");
      return;
    }
    mutation.mutate();
  };

  return (
    <Button
      type="button"
      variant={liked ? "default" : "outline"}
      size="sm"
      className={cn("gap-2", className)}
      onClick={onClick}
      disabled={mutation.isPending}
      aria-pressed={liked}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count.toLocaleString()}
    </Button>
  );
}