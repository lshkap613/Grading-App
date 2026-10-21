import type { Config, GradeResult, Issue, Score } from "./types";

export function computeGrade(
  scores: readonly Score[],
  config: Config,
): GradeResult {
  const gradePerCategory: Record<string, number | null> = {};
  const issues: Issue[] = [];

  for (const categoryId of Object.keys(config.weights)) {
    gradePerCategory[categoryId] = null;
  }

  return {
    gradePerCategory,
    weightedTotal: null,
    letterGrade: null,
    issues,
  };
}
