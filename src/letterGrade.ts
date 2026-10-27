import type { Scale, ScaleEntry } from "./types";

export function letterGrade(total: number, scale: Scale): string {
  let bestMatch: ScaleEntry | undefined = undefined;

  for (const entry of scale) {
    // skip grade-scale entries whose minimum percent threshold is greater than the total grade
    if (total < entry.minPercent) continue;

    if (bestMatch === undefined || entry.minPercent > bestMatch.minPercent) {
      bestMatch = entry;
    }
  }

  if (!bestMatch) {
    throw new Error(
      `Total ${total} is below every minimum in the grade scale; the scale must have a row with minPercent 0`,
    );
  }

  return bestMatch.letter;
}
