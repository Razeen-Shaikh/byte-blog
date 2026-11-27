"use client";

import { CommentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CommentModeration({
  id,
  status,
}: {
  id: string;
  status: CommentStatus;
}) {
  const router = useRouter();

  async function update(next: CommentStatus | "DELETE") {
    if (next === "DELETE") {
      if (!window.confirm("Delete comment?")) return;
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
    } else {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error("Update failed");
        return;
      }
    }
    toast.success("Updated");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" ? (
        <Button size="sm" onClick={() => void update("APPROVED")}>
          Approve
        </Button>
      ) : null}
      {status !== "REJECTED" ? (
        <Button size="sm" variant="outline" onClick={() => void update("REJECTED")}>
          Reject
        </Button>
      ) : null}
      <Button size="sm" variant="destructive" onClick={() => void update("DELETE")}>
        Delete
      </Button>
    </div>
  );
}
