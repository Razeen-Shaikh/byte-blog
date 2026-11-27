import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/forms/login-form";
import { Container } from "@/components/layout/container";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
  alternates: { canonical: absoluteUrl("/login") },
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to comment, save articles, and manage your profile.
        </p>
        <div className="mt-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy
          </Link>{" "}
          policies.
        </p>
      </div>
    </Container>
  );
}