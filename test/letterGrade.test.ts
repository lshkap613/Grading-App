import { describe, expect, it } from "vitest";
import { letterGrade } from "../src/letterGrade";
import { DEFAULT_SCALE } from "../src/defaults";

// Unless a test says otherwise: the scale is DEFAULT_SCALE.
describe("letterGrade", () => {
  // Minimums are inclusive: a total exactly on a minimum gets that row's letter.
  describe("boundaries", () => {
    it("73 -> C (exactly on a minimum)", () => {
      expect(letterGrade(73, DEFAULT_SCALE)).toEqual("C");
    });

    it("72.99 -> C- (just below a minimum)", () => {
      expect(letterGrade(72.99, DEFAULT_SCALE)).toEqual("C-");
    });

    it("90 -> A- (exactly on a minimum)", () => {
      expect(letterGrade(90, DEFAULT_SCALE)).toEqual("A-");
    });

    it("89.99 -> B+ (just below a minimum)", () => {
      expect(letterGrade(89.99, DEFAULT_SCALE)).toEqual("B+");
    });
  });

  describe("between minimums", () => {
    it("78 -> C+", () => {
      expect(letterGrade(78, DEFAULT_SCALE)).toEqual("C+");
    });

    it("85 -> B", () => {
      expect(letterGrade(85, DEFAULT_SCALE)).toEqual("B");
    });
  });

  // The lowest and highest rows.
  describe("ends of the scale", () => {
    it("0 -> F", () => {
      expect(letterGrade(0, DEFAULT_SCALE)).toEqual("F");
    });

    it("64.99 -> F", () => {
      expect(letterGrade(64.99, DEFAULT_SCALE)).toEqual("F");
    });

    it("97 -> A+ (exactly on the top minimum)", () => {
      expect(letterGrade(97, DEFAULT_SCALE)).toEqual("A+");
    });

    it("99 -> A+", () => {
      expect(letterGrade(99, DEFAULT_SCALE)).toEqual("A+");
    });

    it("extra credit: 104 -> A+ (above every minimum)", () => {
      expect(letterGrade(104, DEFAULT_SCALE)).toEqual("A+");
    });
  });

  // The lookup takes the highest qualifying minimum, whatever the row order.
  describe("scale order", () => {
    it("DEFAULT_SCALE reversed, 85 -> B", () => {
      expect(letterGrade(85, DEFAULT_SCALE.toReversed())).toEqual("B");
    });

    it("DEFAULT_SCALE shuffled, 73 -> C", () => {
      const shuffled = [
        { letter: "C-", minPercent: 70 },
        { letter: "A", minPercent: 93 },
        { letter: "F", minPercent: 0 },
        { letter: "B+", minPercent: 87 },
        { letter: "C", minPercent: 73 },
        { letter: "A+", minPercent: 97 },
        { letter: "D", minPercent: 65 },
        { letter: "B-", minPercent: 80 },
        { letter: "C+", minPercent: 77 },
        { letter: "A-", minPercent: 90 },
        { letter: "B", minPercent: 83 },
      ];
      expect(letterGrade(73, shuffled)).toEqual("C");
    });
  });

  // Letters are teacher data, not a fixed set.
  describe("custom scales", () => {
    const passFail = [
      { letter: "Pass", minPercent: 60 },
      { letter: "Fail", minPercent: 0 },
    ];

    it("scale [{Pass, 60}, {Fail, 0}], 75 -> Pass", () => {
      expect(letterGrade(75, passFail)).toEqual("Pass");
    });

    it("scale [{Pass, 60}, {Fail, 0}], 59.99 -> Fail", () => {
      expect(letterGrade(59.99, passFail)).toEqual("Fail");
    });
  });

  // A scale must have a 0 row (checked when it is saved), so a missing one is a bug.
  describe("scale without a 0 row", () => {
    const noZeroRow = [
      { letter: "A", minPercent: 90 },
      { letter: "B", minPercent: 80 },
    ];

    it("scale [{A, 90}, {B, 80}], 50 -> throws", () => {
      expect(() => letterGrade(50, noZeroRow)).toThrow("below every minimum");
    });

    it("scale [{A, 90}, {B, 80}], 85 -> B (still works when a row qualifies)", () => {
      expect(letterGrade(85, noZeroRow)).toEqual("B");
    });
  });
});
