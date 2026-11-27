"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ReadingProgressProps = {
  targetSelector?: string;
  className?: string;
};

export function ReadingProgress({
  targetSelector = ".article-prose",
  className,
}: ReadingProgressProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      const el = document.querySelector(targetSelector);
      if (!el) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
        return;
      }

      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.scrollY;
      const elHeight = el.scrollHeight;
      const viewport = window.innerHeight;
      const scrolled = window.scrollY - elTop + viewport * 0.2;
      const total = elHeight - viewport * 0.4;

      if (total <= 0) {
        setProgress(0);
        return;
      }

      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetSelector]);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent", className)}
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}