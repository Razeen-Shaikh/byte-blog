"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema } from "@/lib/validations/taxonomy";

type FormValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(body?.error ?? "Could not subscribe");
      return;
    }

    toast.success("You're on the list. Welcome.");
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={className}
      noValidate
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining…" : "Subscribe"}
        </Button>
      </div>
      {errors.email ? (
        <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
      ) : null}
    </form>
  );
}