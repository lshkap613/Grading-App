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

    it(
      "entered 100, late 70, missing, excused, not-entered, dropped 10 -> 56.67 (170 / 3)", () => {
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
      }
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
