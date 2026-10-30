"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

type Props = {
  variant?: "dark" | "light";
  className?: string;
};

export function HostLogoutButton({ variant = "light", className }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/user/vendorLogout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/list-your-space");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={busy}
      aria-label={busy ? "Logging out" : "Log out"}
      className={cn(
        variant === "dark" ? "host-dash__btn-logout" : "host-dash__btn-logout host-dash__btn-logout--light",
        className,
      )}
    >
      {busy ? <Spinner /> : <LogOut className="h-4 w-4" aria-hidden />}
      <span className="sr-only sm:not-sr-only sm:inline">{busy ? "Logging out…" : "Logout"}</span>
    </button>
  );
}
