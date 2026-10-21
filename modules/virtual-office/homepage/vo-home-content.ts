import { getVirtualOfficeCityCatalogBySlug } from "@/lib/virtual-office-city-catalog";
import { getVoCityState } from "@/modules/virtual-office/components/city-page/vo-city-content";

export type VoHomeCity = {
  name: string;
  /** `/virtual-office/{slug}` route segment. */
  slug: string;
  state: string;
  code: string;
  /** Card background — the city's hero photo from the catalog. */
  image?: string;
};

const CITIES: Array<{ name: string; slug: string }> = [
  { name: "Gurugram", slug: "gurugram" },
  { name: "Noida", slug: "noida" },
  { name: "Delhi", slug: "delhi" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Pune", slug: "pune" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Chennai", slug: "chennai" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Indore", slug: "indore" },
];

export const VO_HOME_CITIES: VoHomeCity[] = CITIES.map((city) => {
  const state = getVoCityState(city.slug);
  return {
    ...city,
    state: state?.state ?? "",
    code: state?.code ?? "",
    image: getVirtualOfficeCityCatalogBySlug(city.slug)?.image,
  };
});

export const VO_HOME_FAQS = [
  {
    q: "What is a virtual office in India?",
    a: "A virtual office gives your business a real commercial address without renting a desk. You get a NOC, a rent agreement and a utility bill so you can use the address for GST, company registration, invoices and your website, while you work from anywhere.",
  },
  {
    q: "Is a virtual office valid for GST registration in India?",
    a: "Yes. GST officers accept a virtual office as a place of business when you have a NOC from the owner and a rent agreement and a recent utility bill. An officer may visit to check the address and the centre handles that visit for you.",
  },
  {
    q: "Can I register a company with a virtual office?",
    a: "Yes. With the company registration plan you get the NOC, agreement and utility bill needed to use the address as the registered office of your Pvt Ltd, LLP or OPC.",
  },
  {
    q: "How much does a virtual office cost in India?",
    a: "Prices depend on the city, the area and the plan. A business address plan usually costs less than a GST or company registration plan. Share your city and we send you live prices on WhatsApp.",
  },
  {
    q: "Can I get GST in many states with virtual offices?",
    a: "Yes. GST works state by state, so you need an address in each state where you want a GSTIN. We set up virtual offices in all your states with one expert and one plan.",
  },
  {
    q: "What is the difference between APOB and a new GSTIN?",
    a: "An APOB (additional place of business) adds a new address to your existing GSTIN in the same state. A new state needs its own separate GSTIN and a local address there.",
  },
  {
    q: "Can Amazon and Flipkart sellers use a virtual office?",
    a: "Yes. Many online sellers use virtual offices to get a GSTIN in new states so they can sell and store stock across India. Check each marketplace's rules for warehouse addresses.",
  },
  {
    q: "How long does setup take?",
    a: "Online KYC takes about 5 minutes. Most centres share documents within 24 to 48 hours after KYC, and you can then apply for GST or company registration.",
  },
  {
    q: "Is SpaceWallah a provider or a marketplace?",
    a: "SpaceWallah is a marketplace. We compare verified centres in each city, check their documents and help you pick the best option. Our help is free and we charge no brokerage.",
  },
  {
    q: "Will banks accept a virtual office address?",
    a: "Most banks accept a virtual office address for a current account when you share the NOC, agreement and utility bill along with your GST or incorporation certificate. Some banks may visit the address.",
  },
];
