import type { Score } from "./types";

export function categoryScore(scores: readonly Score[]): number | null {
  const countedScores = scores.filter((score) => score.status === "entered");

  const average =
    countedScores.length === 0
      ? null
      : countedScores.reduce(
          (sum, score) => sum + (score.points / score.pointsPossible) * 100,
          0,
        ) / countedScores.length;

  return average;
}
