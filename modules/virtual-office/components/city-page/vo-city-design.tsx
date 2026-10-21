import type { ReactNode } from "react";

import { CONTACT_PHONE } from "@/lib/contact-data";
import { cn } from "@/utils/cn";

/** Shared look for the virtual office city page. */
export const VO_WHATSAPP_HREF = `https://wa.me/91${CONTACT_PHONE}`;

export function VoWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0", className)}>{children}</div>;
}

export function VoBand({
  id,
  children,
  tone = "white",
  className,
}: {
  id?: string;
  children: ReactNode;
  tone?: "white" | "soft" | "dark";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-16 sm:py-20 lg:py-24",
        tone === "white" && "bg-white",
        tone === "soft" && "bg-[#F5F9F7]",
        tone === "dark" && "bg-[#0B3B2E] text-white",
        className,
      )}
    >
      <VoWrap>{children}</VoWrap>
    </section>
  );
}

export function VoKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-bold uppercase tracking-[0.14em] text-brand", className)}>{children}</p>
  );
}

export function VoHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "vo-display mt-2 text-[2rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.5rem] lg:text-[2.85rem]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function VoLead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-4 max-w-[46rem] text-[1.0625rem] leading-[1.7] text-muted", className)}>{children}</p>;
}

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

function ButtonBase({
  children,
  className,
  href,
  onClick,
  type = "button",
  disabled,
  external,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/** Mint green fill, white text. */
export function VoGreenButton({ className, ...props }: ButtonProps) {
  return <ButtonBase {...props} className={cn("bg-[#12B886] text-white hover:bg-[#10a678]", className)} />;
}

/** Dark green fill, white text. */
export function VoDarkButton({ className, ...props }: ButtonProps) {
  return <ButtonBase {...props} className={cn("bg-[#0B3B2E] text-white hover:bg-[#0e4a3a]", className)} />;
}

/** Dark outline. */
export function VoOutlineButton({ className, ...props }: ButtonProps) {
  return (
    <ButtonBase
      {...props}
      className={cn("border-[1.5px] border-[#0B3B2E] bg-white text-ink hover:bg-[#F5F9F7]", className)}
    />
  );
}

export function VoCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("h-4 w-4 shrink-0 text-brand", className)}>
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VoCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("h-4 w-4 shrink-0 text-[#9AA5A1]", className)}>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
