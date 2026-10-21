const faqs = [
  {
    question: "Is a virtual office address valid for GST registration?",
    answer:
      "Yes. A virtual office with the right documentation NOC, utility bill, and rental agreement is fully accepted by GST authorities across India. All addresses on SpaceWallah are verified for GST compliance.",
  },
  {
    question: "Can I use a virtual office for company / ROC registration?",
    answer:
      "Yes. For company incorporation under the Companies Act, you need a registered address with supporting documents. Our Company Registration plan includes all required paperwork.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Most businesses receive their agreement and all documents within 24–48 hours of confirming their virtual office. Our team expedites the process once your identity and business documents are submitted.",
  },
  {
    question: "What is APOB and do you support it?",
    answer:
      "APOB (Additional Place of Business) is required when you want to expand GST registration to a new state. Yes our GST Registration plan includes APOB support for inter-state sellers.",
  },
  {
    question: "Is SpaceWallah a virtual office provider or aggregator?",
    answer:
      "SpaceWallah is a discovery and aggregator platform. We connect you to the best-fit verified provider in your city giving you unbiased options, better pricing, and expert guidance throughout the process.",
  },
  {
    question: "What if I need a virtual office in multiple cities?",
    answer:
      "No problem. Many businesses on SpaceWallah use us to register across 3–10 states. Our consultant helps you coordinate addresses, documentation, and pricing across multiple cities in one go.",
  },
] as const;

export function VirtualOfficeFaqSection() {
  return (
    <div>
      <header className="max-w-3xl">
        <span className="inline-flex items-center rounded-full bg-[rgba(76,175,80,0.14)] px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[#1B5E20] sm:text-xs">
          FAQ
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-4xl sm:leading-[1.12]">
          Common questions answered
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Still deciding? Here&apos;s what founders usually ask before getting started.
        </p>
      </header>

      <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
        {faqs.map((item) => (
          <li
            key={item.question}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:rounded-[1.35rem] sm:p-6"
          >
            <p className="text-base font-semibold leading-snug text-ink sm:text-[1.0625rem] sm:leading-snug">
              {item.question}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-[0.9375rem] sm:leading-relaxed">
              {item.answer}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
