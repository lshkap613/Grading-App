import type { GradeResult, Weights } from "./types";

export function weightedTotal(
  gradePerCategory: Readonly<GradeResult["gradePerCategory"]>,
  weights: Weights,
): number | null {
  let weightedSum = 0;
  let weightSum = 0;

  for (const [categoryId, weight] of Object.entries(weights)) {
    let categoryGrade = gradePerCategory[categoryId];

    if (categoryGrade != null) {
      weightedSum += categoryGrade * weight;
      weightSum += weight;
    }
  }

  if (weightSum === 0) {
    return null;
  }

  return weightedSum / weightSum;
}
