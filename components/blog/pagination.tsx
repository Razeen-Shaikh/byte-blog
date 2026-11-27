import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

export function Pagination({ page, totalPages, buildHref, className }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-3", className)}
      aria-label="Pagination"
    >
      {prev ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildHref(prev)}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildHref(next)}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}