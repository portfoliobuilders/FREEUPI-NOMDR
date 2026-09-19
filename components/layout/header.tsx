"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Create" },
  { href: "/calculator", label: "Planner" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compliance", label: "Compliance" },
];

export function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/print")) {
    return null;
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="FREEUPI home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
            F
          </span>
          <span className="text-sm font-semibold tracking-tight">FREEUPI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Create account
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>FREEUPI</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 grid gap-3" aria-label="Mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
                Log in
              </Link>
              <Link href="/signup" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
                Create account
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
