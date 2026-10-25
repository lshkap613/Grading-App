import type { DecimalPlaces } from "./types";

export function roundTotal(
  total: number,
  decimalPlaces: DecimalPlaces,
): number {
  return Math.round(total * 10 ** decimalPlaces) / 10 ** decimalPlaces;
}
