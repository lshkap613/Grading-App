import type { Score } from "./types";

/**
 * Calculates the average score for a category based on its scores.
 * Not all scores are counted in the average.
 * Counted scores are have status of "entered", "late", or "missing".
 * Dropped, excused, and not-entered scores are ignored.
 * Missing scores are counted as 0.
 * If there are no counted scores, the average is null.
 */
export function categoryScore(scores: readonly Score[]): number | null {
  const countedScores = scores.filter(
    (score) =>
      score.status === "entered" ||
      score.status === "late" ||
      score.status === "missing",
  ).filter((score) => score.pointsPossible > 0);

  const percents = countedScores.map((score) => {
    if (score.status === "missing") {
      return 0;
    }
    return (score.points / score.pointsPossible) * 100;
  });

  const average =
    percents.length === 0
      ? null
      : percents.reduce((sum, percent) => sum + percent, 0) / percents.length;

  return average;
}
