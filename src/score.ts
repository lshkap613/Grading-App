import type { CountedScore, Score } from "./types";

export function hasValidPointsPossible(score: Score): boolean {
  return score.pointsPossible > 0;
}

export function percentOf(score: CountedScore): number {
  if (score.status === "missing") {
    return 0;
  }
  return (score.points / score.pointsPossible) * 100;
}
