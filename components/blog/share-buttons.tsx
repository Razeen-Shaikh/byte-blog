"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  url: string;
};

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Share
      </span>
      <Button variant="outline" size="sm" asChild>
        <a href={tweet} target="_blank" rel="noopener noreferrer">
          <Share2 className="size-3.5" />
          Share
        </a>
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={copyLink}>
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}