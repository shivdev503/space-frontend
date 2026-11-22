/** The company behind SpaceWallah. The About page and the Organization schema both read from here. */
export const COMPANY = {
  brand: "SpaceWallah",
  legalName: "Spacewallah Enterprises",
  gstin: "09NEHPK6300D1ZI",
  office: {
    street: "Unit 309, 3rd Floor, Tower A, ElevenBay (formerly SAS Tower)",
    area: "Near Medanta Hospital, Medicity, Sector 38",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122018",
  },
  registered: {
    street: "Sahaswan",
    city: "Badaun",
    state: "Uttar Pradesh",
    postalCode: "243638",
  },
} as const;

/** Opens Google Maps on the office address. */
export const OFFICE_MAP_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `ElevenBay Tower A, ${COMPANY.office.area}, ${COMPANY.office.city}, ${COMPANY.office.state} ${COMPANY.office.postalCode}`,
)}`;
