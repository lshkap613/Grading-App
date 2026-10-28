import { describe, expect, it } from "vitest";
import { DEFAULT_SCALE } from "../src/defaults";
import type { Config } from "../src/types";
import { computeGrade } from "../src/computeGrade";
import { dropped, entered, excused, missing, notEntered } from "./helpers";

// Unless a test says otherwise: weights { homework: 50, tests: 50 }, the default
// scale, decimalPlaces 0, and every score is out of 100.
// Issues are listed in the same order as the scores that caused them.
const config: Config = {
  scale: DEFAULT_SCALE,
  weights: { homework: 50, tests: 50 },
  decimalPlaces: 0,
};

describe("computeGrade", () => {
  describe("no counted scores", () => {
    it("no scores -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}", () => {
      expect(computeGrade([], config)).toEqual({
        gradePerCategory: { homework: null, tests: null },
        weightedTotal: null,
        letterGrade: null,
        issues: [],
      });
    });
    it("only not-entered scores -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}", () => {
      expect(
        computeGrade([notEntered(), notEntered(100, "tests")], config),
      ).toEqual({
        gradePerCategory: { homework: null, tests: null },
        weightedTotal: null,
        letterGrade: null,
        issues: [],
      });
    });
    it("homework dropped 17, tests dropped 45 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}", () => {
      expect(
        computeGrade([dropped(17), dropped(45, 100, "tests")], config),
      ).toEqual({
        gradePerCategory: { homework: null, tests: null },
        weightedTotal: null,
        letterGrade: null,
        issues: [],
      });
    });
  });

  describe("grouping and issues", () => {
    it("homework 85 -> {gradePerCategory: {homework: 85, tests: null}, weightedTotal: 85, letterGrade: 'B', issues: []}", () => {
      const result = computeGrade([entered(85)], config);
      expect(result.gradePerCategory).toEqual({ homework: 85, tests: null });
      expect(result.issues).toEqual([]);
    });

    it("homework 85, quizzes 60 (categoryId not in weights) -> {gradePerCategory: {homework: 85, tests: null}, weightedTotal: 85, letterGrade: 'B', issues: [{kind: 'unknown-category', categoryId: 'quizzes'}]}", () => {
      const result = computeGrade(
        [entered(85), entered(60, 100, "quizzes")],
        config,
      );
      expect(result.gradePerCategory).toEqual({
        homework: 85,
        tests: null,
      });
      expect(result.issues).toEqual([
        { kind: "unknown-category", categoryId: "quizzes" },
      ]);
    });

    it("homework 85/0 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: [{kind: 'invalid-points-possible', categoryId: 'homework'}]}", () => {
      const result = computeGrade([entered(85, 0)], config);
      expect(result.gradePerCategory).toEqual({
        homework: null,
        tests: null,
      });
      expect(result.issues).toEqual([
        { kind: "invalid-points-possible", categoryId: "homework" },
      ]);
    });

    it("homework 80, homework 5/0 -> {gradePerCategory: {homework: 80, tests: null}, weightedTotal: 80, letterGrade: 'B-', issues: [{kind: 'invalid-points-possible', categoryId: 'homework'}]}", () => {
      const result = computeGrade([entered(80), entered(5, 0)], config);
      expect(result.gradePerCategory).toEqual({
        homework: 80,
        tests: null,
      });
      expect(result.issues).toEqual([
        { kind: "invalid-points-possible", categoryId: "homework" },
      ]);
    });

    it("quizzes 85, homework 85/0 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: [{kind: 'unknown-category', categoryId: 'quizzes'}, {kind: 'invalid-points-possible', categoryId: 'homework'}]}", () => {
      const result = computeGrade(
        [entered(85, 100, "quizzes"), entered(85, 0)],
        config,
      );
      expect(result.gradePerCategory).toEqual({
        homework: null,
        tests: null,
      });
      expect(result.issues).toEqual([
        { kind: "unknown-category", categoryId: "quizzes" },
        { kind: "invalid-points-possible", categoryId: "homework" },
      ]);
    });

    it("weights {homework: 30, quizzes: 20, tests: 50}, no scores -> gradePerCategory has all three keys, each null", () => {
      const result = computeGrade([], {
        scale: config.scale,
        weights: { homework: 30, quizzes: 20, tests: 50 },
        decimalPlaces: config.decimalPlaces,
      });
      expect(result.gradePerCategory).toEqual({
        homework: null,
        quizzes: null,
        tests: null,
      });
      expect(result.issues).toEqual([]);
    });

    it("quizzes 75/0 -> {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: [{kind: 'unknown-category', categoryId: 'quizzes'}]} (unknown category issue returned only when invalid-points is also an issue)", () => {
      const result = computeGrade([entered(75, 0, "quizzes")], config);
      expect(result.gradePerCategory).toEqual({
        homework: null,
        tests: null,
      });
      expect(result.issues).toEqual([
        { kind: "unknown-category", categoryId: "quizzes" },
      ]);
    });
  });

  describe("weighted total", () => {
    it("homework 100, homework dropped -> {gradePerCategory: {homework: 100, tests: null}, weightedTotal: 100, letterGrade: 'A+', issues: []}", () => {
      const result = computeGrade([entered(100), dropped()], config);
      expect(result).toEqual({
        gradePerCategory: { homework: 100, tests: null },
        weightedTotal: 100,
        letterGrade: "A+",
        issues: [],
      });
    });

    it("homework 80, tests 90 -> {gradePerCategory: {homework: 80, tests: 90}, weightedTotal: 85, letterGrade: 'B', issues: []}", () => {
      const result = computeGrade(
        [entered(80), entered(90, 100, "tests")],
        config,
      );
      expect(result).toEqual({
        gradePerCategory: { homework: 80, tests: 90 },
        weightedTotal: 85,
        letterGrade: "B",
        issues: [],
      });
    });

    it("empty category skipped: weights {participation: 30, homework: 20, quizzes: 20, tests: 30}, participation 100, homework 80, quizzes 90, no tests -> weightedTotal 91 (6400 / 70 = 91.43), letterGrade 'A-'", () => {
      const result = computeGrade(
        [
          entered(100, 100, "participation"),
          entered(80),
          entered(90, 100, "quizzes"),
        ],
        {
          ...config,
          weights: { participation: 30, homework: 20, quizzes: 20, tests: 30 },
        },
      );
      expect(result).toEqual({
        gradePerCategory: {
          participation: 100,
          homework: 80,
          quizzes: 90,
          tests: null,
        },
        weightedTotal: 91,
        letterGrade: "A-",
        issues: [],
      });
    });

    it("weights not adding up to 100: weights {homework: 1, tests: 1}, homework 80, tests 90 -> weightedTotal 85, letterGrade 'B'", () => {
      const result = computeGrade([entered(80), entered(90, 100, "tests")], {
        ...config,
        weights: { homework: 1, tests: 1 },
      });
      expect(result.weightedTotal).toBe(85);
      expect(result.letterGrade).toBe("B");
    });

    it("weights {homework: 1, tests: 2}; homework: excused, missing, dropped 85, 90, 100; tests: not-entered, dropped 37, 72 -> {gradePerCategory: {homework: 63.33 (190 / 3), tests: 72}, weightedTotal: 69 (207.33 / 3 = 69.11), letterGrade: 'D', issues: []}", () => {
      const result = computeGrade(
        [
          excused(),
          missing(),
          dropped(85),
          entered(90),
          entered(100),
          notEntered(100, "tests"),
          dropped(37, 100, "tests"),
          entered(72, 100, "tests"),
        ],
        { ...config, weights: { homework: 1, tests: 2 } },
      );
      expect(result.gradePerCategory.homework).toBeCloseTo(190 / 3, 10);
      expect(result.gradePerCategory.tests).toBe(72);
      expect(result.weightedTotal).toBe(69);
      expect(result.letterGrade).toBe("D");
      expect(result.issues).toEqual([]);
    });

    it("7th grade spreadsheet row: weights {participation: 40, homework: 20, quizzes: 15, tests: 25}, participation 94, homework 89.6, quizzes 80, tests 100 -> weightedTotal 93 (92.52 rounded), letterGrade 'A' (the spreadsheet showed A- because it didn't round)", () => {
      const result = computeGrade(
        [
          entered(94, 100, "participation"),
          entered(89.6),
          entered(80, 100, "quizzes"),
          entered(100, 100, "tests"),
        ],
        {
          ...config,
          weights: { participation: 40, homework: 20, quizzes: 15, tests: 25 },
        },
      );
      expect(result.weightedTotal).toBe(93);
      expect(result.letterGrade).toBe("A");
    });

    it("extra credit: homework 104, tests 96.1 -> weightedTotal 100 (100.05 rounded), letterGrade 'A+'", () => {
      const result = computeGrade(
        [entered(104), entered(96.1, 100, "tests")],
        config,
      );
      expect(result.weightedTotal).toBe(100);
      expect(result.letterGrade).toBe("A+");
    });
  });

  describe("rounding", () => {
    it("homework 89.5 -> weightedTotal 90, letterGrade 'A-'", () => {
      const result = computeGrade([entered(89.5)], config);
      expect(result.weightedTotal).toBe(90);
      expect(result.letterGrade).toBe("A-");
    });

    it("homework 89.4 -> weightedTotal 89, letterGrade 'B+'", () => {
      const result = computeGrade([entered(89.4)], config);
      expect(result.weightedTotal).toBe(89);
      expect(result.letterGrade).toBe("B+");
    });

    it("decimalPlaces 1: homework 89.96 -> weightedTotal 90, letterGrade 'A-'", () => {
      const result = computeGrade([entered(89.96)], {
        ...config,
        decimalPlaces: 1,
      });
      expect(result.weightedTotal).toBe(90);
      expect(result.letterGrade).toBe("A-");
    });

    it("decimalPlaces 1: homework 89.94 -> weightedTotal 89.9, letterGrade 'B+'", () => {
      const result = computeGrade([entered(89.94)], {
        ...config,
        decimalPlaces: 1,
      });
      expect(result.weightedTotal).toBe(89.9);
      expect(result.letterGrade).toBe("B+");
    });

    it("decimalPlaces 2: homework 90, 85, 85 -> weightedTotal 86.67, letterGrade 'B'", () => {
      const result = computeGrade([entered(90), entered(85), entered(85)], {
        ...config,
        decimalPlaces: 2,
      });
      expect(result.weightedTotal).toBe(86.67);
      expect(result.letterGrade).toBe("B");
    });

    it("category scores are not rounded: homework 90, 85, 85 -> gradePerCategory.homework is 260 / 3, not 86.67", () => {
      const result = computeGrade([entered(90), entered(85), entered(85)], {
        ...config,
        decimalPlaces: 2,
      });
      expect(result.gradePerCategory.homework).toBeCloseTo(260 / 3, 10);
    });
  });

  describe("letter grade", () => {
    it("homework 90 -> letterGrade 'A-' (minimum is inclusive)", () => {
      expect(computeGrade([entered(90)], config).letterGrade).toBe("A-");
    });

    it("homework 0 -> letterGrade 'F'", () => {
      expect(computeGrade([entered(0)], config).letterGrade).toBe("F");
    });

    it("homework 0, tests 0 -> weightedTotal 0, letterGrade 'F' (a total of 0 is not 'no total')", () => {
      const result = computeGrade(
        [entered(0), entered(0, 100, "tests")],
        config,
      );
      expect(result.weightedTotal).toBe(0);
      expect(result.letterGrade).toBe("F");
    });

    it("homework 100, scale rows in shuffled order -> letterGrade 'A+'", () => {
      const shuffled = [
        { letter: "C-", minPercent: 70 },
        { letter: "A", minPercent: 93 },
        { letter: "F", minPercent: 0 },
        { letter: "A+", minPercent: 97 },
        { letter: "B", minPercent: 83 },
        { letter: "A-", minPercent: 90 },
      ];
      expect(
        computeGrade([entered(100)], { ...config, scale: shuffled })
          .letterGrade,
      ).toBe("A+");
    });
  });
});
