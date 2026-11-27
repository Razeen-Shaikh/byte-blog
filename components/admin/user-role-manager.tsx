"use client";

import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function UserRoleManager({
  id,
  role,
  isActive,
}: {
  id: string;
  role: UserRole;
  isActive: boolean;
}) {
  const router = useRouter();

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("Updated");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        value={role}
        onChange={(e) => void patch({ role: e.target.value })}
      >
        {Object.values(UserRole).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void patch({ isActive: !isActive })}
      >
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}
