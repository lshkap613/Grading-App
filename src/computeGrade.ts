import { categoryScore } from "./categoryScore";
import type { Config, GradeResult, Score, Weights } from "./types";
import { weightedTotal } from "./weightedTotal";
import { roundTotal } from "./roundTotal";
import { letterGrade } from "./letterGrade";
import { findIssues } from "./findIssues";

export function computeGrade(
  scores: readonly Score[],
  config: Config,
): GradeResult {
  const gradePerCategory: Record<string, number | null> = {};
  const issues = findIssues(scores, config.categories);

  // get the grade for each known category
  for (const categoryId of Object.keys(config.categories)) {
    gradePerCategory[categoryId] = categoryScore(
      scores.filter((score) => score.categoryId === categoryId),
    );
  }

  // record of categoryIds to weights
  const weights: Weights = Object.fromEntries(
    Object.entries(config.categories).map(([categoryId, category]) => [
      categoryId,
      category.weight,
    ]),
  );

  // get the rounded, weighted total of all categories
  const rawTotal = weightedTotal(gradePerCategory, weights);
  const roundedTotal =
    rawTotal === null ? null : roundTotal(rawTotal, config.decimalPlaces);

  // get the rounded, weighted total's corresponding letter
  const letter =
    roundedTotal === null ? null : letterGrade(roundedTotal, config.scale);

  return {
    gradePerCategory,
    weightedTotal: roundedTotal,
    letterGrade: letter,
    issues,
  };
}
