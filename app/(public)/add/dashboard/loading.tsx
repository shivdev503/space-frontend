import { Spinner } from "@/components/ui/spinner";

/** Shown while the host's listings load (after login, or when opening My listings). */
export default function HostDashboardLoading() {
  return (
    <div className="host-dash" aria-busy="true">
      <div className="host-dash__bg" aria-hidden />
      <div className="host-dash__inner">
        <header className="host-dash__hero">
          <div className="host-dash__hero-glow" aria-hidden />
          <p className="host-dash__eyebrow">SpaceWallah Host Panel</p>
          <p className="host-dash__title flex items-center gap-3" role="status">
            <Spinner className="h-6 w-6" /> Loading your listings…
          </p>
        </header>
        <div className="mt-8 grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-200/70 bg-white/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
