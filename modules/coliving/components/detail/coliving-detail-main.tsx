"use client";

import { Wifi } from "lucide-react";
import { useState } from "react";

import { buildMapsLink, type MapCoordinates } from "@/lib/coliving-map";
import { roomFeatureList, roomOccupancy } from "@/lib/pg-room-occupancy";
import { pgDescriptionParagraphs, pgStartingRent } from "@/services/pg-mapper";
import type { PgDetail } from "@/types/pg.model";
import { formatCurrency } from "@/utils/format";

import {
  ColivingAmenityGrid,
  ColivingAmenityTabs,
  ColivingFoodCard,
  ColivingHighlightGrid,
  ColivingHostSection,
  ColivingMapBlock,
  ColivingReviewsBlock,
  ColivingRoomCard,
  ColivingRuleCard,
  Clock,
  DEFAULT_MEAL_SCHEDULE,
  DEFAULT_REVIEW_BARS,
  Home,
  Users,
} from "./coliving-detail-parts";
import { ColivingNearbyStripDynamic } from "./coliving-nearby-strip-dynamic";
import {
  ColivingAccent,
  ColivingBlock,
  ColivingEyebrow,
  ColivingSectionTitle,
} from "./coliving-detail-ui";

const NOT_PROVIDED = ["Swimming pool", "Gym", "Weekend laundry", "Pets allowed"];

type ColivingDetailMainProps = {
  pg: PgDetail;
};

function buildHostTags(pg: PgDetail): string[] {
  const tags: string[] = ["↺ 48-hour move-in"];
  tags.push(`● ${availabilityLabel(pg.availableFrom)}`);
  if (pg.postedBy) tags.push(`↑ Posted by ${pg.postedBy}`);
  return tags;
}

