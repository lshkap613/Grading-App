import type { Categories, Score, Issue } from "./types";
import { hasValidPointsPossible } from "./score";

export function findIssues(
  scores: readonly Score[],
  categories: Categories,
): Issue[] {
  const issues: Issue[] = [];

  for (const score of scores) {
    // unknown category issue
    if (!Object.hasOwn(categories, score.categoryId)) {
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
