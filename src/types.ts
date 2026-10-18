/**
 * Fields every score has, whatever its status.
 * `pointsPossible` is in points, not percent
 */
export type ScoreBase = { categoryId: string; pointsPossible: number };

export type EnteredScore = ScoreBase & { status: "entered"; points: number };
export type LateScore = ScoreBase & { status: "late"; points: number };

export type MissingScore = ScoreBase & { status: "missing" };

/**
 * Left out of the average. `points` is optional because a missing score can
 * be dropped too..
 */
export type DroppedScore = ScoreBase & { status: "dropped"; points?: number };

/** Left out of the average, as if the assignment did not exist for this student. */
export type ExcusedScore = ScoreBase & { status: "excused" };

/** Not graded yet. Ignored, so a teacher can enter grades gradually. */
export type NotEnteredScore = ScoreBase & { status: "not-entered" };

export type Score =
  | EnteredScore
  | LateScore
  | MissingScore
  | DroppedScore
  | ExcusedScore
  | NotEnteredScore;

export type ScoreStatus = Score["status"];

export type ScaleEntry = { letter: string; minPercent: number };

export type Scale = readonly ScaleEntry[];

/**
 * Category weight as a percentage, keyed by categoryId.
 */
export type Weights = Readonly<Record<string, number>>;

/** Decimal places for the final total only; scores and averages are never rounded. */
export type DecimalPlaces = 0 | 1 | 2;

export type Config = {
  scale: Scale;
  weights: Weights;
  decimalPlaces: DecimalPlaces;
};

/** A score's category has no entry in `weights`. The score is left out of the result. */
export type UnknownCategoryIssue = {
  kind: "unknown-category";
  categoryId: string;
};

/** A score has `pointsPossible` of 0 or less. The score is left out of the result. */
export type InvalidPointsPossibleValueIssue = {
  kind: "invalid-points-possible";
  categoryId: string;
};

/** Problems the engine found but worked around. The UI decides how to word them. */
export type Issue = UnknownCategoryIssue | InvalidPointsPossibleValueIssue;

/**
 * One student's grade. A category with no counted scores is null; with none at all,
 * the total and letter are null too. The total is rounded to `decimalPlaces`.
 */
export type GradeResult = {
  scorePerCategory: Record<string, number | null>;
  weightedTotal: number | null;
  letterGrade: string | null;
  issues: Issue[];
};