/** "Available now" once the date has passed (or is missing), otherwise "Available from 5 Nov 2026". */
function availabilityLabel(availableFrom?: string): string {
  const date = availableFrom ? new Date(availableFrom) : null;
  if (!date || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return "Available now";
  return `Available from ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

/** Explanations for host-selected rules that are only a label in the API. */
function ruleText(rule: string, pg: PgDetail): string {
  const lower = rule.toLowerCase();
  if (lower.includes("lock-in") || lower.includes("lock in")) {
    return pg.noticePeriod.required && pg.noticePeriod.days > 0
      ? `A minimum stay applies, with ${pg.noticePeriod.days} days notice before you move out. Confirm the exact lock-in with the owner before booking.`
      : "A minimum stay applies. Confirm the exact lock-in period with the owner before booking.";
  }
  if (lower.includes("guardian")) return "Parents and guardians cannot stay overnight.";
  if (lower.includes("opposite gender")) return "Guests of the opposite gender are not allowed inside rooms.";
  if (lower.includes("loud music")) return "Keep music and calls quiet after 10pm.";
  if (lower.includes("vegetarian")) return "Only vegetarian food is cooked and allowed in the kitchen.";
  return "";
}

function buildRules(pg: PgDetail) {
  const rules: { type: "allowed" | "no"; title: string; text: string }[] = [];

  pg.rules.forEach((rule) => {
    const lower = rule.toLowerCase();
    const isRestriction =
      lower.includes("no ") || lower.includes("not ") || lower.includes("cannot");
    rules.push({
      type: isRestriction ? "no" : "allowed",
      title: rule,
      text: ruleText(rule, pg),
    });
  });

  if (pg.noticePeriod.required) {
    rules.push({
      type: "allowed",
      title: `${pg.noticePeriod.days}-day notice period`,
      text: "Standard notice in writing — applies both ways, to you and the operator.",
    });
  }

  rules.push({
    type: pg.gateClosing ? "no" : "allowed",
    title: pg.gateClosing ? "Gate closes at night" : "No gate closing",
    text: pg.gateClosing
      ? "Please check curfew timings with the operator before move-in."
      : "Available all day, 24/7. Late nights are fine — please log entry with security after midnight.",
  });

  if (pg.maintenanceCharge.applicable) {
    rules.push({
      type: "no",
      title: "Maintenance charge",
      text:
        pg.maintenanceCharge.amount != null
          ? `Additional ${pg.maintenanceCharge.amount} per month may apply.`
          : "Additional maintenance charge may apply.",
    });
  }

  if (pg.preferredGuests) {
    rules.push({
      type: "allowed",
      title: "Open to",
      text: `${pg.preferredGuests}. Standard ID verification at move-in.`,
    });
  }

  return rules;
}

function reviewToCard(r: PgDetail["reviews"][number], i: number) {
  return {
    initial: (r.status || "R").slice(0, 1).toUpperCase(),
    name: r.status || `Resident ${i + 1}`,
    when: r.date ? `Reviewed ${r.date}` : "Verified resident",
    stars: Math.min(5, Math.max(1, Math.round(r.rating))),
    quote: r.feedback,
  };
}

export function ColivingDetailMain({ pg }: ColivingDetailMainProps) {
  const [amenTab, setAmenTab] = useState<0 | 1 | 2>(0);
  const minRent = pgStartingRent(pg);
  const hostInitials = (pg.postedBy || pg.name).slice(0, 2).toUpperCase();
  const coordinates: MapCoordinates | null = pg.coordinates
    ? { lat: pg.coordinates.lat, lng: pg.coordinates.lng }
    : null;
  const mapsLink = buildMapsLink(coordinates, pg.address);

  const listedAmenities = new Set([...pg.commonAmenities, ...pg.roomAmenities].map((a) => a.toLowerCase()));
  const notProvided = NOT_PROVIDED.filter((a) => !listedAmenities.has(a.toLowerCase()));
  const amenityItems =
    amenTab === 0 ? pg.commonAmenities : amenTab === 1 ? pg.roomAmenities : notProvided;

  const roomFeatures = roomFeatureList(pg.roomAmenities);
  const minDeposit = Math.min(...pg.rooms.map((r) => r.deposit ?? Infinity));
  const roomIntro = [
    pg.roomAmenities.length
      ? `Rooms come with ${pg.roomAmenities.slice(0, 6).join(", ").toLowerCase()}.`
      : "",
    Number.isFinite(minDeposit) && minDeposit > 0 ? `Security deposit from ${formatCurrency(minDeposit)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mealSchedule =
    pg.food.meals.length >= 3
      ? pg.food.meals.slice(0, 3).map((m, i) => ({
          label: m,
          time: DEFAULT_MEAL_SCHEDULE[i]?.time ?? "",
        }))
      : [...DEFAULT_MEAL_SCHEDULE];

  const billsLabel = [
    pg.food.included ? "Food" : null,
    "Wi-Fi",
    pg.roomCleaning ? "Cleaning" : null,
    pg.water ? "Water" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="min-w-0">
      <ColivingBlock id="overview" className="!pt-6 lg:!pt-9">
        <ColivingHostSection
          hostName={pg.name.split(/[·,]/)[0]?.trim() || pg.postedBy || pg.name}
          hostInitials={hostInitials}
          verified={pg.verified}
          subtitle={[pg.type, pg.preferredGuests && pg.preferredGuests.toLowerCase() !== "all" ? `For ${pg.preferredGuests.toLowerCase()}` : "", pg.contactSchedule].filter(Boolean).join(" · ")}
          tags={buildHostTags(pg)}
        />

        <div className="mt-8 max-w-3xl">
          <h2 className="font-display text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[1.85rem] lg:text-[2.125rem]">
            A quiet {pg.type.toLowerCase()} in <ColivingAccent>{pg.locality}</ColivingAccent>
          </h2>
          {pgDescriptionParagraphs(pg).map((paragraph, i) => (
            <p key={i} className="mt-4 text-[0.9375rem] leading-relaxed text-ink/90 sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8">
          <ColivingHighlightGrid
            items={[
              { icon: Home, label: "Available for", value: pg.type },
              { icon: Users, label: "Open to", value: pg.preferredGuests || "All guests" },
              {
                icon: Wifi,
                label: "All-inclusive bills",
                value: billsLabel ? `Rent · ${billsLabel}` : "Rent · utilities",
              },
              {
                icon: Clock,
                label: "Notice period",
                value: pg.noticePeriod.required ? `${pg.noticePeriod.days} days` : "Flexible",
              },
            ]}
          />
        </div>
      </ColivingBlock>

      <ColivingBlock id="rooms">
        <ColivingEyebrow>Pick your room</ColivingEyebrow>
        <ColivingSectionTitle>
          {pg.rooms.length} room type{pg.rooms.length !== 1 ? "s" : ""}.{" "}
          <ColivingAccent>Same residence</ColivingAccent>
        </ColivingSectionTitle>
        {roomIntro ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{roomIntro}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-4">
          {pg.rooms.map((room) => (
            <ColivingRoomCard
              key={room.type}
              title={room.type}
              specs={roomOccupancy(room.type)}
              features={roomFeatures}
              rent={room.rent}
              deposit={room.deposit}
              recommended={room.rent != null && room.rent === minRent && minRent > 0}
            />
          ))}
        </div>
      </ColivingBlock>

      <ColivingBlock id="amenities">
        <ColivingEyebrow>What&apos;s included</ColivingEyebrow>
        <ColivingSectionTitle>
          Amenities, on the <ColivingAccent>house</ColivingAccent>
        </ColivingSectionTitle>
        <ColivingAmenityTabs active={amenTab} onChange={setAmenTab} />
        <ColivingAmenityGrid items={amenityItems} muted={amenTab === 2} />
      </ColivingBlock>

      <ColivingBlock id="meals">
        <ColivingEyebrow>Food included</ColivingEyebrow>
        <ColivingSectionTitle>
          {pg.food.included ? (
            <>
              Three meals a day, <ColivingAccent>freshly cooked</ColivingAccent>
            </>
          ) : (
            "Meals not included"
          )}
        </ColivingSectionTitle>
        {pg.food.included ? (
          <>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
              An in-house kitchen, run by a full-time cook, with a rotating weekly menu. All meals are vegetarian
              by default — non-veg available on request.
            </p>
            <ColivingFoodCard meals={mealSchedule} />
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Meals are not part of the monthly rent for this property.</p>
        )}
      </ColivingBlock>

      <ColivingBlock id="rules">
        <ColivingEyebrow>Good to know</ColivingEyebrow>
        <ColivingSectionTitle>
          House rules &amp; <ColivingAccent>policies</ColivingAccent>
        </ColivingSectionTitle>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Transparent terms before you move in. No surprise clauses on move-out day.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {buildRules(pg).map((rule) => (
            <ColivingRuleCard key={rule.title} type={rule.type} title={rule.title} text={rule.text} />
          ))}
        </div>
      </ColivingBlock>

      <ColivingBlock id="location">
        <ColivingEyebrow>Where you&apos;ll live</ColivingEyebrow>
        <ColivingSectionTitle>
          {pg.locality} · <ColivingAccent>{pg.city}</ColivingAccent>
        </ColivingSectionTitle>
        <ColivingMapBlock
          name={pg.name}
          locality={pg.locality}
          city={pg.city}
          address={pg.address}
          coordinates={coordinates}
          mapsLink={mapsLink}
        />
        <ColivingNearbyStripDynamic
          nearbyPlaces={pg.nearbyPlaces}
          coordinates={coordinates}
          address={pg.address}
          locality={pg.locality}
          city={pg.city}
        />
      </ColivingBlock>

      <ColivingBlock id="reviews" className="!border-b-0">
        <ColivingEyebrow>What residents say</ColivingEyebrow>
        <ColivingSectionTitle>
          {pg.reviews.length > 0 ? (
            <>
              An <ColivingAccent>average {pg.rating.toFixed(2)}</ColivingAccent> across {pg.reviews.length} review
              {pg.reviews.length !== 1 ? "s" : ""}.
            </>
          ) : (
            "No reviews yet"
          )}
        </ColivingSectionTitle>
        {pg.reviews.length > 0 ? (
          <ColivingReviewsBlock
            rating={pg.rating}
            reviewCount={pg.reviews.length}
            bars={[...DEFAULT_REVIEW_BARS]}
            reviews={pg.reviews.map(reviewToCard)}
          />
        ) : null}
      </ColivingBlock>
    </main>
  );
}
