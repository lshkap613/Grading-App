import { categoryScore, hasValidPointsPossible } from "./categoryScore";
import type { Config, GradeResult, Issue, Score } from "./types";

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
    weightedTotal: null,
    letterGrade: null,
    issues,
  };
}
