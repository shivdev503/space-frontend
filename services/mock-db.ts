import { cache } from "react";

import {
  Brand,
  CaseStudy,
  City,
  CityPageData,
  CityPageFilters,
  ComparisonRow,
  HomepageData,
  HowItWorksStep,
  Lead,
  PricingPlan,
  LocationPageData,
  Space,
  SpaceVertical,
  Testimonial,
  TrustMetric,
  VerticalLandingData,
  WhySpaceWallahItem,
} from "@/types";
import { canonicalCoworkingCitySlug, getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";

/** Stable default for `getCityPageData` / `cache()` key when no filters are applied. */
export const EMPTY_CITY_PAGE_FILTERS: CityPageFilters = {};

const seedSpaces: Space[] = [
  {
    id: "spc_001",
    name: "Altura One BKC",
    slug: "altura-one-bkc",
    vertical: "coworking",
    brand: "WeWork",
    city: "mumbai",
    location: "bkc",
    address: "Level 12, Platina Tower, Bandra Kurla Complex, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 8999,
    spaceTypes: ["Hot Desk", "Dedicated Desk", "Private Cabin"],
    teamSizes: ["1-5", "6-20", "21-50"],
    plans: [
      { name: "Hot Desk", price: 8999, unit: "/seat/month" },
      { name: "Dedicated Desk", price: 12999, unit: "/seat/month" },
    ],
    amenities: ["24/7 Access", "Meeting Rooms", "Cafeteria", "High-Speed WiFi"],
    highlights: ["Bright community floor", "BKC business district", "Fast move-in"],
    description:
      "Premium coworking floors in Mumbai's financial core with hospitality-grade common spaces.",
    rating: 4.8,
    isFeatured: true,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "spc_002",
    name: "Addressly Koramangala",
    slug: "addressly-koramangala",
    vertical: "virtual-office",
    brand: "Awfis",
    city: "bangalore",
    location: "koramangala",
    address: "80 Feet Road, Koramangala, Bangalore",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 1999,
    spaceTypes: ["GST Registration", "Business Address"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "GST Registration", price: 1999, unit: "/month" },
      { name: "Business Address + Mail Handling", price: 3499, unit: "/month" },
    ],
    amenities: ["GST Registration", "Mail Handling", "Reception Support"],
    highlights: ["Startup-friendly address", "Compliance-ready docs", "Reception support"],
    description:
      "A virtual office product designed for startups that need speed, compliance, and credibility.",
    rating: 4.7,
    isFeatured: true,
    createdAt: "2026-01-18T11:15:00.000Z",
  },
  {
    id: "spc_003",
    name: "Northlight Business Centre",
    slug: "northlight-business-centre",
    vertical: "office-space",
    brand: "Table Space",
    city: "gurgaon",
    location: "golf-course-road",
    address: "Sector 54, Golf Course Road, Gurgaon",
    images: [
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 75000,
    spaceTypes: ["Managed Office", "Private Floor"],
    teamSizes: ["21-50", "50+"],
    plans: [
      { name: "Managed Office", price: 75000, unit: "/month" },
      { name: "Private Floor", price: 295000, unit: "/month" },
    ],
    amenities: ["Reception", "Parking", "Board Rooms", "Power Backup"],
    highlights: ["Enterprise-ready suites", "Premium tower address", "Board-room access"],
    description:
      "Managed office inventory for scaling teams that need polished, enterprise-ready infrastructure.",
    rating: 4.9,
    isFeatured: true,
    createdAt: "2026-02-01T09:30:00.000Z",
  },
  {
    id: "spc_004",
    name: "Harbor Desk Anna Salai",
    slug: "harbor-desk-anna-salai",
    vertical: "coworking",
    brand: "91Springboard",
    city: "chennai",
    location: "anna-salai",
    address: "Anna Salai Main Road, Chennai",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 6999,
    spaceTypes: ["Flexi Desk", "Private Cabin"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "Flexi Seat", price: 6999, unit: "/seat/month" },
      { name: "Private Cabin", price: 24999, unit: "/month" },
    ],
    amenities: ["Phone Booths", "Event Space", "Tea/Coffee", "Visitor Lounge"],
    highlights: ["Founder-friendly floor", "Central Chennai", "Community events"],
    description:
      "A refined coworking setup tailored to founders and satellite teams in central Chennai.",
    rating: 4.6,
    isFeatured: true,
    createdAt: "2026-02-12T08:45:00.000Z",
  },
  {
    id: "spc_005",
    name: "Capital Works Connaught Place",
    slug: "capital-works-connaught-place",
    vertical: "coworking",
    brand: "Smartworks",
    city: "delhi",
    location: "connaught-place",
    address: "Inner Circle, Connaught Place, New Delhi",
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 10999,
    spaceTypes: ["Shared Desk", "Private Studio"],
    teamSizes: ["1-5", "6-20", "21-50"],
    plans: [
      { name: "Shared Desk", price: 10999, unit: "/seat/month" },
      { name: "Private Studio", price: 38999, unit: "/month" },
    ],
    amenities: ["Concierge", "Meeting Suites", "Metro Access", "Pantry"],
    highlights: ["Landmark CBD address", "Client-facing lounges", "Hospitality-led experience"],
    description:
      "A hospitality-led workspace in the heart of Delhi for leadership teams and client-facing operators.",
    rating: 4.9,
    isFeatured: true,
    createdAt: "2026-02-15T10:30:00.000Z",
  },
  {
    id: "spc_006",
    name: "Orbital Suites Noida One",
    slug: "orbital-suites-noida-one",
    vertical: "office-space",
    brand: "IndiQube",
    city: "noida",
    location: "sector-62",
    address: "Sector 62, Noida",
    images: [
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 62000,
    spaceTypes: ["Managed Office", "Custom Buildout"],
    teamSizes: ["21-50", "50+"],
    plans: [
      { name: "Managed Office", price: 62000, unit: "/month" },
      { name: "Custom Buildout", price: 180000, unit: "/month" },
    ],
    amenities: ["Server Room", "Visitor Management", "Parking", "Power Backup"],
    highlights: ["Tech corridor location", "Scalable floorplates", "Managed services"],
    description:
      "Flexible office inventory in Noida for technology teams that need clean infra and fast move-ins.",
    rating: 4.7,
    isFeatured: false,
    createdAt: "2026-02-18T08:10:00.000Z",
  },
  {
    id: "spc_007",
    name: "Skyline Desk HITEC City",
    slug: "skyline-desk-hitec-city",
    vertical: "coworking",
    brand: "IndiQube",
    city: "hyderabad",
    location: "hitec-city",
    address: "Madhapur, HITEC City, Hyderabad",
    images: [
      "https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 7999,
    spaceTypes: ["Day Flex", "Team Cabin"],
    teamSizes: ["1-5", "6-20", "21-50"],
    plans: [
      { name: "Day Flex", price: 7999, unit: "/seat/month" },
      { name: "Team Cabin", price: 32999, unit: "/month" },
    ],
    amenities: ["Podcast Room", "Meeting Pods", "Cafe", "Printing"],
    highlights: ["Design-forward interiors", "HITEC City access", "Team cabins"],
    description:
      "A calm, design-forward coworking floor for product teams and consulting pods in Hyderabad.",
    rating: 4.8,
    isFeatured: true,
    createdAt: "2026-02-20T09:45:00.000Z",
  },
  {
    id: "spc_008",
    name: "Deskline Business Address Pune",
    slug: "deskline-business-address-pune",
    vertical: "virtual-office",
    brand: "Regus",
    city: "pune",
    location: "baner",
    address: "Baner Road, Pune",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 1799,
    spaceTypes: ["Business Address", "Compliance Support"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "Basic Registration", price: 1799, unit: "/month" },
      { name: "Compliance Plus", price: 2999, unit: "/month" },
    ],
    amenities: ["Business Address", "Mail Alerts", "Reception", "GST Support"],
    highlights: ["Lean-company friendly", "Baner location", "GST-ready support"],
    description:
      "A virtual-office product for lean companies that want a trusted business address in Pune.",
    rating: 4.5,
    isFeatured: true,
    createdAt: "2026-02-24T07:40:00.000Z",
  },
  {
    id: "spc_009",
    name: "The Quarter 5th Avenue",
    slug: "the-quarter-5th-avenue",
    vertical: "office-space",
    brand: "WeWork",
    city: "bangalore",
    location: "mg-road",
    address: "MG Road, Bangalore",
    images: [
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 98000,
    spaceTypes: ["Managed HQ", "Enterprise Suite"],
    teamSizes: ["21-50", "50+"],
    plans: [
      { name: "Managed HQ", price: 98000, unit: "/month" },
      { name: "Enterprise Suite", price: 250000, unit: "/month" },
    ],
    amenities: ["Valet Parking", "Board Rooms", "IT Support", "Reception"],
    highlights: ["MG Road address", "Leadership-ready space", "Premium arrival experience"],
    description:
      "A central Bangalore office option for fast-scaling teams that want polish without procurement delays.",
    rating: 4.9,
    isFeatured: true,
    createdAt: "2026-03-02T12:20:00.000Z",
  },
  {
    id: "spc_010",
    name: "Registry Lane Connaught Place",
    slug: "registry-lane-connaught-place",
    vertical: "virtual-office",
    brand: "Smartworks",
    city: "delhi",
    location: "connaught-place",
    address: "Connaught Place, New Delhi",
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 2499,
    spaceTypes: ["GST Address", "Business Plus"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "GST Address", price: 2499, unit: "/month" },
      { name: "Business Plus", price: 3999, unit: "/month" },
    ],
    amenities: ["GST Registration", "Mail Handling", "Reception Support"],
    highlights: ["Central Delhi address", "GST-ready package", "Trusted docs"],
    description:
      "A central Delhi virtual office solution for teams that want compliance readiness and a stronger business address.",
    rating: 4.8,
    isFeatured: true,
    createdAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "spc_011",
    name: "Signature Address Madhapur",
    slug: "signature-address-madhapur",
    vertical: "virtual-office",
    brand: "Awfis",
    city: "hyderabad",
    location: "madhapur",
    address: "Madhapur, Hyderabad",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 2199,
    spaceTypes: ["Registration Ready", "Premium Support"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "Registration Ready", price: 2199, unit: "/month" },
      { name: "Premium Support", price: 3599, unit: "/month" },
    ],
    amenities: ["Business Address", "Mail Alerts", "Documentation Support"],
    highlights: ["Madhapur business address", "Founder-friendly setup", "Documentation support"],
    description:
      "A documentation-ready virtual office product for founders and distributed teams in Hyderabad.",
    rating: 4.6,
    isFeatured: true,
    createdAt: "2026-03-07T09:10:00.000Z",
  },
  {
    id: "spc_012",
    name: "Harbor Suites Nariman Point",
    slug: "harbor-suites-nariman-point",
    vertical: "office-space",
    brand: "Awfis",
    city: "mumbai",
    location: "nariman-point",
    address: "Nariman Point, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 145000,
    spaceTypes: ["Executive Suite", "Private Wing"],
    teamSizes: ["21-50", "50+"],
    plans: [
      { name: "Executive Suite", price: 145000, unit: "/month" },
      { name: "Private Wing", price: 380000, unit: "/month" },
    ],
    amenities: ["Concierge", "Board Rooms", "Reception", "Parking"],
    highlights: ["South Mumbai prestige", "Executive hospitality", "Private-wing option"],
    description:
      "A polished South Mumbai office option for leadership teams that want premium client-facing infrastructure.",
    rating: 4.9,
    isFeatured: true,
    createdAt: "2026-03-09T11:00:00.000Z",
  },
  {
    id: "spc_013",
    name: "Riverfront Work Hub Lucknow",
    slug: "riverfront-work-hub-lucknow",
    vertical: "coworking",
    brand: "Awfis",
    city: "lucknow",
    location: "gomti-nagar",
    address: "Gomti Nagar, Lucknow",
    images: [
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 6499,
    spaceTypes: ["Hot Desk", "Dedicated Desk"],
    teamSizes: ["1-5", "6-20"],
    plans: [{ name: "Hot Desk", price: 6499, unit: "/seat/month" }],
    amenities: ["WiFi", "Meeting Rooms", "Cafeteria"],
    highlights: ["Central Lucknow", "Flexible plans"],
    description: "Coworking in Lucknow for growing teams.",
    rating: 4.5,
    isFeatured: false,
    createdAt: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "spc_014",
    name: "Central Square Indore",
    slug: "central-square-indore",
    vertical: "coworking",
    brand: "Smartworks",
    city: "indore",
    location: "vijay-nagar",
    address: "Vijay Nagar, Indore",
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 5999,
    spaceTypes: ["Hot Desk", "Private Cabin"],
    teamSizes: ["1-5", "6-20"],
    plans: [{ name: "Hot Desk", price: 5999, unit: "/seat/month" }],
    amenities: ["WiFi", "Parking", "Pantry"],
    highlights: ["Vijay Nagar", "Startup friendly"],
    description: "Premium coworking in Indore.",
    rating: 4.6,
    isFeatured: false,
    createdAt: "2026-03-11T10:00:00.000Z",
  },
  {
    id: "spc_015",
    name: "Sabarmati Studios Ahmedabad",
    slug: "sabarmati-studios-ahmedabad",
    vertical: "coworking",
    brand: "91Springboard",
    city: "ahmedabad",
    location: "sg-highway",
    address: "SG Highway, Ahmedabad",
    images: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 6799,
    spaceTypes: ["Hot Desk", "Team Cabin"],
    teamSizes: ["1-5", "6-20"],
    plans: [{ name: "Hot Desk", price: 6799, unit: "/seat/month" }],
    amenities: ["WiFi", "Meeting Rooms", "Cafeteria"],
    highlights: ["SG Highway", "Scale-ready"],
    description: "Coworking on Ahmedabad’s business corridor.",
    rating: 4.7,
    isFeatured: false,
    createdAt: "2026-03-12T10:00:00.000Z",
  },
  {
    id: "spc_016",
    name: "Gridline Koramangala",
    slug: "gridline-koramangala",
    vertical: "coworking",
    brand: "Awfis",
    city: "bangalore",
    location: "koramangala",
    address: "Koramangala 5th Block, Bangalore",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 8499,
    spaceTypes: ["Hot Desk", "Dedicated Desk", "Private Cabin"],
    teamSizes: ["1-5", "6-20"],
    plans: [
      { name: "Hot Desk", price: 8499, unit: "/seat/month" },
      { name: "Dedicated Desk", price: 11999, unit: "/seat/month" },
    ],
    amenities: ["High-Speed WiFi", "Meeting Rooms", "Cafeteria", "Parking"],
    highlights: ["Koramangala hub", "Metro access", "Scale-friendly"],
    description: "Flexible coworking in Koramangala for startups and product teams.",
    rating: 4.7,
    isFeatured: true,
    createdAt: "2026-03-14T10:00:00.000Z",
  },
  {
    id: "spc_clv_001",
    name: "UrbanNest DLF Phase 3 Coliving",
    slug: "urbannest-dlf-phase-3-coliving",
    vertical: "coliving",
    brand: "UrbanNest",
    city: "gurgaon",
    location: "dlf-phase-3",
    address: "DLF Phase 3, Gurugram",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 14999,
    spaceTypes: ["Private room", "Twin sharing"],
    teamSizes: ["1", "2"],
    plans: [
      { name: "Twin sharing", price: 14999, unit: "/bed/month" },
      { name: "Private room", price: 24999, unit: "/month" },
    ],
    amenities: ["WiFi", "Housekeeping", "Power backup", "Meals"],
    highlights: ["Near Cyber City", "Managed coliving", "All-inclusive rent"],
    description:
      "Premium coliving and PG-style rooms in DLF Phase 3 with meals, WiFi, and weekly housekeeping included.",
    rating: 4.6,
    isFeatured: true,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "spc_clv_002",
    name: "Koramangala Commons Coliving",
    slug: "koramangala-commons-coliving",
    vertical: "coliving",
    brand: "Commons",
    city: "bangalore",
    location: "koramangala",
    address: "Koramangala 5th Block, Bangalore",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 12999,
    spaceTypes: ["Studio room", "Double sharing"],
    teamSizes: ["1", "2"],
    plans: [
      { name: "Double sharing", price: 12999, unit: "/bed/month" },
      { name: "Studio", price: 21999, unit: "/month" },
    ],
    amenities: ["WiFi", "Lounge", "Laundry", "CCTV"],
    highlights: ["Startup neighbourhood", "Flexible lock-in", "Community events"],
    description:
      "Coliving near Koramangala’s startup corridor — ideal for founders and working professionals who want a turnkey room.",
    rating: 4.7,
    isFeatured: true,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "spc_clv_003",
    name: "Bandra Living Coliving",
    slug: "bandra-living-coliving",
    vertical: "coliving",
    brand: "Bandra Living",
    city: "mumbai",
    location: "bandra",
    address: "Bandra West, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 18999,
    spaceTypes: ["Private room", "Triple sharing"],
    teamSizes: ["1", "2", "3"],
    plans: [
      { name: "Triple sharing", price: 18999, unit: "/bed/month" },
      { name: "Private room", price: 32999, unit: "/month" },
    ],
    amenities: ["WiFi", "AC", "Meals", "Housekeeping"],
    highlights: ["Linking Road access", "Premium fit-out", "PG-style meals"],
    description:
      "High-trust coliving and PG rooms in Bandra with AC, meals, and daily housekeeping for busy professionals.",
    rating: 4.8,
    isFeatured: true,
    createdAt: "2026-04-03T10:00:00.000Z",
  },
  {
    id: "spc_clv_004",
    name: "Connaught Coliving House",
    slug: "connaught-coliving-house",
    vertical: "coliving",
    brand: "CityStay",
    city: "delhi",
    location: "connaught-place",
    address: "Connaught Place, New Delhi",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 15999,
    spaceTypes: ["Single room", "Double sharing"],
    teamSizes: ["1", "2"],
    plans: [
      { name: "Double sharing", price: 15999, unit: "/bed/month" },
      { name: "Single room", price: 23999, unit: "/month" },
    ],
    amenities: ["WiFi", "Security", "Meals", "Laundry"],
    highlights: ["Central Delhi", "Metro access", "Managed PG"],
    description:
      "Central Delhi coliving with metro access, security, and meal-inclusive plans for students and young professionals.",
    rating: 4.5,
    isFeatured: false,
    createdAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: "spc_clv_005",
    name: "Sector 62 Noida PG & Coliving",
    slug: "sector-62-noida-pg-coliving",
    vertical: "coliving",
    brand: "Staywise",
    city: "noida",
    location: "sector-62",
    address: "Sector 62, Noida",
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 9999,
    spaceTypes: ["PG triple", "Coliving private"],
    teamSizes: ["1", "2", "3"],
    plans: [
      { name: "PG triple", price: 9999, unit: "/bed/month" },
      { name: "Private room", price: 16999, unit: "/month" },
    ],
    amenities: ["WiFi", "Parking", "Meals", "Housekeeping"],
    highlights: ["Near IT corridor", "Student friendly", "Transparent pricing"],
    description:
      "Affordable PG and coliving near Noida’s IT corridor with meals, WiFi, and structured house rules.",
    rating: 4.4,
    isFeatured: false,
    createdAt: "2026-04-05T10:00:00.000Z",
  },
  {
    id: "spc_clv_006",
    name: "Koregaon Park Student Hub",
    slug: "koregaon-park-student-hub",
    vertical: "coliving",
    brand: "Student Hub",
    city: "pune",
    location: "koregaon-park",
    address: "Koregaon Park, Pune",
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 10999,
    spaceTypes: ["Twin PG", "Coliving suite"],
    teamSizes: ["1", "2"],
    plans: [
      { name: "Twin PG", price: 10999, unit: "/bed/month" },
      { name: "Suite", price: 19999, unit: "/month" },
    ],
    amenities: ["WiFi", "Meals", "Study lounge", "Laundry"],
    highlights: ["Near FC Road", "Young community", "Flexible tenure"],
    description:
      "Student-friendly PG and coliving in Koregaon Park with study lounge and meal plans designed for campus life.",
    rating: 4.5,
    isFeatured: false,
    createdAt: "2026-04-06T10:00:00.000Z",
  },
  {
    id: "spc_clv_007",
    name: "Gachibowli Nest Coliving",
    slug: "gachibowli-nest-coliving",
    vertical: "coliving",
    brand: "Nest Coliving",
    city: "hyderabad",
    location: "gachibowli",
    address: "Gachibowli, Hyderabad",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    price: 11999,
    spaceTypes: ["Private room", "Quad sharing"],
    teamSizes: ["1", "2", "3", "4"],
    plans: [
      { name: "Quad sharing", price: 11999, unit: "/bed/month" },
      { name: "Private room", price: 18999, unit: "/month" },
    ],
    amenities: ["WiFi", "Gym", "Meals", "Housekeeping"],
    highlights: ["Tech park commute", "Gym access", "All-inclusive"],
    description:
      "Tech-corridor coliving in Gachibowli with gym, meals, and quick access to HITEC City and financial district offices.",
    rating: 4.6,
    isFeatured: true,
    createdAt: "2026-04-07T10:00:00.000Z",
  },
];

/** Homepage and search: only these cities, in display order (two-column grid). */
const seedCities: City[] = [
  {
    id: "city_gurgaon",
    name: "Gurugram",
    slug: "gurgaon",
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=200&q=80",
    tagline: "Premium office clusters close to enterprise demand.",
    spaceCount: 188,
  },
  {
    id: "city_mumbai",
    name: "Mumbai",
    slug: "mumbai",
    image:
      "https://images.unsplash.com/photo-1529253355930-6d5ed022202d?auto=format&fit=crop&w=200&q=80",
    tagline: "Financial capital workspace supply.",
    spaceCount: 210,
  },
  {
    id: "city_bangalore",
    name: "Bangalore",
    slug: "bangalore",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=200&q=80",
    tagline: "Design-led workspaces for startups and SaaS.",
    spaceCount: 236,
  },
  {
    id: "city_hyderabad",
    name: "Hyderabad",
    slug: "hyderabad",
    image:
      "https://images.unsplash.com/photo-1542317854-0d6fc7b74d6b?auto=format&fit=crop&w=200&q=80",
    tagline: "HITEC City and beyond.",
    spaceCount: 97,
  },
  {
    id: "city_chennai",
    name: "Chennai",
    slug: "chennai",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7c742ca?auto=format&fit=crop&w=200&q=80",
    tagline: "Calm, premium environments.",
    spaceCount: 76,
  },
  {
    id: "city_lucknow",
    name: "Lucknow",
    slug: "lucknow",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&q=80",
    tagline: "Growing workspace market.",
    spaceCount: 24,
  },
  {
    id: "city_pune",
    name: "Pune",
    slug: "pune",
    image:
      "https://images.unsplash.com/photo-1596178065887-93e4f2a6a6b5?auto=format&fit=crop&w=200&q=80",
    tagline: "Technology and services teams.",
    spaceCount: 121,
  },
  {
    id: "city_noida",
    name: "Noida",
    slug: "noida",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=200&q=80",
    tagline: "Tech corridor inventory.",
    spaceCount: 114,
  },
  {
    id: "city_delhi",
    name: "Delhi",
    slug: "delhi",
    image:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=200&q=80",
    tagline: "Landmark CBD addresses.",
    spaceCount: 142,
  },
  {
    id: "city_indore",
    name: "Indore",
    slug: "indore",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=200&q=80",
    tagline: "Central India hub.",
    spaceCount: 18,
  },
  {
    id: "city_ahmedabad",
    name: "Ahmedabad",
    slug: "ahmedabad",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=200&q=80",
    tagline: "Business corridor growth.",
    spaceCount: 22,
  },
];

const trustMetrics: TrustMetric[] = [
  { id: "metric_001", value: 1000, suffix: "+", label: "spaces across premium districts" },
  { id: "metric_002", value: 11, suffix: "+", label: "top cities covered" },
  { id: "metric_003", value: 250, suffix: "+", label: "startup and enterprise clients served" },
];

/** Coworking operators for homepage + vertical pages; order is intentionally shuffled for display variety. */
const brands: Brand[] = [
  {
    id: "brand_001",
    name: "Bhive",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/71d43e23a7ae6ebb391a15e699d40b480f477768.webp",
    url: "/brand/bhive-workspace",
  },
  {
    id: "brand_002",
    name: "Innov8",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/c4c17f01171e0494e577509eb6463d46e98cba5a.webp",
    url: "/brand/innov8",
  },
  {
    id: "brand_003",
    name: "WeWork",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/3a4f25ddb65a1444dc67dc4b0a2b60d6e7648ad0.webp",
    url: "/brand/wework",
  },
  {
    id: "brand_004",
    name: "Awfis",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/418876d12cfd6d663a344bed1ef0b62d36bb38f1.webp",
    url: "/brand/awfis",
  },
  {
    id: "brand_005",
    name: "Indiqube",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/96d6ad27f63a3fe44e58b3988faf6aa3d35ec7ce.webp",
    url: "/brand/indiqube",
  },
  {
    id: "brand_006",
    name: "91Springboard",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/85bede6f564b721526057118f32551c01c4da373.webp",
    url: "/brand/91springboard",
  },
  {
    id: "brand_007",
    name: "InstaOffice",
    category: "Operator",
    image:
      "https://img.spacewallah.com/images/latest_images_2024/3e9de30708805d8e117d8b0914f479ca583a9595.webp",
    url: "/brand/instaoffice",
  },
];

const testimonials: Testimonial[] = [
  {
    id: "testimonial_001",
    name: "Rohan Mehta",
    role: "Founder",
    company: "NovaStack",
    quote:
      "SpaceWallah helped us shortlist our Gurgaon office in one afternoon. The quality filter was noticeably better than the marketplaces we had tried before.",
  },
  {
    id: "testimonial_002",
    name: "Shreya Iyer",
    role: "Operations Lead",
    company: "Kite Loop",
    quote:
      "The consultation flow was refreshingly clear. We compared premium options in Bangalore without wasting time on low-fit listings.",
  },
  {
    id: "testimonial_003",
    name: "Aditya Jain",
    role: "Admin Manager",
    company: "Northbeam Health",
    quote:
      "We needed a virtual office quickly and the team lined up credible options with pricing clarity from day one.",
  },
];

const differentiators: WhySpaceWallahItem[] = [
  {
    id: "why_001",
    title: "Verified spaces",
    description: "Only curated listings with reliable pricing, imagery, and quality filters make the cut.",
  },
  {
    id: "why_002",
    title: "Best price deals",
    description: "We guide teams toward commercially efficient options, not just the loudest brands.",
  },
  {
    id: "why_003",
    title: "Free consultation",
    description: "Talk to experts who understand city micro-markets, operator fit, and negotiation context.",
  },
  {
    id: "why_004",
    title: "Flexible options",
    description: "Coworking, private offices, and virtual offices in one decision flow for growing teams.",
  },
];

const howItWorks: HowItWorksStep[] = [
  {
    id: "step_001",
    title: "Search your location",
    description: "Start with the city or micro-market where your team wants to operate.",
    imageSrc:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "step_002",
    title: "Compare options",
    description: "Review premium spaces side by side across price, amenities, and flexibility.",
    imageSrc:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "step_003",
    title: "Get the best deal",
    description: "Submit your requirement and our team helps you shortlist and negotiate.",
    imageSrc:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
];

const searchFieldOptions = {
  teamSizes: [
    { label: "1-5 people", value: "1-5" },
    { label: "6-20 people", value: "6-20" },
    { label: "21-50 people", value: "21-50" },
    { label: "50+ people", value: "50+" },
  ],
  budgets: [
    { label: "Under Rs. 10k / seat", value: "under-10k" },
    { label: "Rs. 10k - Rs. 20k / seat", value: "10k-20k" },
    { label: "Rs. 20k - Rs. 40k / seat", value: "20k-40k" },
    { label: "Custom enterprise budget", value: "custom" },
  ],
} satisfies Pick<HomepageData["searchOptions"], "teamSizes" | "budgets">;

const seedLeads: Lead[] = [
  {
    id: "lead_001",
    name: "Aarav Gupta",
    phone: "+91 9876543210",
    email: "aarav@northstar.in",
    requirement: "15 seats for a product team starting next month",
    spaceId: "spc_001",
    city: "mumbai",
    teamSize: "6-20",
    budget: "10k-20k",
    source: "listing",
    createdAt: "2026-03-03T12:00:00.000Z",
  },
];

let spaces = [...seedSpaces];
let leads = [...seedLeads];

function matchesBudget(space: Space, budget?: string) {
  if (!budget) return true;

  switch (budget) {
    case "under-10k":
      return space.price < 10000;
    case "10k-20k":
      return space.price >= 10000 && space.price <= 20000;
    case "20k-40k":
      return space.price > 20000 && space.price <= 40000;
    case "custom":
      return space.price > 40000;
    default:
      return true;
  }
}

export function listSpaces(filters?: {
  vertical?: SpaceVertical;
  city?: string;
  location?: string;
  featured?: boolean;
  brand?: string;
  teamSize?: string;
  spaceType?: string;
  amenity?: string;
  budget?: string;
}) {
  return spaces.filter((space) => {
    if (filters?.vertical && space.vertical !== filters.vertical) return false;
    if (filters?.city && space.city !== filters.city) return false;
    if (filters?.location && space.location !== filters.location) return false;
    if (filters?.featured !== undefined && space.isFeatured !== filters.featured) {
      return false;
    }
    if (filters?.brand && space.brand !== filters.brand) return false;
    if (filters?.teamSize && !space.teamSizes.includes(filters.teamSize)) return false;
    if (filters?.spaceType && !space.spaceTypes.includes(filters.spaceType)) return false;
    if (filters?.amenity && !space.amenities.includes(filters.amenity)) return false;
    if (!matchesBudget(space, filters?.budget)) return false;
    return true;
  });
}

export function listCities() {
  return seedCities;
}

export function listCitiesByVertical(vertical: SpaceVertical) {
  const cityCounts = new Map<string, number>();

  listSpaces({ vertical }).forEach((space) => {
    cityCounts.set(space.city, (cityCounts.get(space.city) ?? 0) + 1);
  });

  return seedCities
    .filter((city) => cityCounts.has(city.slug))
    .map((city) => ({
      ...city,
      spaceCount: cityCounts.get(city.slug) ?? city.spaceCount,
    }));
}

export function listTrustMetrics() {
  return trustMetrics;
}

export function listBrands() {
  return brands;
}

export function listTestimonials() {
  return testimonials;
}

export function listDifferentiators() {
  return differentiators;
}

export function listHowItWorks() {
  return howItWorks;
}

export function getSearchOptions(): HomepageData["searchOptions"] {
  return {
    locations: listHomepageCitiesFromAvailable().map((city) => ({
      label: city.name,
      value: city.slug,
    })),
    ...searchFieldOptions,
  };
}

function listHomepageCitiesWithCounts(): City[] {
  return listHomepageCitiesFromAvailable().map((city) => ({
    ...city,
    spaceCount: listSpaces({ vertical: "coworking", city: city.slug }).length,
  }));
}

export function getHomepageData(): HomepageData {
  const homepageCities = listHomepageCitiesWithCounts();
  const cityCount = homepageCities.length;

  return {
    trustMetrics: listTrustMetrics().map((metric) =>
      metric.id === "metric_002" ? { ...metric, value: cityCount } : metric,
    ),
    cities: homepageCities,
    featuredSpaces: listSpaces({ featured: true }).slice(0, 8),
    brands: listBrands(),
    testimonials: listTestimonials(),
    differentiators: listDifferentiators(),
    howItWorks: listHowItWorks(),
    searchOptions: getSearchOptions(),
  };
}

function buildCityPageTitle(vertical: SpaceVertical, cityName: string) {
  if (vertical === "coworking") {
    return `Coworking Spaces in ${cityName}`;
  }

  if (vertical === "virtual-office") {
    return `Virtual Offices in ${cityName}`;
  }

  if (vertical === "coliving") {
    return `Coliving Space in ${cityName}`;
  }

  return `Managed Office in ${cityName}`;
}

function slugToTitle(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildCityPageSubtitle(vertical: SpaceVertical, cityName: string) {
  if (vertical === "coworking") {
    return `Flexible desks, private cabins, and managed coworking options across ${cityName}.`;
  }

  if (vertical === "virtual-office") {
    return `GST-ready business addresses, documentation support, and trusted providers in ${cityName}.`;
  }

  if (vertical === "coliving") {
    return `Furnished coliving homes and PG rooms with meals, WiFi, and managed housekeeping across ${cityName}.`;
  }

  return `Premium managed offices and enterprise-ready workspaces for growing teams in ${cityName}.`;
}

function buildSeoSection(vertical: SpaceVertical, cityName: string, totalSpaces: number) {
  if (vertical === "coworking") {
    return {
      title: `Best coworking spaces in ${cityName}`,
      paragraphs: [
        `${cityName} has become one of the most important workspace markets for startups, agencies, consulting teams, and distributed operators who want flexibility without compromising on quality. The best coworking spaces in ${cityName} combine strong infrastructure, hospitality-grade common areas, and more thoughtful micro-locations that keep teams close to talent, transport, and client movement. On SpaceWallah, the goal is not to overwhelm people with noisy marketplace inventory. Instead, we help visitors discover a more curated view of coworking supply so teams can compare fit, pricing, and experience with more confidence.`,
        `When businesses look for coworking spaces in ${cityName}, the most important decision is rarely just the headline price. Teams usually care about whether a space supports the way they actually work. That includes access to meeting rooms, community energy, visitor experience, move-in readiness, and whether the operator can support growth from a few seats to a larger team cluster. A founder-led company may prefer a vibrant floor with networking and event access, while a larger operating team may want stronger privacy, managed cabins, and a quieter workday rhythm. This is why curated discovery matters more than endless listing volume.`,
        `SpaceWallah currently highlights ${totalSpaces}+ premium and emerging coworking options in ${cityName}, with attention to location quality, amenities, and operator credibility. We also make it easier to browse by budget, team size, space type, and brand so the shortlist process feels faster and more intentional. Instead of navigating cluttered results, teams can focus on a smaller set of high-fit options and move toward a consultation when they are ready.`,
        `For companies evaluating coworking in ${cityName}, the strongest outcome usually comes from comparing spaces in context. A centrally located premium floor might improve talent experience and client perception, while a more cost-efficient district may unlock better flexibility for expansion. The right answer depends on headcount, budget, brand expectations, and operating style. That is why SpaceWallah is designed as a lead-generation and consultation platform rather than a booking engine. We help teams start with clarity, shortlist faster, and move toward the right workspace decision with less friction.`,
      ],
    };
  }

  if (vertical === "virtual-office") {
    return {
      title: `Benefits of virtual office in ${cityName}`,
      paragraphs: [
        `A virtual office in ${cityName} gives companies a faster way to establish business presence without committing to a physical office lease before they need one. For startups, remote-first teams, consultants, and expanding companies, the right virtual office can unlock a professional address, better compliance support, and smoother documentation workflows. The value is not only about cost efficiency. It is also about credibility, legal readiness, and choosing a provider that feels reliable when it matters most.`,
        `Businesses exploring virtual office services in ${cityName} are often looking for support around GST registration, company registration, business correspondence, and mail handling. Those requirements sound simple on paper, but the quality of the provider makes a real difference. Documentation standards, response time, address quality, and support structure all influence whether the process feels easy or frustrating. A better platform experience should help users compare providers with more clarity instead of burying the important details behind vague listings.`,
        `SpaceWallah surfaces trusted virtual office options in ${cityName} and organizes them around the things decision-makers usually care about most: address quality, documentation support, service scope, and pricing fit. With ${totalSpaces}+ relevant options in the current city dataset, users can filter by amenities, service type, and brand to identify stronger matches faster. This creates a more professional journey for founders and operations teams that want to move with confidence.`,
        `The benefit of choosing the right virtual office in ${cityName} goes beyond paperwork. A better address can improve first impressions, simplify official communication, and support a more credible business setup while the company scales. The wrong provider can create delays and uncertainty. That is why SpaceWallah takes a more curated, advisory-led approach to discovery. Instead of acting like a generic directory, the platform is built to help users understand their options, submit their requirement, and move toward a provider that fits their business needs with more trust.`,
      ],
    };
  }

  if (vertical === "coliving") {
    return {
      title: `Best coliving space in ${cityName}`,
      paragraphs: [
        `${cityName} has strong demand for coliving and PG inventory from students, early-career professionals, and remote workers who want furnished rooms without long furniture procurement cycles. The best coliving spaces in ${cityName} combine predictable monthly pricing, security, housekeeping, and meal options that reduce day-to-day operational friction compared with traditional rentals.`,
        `When people search for PG in ${cityName}, the decision is rarely only rent. House rules, meal quality, WiFi reliability, AC availability, visitor policy, and proximity to metro or office hubs all influence fit. Coliving adds a more hospitality-led layer: community programming, shared lounges, and clearer service standards. SpaceWallah helps visitors compare these dimensions with a more curated lens instead of noisy, inconsistent listings.`,
        `SpaceWallah currently highlights ${totalSpaces}+ coliving and PG-style options in ${cityName} with filters for budget, room type, amenities, and brand where available. The objective is faster shortlisting: fewer low-fit options, clearer monthly context, and a smoother path to expert consultation when someone wants help validating availability and move-in timelines.`,
        `Choosing coliving or PG in ${cityName} should feel intentional. Some renters prioritize lowest monthly outlay, while others prioritize shorter commute, premium security, or private-room comfort. SpaceWallah is built as a discovery and lead platform: explore curated inventory, understand tradeoffs, and move toward a conversation that helps you pick a safer, better-fit home base.`,
      ],
    };
  }

  return {
    title: `Premium managed offices in ${cityName}`,
    paragraphs: [
      `${cityName} continues to attract growth-stage companies, enterprise teams, and operators who need premium managed office environments beyond a simple short-term seat solution. Demand for managed office in ${cityName} is shaped by teams that care about brand presence, staff experience, move-in quality, and the ability to scale without rebuilding their workplace strategy every few months. The best managed offices are not just about square footage. They are about operational confidence, location quality, and the kind of environment that supports leadership, hiring, and client interactions.`,
      `For many businesses, the challenge is not finding managed office in ${cityName}; it is identifying which options are genuinely worth considering. Listings often blur together, even though the differences in service level, fit-out readiness, reception quality, board-room access, and building profile can be significant. A premium managed office search should feel more like strategic evaluation than casual browsing. Teams need to compare inventory in a way that respects budget while also accounting for future growth, internal culture, and the expectations that come with a client-facing workplace.`,
      `SpaceWallah helps structure that evaluation by surfacing curated managed office inventory in ${cityName} and presenting it through cleaner filters, clearer location context, and stronger quality signals. With ${totalSpaces}+ relevant city listings available in the current dataset, teams can narrow the shortlist by budget, amenity profile, brand, and office type instead of relying on broad, cluttered search experiences. This makes it easier for founders, admin teams, and operations leaders to quickly move from awareness to a more intentional shortlist.`,
      `The right managed office in ${cityName} should support where the business is going, not just where it is today. Some teams need fully managed space that reduces operational lift, while others need premium private suites with room to expand. In both cases, the search experience should reduce friction rather than create it. That is why SpaceWallah is designed around lead generation and consultation. We help users explore premium managed office in ${cityName}, understand the tradeoffs between options, and move toward a conversation that leads to a better workplace decision.`,
    ],
  };
}

function buildFaqs(vertical: SpaceVertical, cityName: string) {
  if (vertical === "coworking") {
    return [
      {
        id: `${vertical}-${cityName}-faq-1`,
        question: `What is the average price of coworking spaces in ${cityName}?`,
        answer:
          `Pricing depends on micro-market, operator, and space type, but teams usually compare coworking in ${cityName} by seat cost, cabin pricing, and amenity quality rather than headline rent alone.`,
      },
      {
        id: `${vertical}-${cityName}-faq-2`,
        question: `Which locations are best for coworking in ${cityName}?`,
        answer:
          `The best location depends on hiring, commute, and client access. Premium business districts usually offer stronger operator density and a better mix of flexible workspace options.`,
      },
      {
        id: `${vertical}-${cityName}-faq-3`,
        question: `Can startups get flexible coworking plans in ${cityName}?`,
        answer:
          `Yes. Many coworking operators in ${cityName} support hot desks, dedicated desks, team cabins, and managed private areas for growing startups and agile teams.`,
      },
      {
        id: `${vertical}-${cityName}-faq-4`,
        question: `How can SpaceWallah help me find coworking in ${cityName}?`,
        answer:
          `SpaceWallah helps you compare curated options, filter by budget and team size, and submit a requirement for a faster, higher-fit shortlist.`,
      },
    ];
  }

  if (vertical === "virtual-office") {
    return [
      {
        id: `${vertical}-${cityName}-faq-1`,
        question: `Can I get GST registration support with a virtual office in ${cityName}?`,
        answer:
          `Many providers offer GST-ready documentation, but the level of support varies. Comparing providers carefully helps avoid delays and paperwork issues.`,
      },
      {
        id: `${vertical}-${cityName}-faq-2`,
        question: `What services are included in a virtual office in ${cityName}?`,
        answer:
          `Typical services include a business address, documentation support, and mail handling, with additional service tiers for premium support and reception coverage.`,
      },
      {
        id: `${vertical}-${cityName}-faq-3`,
        question: `Is a virtual office in ${cityName} suitable for startups?`,
        answer:
          `Yes. Virtual offices are especially useful for startups and remote teams that want compliance support and a more credible business presence without taking a full office lease.`,
      },
      {
        id: `${vertical}-${cityName}-faq-4`,
        question: `How do I choose the right virtual office provider in ${cityName}?`,
        answer:
          `Focus on documentation standards, address quality, provider credibility, and service support rather than price alone.`,
      },
    ];
  }

  if (vertical === "coliving") {
    return [
      {
        id: `${vertical}-${cityName}-faq-1`,
        question: `What is the difference between PG and coliving in ${cityName}?`,
        answer:
          `PG options are often meal-first, room-sharing setups with simpler amenities, while coliving usually adds more hospitality-led services, community programming, and furnished private-room upgrades.`,
      },
      {
        id: `${vertical}-${cityName}-faq-2`,
        question: `What is typically included in monthly coliving rent in ${cityName}?`,
        answer:
          `Most listings include WiFi, housekeeping, and security; many also bundle meals or offer meal plans as add-ons. Always confirm lock-in, deposit, and visitor policy before booking.`,
      },
      {
        id: `${vertical}-${cityName}-faq-3`,
        question: `Which areas in ${cityName} are best for students and working professionals?`,
        answer:
          `The best pocket depends on commute, campus or office proximity, and budget. Premium micro-markets usually offer stronger building security and faster metro access.`,
      },
      {
        id: `${vertical}-${cityName}-faq-4`,
        question: `How can SpaceWallah help me find coliving or PG in ${cityName}?`,
        answer:
          `SpaceWallah helps you compare curated options, filter by budget and amenities, and submit a requirement for a faster shortlist with clearer monthly pricing context.`,
      },
    ];
  }

  return [
    {
      id: `${vertical}-${cityName}-faq-1`,
      question: `What types of managed office are available in ${cityName}?`,
      answer:
        `Businesses can typically choose between managed offices, private suites, enterprise floors, and more customizable office formats depending on scale and operational needs.`,
    },
    {
      id: `${vertical}-${cityName}-faq-2`,
      question: `How do companies compare premium managed offices in ${cityName}?`,
      answer:
        `The strongest comparisons usually include building quality, reception experience, board-room access, office services, and how well the space supports future growth.`,
    },
    {
      id: `${vertical}-${cityName}-faq-3`,
      question: `Are managed offices available for growing teams in ${cityName}?`,
      answer:
        `Yes. Managed office inventory is often the best fit for teams that want faster occupancy, lower operational effort, and a more polished workplace experience.`,
    },
    {
      id: `${vertical}-${cityName}-faq-4`,
      question: `How can SpaceWallah help with managed office in ${cityName}?`,
      answer:
        `SpaceWallah helps teams filter curated managed office options, explore popular micro-markets, and submit a requirement for expert consultation.`,
    },
  ];
}

export const getCityPageData = cache(function getCityPageData(
  vertical: SpaceVertical,
  citySlug: string,
  filters: CityPageFilters = EMPTY_CITY_PAGE_FILTERS,
): CityPageData | null {
  const routeSlug =
    vertical === "coworking" ||
    vertical === "virtual-office" ||
    vertical === "office-space" ||
    vertical === "coliving"
      ? canonicalCoworkingCitySlug(citySlug.trim())
      : citySlug.trim();

  let city: City | null =
    listCitiesByVertical(vertical).find((item) => item.slug === routeSlug) ?? null;

  if (!city) {
    const fromSeed = seedCities.find((item) => item.slug === routeSlug);
    if (fromSeed) {
      city = {
        ...fromSeed,
        spaceCount: listSpaces({ vertical, city: routeSlug }).length,
      };
    }
  }

  if (
    !city &&
    (vertical === "coworking" ||
      vertical === "virtual-office" ||
      vertical === "office-space" ||
      vertical === "coliving")
  ) {
    const fromCatalog = listHomepageCitiesFromAvailable(vertical).find((item) => item.slug === routeSlug);
    if (fromCatalog) {
      city = {
        ...fromCatalog,
        spaceCount: listSpaces({ vertical, city: routeSlug }).length,
      };
    }
  }

  if (!city) {
    return null;
  }

  const citySpaces = listSpaces({ vertical, city: routeSlug });
  const filteredSpaces = listSpaces({ vertical, city: routeSlug, ...filters });
  const cityName = city.name;
  const allAmenities = Array.from(new Set(citySpaces.flatMap((space) => space.amenities)));
  const allBrands = Array.from(new Set(citySpaces.map((space) => space.brand)));
  const allSpaceTypes = Array.from(new Set(citySpaces.flatMap((space) => space.spaceTypes)));
  const allTeamSizes = Array.from(new Set(citySpaces.flatMap((space) => space.teamSizes)));
  const locationCounts = citySpaces.reduce<Map<string, number>>((acc, space) => {
    acc.set(space.location, (acc.get(space.location) ?? 0) + 1);
    return acc;
  }, new Map());

  const popularLocations = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([location, count]) => ({
      name: slugToTitle(location),
      slug: location,
      spaceCount: count,
    }));

  return {
    vertical,
    city,
    catalogCityId:
      vertical === "coworking" ||
      vertical === "office-space" ||
      vertical === "virtual-office" ||
      vertical === "coliving"
        ? getCatalogCityIdBySlug(routeSlug) ?? undefined
        : undefined,
    title: buildCityPageTitle(vertical, cityName),
    subtitle: buildCityPageSubtitle(vertical, cityName),
    totalSpaces: filteredSpaces.length,
    spaces: filteredSpaces,
    filters: {
      budgets: [
        { label: "All budgets", value: "" },
        { label: "Under Rs. 10k", value: "under-10k" },
        { label: "Rs. 10k - Rs. 20k", value: "10k-20k" },
        { label: "Rs. 20k - Rs. 40k", value: "20k-40k" },
        { label: "Custom / enterprise", value: "custom" },
      ],
      teamSizes: [{ label: "All team sizes", value: "" }].concat(
        allTeamSizes.map((item) => ({ label: item, value: item })),
      ),
      spaceTypes: [{ label: "All space types", value: "" }].concat(
        allSpaceTypes.map((item) => ({ label: item, value: item })),
      ),
      amenities: [{ label: "All amenities", value: "" }].concat(
        allAmenities.map((item) => ({ label: item, value: item })),
      ),
      brands: [{ label: "All brands", value: "" }].concat(
        allBrands.map((item) => ({ label: item, value: item })),
      ),
    },
    popularLocations,
    seoSection: buildSeoSection(vertical, cityName, citySpaces.length),
    faqs: buildFaqs(vertical, cityName),
    leadCta: {
      title:
        vertical === "virtual-office"
          ? "Get a GST-ready address without the guesswork"
          : vertical === "coliving"
            ? "Move into a home that actually fits"
            : "Get a shortlist built for your team",
      description:
        vertical === "virtual-office"
          ? `Compare trusted virtual office providers in ${cityName} with clear documentation support. Tell us your need and we will recommend the right plan.`
          : vertical === "coliving"
            ? `Share your budget, room preference, and move-in date. SpaceWallah advisors shortlist verified coliving and PG options in ${cityName} you can visit with confidence.`
            : `Share your team size, budget, and preferred areas. Our advisors compare verified coworking options in ${cityName} and send a clear shortlist you can act on.`,
      ctaLabel:
        vertical === "virtual-office"
          ? "Get my virtual office shortlist"
          : vertical === "coliving"
            ? "Get my free home shortlist"
            : "Get my free shortlist",
    },
  };
});

function buildLocationPageTitle(
  vertical: SpaceVertical,
  locationName: string,
  cityName: string,
) {
  if (vertical === "coworking") {
    return `Coworking Spaces in ${locationName}, ${cityName}`;
  }

  if (vertical === "virtual-office") {
    return `Virtual Office in ${locationName}, ${cityName}`;
  }

  if (vertical === "coliving") {
    return `Coliving Space in ${locationName}, ${cityName}`;
  }

  return `Managed Office in ${locationName}, ${cityName}`;
}

function buildLocationPageSubtitle(
  vertical: SpaceVertical,
  locationName: string,
  cityName: string,
) {
  if (vertical === "coworking") {
    return `Explore flexible desks, private cabins, and managed coworking options around ${locationName}, ${cityName}.`;
  }

  if (vertical === "virtual-office") {
    return `Compare compliance-ready virtual office providers with trusted documentation support near ${locationName}, ${cityName}.`;
  }

  if (vertical === "coliving") {
    return `Explore furnished coliving rooms and PG options with meals, WiFi, and security near ${locationName}, ${cityName}.`;
  }

  return `Discover premium managed offices and enterprise-ready workspaces near ${locationName}, ${cityName}.`;
}

function buildLocationInsights(
  vertical: SpaceVertical,
  locationName: string,
  cityName: string,
) {
  if (vertical === "coworking") {
    return {
      summary: `${locationName} is one of the most active business pockets in ${cityName}, ideal for teams that want fast commute, strong ecosystem energy, and quality coworking supply.`,
      nearby: [`${locationName} Metro`, `${cityName} CBD`, "Business towers"],
      notes: [
        "High density of startup and consulting teams",
        "Strong cafe, meeting, and after-work ecosystem",
        "Easy access for clients and distributed teams",
      ],
    };
  }

  if (vertical === "virtual-office") {
    return {
      summary: `${locationName} offers stronger address credibility in ${cityName}, making it a practical choice for businesses that need compliance support and professional presence.`,
      nearby: [`${locationName} Metro`, "Government service hubs", "Prime commercial blocks"],
      notes: [
        "Trusted address quality for official use",
        "Better provider support for GST and registration",
        "More options for mail and reception handling",
      ],
    };
  }

  if (vertical === "coliving") {
    return {
      summary: `${locationName} is a strong residential and commuter pocket in ${cityName} for coliving and PG seekers who want shorter travel time, better security, and predictable monthly costs.`,
      nearby: [`${locationName} Metro`, "Daily needs retail", "Office hubs"],
      notes: [
        "Higher density of furnished room inventory",
        "Better options for meals and housekeeping bundles",
        "Strong demand from students and early-career renters",
      ],
    };
  }

  return {
    summary: `${locationName} is a premium business district in ${cityName} with stronger office inventory for teams focused on growth, client visibility, and operational reliability.`,
    nearby: [`${locationName} Metro`, "Corporate parks", "Major arterial roads"],
    notes: [
      "High-quality managed office supply",
      "Better enterprise infrastructure and services",
      "Strong long-term occupancy potential",
    ],
  };
}

function buildLocationSeoSection(
  vertical: SpaceVertical,
  locationName: string,
  cityName: string,
  totalSpaces: number,
) {
  if (vertical === "coworking") {
    const third =
      totalSpaces > 0
        ? `With ${totalSpaces}+ relevant options in the current ${locationName} dataset, users can filter by budget, team size, amenities, and space type to move from browsing to decision quickly. This location-focused page is designed for hyper-local discovery, combining marketplace speed with a more premium and consultation-friendly workflow.`
        : `Live inventory for ${locationName} updates often. Use the consultation form below and our team can shortlist current options that match your budget, team size, and move-in timeline.`;
    return {
      title: `Best coworking spaces in ${locationName}, ${cityName}`,
      paragraphs: [
        `${locationName} has emerged as one of the strongest micro-markets in ${cityName} for teams that want a modern, flexible workspace setup without committing to a traditional long lease too early. Companies exploring coworking in ${locationName} typically prioritize easy commute, business visibility, and a better day-to-day work environment for founders, employees, and client meetings. The right coworking space here can improve team productivity while keeping occupancy decisions more agile.`,
        `When comparing coworking spaces in ${locationName}, most operators discover that pricing alone is not the best decision metric. Teams should also compare location quality, cabin flexibility, meeting room access, amenities, move-in readiness, and the service level of the operator. SpaceWallah helps simplify this process by surfacing curated options with clearer filters, so decision-makers can shortlist faster and avoid low-fit listings.`,
        third,
      ],
    };
  }

  if (vertical === "virtual-office") {
    return {
      title: `Benefits of virtual office in ${locationName}, ${cityName}`,
      paragraphs: [
        `A virtual office in ${locationName}, ${cityName} gives businesses a practical way to establish a professional address while staying lean on real-estate costs. For startups, remote-first teams, and expanding companies, choosing the right location can improve business credibility and simplify compliance tasks without adding operational complexity.`,
        `Companies usually evaluate virtual office options in ${locationName} for GST registration support, business address quality, documentation readiness, and mail handling services. The difference between providers can be meaningful, so clearer comparison is essential. SpaceWallah helps users evaluate options by service quality and support level, not just headline pricing.`,
        `This page highlights ${totalSpaces}+ location-specific options and supports quick filtering by budget, amenities, and service type. The objective is to help businesses make faster and safer decisions with better local context and stronger trust signals.`,
      ],
    };
  }

  if (vertical === "coliving") {
    return {
      title: `Best coliving space in ${locationName}, ${cityName}`,
      paragraphs: [
        `${locationName} is a practical micro-market in ${cityName} for renters who want furnished rooms, clearer monthly pricing, and faster move-in without coordinating furniture, utilities, and vendors independently. Coliving and PG operators in this pocket often compete on meal quality, security, WiFi reliability, and housekeeping discipline — details that matter more than a generic headline rent.`,
        `When comparing coliving in ${locationName}, it helps to validate lock-in, deposit structure, visitor policy, AC availability, and what is included in the monthly fee. PG seekers may prioritize meal frequency and curfew rules, while working professionals may prioritize quieter floors and private-room upgrades. SpaceWallah presents location-level inventory with filters that make these comparisons easier.`,
        `This page currently surfaces ${totalSpaces}+ relevant listings in ${locationName}. If you want faster confirmation on availability, use the consultation form and our team can help shortlist safer matches with stronger operator credibility.`,
      ],
    };
  }

  return {
    title: `Premium managed offices in ${locationName}, ${cityName}`,
    paragraphs: [
      `${locationName} is one of the most attractive business districts in ${cityName} for teams looking for premium managed offices, better connectivity, and stronger client-facing infrastructure. Businesses exploring managed office in this micro-market usually care about quality of building stock, managed services, and room to scale as operations expand.`,
      `Comparing managed offices in ${locationName} should include more than rent. Teams should evaluate service quality, reception experience, board-room access, parking, power reliability, and expansion flexibility. SpaceWallah helps structure this decision process through cleaner filters and more curated location-level inventory.`,
      `This location page currently surfaces ${totalSpaces}+ relevant options and is designed to support fast, high-intent shortlisting. By combining hyper-local discovery with consultation-led lead capture, businesses can move from exploration to action with greater confidence.`,
    ],
  };
}

function buildLocationFaqs(
  vertical: SpaceVertical,
  locationName: string,
  cityName: string,
) {
  if (vertical === "coworking") {
    return [
      {
        id: `${vertical}-${cityName}-${locationName}-faq-1`,
        question: `What are the best coworking spaces in ${locationName}, ${cityName}?`,
        answer:
          "The best option depends on your team size, budget, and required amenities. Start by comparing curated options with strong location access and service quality.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-2`,
        question: `What is the typical coworking price range in ${locationName}?`,
        answer:
          "Pricing varies by operator and plan type. Shared desks are usually lower cost, while cabins and managed suites are priced higher.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-3`,
        question: `Can small teams find flexible plans in ${locationName}?`,
        answer:
          "Yes. Most coworking operators support flexible seat-based and cabin plans for small and growing teams.",
      },
    ];
  }

  if (vertical === "virtual-office") {
    return [
      {
        id: `${vertical}-${cityName}-${locationName}-faq-1`,
        question: `Can I use a virtual office in ${locationName} for GST registration?`,
        answer:
          "Many providers support GST-ready documentation, but service quality varies. It is best to compare provider support before deciding.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-2`,
        question: `What services are usually included in this location?`,
        answer:
          "Most plans include business address support, documentation, and mail handling, with premium tiers offering added service coverage.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-3`,
        question: `How quickly can a virtual office be set up in ${locationName}?`,
        answer:
          "Setup speed depends on documentation readiness and provider process, but curated providers usually support faster onboarding.",
      },
    ];
  }

  if (vertical === "coliving") {
    return [
      {
        id: `${vertical}-${cityName}-${locationName}-faq-1`,
        question: `What should I check before booking coliving in ${locationName}, ${cityName}?`,
        answer:
          "Confirm deposit, lock-in, meal plan, visitor policy, AC availability, and what is included in the monthly rent before you commit.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-2`,
        question: `Is ${locationName} suitable for students and working professionals?`,
        answer:
          "Yes. Pockets like this are often chosen for commute convenience, daily needs access, and a stronger supply of furnished room inventory.",
      },
      {
        id: `${vertical}-${cityName}-${locationName}-faq-3`,
        question: `How can SpaceWallah help with PG or coliving in ${locationName}?`,
        answer:
          "SpaceWallah helps you compare curated listings, filter by budget and amenities, and request a faster shortlist with clearer monthly pricing context.",
      },
    ];
  }

  return [
    {
      id: `${vertical}-${cityName}-${locationName}-faq-1`,
      question: `What types of managed office are available in ${locationName}, ${cityName}?`,
      answer:
        "You can usually compare managed offices, private suites, and larger enterprise options depending on team size and occupancy plans.",
    },
    {
      id: `${vertical}-${cityName}-${locationName}-faq-2`,
      question: `Is ${locationName} a good location for growing teams?`,
      answer:
        "Yes. Business districts like this typically offer stronger infrastructure, better commute access, and more premium office inventory.",
    },
    {
      id: `${vertical}-${cityName}-${locationName}-faq-3`,
      question: `How can SpaceWallah help with office selection in ${locationName}?`,
      answer:
        "SpaceWallah helps compare local inventory with cleaner filters and consultation support for quicker, better-fit decisions.",
    },
  ];
}

export function getLocationPageData(
  vertical: SpaceVertical,
  citySlug: string,
  locationSlug: string,
  filters: CityPageFilters = {},
): LocationPageData | null {
  const city = listCitiesByVertical(vertical).find((item) => item.slug === citySlug);

  if (!city) {
    return null;
  }

  const locationSpaces = listSpaces({
    vertical,
    city: citySlug,
    location: locationSlug,
  });

  if (locationSpaces.length === 0) {
    return null;
  }

  const filteredSpaces = listSpaces({
    vertical,
    city: citySlug,
    location: locationSlug,
    ...filters,
  });
  const locationName = slugToTitle(locationSlug);
  const allAmenities = Array.from(
    new Set(locationSpaces.flatMap((space) => space.amenities)),
  );
  const allBrands = Array.from(new Set(locationSpaces.map((space) => space.brand)));
  const allSpaceTypes = Array.from(
    new Set(locationSpaces.flatMap((space) => space.spaceTypes)),
  );
  const allTeamSizes = Array.from(
    new Set(locationSpaces.flatMap((space) => space.teamSizes)),
  );

  return {
    vertical,
    city,
    catalogCityId:
      vertical === "coworking" || vertical === "office-space" || vertical === "coliving"
        ? getCatalogCityIdBySlug(citySlug) ?? undefined
        : undefined,
    citySlug,
    locationSlug,
    locationName,
    title: buildLocationPageTitle(vertical, locationName, city.name),
    subtitle: buildLocationPageSubtitle(vertical, locationName, city.name),
    totalSpaces: filteredSpaces.length,
    spaces: filteredSpaces,
    popularSpaces: locationSpaces.slice(0, 3),
    filters: {
      budgets: [
        { label: "All budgets", value: "" },
        { label: "Under Rs. 10k", value: "under-10k" },
        { label: "Rs. 10k - Rs. 20k", value: "10k-20k" },
        { label: "Rs. 20k - Rs. 40k", value: "20k-40k" },
        { label: "Custom / enterprise", value: "custom" },
      ],
      teamSizes: [{ label: "All team sizes", value: "" }].concat(
        allTeamSizes.map((item) => ({ label: item, value: item })),
      ),
      spaceTypes: [{ label: "All space types", value: "" }].concat(
        allSpaceTypes.map((item) => ({ label: item, value: item })),
      ),
      amenities: [{ label: "All amenities", value: "" }].concat(
        allAmenities.map((item) => ({ label: item, value: item })),
      ),
      brands: [{ label: "All brands", value: "" }].concat(
        allBrands.map((item) => ({ label: item, value: item })),
      ),
    },
    insights: buildLocationInsights(vertical, locationName, city.name),
    seoSection: buildLocationSeoSection(
      vertical,
      locationName,
      city.name,
      locationSpaces.length,
    ),
    faqs: buildLocationFaqs(vertical, locationName, city.name),
    leadCta: {
      title:
        vertical === "coliving"
          ? `Ready to shortlist homes in ${locationName}?`
          : vertical === "virtual-office"
            ? `Need a virtual office near ${locationName}?`
            : `Ready for a workspace that fits ${locationName}?`,
      description:
        vertical === "virtual-office"
          ? `Tell us your compliance need and we will shortlist trusted virtual office providers around ${locationName}, ${city.name}.`
          : vertical === "coliving"
            ? `Share your budget and move-in date. We will shortlist verified coliving and PG options around ${locationName}, ${city.name}.`
            : `Skip endless listing tabs. Our team shortlists verified coworking options around ${locationName}, ${city.name}, matched to your budget and timeline.`,
      ctaLabel:
        vertical === "virtual-office"
          ? "Get my virtual office shortlist"
          : vertical === "coliving"
            ? "Get my free home shortlist"
            : "Talk to an advisor, free",
    },
  };
}

export function filterSpacesByCityPageFilters(
  spaces: Space[],
  filters: CityPageFilters,
): Space[] {
  return spaces.filter((space) => {
    if (filters.brand && space.brand !== filters.brand) return false;
    if (filters.teamSize && !space.teamSizes.includes(filters.teamSize)) return false;
    if (filters.spaceType && !space.spaceTypes.includes(filters.spaceType)) return false;
    if (filters.amenity && !space.amenities.includes(filters.amenity)) return false;
    if (!matchesBudget(space, filters.budget)) return false;
    return true;
  });
}

/** Build a location page when spaces come from the coworking API (`/api/user/workSpaces` + `micro_location`). */
export function buildLocationPageDataFromSpaces(
  vertical: SpaceVertical,
  city: City,
  citySlug: string,
  locationSlug: string,
  locationSpaces: Space[],
  filters: CityPageFilters,
  coworkingCatalogCityId?: string,
  workspaceMicroLocationId?: string,
): LocationPageData | null {
  const filteredSpaces = filterSpacesByCityPageFilters(locationSpaces, filters);
  const locationName = slugToTitle(locationSlug.replace(/_/g, "-"));
  const allAmenities = Array.from(
    new Set(locationSpaces.flatMap((space) => space.amenities)),
  );
  const allBrands = Array.from(new Set(locationSpaces.map((space) => space.brand)));
  const allSpaceTypes = Array.from(
    new Set(locationSpaces.flatMap((space) => space.spaceTypes)),
  );
  const allTeamSizes = Array.from(
    new Set(locationSpaces.flatMap((space) => space.teamSizes)),
  );

  return {
    vertical,
    city,
    catalogCityId:
      (vertical === "coworking" || vertical === "coliving") && coworkingCatalogCityId
        ? coworkingCatalogCityId
        : undefined,
    workspaceMicroLocationId:
      vertical === "coworking" && workspaceMicroLocationId
        ? workspaceMicroLocationId
        : undefined,
    citySlug,
    locationSlug,
    locationName,
    title: buildLocationPageTitle(vertical, locationName, city.name),
    subtitle: buildLocationPageSubtitle(vertical, locationName, city.name),
    totalSpaces: filteredSpaces.length,
    spaces: filteredSpaces,
    popularSpaces: locationSpaces.slice(0, 3),
    filters: {
      budgets: [
        { label: "All budgets", value: "" },
        { label: "Under Rs. 10k", value: "under-10k" },
        { label: "Rs. 10k - Rs. 20k", value: "10k-20k" },
        { label: "Rs. 20k - Rs. 40k", value: "20k-40k" },
        { label: "Custom / enterprise", value: "custom" },
      ],
      teamSizes: [{ label: "All team sizes", value: "" }].concat(
        allTeamSizes.map((item) => ({ label: item, value: item })),
      ),
      spaceTypes: [{ label: "All space types", value: "" }].concat(
        allSpaceTypes.map((item) => ({ label: item, value: item })),
      ),
      amenities: [{ label: "All amenities", value: "" }].concat(
        allAmenities.map((item) => ({ label: item, value: item })),
      ),
      brands: [{ label: "All brands", value: "" }].concat(
        allBrands.map((item) => ({ label: item, value: item })),
      ),
    },
    insights: buildLocationInsights(vertical, locationName, city.name),
    seoSection: buildLocationSeoSection(vertical, locationName, city.name, locationSpaces.length),
    faqs: buildLocationFaqs(vertical, locationName, city.name),
    leadCta: {
      title:
        vertical === "coliving"
          ? `Ready to shortlist homes in ${locationName}?`
          : vertical === "virtual-office"
            ? `Need a virtual office near ${locationName}?`
            : `Ready for a workspace that fits ${locationName}?`,
      description:
        vertical === "virtual-office"
          ? `Tell us your compliance need and we will shortlist trusted virtual office providers around ${locationName}, ${city.name}.`
          : vertical === "coliving"
            ? `Share your budget and move-in date. We will shortlist verified coliving and PG options around ${locationName}, ${city.name}.`
            : `Skip endless listing tabs. Our team shortlists verified coworking options around ${locationName}, ${city.name}, matched to your budget and timeline.`,
      ctaLabel:
        vertical === "virtual-office"
          ? "Get my virtual office shortlist"
          : vertical === "coliving"
            ? "Get my free home shortlist"
            : "Talk to an advisor, free",
    },
  };
}

const coworkingBenefits: WhySpaceWallahItem[] = [
  {
    id: "cw_benefit_001",
    title: "Flexible plans",
    description: "Hot desks, dedicated desks, cabins, and managed floors built for fast-moving teams.",
  },
  {
    id: "cw_benefit_002",
    title: "Networking built in",
    description: "Choose spaces with stronger communities, events, and founder-friendly ecosystems.",
  },
  {
    id: "cw_benefit_003",
    title: "Ready to move",
    description: "Skip fit-outs and start with operational, design-led workspaces from day one.",
  },
];

const coworkingHowItWorks: HowItWorksStep[] = [
  {
    id: "cw_step_001",
    title: "Search your city",
    description: "Start with the market, budget, and seat size that fits your current stage.",
  },
  {
    id: "cw_step_002",
    title: "Compare premium options",
    description: "Review curated coworking operators side by side without marketplace clutter.",
  },
  {
    id: "cw_step_003",
    title: "Get office consultation",
    description: "Share your requirement and we help you shortlist the right fit quickly.",
  },
];

const virtualOfficeBenefits: WhySpaceWallahItem[] = [
  {
    id: "vo_benefit_001",
    title: "GST registration support",
    description: "Choose documentation-ready providers for faster onboarding and compliance workflows.",
  },
  {
    id: "vo_benefit_002",
    title: "Professional business address",
    description: "Build credibility with prime-location addresses across major Indian cities.",
  },
  {
    id: "vo_benefit_003",
    title: "Mail handling services",
    description: "Stay operational with mail alerts, reception support, and add-on admin services.",
  },
];

const virtualOfficePricingPlans: PricingPlan[] = [
  {
    id: "vo_plan_001",
    name: "Starter",
    price: "From Rs. 1,799/mo",
    description: "Built for early-stage companies that need a trusted business address quickly.",
    features: ["Business address", "Basic documentation", "Mail alerts"],
  },
  {
    id: "vo_plan_002",
    name: "Business",
    price: "From Rs. 2,999/mo",
    description: "For growing companies that need GST-ready documentation and smoother operations.",
    features: ["GST support", "Business address", "Reception assistance"],
  },
  {
    id: "vo_plan_003",
    name: "Premium",
    price: "Custom pricing",
    description: "Designed for teams that want legal confidence, service support, and premium locations.",
    features: ["Prime address", "Priority support", "Mail handling + admin help"],
  },
];

const virtualOfficeComparisonRows: ComparisonRow[] = [
  {
    id: "vo_compare_001",
    feature: "GST documentation",
    values: ["Basic", "Included", "Priority handled"],
  },
  {
    id: "vo_compare_002",
    feature: "Mail handling",
    values: ["Alerts only", "Collection support", "Managed handling"],
  },
  {
    id: "vo_compare_003",
    feature: "Location quality",
    values: ["Standard", "Business district", "Prime landmark"],
  },
  {
    id: "vo_compare_004",
    feature: "Support model",
    values: ["Email", "Dedicated advisor", "Priority concierge"],
  },
];

const colivingBenefits: WhySpaceWallahItem[] = [
  {
    id: "clv_benefit_001",
    title: "Move-in ready rooms",
    description: "Furnished beds, wardrobes, and WiFi so you can shift without buying furniture upfront.",
  },
  {
    id: "clv_benefit_002",
    title: "PG or coliving clarity",
    description: "Compare meal plans, security, and house rules with clearer monthly pricing context.",
  },
  {
    id: "clv_benefit_003",
    title: "City-smart locations",
    description: "Shortlist options near tech parks, campuses, and metro corridors that match your commute.",
  },
];

const officeSpaceBenefits: WhySpaceWallahItem[] = [
  {
    id: "os_benefit_001",
    title: "Fully managed",
    description: "Move into polished spaces with operations, reception, infrastructure, and upkeep already handled.",
  },
  {
    id: "os_benefit_002",
    title: "Scalable footprint",
    description: "Expand from team suites to private floors without rebuilding your search from scratch.",
  },
  {
    id: "os_benefit_003",
    title: "Customizable layouts",
    description: "Find inventory that can support enterprise needs, branding, and operational nuance.",
  },
];

const officeEnterpriseSolutions: WhySpaceWallahItem[] = [
  {
    id: "os_solution_001",
    title: "Managed headquarters",
    description: "Premium, client-facing office inventory for leadership teams and central operations.",
  },
  {
    id: "os_solution_002",
    title: "Satellite hubs",
    description: "Flexible office footprints for regional hiring and distributed team expansion.",
  },
  {
    id: "os_solution_003",
    title: "Enterprise customization",
    description: "Spaces with branding, layout planning, and support for longer-term occupancy strategies.",
  },
];

const officeCaseStudies: CaseStudy[] = [
  {
    id: "os_case_001",
    company: "Northbeam Health",
    headline: "Scaled from a 12-seat suite to a branded private floor in Gurgaon.",
    summary: "The team needed a premium address, board-room access, and fast occupancy without a long procurement cycle.",
    metric: "4 weeks to move-in",
  },
  {
    id: "os_case_002",
    company: "AstraPay",
    headline: "Shortlisted enterprise-ready Bangalore offices with stronger cost control.",
    summary: "SpaceWallah helped compare managed office options by service level, location quality, and flexibility.",
    metric: "18% projected cost efficiency",
  },
  {
    id: "os_case_003",
    company: "Meridian Labs",
    headline: "Built a two-city workspace strategy with central visibility.",
    summary: "The company needed premium offices for leadership in one city and an expandable team hub in another.",
    metric: "2 cities launched together",
  },
];

export function getVerticalLandingData(vertical: SpaceVertical): VerticalLandingData {
  const verticalSpaces = listSpaces({ vertical });
  const featuredSpaces = listSpaces({ vertical, featured: true }).slice(0, 6);
  const cities = listCitiesByVertical(vertical);

  if (vertical === "coworking") {
    return {
      vertical,
      hero: {
        eyebrow: "Coworking Spaces",
        title: "Find the Best Coworking Spaces Near You",
        subtitle:
          "Flexible desks, private cabins and managed offices across top cities.",
        ctaLabel: "Explore Spaces",
        image:
          "https://img.spacewallah.com/images/latest_images_2024/7fed3a04f52c777052ecb019c42ddaba6c5fb34e.webp",
        imageLabel: "Bright coworking lounge",
        stats: [
          { label: "Flexible plans", value: "Hot desks to private cabins" },
          { label: "Move-in speed", value: "Operational from day one" },
          { label: "Best for", value: "Startups, creators, agile teams" },
        ],
      },
      cities,
      featuredSpaces,
      benefits: coworkingBenefits,
      howItWorks: coworkingHowItWorks,
      leadSection: {
        title: "Get Expert Advice",
        description:
          "Tell us your preferred city, seat count, and budget. We'll help you shortlist coworking options that actually match your team.",
        ctaLabel: "Get Expert Advice",
        bullets: ["Curated operators", "Fast shortlist", "No brokerage confusion"],
      },
      searchOptions: getSearchOptions(),
      brands: listBrands(),
    };
  }

  if (vertical === "virtual-office") {
    return {
      vertical,
      hero: {
        eyebrow: "India's Trusted Virtual Office Provider",
        title: "Virtual Office in India",
        subtitle:
          "Get a GST-compliant virtual office address in top Indian cities with complete documentation support and fast setup.",
        ctaLabel: "Get Virtual Office",
        image:
          "https://img.spacewallah.com/images/latest_images_2024/1be87877ad43a0a7666804cd6c1052a99b22488d.webp",
        imageLabel: "Modern open-plan workspace",
        badges: [
          "10,000+ businesses served",
          "50+ cities across India",
          "500+ verified providers",
          "100% GST-approved addresses",
        ],
      },
      cities,
      featuredSpaces: verticalSpaces.slice(0, 4),
      benefits: virtualOfficeBenefits,
      howItWorks: [
        {
          id: "vo_step_001",
          title: "Choose your city",
          description: "Start with the city where you need a business address or GST registration support.",
        },
        {
          id: "vo_step_002",
          title: "Compare service levels",
          description: "Review pricing, documentation support, and mail-handling coverage in one place.",
        },
        {
          id: "vo_step_003",
          title: "Get set up faster",
          description: "Submit your requirement and we help you move toward the right provider quickly.",
        },
      ],
      leadSection: {
        title: "Get Virtual Office Today",
        description:
          "Share your city and business requirement. We'll guide you to the right provider for compliance, address quality, and support.",
        ctaLabel: "Get Virtual Office Today",
        bullets: ["Compliance-ready docs", "Prime business addresses", "Fast onboarding"],
      },
      searchOptions: getSearchOptions(),
      pricingPlans: virtualOfficePricingPlans,
      comparisonTable: {
        columns: ["Starter", "Business", "Premium"],
        rows: virtualOfficeComparisonRows,
      },
      brands: listBrands().slice(0, 4),
    };
  }

  if (vertical === "coliving") {
    return {
      vertical,
      hero: {
        eyebrow: "Coliving Space",
        title: "Find Coliving Space Across Top Indian Cities",
        subtitle:
          "Furnished rooms, meal-inclusive PG options, and managed coliving homes with clearer monthly pricing.",
        ctaLabel: "Explore Coliving",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
        imageLabel: "Modern furnished coliving room",
        stats: [
          { label: "Room formats", value: "Sharing to private suites" },
          { label: "Move-in", value: "Furnished, WiFi-ready" },
          { label: "Best for", value: "Students & young professionals" },
        ],
      },
      cities,
      featuredSpaces,
      benefits: colivingBenefits,
      howItWorks: [
        {
          id: "clv_step_001",
          title: "Choose your city",
          description: "Start with where you study or work so commute and safety tradeoffs stay realistic.",
        },
        {
          id: "clv_step_002",
          title: "Compare plans",
          description: "Review meals, housekeeping, AC, and deposit terms side by side before you shortlist.",
        },
        {
          id: "clv_step_003",
          title: "Talk to an expert",
          description: "Share your budget and move-in date for a faster, higher-fit coliving or PG shortlist.",
        },
      ],
      leadSection: {
        title: "Get Coliving Help",
        description:
          "Tell us your city, budget, and sharing preference. We help you shortlist coliving and PG options with clearer monthly costs.",
        ctaLabel: "Get Coliving Help",
        bullets: ["Curated operators", "Faster shortlist", "Less listing noise"],
      },
      searchOptions: getSearchOptions(),
      brands: listBrands().slice(0, 4),
    };
  }

  return {
    vertical,
    hero: {
      eyebrow: "Managed Office",
      title: "Premium Managed Offices for Growing Teams",
      subtitle:
        "Private suites, managed spaces, and enterprise workplace solutions for teams that need polish and scale.",
      ctaLabel: "Find Managed Office",
      image:
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
      imageLabel: "Luxury office interior",
      stats: [
        { label: "Formats", value: "Team suites to full floors" },
        { label: "Experience", value: "Premium, client-facing environments" },
        { label: "Fit", value: "Growth-stage and enterprise teams" },
      ],
    },
    cities,
    featuredSpaces,
    benefits: officeSpaceBenefits,
    howItWorks: [
      {
        id: "os_step_001",
        title: "Share your team brief",
        description: "Tell us your city, headcount, budget, and workplace expectations.",
      },
      {
        id: "os_step_002",
        title: "Review premium options",
        description: "Compare managed offices and private suites with a stronger quality filter.",
      },
      {
        id: "os_step_003",
        title: "Talk to an expert",
        description: "Our team helps shortlist spaces that align with brand, growth, and operations.",
      },
    ],
    leadSection: {
      title: "Talk to an Expert",
      description:
        "From managed offices to private floors, we help teams evaluate premium managed office options with more confidence and less noise.",
      ctaLabel: "Talk to an Expert",
      bullets: ["Managed and enterprise options", "Workspace advisory", "Premium locations"],
    },
    searchOptions: getSearchOptions(),
    enterpriseSolutions: officeEnterpriseSolutions,
    caseStudies: officeCaseStudies,
    brands: listBrands(),
  };
}

export function getSpaceById(id: string) {
  return spaces.find((space) => space.id === id) ?? null;
}

export function getSpaceBySlug(slug: string, vertical?: SpaceVertical) {
  return (
    spaces.find(
      (space) => space.slug === slug && (!vertical || space.vertical === vertical),
    ) ?? null
  );
}

export function upsertSpace(
  input: Omit<Space, "id" | "createdAt"> & Partial<Pick<Space, "id" | "createdAt">>,
) {
  if (input.id) {
    spaces = spaces.map((space) =>
      space.id === input.id ? ({ ...space, ...input, id: space.id } as Space) : space,
    );
    return getSpaceById(input.id);
  }

  const created: Space = {
    ...input,
    id: `spc_${Date.now()}`,
    createdAt: new Date().toISOString(),
  } as Space;
  spaces.unshift(created);
  return created;
}

export function deleteSpace(id: string) {
  const existing = getSpaceById(id);
  spaces = spaces.filter((space) => space.id !== id);
  return existing;
}

export function listLeads(filters?: { city?: string; spaceId?: string }) {
  return leads.filter((lead) => {
    if (filters?.city && lead.city !== filters.city) return false;
    if (filters?.spaceId && lead.spaceId !== filters.spaceId) return false;
    return true;
  });
}

export function getLeadById(id: string) {
  return leads.find((lead) => lead.id === id) ?? null;
}

export function createLead(input: Omit<Lead, "id" | "createdAt">) {
  const created: Lead = {
    ...input,
    source: input.source ?? "homepage",
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  leads.unshift(created);
  return created;
}

export function updateLead(id: string, input: Partial<Omit<Lead, "id" | "createdAt">>) {
  leads = leads.map((lead) => (lead.id === id ? { ...lead, ...input } : lead));
  return getLeadById(id);
}

export function deleteLead(id: string) {
  const existing = getLeadById(id);
  leads = leads.filter((lead) => lead.id !== id);
  return existing;
}
