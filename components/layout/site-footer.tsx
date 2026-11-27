import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  explore: [
    { href: "/blog", label: "Articles" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
  ],
  connect: [
    { href: "/contact", label: "Contact" },
    { href: "/rss.xml", label: "RSS" },
    { href: "/privacy", label: "Privacy" },
  ],
} as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Byte Blog
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Stories on software, product craft, and the teams building what
              comes next. A premium editorial space for long-form ideas.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Connect
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Byte Blog. All rights reserved.</p>
          <p className="font-mono text-[11px] uppercase tracking-widest">
            Crafted for readers who ship
          </p>
        </div>
      </div>
    </footer>
  );
}