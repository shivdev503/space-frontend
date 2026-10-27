import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_BRAND, LEGAL_EMAIL, LEGAL_PHONE, LEGAL_UPDATED, LEGAL_WEBSITE } from "@/modules/legal/legal-constants";
import { LegalPage, type LegalSection } from "@/modules/legal/legal-page";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata(
  "Privacy Policy | SpaceWallah",
  "How SpaceWallah collects, uses, shares and protects your personal data when you search for coworking spaces, offices, virtual offices and PGs, and how to exercise your rights.",
  "/privacy-policy",
);

const mail = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: (
      <>
        <p>
          {LEGAL_BRAND} ({LEGAL_WEBSITE}, &ldquo;we&rdquo;, &ldquo;us&rdquo;) helps people and businesses find coworking spaces, managed offices, virtual offices, and PG and
          coliving rooms across India, and connects them with the operators and owners of those spaces.
        </p>
        <p>
          This policy explains what personal data we collect, why we collect it, who we share it with and the choices you
          have. It is written to meet the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000
          and its rules. For the purposes of the DPDP Act, {LEGAL_BRAND} is the data fiduciary for the data described here.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    heading: "Data we collect",
    body: (
      <>
        <p>
          <strong>Data you give us.</strong> When you send an enquiry, book a tour, request a callback or contact us, we
          collect your name, mobile number and email address, plus details of what you need, such as the city or locality,
          type of space, team size or number of seats, budget, preferred move-in date and any message you write.
        </p>
        <p>
          <strong>Data from hosts.</strong> If you list a space with us, we collect your name, contact details, business
          name, listing details, prices, photos and any documents you share to verify the listing.
        </p>
        <p>
          <strong>Data collected automatically.</strong> When you use the website we collect technical information such as
          your IP address, device and browser type, pages viewed, search filters, referring website and approximate
          location derived from your IP address. Some of this is collected through cookies and similar technologies (see
          section 6).
        </p>
        <p>
          We do not ask for and do not want sensitive data such as passwords to other services, bank or card details,
          health information or biometric data through the website. Please do not include them in messages to us.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use your data",
    body: (
      <ul>
        <li>To understand your requirement and suggest suitable spaces.</li>
        <li>
          To share your enquiry with the operators or owners of the spaces you are interested in, so they can give you
          availability, prices and tour slots.
        </li>
        <li>
          To contact you by phone call, SMS, WhatsApp or email about your enquiry, site visits and options that match it.
        </li>
        <li>To help hosts publish and manage their listings and receive enquiries.</li>
        <li>To run, secure and improve the website, measure how it is used and fix problems.</li>
        <li>To prevent fraud, spam and misuse, and to meet our legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    heading: "Who we share your data with",
    body: (
      <>
        <p>We do not sell your personal data. We share it only as follows:</p>
        <ul>
          <li>
            <strong>Space operators and property owners</strong> relevant to your enquiry. Once they receive your details,
            their own privacy policies also apply to how they use them.
          </li>
          <li>
            <strong>Service providers</strong> who work for us, such as hosting, customer relationship management, calling
            and messaging, email and analytics providers. They may use your data only to provide their service to us.
          </li>
          <li>
            <strong>Authorities</strong> when the law requires it, or to protect the rights, safety and property of our
            users, hosts or {LEGAL_BRAND}.
          </li>
          <li>
            <strong>A buyer or successor</strong> if our business is merged, acquired or restructured, subject to this
            policy.
          </li>
        </ul>
        <p>
          Some of our service providers may store data on servers outside India. Where that happens we take steps to keep
          it protected as described in this policy and as permitted by Indian law.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    heading: "Consent and how to withdraw it",
    body: (
      <>
        <p>
          When you submit a form on the website you consent to us using your data for the purposes in section 3, including
          being contacted by phone, SMS, WhatsApp and email about your enquiry, even if your number is registered on the
          National Do Not Call registry.
        </p>
        <p>
          You can withdraw your consent at any time by emailing {mail} or by replying &ldquo;STOP&rdquo; to our messages.
          Withdrawal does not affect processing that happened before it, and we may keep data we are required to keep by
          law.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and analytics",
    body: (
      <>
        <p>
          We use cookies and similar technologies to keep the website working, remember your preferences, measure traffic
          and understand which pages and listings are useful. We use Google Tag Manager and Google Analytics for this, and
          may use advertising tags to measure our campaigns.
        </p>
        <p>
          You can block or delete cookies in your browser settings. Some parts of the website may not work properly if you
          do.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep data",
    body: (
      <p>
        We keep enquiry and contact data for as long as we need it to help you find a space and follow up, and in any case
        for no longer than 3 years after our last contact with you, unless the law requires us to keep it longer (for
        example, tax and accounting records). Host and listing data is kept while the listing is active and for a reasonable
        period after it is removed. After that we delete or anonymise it.
      </p>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <p>
        We use reasonable security practices, including encrypted connections (HTTPS), access controls and restricted
        access to personal data on a need-to-know basis. No system is completely secure, so we cannot guarantee absolute
        security. If a personal data breach affects you, we will inform you and the Data Protection Board of India as the
        law requires.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Grievance officer and contact",
    body: (
      <>
        <p>
          For questions, requests or complaints about your personal data, contact our Grievance Officer at {mail} or call{" "}
          {LEGAL_PHONE} (Monday to Saturday, 9 AM to 7 PM IST). We will acknowledge your complaint within 48 hours and resolve
          it within 30 days.
        </p>
        <p>
          See also our <Link href="/terms">Terms of Use</Link> and <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={LEGAL_UPDATED}
      intro={
        <p>
          Your privacy matters to us. This policy describes how {LEGAL_BRAND} handles the personal data you share when you
          use {LEGAL_WEBSITE}, send an enquiry or list a space with us.
        </p>
      }
      sections={sections}
    />
  );
}
