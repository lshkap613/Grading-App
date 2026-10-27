import { describe, expect, it } from "vitest";
import { weightedTotal } from "../src/weightedTotal";

const weights = { homework: 50, tests: 50 };

// Inputs are a gradePerCategory record (as built by computeGrade) and weights.
// Unless a test says otherwise: weights { homework: 50, tests: 50 }.
// Totals are unrounded; rounding happens in computeGrade.
describe("weightedTotal", () => {
  // Categories with a null score are left out of both the sum and the divisor.
  describe("empty categories", () => {
    it("homework null, tests null -> null", () => {
      expect(weightedTotal({ homework: null, tests: null }, weights)).toEqual(
        null,
      );
    });

    it("homework 100, tests null -> 100 (null category skipped)", () => {
      expect(weightedTotal({ homework: 100, tests: null }, weights)).toEqual(
        100,
      );
    });

    it("homework 0, tests 100 -> 50 (a score of 0 counts; only null is skipped)", () => {
      expect(weightedTotal({ homework: 0, tests: 100 }, weights)).toEqual(50);
    });

    it("spec example: weights {participation: 30, homework: 20, quizzes: 20, tests: 30}, participation 100, homework 80, quizzes 90, tests null -> 91.43 (6400 / 70)", () => {
      expect(
        weightedTotal(
          { participation: 100, homework: 80, quizzes: 90, tests: null },
          { participation: 30, homework: 20, quizzes: 20, tests: 30 },
        ),
      ).toBeCloseTo(6400 / 70, 10);
    });
  });

  // Each category's score is multiplied by its weight, then divided by the weights used.
  describe("weights", () => {
    it("homework 80, tests 90 -> 85", () => {
      expect(weightedTotal({ homework: 80, tests: 90 }, weights)).toEqual(85);
    });

    it("weights not adding up to 100: weights {homework: 1, tests: 1}, homework 80, tests 90 -> 85", () => {
      expect(
        weightedTotal({ homework: 80, tests: 90 }, { homework: 1, tests: 1 }),
      ).equal(85);
    });

    it("weights {homework: 1, tests: 2}, homework 63.33 (190 / 3), tests 72 -> 69.11 (622 / 9)", () => {
      expect(
        weightedTotal(
          { homework: 190 / 3, tests: 72 },
          { homework: 1, tests: 2 },
        ),
      ).toBeCloseTo(622 / 9, 10);
    });

    it("7th grade spreadsheet row: weights {participation: 40, homework: 20, quizzes: 15, tests: 25}, participation 94, homework 89.6, quizzes 80, tests 100 -> 92.52", () => {
      expect(
        weightedTotal(
          { participation: 94, homework: 89.6, quizzes: 80, tests: 100 },
          { participation: 40, homework: 20, quizzes: 15, tests: 25 },
        ),
      ).toBe(92.52);
    });
  });

  // The total is not capped at 100.
  describe("extra credit", () => {
    it("homework 104, tests 96.1 -> 100.05", () => {
      expect(weightedTotal({ homework: 104, tests: 96.1 }, weights)).toEqual(
        100.05,
      );
    });
  });
});
