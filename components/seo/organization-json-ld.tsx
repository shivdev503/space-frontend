import { absoluteUrl } from "@/components/seo/breadcrumbs";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_SOCIAL_LINKS } from "@/lib/contact-data";
import { APP_NAME } from "@/utils/constants";

/** Organization and WebSite structured data for the homepage. */
export function OrganizationJsonLd() {
  const siteUrl = absoluteUrl("/");
  const organizationId = `${siteUrl}/#organization`;
  const phone = `+91${CONTACT_PHONE}`;

  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: APP_NAME,
        url: siteUrl,
        logo: absoluteUrl("/icon-512.png"),
        email: CONTACT_EMAIL,
        telephone: phone,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: phone,
          email: CONTACT_EMAIL,
          areaServed: "IN",
        },
        sameAs: CONTACT_SOCIAL_LINKS.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: APP_NAME,
        url: siteUrl,
        publisher: { "@id": organizationId },
      },
    ],
  }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />;
}
