import { toPhone10 } from "@/lib/phone-norm";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export type BuildUserEnquiryInput = {
  name: string;
  email: string;
  phone: string;
  /** Maps to `interested_in` (e.g. requirement text). */
  interestedIn: string;
  city: string;
  /** Optional neighbourhood / sector — `microlocation` + drives `location[]`. */
  microlocation?: string;
  pageUrl: string;
  /** Listing id from detail pages; only sent if it looks like a Mongo ObjectId. */
  spaceId?: string;
  /** Which body field to set when `spaceId` is a valid ObjectId. */
  spaceListingKey?: "work_space" | "office_space" | "living_space";
  /** Upstream `mx_Space_Type` (e.g. Web Coworking). */
  mxSpaceType: string;
  noOfPerson?: string;
  budget?: string;
  moveInDate?: string;
};

function isMongoObjectId(s: string): boolean {
  return OBJECT_ID.test(s.trim());
}

/**
 * JSON body for `POST /api/user/enquiry` — matches
 * `createEnquiry` / `manage-enquiry` expectations.
 */
export function buildUserEnquiryBody(input: BuildUserEnquiryInput): Record<string, unknown> {
  const phone10 = toPhone10(input.phone);
  if (!phone10) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }

  const city = (input.city || "India").trim() || "India";
  const micro = (input.microlocation ?? "").trim();
  const location: string[] = [];
  if (micro) location.push(micro);
  if (!location.includes(city)) location.push(city);
  if (location.length === 0) location.push(city);

  const body: Record<string, unknown> = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone_number: phone10,
    interested_in: (input.interestedIn || "Workspace enquiry").trim(),
    no_of_person: (input.noOfPerson ?? "1").trim() || "1",
    city,
    microlocation: micro,
    location,
    mx_Space_Type: input.mxSpaceType.trim() || "General",
    mx_Page_Url: input.pageUrl.trim() || "https://www.spacewallah.com",
    mx_BudgetPrice: (input.budget ?? "").toString().trim(),
    mx_Move_In_Date: (input.moveInDate ?? "").toString().trim(),
  };

  const sid = input.spaceId?.trim();
  const key = input.spaceListingKey;
  if (sid && isMongoObjectId(sid) && key) {
    body[key] = sid;
  }

  return body;
}
