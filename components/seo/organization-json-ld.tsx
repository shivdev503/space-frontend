import { absoluteUrl } from "@/components/seo/breadcrumbs";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_SOCIAL_LINKS } from "@/lib/contact-data";
import { COMPANY } from "@/lib/company-data";
import { APP_NAME } from "@/utils/constants";

/** Organization and WebSite structured data for the homepage and About page (`aboutPath`). */
export function OrganizationJsonLd({ aboutPath }: { aboutPath?: string } = {}) {
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
        legalName: COMPANY.legalName,
        taxID: COMPANY.gstin,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${COMPANY.office.street}, ${COMPANY.office.area}`,
          addressLocality: COMPANY.office.city,
          addressRegion: COMPANY.office.state,
          postalCode: COMPANY.office.postalCode,
          addressCountry: "IN",
        },
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
      ...(aboutPath
        ? [
            {
              "@type": "AboutPage",
              "@id": absoluteUrl(aboutPath),
              url: absoluteUrl(aboutPath),
              name: `About ${APP_NAME}`,
              isPartOf: { "@id": `${siteUrl}/#website` },
              mainEntity: { "@id": organizationId },
            },
          ]
        : []),
    ],
  }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />;
}
