import { describe, expect, it } from "vitest";
import { categoryScore } from "../src/categoryScore";

// All scores are out of 100 unless the name says otherwise.
describe("categoryScore", () => {
  describe("nothing to count", () => {
    it("no scores -> null", () => {
      expect(categoryScore([])).toBeNull();
    });

    it("only not-entered scores -> null", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "not-entered",
          },
        ]),
      ).toBeNull();
    });

    it("only excused scores -> null", () => {
      expect(
        categoryScore([
          { categoryId: "homework", pointsPossible: 100, status: "excused" },
        ]),
      ).toBeNull();
    });

    it("only dropped scores, even with points -> null", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "dropped",
            points: 52,
          },
        ]),
      ).toBeNull();
    });
  });

  describe("single score", () => {
    it("one entered 85 -> 85", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 85,
          },
        ]),
      ).toBe(85);
    });

    it("one entered 18/20 -> 90", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 20,
            status: "entered",
            points: 18,
          },
        ]),
      ).toBe(90);
    });

    it("one late 70 -> 70 (no deduction)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "late",
            points: 70,
          },
        ]),
      ).toBe(70);
    });

    it("one missing -> 0, not null", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "missing",
          },
        ]),
      ).toBe(0);
    });

    it("one entered 0 -> 0", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 0,
          },
        ]),
      ).toBe(0);
    });
  });

  describe("statuses", () => {
    it("entered 80 + missing -> 40", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "missing",
          },
        ]),
      ).toBe(40);
    });

    it("entered 80 + excused -> 80", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "excused",
          },
        ]),
      ).toBe(80);
    });

    it("entered 80 + not-entered -> 80", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "not-entered",
          },
        ]),
      ).toBe(80);
    });

    it("entered 80 + dropped 20 -> 80", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "dropped",
            points: 20,
          },
        ]),
      ).toBe(80);
    });

    it("entered 100, late 70, missing, excused, not-entered, dropped 10 -> 56.67 (170 / 3)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 100,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "late",
            points: 70,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "missing",
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "excused",
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "not-entered",
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "dropped",
            points: 10,
          },
        ]),
      ).toBeCloseTo(56.67, 2);
    });
  });

  describe("percentages", () => {
    it("extra credit: entered 104 -> 104", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 104,
          },
        ]),
      ).toBe(104);
    });

    it("extra credit: entered 104 + entered 96 -> 100", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 104,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 96,
          },
        ]),
      ).toBe(100);
    });

    it("participation: 4/5 -> 80", () => {
      expect(
        categoryScore([
          {
            categoryId: "participation",
            pointsPossible: 5,
            status: "entered",
            points: 4,
          },
        ]),
      ).toBe(80);
    });

    it("participation: 5/5, 4/5, 3/5 -> 80", () => {
      expect(
        categoryScore([
          {
            categoryId: "participation",
            pointsPossible: 5,
            status: "entered",
            points: 5,
          },
          {
            categoryId: "participation",
            pointsPossible: 5,
            status: "entered",
            points: 4,
          },
          {
            categoryId: "participation",
            pointsPossible: 5,
            status: "entered",
            points: 3,
          },
        ]),
      ).toBe(80);
    });

    it("mixed pointsPossible: 18/20 + 50/100 -> 70 (average of percentages, not 68/120 = 56.67)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 20,
            status: "entered",
            points: 18,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 50,
          },
        ]),
      ).toBe(70);
    });

    it("repeating decimal: 90, 85, 85 -> 86.67 (260 / 3, not rounded)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 90,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 85,
          },
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 85,
          },
        ]),
      ).toBeCloseTo(86.67, 2);
    });
  });

  describe("invalid pointsPossible", () => {
    it("entered 80 + entered 5/0 -> 80 (invalid score ignored)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: 0,
            status: "entered",
            points: 5,
          },
        ]),
      ).toBe(80);
    });

    it("entered 80 + entered 5/-10 -> 80 (invalid score ignored)", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 100,
            status: "entered",
            points: 80,
          },
          {
            categoryId: "homework",
            pointsPossible: -10,
            status: "entered",
            points: 5,
          },
        ]),
      ).toBe(80);
    });

    it("only a score with pointsPossible 0 -> null", () => {
      expect(
        categoryScore([
          {
            categoryId: "homework",
            pointsPossible: 0,
            status: "entered",
            points: 5,
          },
        ]),
      ).toBeNull();
    });
  });
});
