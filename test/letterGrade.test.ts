import { describe, it } from "vitest";

// Unless a test says otherwise: the scale is DEFAULT_SCALE.
describe("letterGrade", () => {
  // Minimums are inclusive: a total exactly on a minimum gets that row's letter.
  describe("boundaries", () => {
    it.todo("73 -> C (exactly on a minimum)");
    it.todo("72.99 -> C- (just below a minimum)");
    it.todo("90 -> A- (exactly on a minimum)");
    it.todo("89.99 -> B+ (just below a minimum)");
  });

  describe("between minimums", () => {
    it.todo("78 -> C+");
    it.todo("85 -> B");
  });

  // The lowest and highest rows.
  describe("ends of the scale", () => {
    it.todo("0 -> F");
    it.todo("64.99 -> F");
    it.todo("97 -> A+");
    it.todo("99 -> A+");
    it.todo("extra credit: 104 -> A+ (above every minimum)");
  });

  // The lookup takes the highest qualifying minimum, whatever the row order.
  describe("scale order", () => {
    it.todo("DEFAULT_SCALE reversed, 85 -> B");
    it.todo("DEFAULT_SCALE shuffled, 73 -> C");
  });

  // Letters are teacher data, not a fixed set.
  describe("custom scales", () => {
    it.todo("scale [{Pass, 60}, {Fail, 0}], 75 -> Pass");
    it.todo("scale [{Pass, 60}, {Fail, 0}], 59.99 -> Fail");
  });

  // A scale must have a 0 row (checked when it is saved), so a missing one is a bug.
  describe("scale without a 0 row", () => {
    it.todo("scale [{A, 90}, {B, 80}], 50 -> throws");
    it.todo(
      "scale [{A, 90}, {B, 80}], 85 -> B (still works when a row qualifies)",
    );
  });
});
