"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!window.confirm("Delete this article permanently?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to delete");
      return;
    }
    toast.success("Article deleted");
    router.refresh();
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => void onDelete()}>
      Delete
    </Button>
  );
}
