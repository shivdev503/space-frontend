import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

/** Small inline spinner for buttons and status lines. Decorative: pair it with text. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 shrink-0 animate-spin", className)} aria-hidden />;
}
