import type { Metadata } from "next";

import { ContactPage } from "@/modules/contact/contact-page";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata(
  "Contact Us | SpaceWallah",
  "Get in touch with SpaceWallah for coworking, coliving, virtual office, and managed office guidance across India.",
  "/contact",
);

export default function ContactRoutePage() {
  return <ContactPage />;
}
