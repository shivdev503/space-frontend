/** "4.5 · 12 reviews" when the listing has a real rating and reviews, otherwise null (never a made-up score). */
export function ratingLabel(rating: number | null | undefined, reviewCount: number | null | undefined): string | null {
  const n = reviewCount ?? 0;
  if (!rating || rating <= 0 || n <= 0) return null;
  return `${rating.toFixed(1)} · ${n} review${n === 1 ? "" : "s"}`;
}
