// FILE: components/portfolio/portfolioUtils.ts
import type { PortfolioHolding } from "../../lib/auth";

/** Clamp to [lo, hi]. */
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Parse ESG (0–100). Accepts "78", "78.2", "78%". */
export const getEsgCompositeAsNumber = (
  value: string | number | null | undefined
): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return clamp(value, 0, 100);
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    const num = Number(s.endsWith("%") ? s.slice(0, -1) : s);
    return Number.isFinite(num) ? clamp(num, 0, 100) : null;
  }
  return null; 
};

/** Normalize allocation percentage for weighting. */
const normalizePct = (pct: number | null | undefined): number => {
  if (typeof pct !== "number" || !Number.isFinite(pct)) return 0;
  return clamp(pct, 0, 100);
};

/** Your exact mapping. */
export type RatingBand = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";
export const scoreToRating = (s: number): RatingBand => {
  const v = clamp(s, 0, 100);
  if (v > 75) return "A+";
  if (v >= 70) return "A";
  if (v >= 65) return "B+";
  if (v >= 60) return "B";
  if (v >= 55) return "C+";
  if (v >= 50) return "C";
  return "D"; // <50
};

export const ratingMeta: Record<
  RatingBand,
  { category: "Leadership" | "Advanced" | "Good" | "Progressing" | "Average" | "Basic" | "Nascent"; colorClass: string }
> = {
  "A+": { category: "Leadership",  colorClass: "bg-rating-a-plus" },
  "A":  { category: "Advanced",    colorClass: "bg-rating-a" },
  "B+": { category: "Good",        colorClass: "bg-rating-b-plus" },
  "B":  { category: "Progressing", colorClass: "bg-rating-b" },
  "C+": { category: "Average",     colorClass: "bg-rating-c-plus" },
  "C":  { category: "Basic",       colorClass: "bg-rating-c" },
  "D":  { category: "Nascent",     colorClass: "bg-rating-d" },
};

/**
 * Percent-based portfolio stats:
 * - totalAllocation: sum of aum_value (as %) — can be <= or > 100 (we validate elsewhere)
 * - averageScore: weighted by percent (only rows with valid ESG score contribute)
 * - averageRating: from bands above
 */
export const calculatePortfolioStats = (holdings: PortfolioHolding[]) => {
  let totalAllocation = 0;       // sum of percentages
  let wSum = 0;                  // sum(score * pct)
  let pctWithScoreSum = 0;       // sum(pct where score exists)

  for (const h of holdings) {
    const pct = normalizePct(h.aum_value);
    totalAllocation += pct;

    const score = getEsgCompositeAsNumber(h.esg_composite);
    if (score !== null && pct > 0) {
      wSum += score * pct;
      pctWithScoreSum += pct;
    }
  }

  const avg = pctWithScoreSum > 0 ? wSum / pctWithScoreSum : 0;
  const band = scoreToRating(avg);

  return {
    totalAUM: totalAllocation.toFixed(2),   // kept prop name for compatibility; now a %
    averageScore: avg.toFixed(2),
    averageRating: band,
  };
};
