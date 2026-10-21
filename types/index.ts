export type SpaceVertical = "coworking" | "virtual-office" | "office-space" | "coliving";

export type SpacePlan = {
  name: string;
  price: number;
  unit: string;
};

/** Optional per-image tone from workspace wire (`brightness` / `contrast`); aligns with `Space.images` indices. */
export type SpaceImageAdjustment = {
  brightness?: number;
  contrast?: number;
};

export type Space = {
  id: string;
  spaceTag?: string;
  name: string;
  slug: string;
  vertical: SpaceVertical;
  brand: string;
  city: string;
  location: string;
  address: string;
  images: string[];
  /** Same length as `images` when present; sparse when only some photos have API tone metadata. */
  imageAdjustments?: Array<SpaceImageAdjustment | undefined>;
  price: number;
  spaceTypes: string[];
  teamSizes: string[];
  plans: SpacePlan[];
  amenities: string[];
  highlights: string[];
  description: string;
  rating: number;
  isFeatured: boolean;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  requirement: string;
  spaceId?: string;
  city?: string;
  teamSize?: string;
  budget?: string;
  source?: "homepage" | "listing" | "admin";
  createdAt: string;
};

export type City = {
  id: string;
  name: string;
  slug: string;
  image: string;
  tagline: string;
  spaceCount: number;
};

export type TrustMetric = {
  id: string;
  value: number;
  suffix?: string;
  label: string;
};

export type Brand = {
  id: string;
  name: string;
  category: string;
  /** Logo for homepage “Trusted Operators” rail. */
  image?: string;
  /** Brand detail route (e.g. `/brand/wework`). */
  url?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
};

export type WhySpaceWallahItem = {
  id: string;
  title: string;
  description: string;
};

export type HowItWorksStep = {
  id: string;
  title: string;
  description: string;
  /** Shown in the card on hover (optional). */
  imageSrc?: string;
};

export type SearchOption = {
  label: string;
  value: string;
};

export type HomepageData = {
  trustMetrics: TrustMetric[];
  cities: City[];
  featuredSpaces: Space[];
  brands: Brand[];
  testimonials: Testimonial[];
  differentiators: WhySpaceWallahItem[];
  howItWorks: HowItWorksStep[];
  searchOptions: {
    locations: SearchOption[];
    teamSizes: SearchOption[];
    budgets: SearchOption[];
  };
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
};

export type ComparisonRow = {
  id: string;
  feature: string;
  values: string[];
};

export type CaseStudy = {
  id: string;
  company: string;
  headline: string;
  summary: string;
  metric: string;
};

export type VerticalHero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
  imageLabel: string;
  badges?: string[];
  stats?: Array<{
    label: string;
    value: string;
  }>;
};

export type VerticalLandingData = {
  vertical: SpaceVertical;
  hero: VerticalHero;
  cities: City[];
  featuredSpaces: Space[];
  benefits: WhySpaceWallahItem[];
  howItWorks: HowItWorksStep[];
  leadSection: {
    title: string;
    description: string;
    ctaLabel: string;
    bullets: string[];
  };
  searchOptions: HomepageData["searchOptions"];
  pricingPlans?: PricingPlan[];
  comparisonTable?: {
    columns: string[];
    rows: ComparisonRow[];
  };
  enterpriseSolutions?: WhySpaceWallahItem[];
  caseStudies?: CaseStudy[];
  brands?: Brand[];
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type SEOSection = {
  title: string;
  paragraphs: string[];
};

export type CityPageFilters = {
  budget?: string;
  teamSize?: string;
  spaceType?: string;
  amenity?: string;
  brand?: string;
};

export type CityPageData = {
  vertical: SpaceVertical;
  city: City;
  /** Catalog Mongo id for `/api/user/workSpaces?city=` / `/api/user/officeSpaces?city=` (coworking & office-space when known). */
  catalogCityId?: string;
  title: string;
  subtitle: string;
  totalSpaces: number;
  spaces: Space[];
  filters: {
    budgets: SearchOption[];
    teamSizes: SearchOption[];
    spaceTypes: SearchOption[];
    amenities: SearchOption[];
    brands: SearchOption[];
  };
  popularLocations: Array<{
    name: string;
    slug: string;
    spaceCount: number;
  }>;
  seoSection: SEOSection;
  faqs: FAQItem[];
  leadCta: {
    title: string;
    description: string;
    ctaLabel: string;
  };
};

export type LocationPageData = {
  vertical: SpaceVertical;
  city: City;
  /** Catalog Mongo id for `/api/user/workSpaces?city=` / `/api/user/officeSpaces?city=` (coworking & office-space when known). */
  catalogCityId?: string;
  /**
   * Micro-location document id for `GET /api/user/workSpaces?micro_location=` (coworking).
   * Differs from `locationSlug` when the URL uses a slug/key; resolved via micro-locations API.
   */
  workspaceMicroLocationId?: string;
  citySlug: string;
  locationSlug: string;
  locationName: string;
  title: string;
  subtitle: string;
  totalSpaces: number;
  spaces: Space[];
  popularSpaces: Space[];
  filters: {
    budgets: SearchOption[];
    teamSizes: SearchOption[];
    spaceTypes: SearchOption[];
    amenities: SearchOption[];
    brands: SearchOption[];
  };
  insights: {
    summary: string;
    nearby: string[];
    notes: string[];
  };
  seoSection: SEOSection;
  faqs: FAQItem[];
  leadCta: {
    title: string;
    description: string;
    ctaLabel: string;
  };
};

export { CoworkingModel } from "./coworking-workspace.model";
export * from "./coworking-workspace-api";
