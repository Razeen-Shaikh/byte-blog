"use client";

import type { Session } from "next-auth";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthSessionProvider } from "./session-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthSessionProvider session={session}>
        <QueryProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:
                    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                  description: "group-[.toast]:text-muted-foreground",
                  actionButton:
                    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                  cancelButton:
                    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}