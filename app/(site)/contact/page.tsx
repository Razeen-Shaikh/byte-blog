import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Byte Blog team.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <header className="mb-10 max-w-xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, corrections, or pitches — send a note. We read every message.
        </p>
      </header>
      <ContactForm />
    </Container>
  );
}