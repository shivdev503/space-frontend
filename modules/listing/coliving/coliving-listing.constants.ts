export const COLIVING_LISTING_STEPS = [
  {
    n: 1,
    key: "basic",
    label: "Basic Info",
    title: "Let's start with the basics",
    sub: "Tell us a little about your property.",
  },
  {
    n: 2,
    key: "location",
    label: "Location",
    title: "Where is your property?",
    sub: "Accurate location helps tenants find you faster.",
  },
  {
    n: 3,
    key: "rooms",
    label: "Rooms",
    title: "What types of rooms do you offer?",
    sub: "Add each room type you have available — you can add multiple.",
  },
  {
    n: 4,
    key: "food",
    label: "Services",
    title: "What do you provide for your tenants?",
    sub: "Let tenants know what's included in the rent.",
  },
  {
    n: 5,
    key: "amenities",
    label: "Amenities",
    title: "What facilities does your property have?",
    sub: "More amenities = more inquiries.",
  },
  {
    n: 6,
    key: "rules",
    label: "Rules",
    title: "Set your house rules",
    sub: "Clear rules attract the right tenants.",
  },
  {
    n: 7,
    key: "photos",
    label: "Photos",
    title: "Add photos & describe your property",
    sub: "Good photos are the #1 reason tenants choose.",
  },
] as const;

export const COLIVING_DRAFT_STORAGE_KEY = "spacewallah:coliving-listing-draft-v2";

export const COLIVING_HOUSE_RULES = [
  "No Smoking",
  "No Alcohol",
  "No Pets",
  "No Opposite Gender Guests",
  "No Loud Music After 10pm",
  "No Guardians Stay",
  "Rent Lock-in",
  "Vegetarian Kitchen",
] as const;

export const COLIVING_COMMON_AMENITIES = [
  "Power Back-Up",
  "Lift",
  "Wi-Fi",
  "Water Cooler",
  "Fridge",
  "Warden",
  "Gym",
  "Security",
  "CCTV",
  "TV Lounge",
  "Study Room",
  "Terrace",
] as const;

export const COLIVING_ROOM_AMENITIES = [
  "AC",
  "Television",
  "Single Bed",
  "Attached Bath",
  "Hot Water",
  "Cupboard",
  "Table & Chair",
  "Mattress",
  "Balcony",
] as const;
