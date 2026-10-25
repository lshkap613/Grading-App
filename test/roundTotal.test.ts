import { describe, expect, it } from "vitest";
import { roundTotal } from "../src/roundTotal";

describe("roundTotal", () => {
  // The default: round to the nearest whole number, with halves rounding up.
  describe("0 decimal places", () => {
    it("89.4 -> 89", () => {
      expect(roundTotal(89.4, 0)).toBe(89);
    });

    it("89.49 -> 89 (only the first decimal matters)", () => {
      expect(roundTotal(89.49, 0)).toBe(89);
    });

    it("89.5 -> 90 (halves round up)", () => {
      expect(roundTotal(89.5, 0)).toBe(90);
    });

    it("90 -> 90 (whole numbers stay as they are)", () => {
      expect(roundTotal(90, 0)).toBe(90);
    });

    it("0 -> 0", () => {
      expect(roundTotal(0, 0)).toBe(0);
    });

    it("extra credit: 100.05 -> 100 (no cap at 100)", () => {
      expect(roundTotal(100.05, 0)).toBe(100);
    });

    it("extra credit: 104 -> 104", () => {
      expect(roundTotal(104, 0)).toBe(104);
    });
  });

  describe("1 decimal place", () => {
    it("89.94 -> 89.9", () => {
      expect(roundTotal(89.94, 1)).toBe(89.9);
    });

    it("89.95 -> 90 (halves round up, carrying into the whole number)", () => {
      expect(roundTotal(89.95, 1)).toBe(90);
    });

    it("89.96 -> 90", () => {
      expect(roundTotal(89.96, 1)).toBe(90);
    });

    it("spec example total: 6400 / 70 (91.428...) -> 91.4", () => {
      expect(roundTotal(6400 / 70, 1)).toBe(91.4);
    });
  });

  describe("2 decimal places", () => {
    it("repeating decimal: 260 / 3 (86.666...) -> 86.67", () => {
      expect(roundTotal(260 / 3, 2)).toBe(86.67);
    });

    it("6400 / 70 (91.42857...) -> 91.43", () => {
      expect(roundTotal(6400 / 70, 2)).toBe(91.43);
    });

    it("85 -> 85 (no trailing zeros added; that's for display)", () => {
      expect(roundTotal(85, 2)).toBe(85);
    });

    it("very small numbers: 0.0000001 -> 0", () => {
      expect(roundTotal(0.0000001, 2)).toBe(0);
    });
  });
});
