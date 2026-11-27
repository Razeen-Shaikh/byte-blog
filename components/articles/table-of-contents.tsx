"use client";

import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type TableOfContentsProps = {
  items: TocItem[];
  className?: string;
};

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: [0, 0.25, 0.5, 1] },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label="Table of contents" className={cn("text-sm", className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ScrollArea className="max-h-[min(60vh,24rem)] pr-3">
        <ul className="space-y-2 border-l border-border pl-3">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block py-0.5 text-muted-foreground transition-colors hover:text-foreground",
                  item.level === 3 && "pl-3 text-[13px]",
                  activeId === item.id && "font-medium text-primary",
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
}