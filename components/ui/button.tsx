import Link from "next/link";
import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/utils/cn";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** With `href`: runs on click, e.g. to load in place while crawlers follow the link. */
  onLinkClick?: MouseEventHandler<HTMLAnchorElement>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary:
    "bg-[color:var(--color-brand)] text-white shadow-card hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)]",
  secondary:
    "border border-line bg-white text-ink hover:-translate-y-0.5 hover:border-slate-300",
  ghost: "text-ink hover:bg-white/70",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  onLinkClick,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition duration-200",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onLinkClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
