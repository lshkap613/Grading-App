import { categoryScore, hasValidPointsPossible } from "./categoryScore";
import type { Config, GradeResult, Issue, Score } from "./types";
import { weightedTotal } from "./weightedTotal";
import { roundTotal } from "./roundTotal";
import { letterGrade } from "./letterGrade";

export function computeGrade(
  scores: readonly Score[],
  config: Config,
): GradeResult {
  const gradePerCategory: Record<string, number | null> = {};
  const issues: Issue[] = [];

  // get the grade for each known category
  for (const categoryId of Object.keys(config.weights)) {
    gradePerCategory[categoryId] = categoryScore(
      scores.filter((score) => score.categoryId === categoryId),
    );
  }

  const rawTotal = weightedTotal(gradePerCategory, config.weights);
  const roundedTotal =
    rawTotal === null ? null : roundTotal(rawTotal, config.decimalPlaces);
  const letter =
    roundedTotal === null ? null : letterGrade(roundedTotal, config.scale);

  // check for issues
  for (const score of scores) {
    // unknown category issue
    if (!Object.hasOwn(config.weights, score.categoryId)) {
      issues.push({ kind: "unknown-category", categoryId: score.categoryId });
    }

    // invalid pointsPossible issue
    else if (!hasValidPointsPossible(score)) {
      issues.push({
        kind: "invalid-points-possible",
        categoryId: score.categoryId,
      });
    }
  }

  return {
    gradePerCategory,
    weightedTotal: roundedTotal,
    letterGrade: letter,
    issues,
  };
}
