import type {
  EnteredScore,
  LateScore,
  MissingScore,
  DroppedScore,
  ExcusedScore,
  NotEnteredScore,
  ScoreBase,
} from "../src/types";

type ScoreOptions = Partial<ScoreBase>;

let nextAssignmentId = 1;

function base(options: ScoreOptions): ScoreBase {
  return {
    categoryId: "homework",
    pointsPossible: 100,
    date: "2026-09-01",
    attempt: 1,
    ...options,
    assignmentId: options.assignmentId ?? `auto-${nextAssignmentId++}`,
  };
}

// Test helpers that build one score of each status, so each test reads like
// its name. Defaults come from base(); pass options to override any of them.
export function entered(
  points: number,
  options: ScoreOptions = {},
): EnteredScore {
  return {
    ...base(options),
    status: "entered",
    points,
  };
}

export function late(points: number, options: ScoreOptions = {}): LateScore {
  return { ...base(options), status: "late", points };
}

export function missing(options: ScoreOptions = {}): MissingScore {
  return { ...base(options), status: "missing" };
}

export function dropped(
  points?: number,
  options: ScoreOptions = {},
): DroppedScore {
  if (points === undefined) {
    return { ...base(options), status: "dropped" };
  }
  return {
    ...base(options),
    status: "dropped",
    points,
  };
}

export function excused(options: ScoreOptions = {}): ExcusedScore {
  return { ...base(options), status: "excused" };
}

export function notEntered(options: ScoreOptions = {}): NotEnteredScore {
  return { ...base(options), status: "not-entered" };
}
