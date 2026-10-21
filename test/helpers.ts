import type {
  EnteredScore,
  LateScore,
  MissingScore,
  DroppedScore,
  ExcusedScore,
  NotEnteredScore,
} from "../src/types";

// Test helpers that build one score of each status, so each test reads like
// its name. Scores default to the "homework" category and 100 points possible.
export function entered(
  points: number,
  pointsPossible = 100,
  categoryId = "homework",
): EnteredScore {
  return { categoryId, pointsPossible, status: "entered", points };
}

export function late(
  points: number,
  pointsPossible = 100,
  categoryId = "homework",
): LateScore {
  return { categoryId, pointsPossible, status: "late", points };
}

export function missing(
  pointsPossible = 100,
  categoryId = "homework",
): MissingScore {
  return { categoryId, pointsPossible, status: "missing" };
}

export function dropped(
  points?: number,
  pointsPossible = 100,
  categoryId = "homework",
): DroppedScore {
  if (points === undefined) {
    return { categoryId, pointsPossible, status: "dropped" };
  }
  return { categoryId, pointsPossible, status: "dropped", points };
}

export function excused(
  pointsPossible = 100,
  categoryId = "homework",
): ExcusedScore {
  return { categoryId, pointsPossible, status: "excused" };
}

export function notEntered(
  pointsPossible = 100,
  categoryId = "homework",
): NotEnteredScore {
  return { categoryId, pointsPossible, status: "not-entered" };
}
