import type { GradeResult, Weights } from "./types";

export function weightedTotal(
  gradePerCategory: Readonly<GradeResult["gradePerCategory"]>,
  weights: Weights,
): number | null {
  let weightedSum = 0;
  let weightSum = 0;

  for (const [categoryId, weight] of Object.entries(weights)) {
    if (gradePerCategory[categoryId] != null) {
      weightedSum += gradePerCategory[categoryId] * weight;
      weightSum += weight;
    }
  }

  if (weightSum === 0) {
    return null;
  }

  return weightedSum / weightSum;
}
