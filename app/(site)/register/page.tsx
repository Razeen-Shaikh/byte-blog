import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";
import { Container } from "@/components/layout/container";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
  alternates: { canonical: absoluteUrl("/register") },
};

export default function RegisterPage() {
  return (
    <Container className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Join Byte Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a free reader account to follow authors and join discussions.
        </p>
        <div className="mt-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="underline hover:text-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}