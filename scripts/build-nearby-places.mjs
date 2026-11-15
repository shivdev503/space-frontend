/**
 * Builds data/nearby-places.json: OpenStreetMap stations, malls, markets and supermarkets for every
 * city SpaceWallah covers, so listing pages can show "nearby places" instantly without calling the
 * public Overpass servers on each visit (they are often slow or down).
 *
 * Run now and then (places change slowly):  node scripts/build-nearby-places.mjs
 * Data © OpenStreetMap contributors (ODbL).
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "data", "nearby-places.json");
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/** south, west, north, east */
const AREAS = {
  ncr: [28.2, 76.8, 28.9, 77.6], // Delhi, Gurgaon, Noida, Greater Noida
  mumbai: [18.85, 72.75, 19.35, 73.2],
  pune: [18.4, 73.7, 18.7, 74.05],
  bangalore: [12.8, 77.4, 13.2, 77.8],
  hyderabad: [17.25, 78.25, 17.6, 78.65],
  chennai: [12.8, 80.05, 13.25, 80.35],
  ahmedabad: [22.9, 72.45, 23.15, 72.7],
  jaipur: [26.75, 75.65, 27.05, 75.95],
  lucknow: [26.7, 80.8, 27.0, 81.1],
  indore: [22.6, 75.75, 22.85, 75.98],
};

/** Same kinds (and search radius, metres) the live lookup used. */
const KINDS = [
  { kind: "station", filter: '["railway"="station"]', radius: 6000 },
  { kind: "station", filter: '["station"="subway"]', radius: 6000 },
  { kind: "station", filter: '["public_transport"="station"]["subway"="yes"]', radius: 6000 },
  { kind: "mall", filter: '["shop"="mall"]', radius: 5000 },
  { kind: "market", filter: '["amenity"="marketplace"]', radius: 2500 },
  { kind: "supermarket", filter: '["amenity"="supermarket"]', radius: 2000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(query) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "SpaceWallah/1.0 (+https://spacewallah.com)" },
          body: new URLSearchParams({ data: query }).toString(),
          signal: AbortSignal.timeout(180_000),
        });
        if (res.ok) return await res.json();
        console.warn(`  ${url} answered ${res.status}`);
      } catch (e) {
        console.warn(`  ${url} failed: ${e.message}`);
      }
    }
    await sleep(15_000);
  }
  throw new Error("all Overpass servers failed");
}

const name = (t) => t.name || t["name:en"] || t.brand || t.operator || "";

async function main() {
  const places = [];
  for (const [area, [s, w, n, e]] of Object.entries(AREAS)) {
    const bbox = `${s},${w},${n},${e}`;
    const q = `[out:json][timeout:170];(${KINDS.map((k) => `node${k.filter}(${bbox});`).join("")});out body;`;
    process.stdout.write(`${area}… `);
    const data = await overpass(q);
    let count = 0;
    for (const el of data.elements ?? []) {
      const t = el.tags || {};
      const nm = name(t).trim();
      if (!nm || typeof el.lat !== "number") continue;
      const k = KINDS.find((x) => {
        if (x.kind === "station") return t.railway === "station" || t.station === "subway" || (t.public_transport === "station" && t.subway === "yes");
        if (x.kind === "mall") return t.shop === "mall";
        if (x.kind === "market") return t.amenity === "marketplace";
        return t.amenity === "supermarket";
      });
      if (!k) continue;
      places.push([Math.round(el.lat * 1e5) / 1e5, Math.round(el.lon * 1e5) / 1e5, nm, k.kind]);
      count += 1;
    }
    console.log(count);
    await sleep(5000);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ builtAt: new Date().toISOString(), source: "© OpenStreetMap contributors (ODbL)", places }));
  console.log(`Saved ${places.length} places to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
