"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchDialog } from "@/components/layout/search-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

function canAccessAdmin(role?: string) {
  return role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center gap-3">
        <MobileNav />

        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground md:text-xl"
        >
          Byte Blog
        </Link>

        <nav className="mx-4 hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchDialog />
          <ThemeToggle />

          {status === "loading" ? (
            <UserMenuPlaceholder />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full p-0"
                  aria-label="Open user menu"
                >
                  <Avatar className="size-9">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? user.username}
                    />
                    <AvatarFallback>
                      {(user.name ?? user.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <UserMenuLabel
                    name={user.name}
                    email={user.email}
                    username={user.username}
                  />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/authors/${user.username}`}>
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {canAccessAdmin(user.role) ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}

function UserMenuPlaceholder() {
  return (
    <Button variant="ghost" size="icon" className="size-9 rounded-full" disabled>
      <span className="sr-only">Loading session</span>
      <div className="size-9 animate-pulse rounded-full bg-muted" />
    </Button>
  );
}

function UserMenuLabel({
  name,
  email,
  username,
}: {
  name?: string | null;
  email?: string | null;
  username: string;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium leading-none">{name ?? username}</p>
      {email ? (
        <p className="text-xs leading-none text-muted-foreground">{email}</p>
      ) : null}
    </div>
  );
}