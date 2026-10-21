import type { Score } from "./types";

/**
 * Calculates the average score for a category based on its scores.
 * Not all scores are counted in the average.
 * Counted scores have status of "entered", "late", or "missing".
 * Dropped, excused, and not-entered scores are ignored, and so are scores
 * with pointsPossible of 0 or less.
 * Missing scores are counted as 0.
 * If there are no counted scores, the average is null.
 */
export function categoryScore(scores: readonly Score[]): number | null {
  const countedScores = scores
    .filter(
      (score) =>
        score.status === "entered" ||
        score.status === "late" ||
        score.status === "missing",
    )
    .filter((score) => hasValidPointsPossible(score));

  const percents = countedScores.map((score) => {
    if (score.status === "missing") {
      return 0;
    }
    return (score.points / score.pointsPossible) * 100;
  });

  return percents.length === 0
    ? null
    : percents.reduce((sum, percent) => sum + percent, 0) / percents.length;
}

export function hasValidPointsPossible(score: Score): boolean {
  return score.pointsPossible > 0;
}
