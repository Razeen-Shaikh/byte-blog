"use client";

import { Button } from "@/components/ui/button";

export function NewsletterExportButton({
  rows,
}: {
  rows: Array<{ email: string; isActive: boolean; createdAt: string }>;
}) {
  function exportCsv() {
    const header = "email,isActive,createdAt\n";
    const body = rows
      .map((row) => `${row.email},${row.isActive},${row.createdAt}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "newsletter-subscribers.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={exportCsv}>
      Export CSV
    </Button>
  );
}
