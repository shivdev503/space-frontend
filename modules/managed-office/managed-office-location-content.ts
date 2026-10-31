import { managedOfficeStartingPrice } from "@/modules/managed-office/managed-office-format";
import { managedOfficeMinSeats } from "@/modules/managed-office/components/detail/managed-office-detail-facts";
import { NON_OPERATOR_BRAND_SLUGS } from "@/services/brand-api";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import type { FAQItem } from "@/types";
import { formatCurrency } from "@/utils/format";

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function officeCount(count: number): string {
  return count === 1 ? "1 managed office" : `${count} managed offices`;
}

/** Facts for a locality page. Every line comes from the offices listed there, nothing is estimated. */
export function managedOfficeLocalityFacts(offices: ManagedOfficeModel.ManagedOffice[]) {
  const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
  const lowest = (values: number[]) => {
    const positive = values.filter((value) => value > 0);
    return positive.length ? Math.min(...positive) : null;
  };
  return {
    count: offices.length,
    brands: unique(
      offices
        .filter((office) => !NON_OPERATOR_BRAND_SLUGS.has(office.brand?.slug?.toLowerCase() ?? ""))
        .map((office) => office.brand?.name?.trim() ?? ""),
    ),
    minPrice: lowest(offices.map((office) => managedOfficeStartingPrice(office) ?? 0)),
    minSeats: lowest(offices.map(managedOfficeMinSeats)),
  };
}

export type ManagedOfficeLocalityFacts = ReturnType<typeof managedOfficeLocalityFacts>;

export function managedOfficeLocalityFaqs(locality: string, city: string, facts: ManagedOfficeLocalityFacts): FAQItem[] {
  const { count, brands, minPrice, minSeats } = facts;
  const faqs: Array<Omit<FAQItem, "id"> | false> = [
    {
      question: `How many managed offices are listed in ${locality}?`,
      answer: `SpaceWallah lists ${officeCount(count)} in ${locality}, ${city}${brands.length ? ` from ${joinNames(brands.slice(0, 4))}` : ""}.`,
    },
    minPrice != null && {
      question: `What does a managed office in ${locality} cost?`,
      answer: `Listed prices in ${locality} start at ${formatCurrency(minPrice)} per seat per month. Your final quote depends on team size, lock-in and fit-out.`,
    },
    minSeats != null && {
      question: `What is the minimum team size for a managed office in ${locality}?`,
      answer: `The lowest listed minimum in ${locality} is ${minSeats} seats. Minimums vary by office, so check each listing or ask our team.`,
    },
    {
      question: "Does SpaceWallah charge brokerage?",
      answer: "No. Our advice and shortlisting are free, with zero brokerage for you.",
    },
  ];
  return faqs
    .filter((faq): faq is Omit<FAQItem, "id"> => Boolean(faq))
    .map((faq, index) => ({ ...faq, id: `managed-office-locality-faq-${index}` }));
}
