import { describe, it } from "vitest";

// Unless a test says otherwise: weights { homework: 50, tests: 50 }, the default
// scale, decimalPlaces 0, and every score is out of 100.
// Issues are listed in the same order as the scores that caused them.

describe("computeGrade", () => {
  describe("no counted scores", () => {
    it.todo(
      "no scores -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}",
    );
    it.todo(
      "only not-entered scores -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}",
    );
    it.todo(
      "homework dropped 17, tests dropped 45 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: []}",
    );
  });

  describe("grouping and issues", () => {
    it.todo(
      "homework 85 -> {gradePerCategory: {homework: 85, tests: null}, weightedTotal: 85, letterGrade: 'B', issues: []}",
    );
    it.todo(
      "homework 85, quizzes 60 (categoryId not in weights) -> {gradePerCategory: {homework: 85, tests: null}, weightedTotal: 85, letterGrade: 'B', issues: [{kind: 'unknown-category', categoryId: 'quizzes'}]}",
    );
    it.todo(
      "homework 85/0 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: [{kind: 'invalid-points-possible', categoryId: 'homework'}]}",
    );
    it.todo(
      "homework 80, homework 5/0 -> {gradePerCategory: {homework: 80, tests: null}, weightedTotal: 80, letterGrade: 'B-', issues: [{kind: 'invalid-points-possible', categoryId: 'homework'}]}",
    );
    it.todo(
      "quizzes 85, homework 85/0 -> {gradePerCategory: {homework: null, tests: null}, weightedTotal: null, letterGrade: null, issues: [{kind: 'unknown-category', categoryId: 'quizzes'}, {kind: 'invalid-points-possible', categoryId: 'homework'}]}",
    );
    it.todo(
      "weights {homework: 30, quizzes: 20, tests: 50}, no scores -> gradePerCategory has all three keys, each null",
    );
  });

  describe("weighted total", () => {
    it.todo(
      "homework 100, homework dropped -> {gradePerCategory: {homework: 100, tests: null}, weightedTotal: 100, letterGrade: 'A+', issues: []}",
    );
    it.todo(
      "homework 80, tests 90 -> {gradePerCategory: {homework: 80, tests: 90}, weightedTotal: 85, letterGrade: 'B', issues: []}",
    );
    it.todo(
      "empty category skipped: weights {participation: 30, homework: 20, quizzes: 20, tests: 30}, participation 100, homework 80, quizzes 90, no tests -> weightedTotal 91 (6400 / 70 = 91.43), letterGrade 'A-'",
    );
    it.todo(
      "weights not adding up to 100: weights {homework: 1, tests: 1}, homework 80, tests 90 -> weightedTotal 85, letterGrade 'B'",
    );
    it.todo(
      "weights {homework: 1, tests: 2}; homework: excused, missing, dropped 85, 90, 100; tests: not-entered, dropped 37, 72 -> {gradePerCategory: {homework: 63.33 (190 / 3), tests: 72}, weightedTotal: 69 (207.33 / 3 = 69.11), letterGrade: 'D', issues: []}",
    );
    it.todo(
      "weights {participation: 40, homework: 20, quizzes: 15, tests: 25}, participation 94, homework 89.6, quizzes 80, tests 100 -> weightedTotal 93 (92.52 rounded), letterGrade 'A' (the spreadsheet showed A- because it didn't round)",
    );
    it.todo(
      "extra credit: homework 104, tests 96.1 -> weightedTotal 100 (100.05 rounded), letterGrade 'A+'",
    );
  });

  describe("rounding", () => {
    it.todo("homework 89.5 -> weightedTotal 90, letterGrade 'A-'");
    it.todo("homework 89.4 -> weightedTotal 89, letterGrade 'B+'");
    it.todo(
      "decimalPlaces 1: homework 89.96 -> weightedTotal 90, letterGrade 'A-'",
    );
    it.todo(
      "decimalPlaces 1: homework 89.94 -> weightedTotal 89.9, letterGrade 'B+'",
    );
    it.todo(
      "decimalPlaces 2: homework 90, 85, 85 -> weightedTotal 86.67, letterGrade 'B'",
    );
    it.todo(
      "decimalPlaces 2, floating-point trap: homework 64.085 -> weightedTotal 64.09, letterGrade 'F' (Math.round(64.085 * 100) / 100 gives 64.08)",
    );
    it.todo(
      "category scores are not rounded: homework 90, 85, 85 -> gradePerCategory.homework is 260 / 3, not 86.67",
    );
  });

  describe("letter grade", () => {
    it.todo("homework 90 -> letterGrade 'A-' (minimum is inclusive)");
    it.todo("homework 0 -> letterGrade 'F'");
    it.todo("homework 100, scale rows in shuffled order -> letterGrade 'A+'");
  });
});
