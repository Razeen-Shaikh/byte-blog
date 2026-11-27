"use client";

import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/utils";

type ShareButtonsProps = {
  title: string;
  slug: string;
  className?: string;
};

export function ShareButtons({ title, slug, className }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const url = absoluteUrl(`/blog/${slug}`);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className={className}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Share
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Share2 className="size-4" />
            Post
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" />
            LinkedIn
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Copy
        </Button>
        <Button variant="ghost" size="icon" className="size-9" onClick={copyLink} aria-label="Copy link">
          <Link2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}