import type { CountedScore } from "./types";
import { percentOf } from "./categoryScore";

export function bestAttempt(scores: readonly CountedScore[]): CountedScore[] {
  const kept = new Map<string, CountedScore>();

  for (const score of scores) {
    const current = kept.get(score.assignmentId);
    if (current === undefined || isBetterAttempt(current, score)) {
      kept.set(score.assignmentId, score);
    }
  }
  return [...kept.values()];
}

/**
 * Determines if the given score is a better attempt than the current score.
 * A duplicate attempt is skipped, and the attempt with the higher percentage counts.
 * In case of a tie, the attempt with the lower attempt number is considered better.
 */
function isBetterAttempt(current: CountedScore, score: CountedScore): boolean {
  if (score.attempt === current.attempt) {
    return false;
  }

  const candidatePercent = percentOf(score);
  const currentPercent = percentOf(current);

  return (
    (score.attempt === 1 && candidatePercent === currentPercent) ||
    candidatePercent > currentPercent
  );
}
