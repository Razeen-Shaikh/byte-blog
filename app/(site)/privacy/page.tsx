import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SITE_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: absoluteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <article className="prose-custom mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="text-muted-foreground leading-relaxed">
          {SITE_NAME} collects the minimum data required to operate the site: account details if you
          register, newsletter email if you subscribe, and standard server logs for security.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell personal information. Analytics, if enabled, are used in aggregate to
          understand readership trends. You may request account deletion by contacting us.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: November 26, 2026</p>
      </article>
    </Container>
  );
}