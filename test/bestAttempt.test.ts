import { describe, it, expect } from "vitest";
import { bestAttempt } from "../src/bestAttempt";
import { entered, late, missing } from "./helpers";

// Input is one category's counted scores. Unless a test says otherwise, every
// score is out of 100, and "retake" means attempt 2 of the same assignment.
describe("bestAttempt", () => {
  describe("no retakes", () => {
    it("no scores -> []", () => {
      expect(bestAttempt([])).toEqual([]);
    });

    it("hw1 80, hw2 90 (no retakes) -> [hw1 80, hw2 90] unchanged", () => {
      const input = [
        entered(80, { assignmentId: "hw1" }),
        entered(90, { assignmentId: "hw2" }),
      ];
      expect(bestAttempt(input)).toEqual(input);
    });
  });

  describe("choosing an attempt", () => {
    it("test1 85, test2 50, test2 retake 45 -> [test1 85, test2 50]", () => {
      const input = [
        entered(85, { assignmentId: "test1" }),
        entered(50, { assignmentId: "test2" }),
        entered(45, { assignmentId: "test2", attempt: 2 }),
      ];
      expect(bestAttempt(input)).toEqual([
        entered(85, { assignmentId: "test1" }),
        entered(50, { assignmentId: "test2" }),
      ]);
    });

    it("test1 85, test2 50, test2 retake 50 -> [test1 85, test2 50 (first attempt)] (a tie counts attempt 1)", () => {
      const input = [
        entered(85, { assignmentId: "test1" }),
        entered(50, { assignmentId: "test2" }),
        entered(50, { assignmentId: "test2", attempt: 2 }),
      ];
      expect(bestAttempt(input)).toEqual([
        entered(85, { assignmentId: "test1" }),
        entered(50, { assignmentId: "test2" }),
      ]);
    });
    it("test1 85, test2 50, test2 retake 75 -> [test1 85, test2 (retake) 75]", () => {
      const test1 = entered(85, { assignmentId: "test1" });
      const test2 = entered(50, { assignmentId: "test2" });
      const test2Retake = entered(75, { assignmentId: "test2", attempt: 2 });
      expect(bestAttempt([test1, test2, test2Retake])).toEqual([
        test1,
        test2Retake,
      ]);
    });

    it("hw1 85 attempt 1, hw1 retake 90, hw2 70 attempt 1, hw2 retake 60 -> [hw1 (retake) 90, hw2 70] (each assignment is decided on its own)", () => {
      const hw1 = entered(85, { assignmentId: "hw1" });
      const hw1Retake = entered(90, { assignmentId: "hw1", attempt: 2 });
      const hw2 = entered(70, { assignmentId: "hw2" });
      const hw2Retake = entered(60, { assignmentId: "hw2", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake, hw2, hw2Retake])).toEqual([
        hw1Retake,
        hw2,
      ]);
    });

    it("hw1 80, hw1 90 (both attempt 1) -> [hw1 80] (a duplicate attempt is ignored; the first listed wins)", () => {
      const first = entered(80, { assignmentId: "hw1" });
      const duplicate = entered(90, { assignmentId: "hw1" });
      expect(bestAttempt([first, duplicate])).toEqual([first]);
    });
  });

  // Attempts are compared as percentages, so different pointsPossible are fair.
  describe("percentages", () => {
    it("hw1 17/20 (85%), hw1 retake 90/100 (90%) -> [hw1 (retake) 90/100] (the retake has more points and a higher percentage)", () => {
      const hw1 = entered(17, { assignmentId: "hw1", pointsPossible: 20 });
      const hw1Retake = entered(90, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1Retake]);
    });

    it("hw1 85/100 (85%), hw1 retake 18/20 (90%) -> [hw1 (retake) 18/20] (fewer points, but a higher percentage)", () => {
      const hw1 = entered(85, { assignmentId: "hw1" });
      const hw1Retake = entered(18, {
        assignmentId: "hw1",
        pointsPossible: 20,
        attempt: 2,
      });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1Retake]);
    });

    it("hw1 18/20 (90%), hw1 retake 90/100 (90%) -> [hw1 18/20 (first attempt)] (equal percentages are a tie)", () => {
      const hw1 = entered(18, { assignmentId: "hw1", pointsPossible: 20 });
      const hw1Retake = entered(90, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1]);
    });

    it("extra credit: hw1 95, hw1 retake 104 -> [hw1 (retake) 104]", () => {
      const hw1 = entered(95, { assignmentId: "hw1" });
      const hw1Retake = entered(104, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1Retake]);
    });
  });

  // Missing counts as 0, so it can lose to a graded attempt.
  describe("missing attempts", () => {
    it("hw1 missing, hw1 retake 70 -> [hw1 (retake) 70]", () => {
      const hw1 = missing({ assignmentId: "hw1" });
      const hw1Retake = entered(70, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1Retake]);
    });

    it("hw1 60, hw1 retake missing -> [hw1 60]", () => {
      const hw1 = entered(60, { assignmentId: "hw1" });
      const hw1Retake = missing({ assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1]);
    });

    it("hw1 missing, hw1 retake missing -> [hw1 missing (first attempt)] (two zeros are a tie)", () => {
      const hw1 = missing({ assignmentId: "hw1" });
      const hw1Retake = missing({ assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1]);
    });

    it("hw1 0, hw1 retake missing -> [hw1 0 (first attempt)] (a 0 and a missing are a tie)", () => {
      const hw1 = entered(0, { assignmentId: "hw1" });
      const hw1Retake = missing({ assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1]);
    });
  });

  // The result does not depend on the order of the input.
  describe("order", () => {
    it("hw1 retake 90 listed before hw1 80 -> [hw1 (retake) 90]", () => {
      const hw1 = entered(80, { assignmentId: "hw1" });
      const hw1Retake = entered(90, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1Retake, hw1])).toEqual([hw1Retake]);
    });

    it("hw1 retake 80 listed before hw1 80 -> [hw1 80 (first attempt)] (a tie still counts attempt 1)", () => {
      const hw1 = entered(80, { assignmentId: "hw1" });
      const hw1Retake = entered(80, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1Retake, hw1])).toEqual([hw1]);
    });

    it("hw1 80, hw2 90, hw2 retake 95, hw3 70 -> [hw1 80, hw2 (retake) 95, hw3 70] (assignments keep the order they first appear in)", () => {
      const hw1 = entered(80, { assignmentId: "hw1" });
      const hw2 = entered(90, { assignmentId: "hw2" });
      const hw2Retake = entered(95, { assignmentId: "hw2", attempt: 2 });
      const hw3 = entered(70, { assignmentId: "hw3" });
      expect(bestAttempt([hw1, hw2, hw2Retake, hw3])).toEqual([
        hw1,
        hw2Retake,
        hw3,
      ]);
    });
  });

  describe("late scores", () => {
    it("hw1 late 70, hw1 retake 80 -> [hw1 (retake) 80] (a late score is compared like any other)", () => {
      const hw1 = late(70, { assignmentId: "hw1" });
      const hw1Retake = entered(80, { assignmentId: "hw1", attempt: 2 });
      expect(bestAttempt([hw1, hw1Retake])).toEqual([hw1Retake]);
    });
  });
});
