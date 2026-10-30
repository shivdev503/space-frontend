import { Spinner } from "@/components/ui/spinner";

/** Host pages (add a property, listing forms) check the session and listings on the server first. */
export default function HostPageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#f7f4ee] px-4" aria-busy="true">
      <p className="flex items-center gap-2.5 text-sm font-medium text-ink/70" role="status">
        <Spinner className="h-5 w-5 text-[color:var(--color-brand)]" /> Loading…
      </p>
    </div>
  );
}
