import { describe, it } from "vitest";

// All scores are out of 100 unless the name says otherwise.
describe("categoryScore", () => {
  describe("nothing to count", () => {
    it.todo("no scores -> null");
    it.todo("only not-entered scores -> null");
    it.todo("only excused scores -> null");
    it.todo("only dropped scores, even with points -> null");
  });

  describe("single score", () => {
    it.todo("one entered 85 -> 85");
    it.todo("one entered 18/20 -> 90");
    it.todo("one late 70 -> 70 (no deduction)");
    it.todo("one missing -> 0, not null");
    it.todo("one entered 0 -> 0");
  });

  describe("statuses", () => {
    it.todo("entered 80 + missing -> 40");
    it.todo("entered 80 + excused -> 80");
    it.todo("entered 80 + not-entered -> 80");
    it.todo("entered 80 + dropped 20 -> 80");
    it.todo(
      "entered 100, late 70, missing, excused, not-entered, dropped 10 -> 56.67 (170 / 3)",
    );
  });

  describe("percentages", () => {
    it.todo("extra credit: entered 104 -> 104");
    it.todo("extra credit: entered 104 + entered 96 -> 100");
    it.todo("participation: 4/5 -> 80");
    it.todo("participation: 5/5, 4/5, 3/5 -> 80");
    it.todo(
      "mixed pointsPossible: 18/20 + 50/100 -> 70 (average of percentages, not 68/120 = 56.67)",
    );
    it.todo("repeating decimal: 90, 85, 85 -> 86.67 (260 / 3, not rounded)");
  });

  describe("invalid pointsPossible", () => {
    it.todo("entered 80 + entered 5/0 -> 80 (invalid score ignored)");
    it.todo("entered 80 + entered 5/-10 -> 80 (invalid score ignored)");
    it.todo("only a score with pointsPossible 0 -> null");
  });
});
