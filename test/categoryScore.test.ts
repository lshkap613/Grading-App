import { describe, expect, it } from "vitest";
import { categoryScore } from "../src/categoryScore";
import { entered, late, missing, dropped, excused, notEntered } from "./helpers";

// All scores are out of 100 unless the name says otherwise.
describe("categoryScore", () => {
  // Inputs with no counted scores return null, never 0.
  describe("nothing to count", () => {
    it("no scores -> null", () => {
      expect(categoryScore([])).toBeNull();
    });

    it("only not-entered scores -> null", () => {
      expect(categoryScore([notEntered(), notEntered()])).toBeNull();
    });

    it("only excused scores -> null", () => {
      expect(categoryScore([excused(), excused()])).toBeNull();
    });

    it("only dropped scores, even with points -> null", () => {
      expect(categoryScore([dropped(52)])).toBeNull();
    });
  });

  // One score of each counted kind, converted to a percentage.
  describe("single score", () => {
    it("one entered 85 -> 85", () => {
      expect(categoryScore([entered(85)])).toBe(85);
    });

    it("one entered 18/20 -> 90", () => {
      expect(categoryScore([entered(18, 20)])).toBe(90);
    });

    it("one late 70 -> 70 (no deduction)", () => {
      expect(categoryScore([late(70)])).toBe(70);
    });

    it("one missing -> 0, not null", () => {
      expect(categoryScore([missing()])).toBe(0);
    });

    it("one entered 0 -> 0", () => {
      expect(categoryScore([entered(0)])).toBe(0);
    });
  });

  // Missing counts as 0; excused, not-entered and dropped are left out.
  describe("statuses", () => {
    it("entered 80 + missing -> 40", () => {
      expect(categoryScore([entered(80), missing()])).toBe(40);
    });

    it("entered 80 + excused -> 80", () => {
      expect(categoryScore([entered(80), excused()])).toBe(80);
    });

    it("entered 80 + not-entered -> 80", () => {
      expect(categoryScore([entered(80), notEntered()])).toBe(80);
    });

    it("entered 80 + dropped 20 -> 80", () => {
      expect(categoryScore([entered(80), dropped(20)])).toBe(80);
    });

    it("entered 100, late 70, missing, excused, not-entered, dropped 10 -> 56.67 (170 / 3)", () => {
      expect(
        categoryScore([
          entered(100),
          late(70),
          missing(),
          excused(),
          notEntered(),
          dropped(10),
        ]),
      ).toBeCloseTo(170 / 3, 10);
    });
  });

  // Extra credit, other point scales, and averaging percentages rather than points.
  describe("percentages", () => {
    it("extra credit: entered 104 -> 104", () => {
      expect(categoryScore([entered(104)])).toBe(104);
    });

    it("extra credit: entered 104 + entered 96 -> 100", () => {
      expect(categoryScore([entered(104), entered(96)])).toBe(100);
    });

    it("participation: 4/5 -> 80", () => {
      expect(categoryScore([entered(4, 5, "participation")])).toBe(80);
    });

    it("participation: 5/5, 4/5, 3/5 -> 80", () => {
      expect(
        categoryScore([
          entered(5, 5, "participation"),
          entered(4, 5, "participation"),
          entered(3, 5, "participation"),
        ]),
      ).toBe(80);
    });

    it("mixed pointsPossible: 18/20 + 50/100 -> 70 (average of percentages, not 68/120 = 56.67)", () => {
      expect(categoryScore([entered(18, 20), entered(50)])).toBe(70);
    });

    it("repeating decimal: 90, 85, 85 -> 86.67 (260 / 3, not rounded)", () => {
      expect(
        categoryScore([entered(90), entered(85), entered(85)]),
      ).toBeCloseTo(260 / 3, 10);
    });
  });

  // Scores with pointsPossible of 0 or less are skipped.
  describe("invalid pointsPossible", () => {
    it("entered 80 + entered 5/0 -> 80 (invalid score ignored)", () => {
      expect(categoryScore([entered(80), entered(5, 0)])).toBe(80);
    });

    it("entered 80 + entered 5/-10 -> 80 (invalid score ignored)", () => {
      expect(categoryScore([entered(80), entered(5, -10)])).toBe(80);
    });

    it("only a score with pointsPossible 0 -> null", () => {
      expect(categoryScore([entered(5, 0)])).toBeNull();
    });
  });
});
