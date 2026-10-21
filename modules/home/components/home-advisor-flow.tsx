import { IndianRupee, ShieldCheck, TramFront, UserRound } from "lucide-react";

const STEPS = [
  {
    number: "1",
    title: "Share your brief",
    description: "Team size, budget, area. Two minutes on a form or WhatsApp.",
  },
  {
    number: "2",
    title: "Tour with an advisor",
    description: "We shortlist 3 to 5 spaces and walk you through them in one trip.",
  },
  {
    number: "3",
    title: "Move in or get documents",
    description: "We negotiate the price. You sign and move in, or receive your GST documents.",
  },
];

const BENEFITS = [
  {
    title: "Zero brokerage",
    description: "Operators pay us, not you",
    Icon: IndianRupee,
  },
  {
    title: "Verified in person",
    description: "Every space toured by our team",
    Icon: ShieldCheck,
  },
  {
    title: "Metro-first",
    description: "Walk time on every listing",
    Icon: TramFront,
  },
  {
    title: "One advisor",
    description: "From first call to move-in",
    Icon: UserRound,
  },
];

export function HomeAdvisorFlow() {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        How it works
      </h2>

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-6">
        {STEPS.map((step) => (
          <article
            key={step.number}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-7 sm:px-7 sm:py-8 lg:min-h-[13.5rem]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdeef5] text-base font-semibold text-[#8f1d52] sm:h-12 sm:w-12 sm:text-lg">
              {step.number}
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">
              {step.title}
            </h3>
            <p className="mt-4 max-w-[27rem] text-base leading-7 text-muted sm:text-lg">
              {step.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 border-y border-slate-200 py-7 sm:mt-14 sm:py-8">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ title, description, Icon }) => (
            <div key={title} className="flex items-start gap-4">
              <Icon className="mt-1 h-7 w-7 shrink-0 stroke-[1.8] text-[#8f1d52]" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-tight text-ink sm:text-lg">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted sm:text-base">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}