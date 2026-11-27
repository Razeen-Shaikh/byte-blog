import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SITE_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <Container className="py-12">
      <article className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Terms of use</h1>
        <p className="text-muted-foreground leading-relaxed">
          Content on {SITE_NAME} is protected by copyright unless otherwise noted. You may quote
          brief excerpts with attribution and a link to the original article.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Comments and community submissions must be respectful and on-topic. We may remove material
          that violates these terms or applicable law. Use of the site constitutes acceptance of
          these terms.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: November 26, 2026</p>
      </article>
    </Container>
  );
}