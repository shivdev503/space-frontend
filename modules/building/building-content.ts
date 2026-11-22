import { coworkingMetro, metroStationShortName } from "@/lib/metro-station";
import { operatorBrandName } from "@/lib/operator-brand";
import { managedOfficeMetro } from "@/modules/managed-office/components/detail/managed-office-detail-facts";
import { managedOfficeStartingPrice } from "@/modules/managed-office/managed-office-format";
import type { Building } from "@/services/building-api";
import type { FAQItem } from "@/types";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { ManagedOfficeModel } from "@/types/managed-office.model";
import { formatCurrency } from "@/utils/format";

export type BuildingFacts = {
  coworkingCount: number;
  managedOfficeCount: number;
  operators: string[];
  /** Cheapest coworking seat a month. */
  coworkingFrom: number | null;
  /** Cheapest managed office seat a month. */
  managedOfficeFrom: number | null;
  metro: { name: string; distance?: number } | null;
};

const positive = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

/** "DesqWorx JMD Megapolis" in JMD Megapolis → "DesqWorx" (the operator, without the building). */
function withoutBuilding(name: string, buildingName: string): string {
  const escaped = buildingName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const stripped = name
    .replace(new RegExp(`\\s*[-–,]?\\s*${escaped}\\b.*$`, "i"), "")
    .trim()
    .replace(/[-–,]$/, "")
    .trim();
  return stripped || name.trim();
}

/** "400 m" → 0.4, "1.1km" → 1.1; ranges and walking times → undefined. */
function kilometres(value: string): number | undefined {
  const m = /^(\d+(?:\.\d+)?)\s*(km|kms|m)$/i.exec(value.trim());
  if (!m) return undefined;
  const n = Number(m[1]) / (m[2].toLowerCase() === "m" ? 1000 : 1);
  return n > 0 && n < 20 ? n : undefined;
}

export function buildingFacts(
  workspaces: CoworkingModel.WorkSpace[],
  offices: ManagedOfficeModel.ManagedOffice[],
  buildingName = "",
): BuildingFacts {
  const operators = new Set<string>();
  for (const ws of workspaces) {
    operators.add(operatorBrandName(ws.brand) || withoutBuilding(ws.name, buildingName));
  }
  for (const o of offices) operators.add((operatorBrandName(o.brand) || withoutBuilding(o.name, buildingName)).trim());

  const cw = workspaces.map((w) => w.starting_price).filter(positive);
  const mo = offices.map(managedOfficeStartingPrice).filter(positive);

  let metro: BuildingFacts["metro"] = null;
  for (const ws of workspaces) {
    const m = coworkingMetro(ws.location);
    if (!m) continue;
    const km = kilometres(m.distance);
    if (!metro || (km !== undefined && (metro.distance === undefined || km < metro.distance))) {
      metro = { name: metroStationShortName(m.name), distance: km };
    }
  }
  if (!metro) {
    const office = offices.map(managedOfficeMetro).find(Boolean);
    if (office) metro = { name: metroStationShortName(office.name), distance: kilometres(office.distance) };
  }

  return {
    coworkingCount: workspaces.length,
    managedOfficeCount: offices.length,
    operators: Array.from(operators).filter(Boolean),
    coworkingFrom: cw.length ? Math.min(...cw) : null,
    managedOfficeFrom: mo.length ? Math.min(...mo) : null,
    metro,
  };
}

/** "Sohna Road, Gurugram" */
export function buildingPlace(building: Building): string {
  return [building.areaName, building.cityName].filter(Boolean).join(", ");
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function centresPhrase(f: BuildingFacts): string {
  const parts = [];
  if (f.coworkingCount) parts.push(`${f.coworkingCount} coworking space${f.coworkingCount === 1 ? "" : "s"}`);
  if (f.managedOfficeCount) parts.push(`${f.managedOfficeCount} managed office${f.managedOfficeCount === 1 ? "" : "s"}`);
  return list(parts);
}

export function buildingTitle(building: Building, f: BuildingFacts): string {
  const what = f.coworkingCount && f.managedOfficeCount ? "Coworking & Office Space" : f.coworkingCount ? "Coworking Space" : "Managed Office Space";
  return `${what} in ${building.name}${building.cityName ? `, ${building.cityName}` : ""}`;
}

export function buildingIntro(building: Building, f: BuildingFacts): string {
  const place = buildingPlace(building);
  const from = [
    f.coworkingFrom ? `coworking seats from ${formatCurrency(f.coworkingFrom)} a month` : "",
    f.managedOfficeFrom ? `managed office seats from ${formatCurrency(f.managedOfficeFrom)} a month` : "",
  ].filter(Boolean);
  return (
    `${building.name}${place ? ` in ${place}` : ""} has ${centresPhrase(f)} listed on SpaceWallah` +
    (f.operators.length ? `, run by ${list(f.operators.slice(0, 6))}` : "") +
    "." +
    (from.length ? ` Compare ${list(from)}.` : "") +
    " Book a free visit with zero brokerage."
  );
}

export function buildingSeo(building: Building, f: BuildingFacts): { title: string; description: string } {
  const total = f.coworkingCount + f.managedOfficeCount;
  const from = f.coworkingFrom ?? f.managedOfficeFrom;
  return {
    title: `${buildingTitle(building, f)} | ${total} Centres`,
    description:
      `Compare ${centresPhrase(f)} in ${building.name}${building.cityName ? `, ${building.cityName}` : ""}` +
      (from ? `, from ${formatCurrency(from)}/seat a month` : "") +
      (f.operators.length ? `: ${list(f.operators.slice(0, 4))}` : "") +
      ". Real prices and photos, free visits, zero brokerage.",
  };
}

/** Questions people search for a building, answered from its listings. */
export function buildingFaqs(building: Building, f: BuildingFacts): FAQItem[] {
  const faqs: FAQItem[] = [];
  const name = building.name;
  faqs.push({
    id: "how-many",
    question: `How many coworking spaces and offices are in ${name}?`,
    answer:
      `SpaceWallah lists ${centresPhrase(f)} in ${name}` +
      (f.operators.length ? `: ${list(f.operators)}.` : ".") +
      " Each listing shows its plans, photos and amenities.",
  });
  if (f.coworkingFrom || f.managedOfficeFrom) {
    faqs.push({
      id: "price",
      question: `What is the price of office space in ${name}?`,
      answer: [
        f.coworkingFrom ? `Coworking seats in ${name} start at ${formatCurrency(f.coworkingFrom)} a month.` : "",
        f.managedOfficeFrom ? `Managed office seats start at ${formatCurrency(f.managedOfficeFrom)} a month.` : "",
        "Prices depend on the plan (hot desk, dedicated desk or private cabin) and the number of seats.",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }
  if (building.address || building.areaName) {
    faqs.push({
      id: "where",
      question: `Where is ${name}?`,
      answer:
        `${name} is in ${[building.address, building.areaName, building.cityName].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.` +
        (f.metro ? ` The nearest metro station is ${f.metro.name}${f.metro.distance ? ` (about ${f.metro.distance} km)` : ""}.` : ""),
    });
  }
  faqs.push({
    id: "visit",
    question: `Can I visit a coworking space in ${name} before booking?`,
    answer:
      "Yes. Send an enquiry from any listing on this page and SpaceWallah arranges a free visit with the operator. There is no brokerage fee.",
  });
  return faqs;
}
