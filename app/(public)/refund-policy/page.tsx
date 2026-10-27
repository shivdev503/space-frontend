import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_BRAND, LEGAL_EMAIL, LEGAL_PHONE, LEGAL_UPDATED } from "@/modules/legal/legal-constants";
import { LegalPage, type LegalSection } from "@/modules/legal/legal-page";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata(
  "Refund and Cancellation Policy | SpaceWallah",
  "How cancellations and refunds work for spaces found on SpaceWallah, including coworking, managed office, virtual office and PG payments and security deposits.",
  "/refund-policy",
);

const mail = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <>
        <p>
          Using {LEGAL_BRAND} to search, compare, enquire and get advice is free, so there is nothing to refund for our
          advisory service. {LEGAL_BRAND} does not take card or online payments on the website.
        </p>
        <p>
          When you take a space, you pay the space operator or owner (the &ldquo;Host&rdquo;) directly, or as set out in
          the agreement you sign. Refunds and cancellations of those payments are therefore governed by your agreement with
          the Host. This page explains how that usually works and how we help.
        </p>
      </>
    ),
  },
  {
    id: "coworking-office",
    heading: "Coworking and managed offices",
    body: (
      <ul>
        <li>Day passes and meeting rooms follow the operator&apos;s cancellation window, which is shown when you book or confirm.</li>
        <li>
          Monthly memberships and managed office agreements usually have a lock-in period and a notice period (often 30 days
          or more). Ending the agreement early may mean paying for the rest of the lock-in.
        </li>
        <li>
          The security deposit is refunded by the operator at the end of the agreement, after any agreed deductions for
          unpaid dues or damage, within the time stated in your agreement.
        </li>
      </ul>
    ),
  },
  {
    id: "virtual-office",
    heading: "Virtual offices",
    body: (
      <ul>
        <li>
          If you cancel before the operator issues your documents (rent agreement, NOC and utility bill), you should get a
          full refund of the plan fee.
        </li>
        <li>
          If the operator cannot issue the documents because your business fails their KYC checks, the plan fee is refunded
          after deducting any verification costs stated in your agreement.
        </li>
        <li>
          Once documents have been issued, the plan fee is generally not refundable, because the address has been reserved
          and documents prepared for you.
        </li>
        <li>
          Approval of GST or company registration is decided by the government authority. A rejection for reasons unrelated
          to the address documents does not by itself make the plan refundable, but we will help you with the operator to
          fix the issue and reapply.
        </li>
      </ul>
    ),
  },
  {
    id: "pg-coliving",
    heading: "PG and coliving",
    body: (
      <ul>
        <li>
          Booking amounts, advance rent and deposits are paid to the PG owner or coliving operator, and their refund rules
          apply. Ask for these in writing before you pay.
        </li>
        <li>
          The security deposit is normally refunded when you move out after serving the notice period, less any unpaid rent,
          bills or damage.
        </li>
        <li>Moving out before the lock-in period ends may mean losing part or all of the deposit, as per the owner&apos;s rules.</li>
      </ul>
    ),
  },
  {
    id: "our-help",
    heading: "How SpaceWallah helps",
    body: (
      <>
        <p>
          If you took a space through {LEGAL_BRAND} and have a problem with a refund, cancellation or deposit, tell us. We
          will take it up with the Host, share what we know about the agreed terms and try to reach a fair outcome quickly.
        </p>
        <p>
          Because the agreement is between you and the Host, we cannot force a Host to pay a refund, but we may remove Hosts
          who repeatedly fail to honour their terms.
        </p>
      </>
    ),
  },
  {
    id: "paid-to-us",
    heading: "Payments made to SpaceWallah",
    body: (
      <p>
        If you ever pay {LEGAL_BRAND} directly for a service, the invoice will state what it covers and its cancellation
        terms. If we cannot deliver that service, you will get a full refund. Approved refunds are made to the original
        payment method within 7 to 10 working days.
      </p>
    ),
  },
  {
    id: "request",
    heading: "How to raise a request",
    body: (
      <>
        <p>
          Email {mail} or call {LEGAL_PHONE} (Monday to Saturday, 9 AM to 7 PM IST) with your name, mobile number, the space
          name, the payment date and amount, and a copy of your agreement or receipt. We will reply within 2 working days.
        </p>
        <p>
          See also our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      updated={LEGAL_UPDATED}
      intro={
        <p>
          This policy explains how cancellations, refunds and security deposits work for spaces you find on {LEGAL_BRAND},
          and how we help if something goes wrong.
        </p>
      }
      sections={sections}
    />
  );
}
