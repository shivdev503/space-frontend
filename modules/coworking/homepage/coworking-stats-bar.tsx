const STATS: {
  value: string;
  suffix: string;
  label: string;
  highlight?: boolean;
}[] = [
  { value: "1000", suffix: "+", label: "Coworking Spaces" },
  { value: "12", suffix: "", label: "Cities Covered" },
  { value: "₹0", suffix: "", label: "Brokerage. Always.", highlight: true },
  { value: "2hr", suffix: "", label: "Expert Response" },
];

export function CoworkingStatsBar() {
  return (
    <section className="border-y border-slate-200/90 bg-white py-8 sm:py-9">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-8 px-5 sm:grid-cols-4 sm:gap-y-0 sm:px-10">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`text-center px-4 sm:px-5 ${
              index < STATS.length - 1 ? "sm:border-r sm:border-slate-200/90" : ""
            } ${index === 1 ? "max-sm:border-r-0" : ""}`}
          >
            <p className="font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-ink sm:text-[40px]">
              {stat.highlight ? (
                <span className="text-[color:var(--color-brand)]">{stat.value}</span>
              ) : (
                <>
                  {stat.value}
                  {stat.suffix ? (
                    <span className="text-[color:var(--color-brand)]">{stat.suffix}</span>
                  ) : null}
                </>
              )}
            </p>
            <p className="mt-2 text-[13px] tracking-wide text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
