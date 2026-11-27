"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
};

export function TaxonomyManager({
  kind,
  items,
}: {
  kind: "categories" | "tags";
  items: Item[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  async function createItem() {
    const res = await fetch(`/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || slugify(name),
        ...(kind === "categories" ? { description: description || null } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Create failed");
      return;
    }
    toast.success("Created");
    setName("");
    setSlug("");
    setDescription("");
    router.refresh();
  }

  async function removeItem(id: string) {
    if (!window.confirm("Delete this item?")) return;
    const res = await fetch(`/api/${kind}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Delete failed");
      return;
    }
    toast.success("Deleted");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="space-y-3 rounded-lg border border-border p-4">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value));
          }}
        />
        <Input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        {kind === "categories" ? (
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : null}
        <Button onClick={() => void createItem()}>Create</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Count</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  {item.description ? (
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">{item.slug}</td>
                <td className="px-4 py-3">{item.count ?? 0}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void removeItem(item.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
