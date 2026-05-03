import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-95 shadow-soft border border-foreground/10",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 border border-border shadow-soft",
  ghost: "hover:bg-muted text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

export function Button({
  className,
  variant = "primary",
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
}) {
  if (asChild) {
    if (!React.isValidElement(children)) return null;
    return React.cloneElement(children, {
      ...props,
      className: cn(base, variants[variant], className, (children as any).props?.className)
    });
  }

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
}) {
  return (
    <Link className={cn(base, variants[variant], className)} href={href}>
      {children}
    </Link>
  );
}
