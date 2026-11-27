"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileUser = {
  name: string | null;
  username: string;
  email: string;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  image: string | null;
};

export function ProfileSettingsForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    bio: user.bio ?? "",
    website: user.website ?? "",
    twitter: user.twitter ?? "",
    github: user.github ?? "",
    linkedin: user.linkedin ?? "",
    image: user.image ?? "",
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border p-6">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input value={user.username} disabled />
      </div>
      {(
        [
          ["name", "Name"],
          ["image", "Avatar URL"],
          ["website", "Website"],
          ["twitter", "Twitter / X"],
          ["github", "GitHub"],
          ["linkedin", "LinkedIn"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
          />
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={4}
          value={form.bio}
          onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
