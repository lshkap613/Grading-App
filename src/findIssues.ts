import type { Score, Issue, Weights } from "./types";
import { hasValidPointsPossible } from "./categoryScore";

export function findIssues(
  scores: readonly Score[],
  weights: Weights,
): Issue[] {
  const issues: Issue[] = [];

  for (const score of scores) {
    // unknown category issue
    if (!Object.hasOwn(weights, score.categoryId)) {
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

  return issues;
}
