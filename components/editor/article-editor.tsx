"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

type Option = { id: string; name: string; slug: string };

type ArticleEditorProps = {
  articleId?: string;
  initial?: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    status: ArticleStatus;
    featured: boolean;
    categoryId: string | null;
    tagIds: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    ogImage: string | null;
    scheduledAt: string | null;
  };
  categories: Option[];
  tags: Option[];
};

export function ArticleEditor({
  articleId,
  initial,
  categories,
  tags,
}: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [status, setStatus] = useState<ArticleStatus>(
    initial?.status ?? ArticleStatus.DRAFT,
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seoDescription ?? "",
  );
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : "",
  );
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const payload = useMemo(
    () => ({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      status,
      featured,
      categoryId: categoryId || null,
      tagIds,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      canonicalUrl: canonicalUrl || null,
      ogImage: ogImage || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    }),
    [
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      featured,
      categoryId,
      tagIds,
      seoTitle,
      seoDescription,
      canonicalUrl,
      ogImage,
      scheduledAt,
    ],
  );

  async function save(showToast = true) {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return null;
    }
    setSaving(true);
    try {
      const res = await fetch(
        articleId ? `/api/articles/${articleId}` : "/api/articles",
        {
          method: articleId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save");
      }
      setLastSavedAt(new Date());
      if (showToast) toast.success("Article saved");
      const createdId = data.article?.id ?? data.id;
      if (!articleId && createdId) {
        router.replace(`/admin/articles/${createdId}/edit`);
      }
      router.refresh();
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!articleId) return;
    const timer = window.setInterval(() => {
      void save(false);
    }, 20000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, payload]);

  function toggleTag(id: string) {
    setTagIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            >
              {Object.values(ArticleStatus).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="featured">Featured</Label>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void save(true)} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            {slug ? (
              <Button type="button" variant="outline" asChild>
                <a href={`/blog/${slug}`} target="_blank" rel="noreferrer">
                  Preview
                </a>
              </Button>
            ) : null}
          </div>
          {lastSavedAt ? (
            <p className="text-xs text-muted-foreground">
              Autosaved {lastSavedAt.toLocaleTimeString()}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover image URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={
                      active
                        ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                        : "rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-medium">SEO</p>
          <Input
            placeholder="SEO title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          <Textarea
            placeholder="SEO description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
          />
          <Input
            placeholder="Canonical URL"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
          />
          <Input
            placeholder="Open Graph image URL"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
          />
        </div>
      </aside>
    </div>
  );
}
