export type UnitSystem = "imperial" | "metric";

const LB_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

export function roundMeasure(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatMeasure(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "";
  return String(roundMeasure(value, digits));
}

/** Convert stored imperial values into display strings for the active unit system. */
export function toDisplayHeight(heightIn: string, unitSystem: UnitSystem): string {
  const n = Number(heightIn);
  if (!heightIn.trim() || !Number.isFinite(n) || n <= 0) return "";
  return unitSystem === "metric" ? formatMeasure(n * CM_PER_IN) : formatMeasure(n);
}

export function toDisplayWeight(weightLb: string, unitSystem: UnitSystem): string {
  const n = Number(weightLb);
  if (!weightLb.trim() || !Number.isFinite(n) || n <= 0) return "";
  return unitSystem === "metric" ? formatMeasure(n / LB_PER_KG) : formatMeasure(n);
}

/** Convert a height typed in the active unit system into inches for storage. */
export function heightToInches(value: string, unitSystem: UnitSystem): string {
  const n = Number(value);
  if (!value.trim() || !Number.isFinite(n) || n <= 0) return "";
  return unitSystem === "metric" ? formatMeasure(n / CM_PER_IN) : formatMeasure(n);
}

/** Convert a weight typed in the active unit system into pounds for storage. */
export function weightToPounds(value: string, unitSystem: UnitSystem): string {
  const n = Number(value);
  if (!value.trim() || !Number.isFinite(n) || n <= 0) return "";
  return unitSystem === "metric" ? formatMeasure(n * LB_PER_KG) : formatMeasure(n);
}
