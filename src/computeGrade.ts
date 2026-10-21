import { categoryScore } from "./categoryScore";
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

  return {
    gradePerCategory,
    weightedTotal: null,
    letterGrade: null,
    issues,
  };
}
