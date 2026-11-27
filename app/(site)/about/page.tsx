import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME} — ${SITE_DESCRIPTION}`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">About {SITE_NAME}</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{SITE_DESCRIPTION}</p>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          We publish long-form essays and practical field notes for people who ship software:
          staff engineers, designers who code, and founders who still read the diff. Our standard is
          clarity over hype and evidence over opinion.
        </p>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          The publication is independently edited. Sponsored work, when it appears, is clearly
          labeled. Your reading time is never sold to third parties.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/blog">Read the archive</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </article>
    </Container>
  );
}