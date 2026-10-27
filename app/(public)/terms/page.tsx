import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_BRAND, LEGAL_EMAIL, LEGAL_PHONE, LEGAL_UPDATED, LEGAL_WEBSITE } from "@/modules/legal/legal-constants";
import { LegalPage, type LegalSection } from "@/modules/legal/legal-page";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata(
  "Terms of Use | SpaceWallah",
  "The terms for using SpaceWallah to discover and enquire about coworking spaces, managed offices, virtual offices and PGs, and for listing your space as a host.",
  "/terms",
);

const mail = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "About these terms",
    body: (
      <>
        <p>
          These Terms of Use apply to your use of {LEGAL_WEBSITE} and any related services (the &ldquo;Platform&rdquo;)
          provided by {LEGAL_BRAND} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the
          Platform you agree to these terms and to our <Link href="/privacy-policy">Privacy Policy</Link>. If you do not
          agree, please do not use the Platform.
        </p>
      </>
    ),
  },
  {
    id: "our-service",
    heading: "What SpaceWallah does",
    body: (
      <>
        <p>
          {LEGAL_BRAND} is a discovery and advisory platform. We list coworking spaces, managed offices, virtual offices,
          and PG and coliving rooms, help you compare them and connect you with their operators and owners
          (&ldquo;Hosts&rdquo;).
        </p>
        <p>
          We do not own, manage or operate the listed spaces. Any booking, membership, lease, licence or rental agreement is
          made directly between you and the Host, on the Host&apos;s terms. The Host is responsible for the space, its services
          and the agreement you sign with them.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    heading: "Fees",
    body: (
      <p>
        Searching, enquiring and getting help from our advisors is free for people looking for a space. We charge no
        brokerage to you. We may receive a fee or commission from Hosts when you take a space through us. This does not
        increase the price you pay the Host.
      </p>
    ),
  },
  {
    id: "listings",
    heading: "Listings, prices and availability",
    body: (
      <>
        <p>
          Listing details, photos, amenities, prices and availability come from Hosts and our own research. We work to keep
          them accurate, but they can change without notice and may contain errors. Prices shown are indicative and may
          exclude taxes, deposits and other charges.
        </p>
        <p>
          Please visit the space and confirm the final price, inclusions, deposit, lock-in and notice period with the Host in
          writing before you pay or sign anything. A &ldquo;verified&rdquo; label means we have checked the listing at a
          point in time; it is not a guarantee of the space or the Host.
        </p>
      </>
    ),
  },
  {
    id: "your-responsibilities",
    heading: "Your responsibilities",
    body: (
      <>
        <p>When you use the Platform you agree to:</p>
        <ul>
          <li>give accurate details in enquiries and keep your contact details current;</li>
          <li>use the Platform only for genuine enquiries and lawful purposes;</li>
          <li>not submit enquiries or listings on behalf of someone without their permission;</li>
          <li>
            not copy, scrape or harvest listings, contact details or other content using automated tools, or reuse them for
            another service;
          </li>
          <li>not try to break, overload or gain unauthorised access to the Platform; and</li>
          <li>not post anything false, misleading, offensive, unlawful or that infringes someone else&apos;s rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "communication",
    heading: "Enquiries and communication",
    body: (
      <p>
        When you send an enquiry, you agree that we may share your details with relevant Hosts and that we and those Hosts
        may contact you by phone call, SMS, WhatsApp or email about your requirement, even if your number is on the National
        Do Not Call registry. You can ask us to stop at any time by emailing {mail}.
      </p>
    ),
  },
  {
    id: "hosts",
    heading: "Listing your space (Hosts)",
    body: (
      <>
        <p>If you list a space on the Platform, you confirm and agree that:</p>
        <ul>
          <li>you own the space or are authorised to offer it, and all listing details, prices and photos are accurate and kept up to date;</li>
          <li>you have the rights to every photo and description you upload, and you give {LEGAL_BRAND} a non-exclusive, royalty-free licence to display, edit for format and promote them on the Platform and in our marketing;</li>
          <li>the space and your services comply with applicable laws, including local, tax, fire safety and police verification requirements;</li>
          <li>you will respond to enquiries promptly and honour the prices and terms you publish; and</li>
          <li>commercial terms, such as commission, are agreed separately in writing with {LEGAL_BRAND}.</li>
        </ul>
        <p>We may edit, decline, hide or remove any listing that is inaccurate, incomplete, inactive or breaks these terms.</p>
      </>
    ),
  },
  {
    id: "virtual-office",
    heading: "Virtual office services",
    body: (
      <p>
        Virtual office documents (such as a rent agreement, NOC and utility bill) are issued by the space operator after
        their KYC checks on your business. Approval of GST registration, company registration or any other application is
        decided by the relevant government authority, so neither {LEGAL_BRAND} nor the operator can guarantee approval. Use
        the address only for the lawful purposes agreed with the operator.
      </p>
    ),
  },
  {
    id: "payments",
    heading: "Payments and refunds",
    body: (
      <p>
        Payments for a space, such as rent, membership fees, deposits and virtual office plan fees, are made to the Host or
        as set out in the agreement you sign. {LEGAL_BRAND} does not take card or online payments on the Platform. Refunds
        and cancellations are covered by our <Link href="/refund-policy">Refund and Cancellation Policy</Link> and by your
        agreement with the Host.
      </p>
    ),
  },
  {
    id: "reviews",
    heading: "Reviews and content you post",
    body: (
      <p>
        Reviews and other content you submit must be honest, based on your own experience and not paid for or written on
        someone else&apos;s behalf. You give us a non-exclusive licence to display them on the Platform. We may remove content
        that breaks these terms or the law.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <p>
        Questions about these terms? Email {mail} or call {LEGAL_PHONE} (Monday to Saturday, 9 AM to 7 PM IST).
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated={LEGAL_UPDATED}
      intro={
        <p>
          Please read these terms carefully. They explain how {LEGAL_BRAND} works, what you can expect from us and what we
          expect from people who search for spaces and Hosts who list them.
        </p>
      }
      sections={sections}
    />
  );
}
