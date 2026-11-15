export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function toTitleCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/** City name as written in headings: the API says "Gurugram", the site uses "Gurgaon". */
export function displayCityName(name: string | undefined | null): string {
  const n = (name ?? "").trim();
  return /^gurugram$/i.test(n) ? "Gurgaon" : n;
}
