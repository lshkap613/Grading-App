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

    it.todo("homework 100, tests null -> 100 (null category skipped)");
    it.todo(
      "homework 0, tests 100 -> 50 (a score of 0 counts; only null is skipped)",
    );
    it.todo(
      "spec example: weights {participation: 30, homework: 20, quizzes: 20, tests: 30}, participation 100, homework 80, quizzes 90, tests null -> 91.43 (6400 / 70)",
    );
  });

  // Each category's score is multiplied by its weight, then divided by the weights used.
  describe("weights", () => {
    it.todo("homework 80, tests 90 -> 85");
    it.todo(
      "weights not adding up to 100: weights {homework: 1, tests: 1}, homework 80, tests 90 -> 85",
    );
    it.todo(
      "weights {homework: 1, tests: 2}, homework 63.33 (190 / 3), tests 72 -> 69.11 (622 / 9)",
    );
    it.todo(
      "7th grade spreadsheet row: weights {participation: 40, homework: 20, quizzes: 15, tests: 25}, participation 94, homework 89.6, quizzes 80, tests 100 -> 92.52",
    );
  });

  // The total is not capped at 100.
  describe("extra credit", () => {
    it.todo("homework 104, tests 96.1 -> 100.05");
  });
});
