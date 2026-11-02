import { describe, it } from "vitest";

// Input is one category's counted scores. Unless a test says otherwise, every
// score is out of 100, and "retake" means attempt 2 of the same assignment.
describe("bestAttempt", () => {
  describe("no retakes", () => {
    it.todo("no scores -> []");
    it.todo("hw1 80, hw2 90 (no retakes) -> [hw1 80, hw2 90] unchanged");
  });

  describe("choosing an attempt", () => {
    it.todo("test1 85, test2 50, test2 retake 45 -> [test1 85, test2 50]");
    it.todo(
      "test1 85, test2 50, test2 retake 50 -> [test1 85, test2 50 (first attempt)] (a tie counts attempt 1)",
    );
    it.todo(
      "test1 85, test2 50, test2 retake 75 -> [test1 85, test2 (retake) 75]",
    );
    it.todo(
      "hw1 85 attempt 1, hw1 retake 90, hw2 70 attempt 1, hw2 retake 60 -> [hw1 (retake) 90, hw2 70] (each assignment is decided on its own)",
    );
    it.todo(
      "hw1 80, hw1 90 (both attempt 1) => [hw1 80] (a duplicate attempt is ignored; the first listed wins.",
    );
  });

  // Attempts are compared as percentages, so different pointsPossible are fair.
  describe("percentages", () => {
    it.todo(
      "hw1 17/20 (85%), hw1 retake 90/100 (90%) -> [hw1 (retake) 90/100] (the retake has more points and a higher percentage)",
    );
    it.todo(
      "hw1 85/100 (85%), hw1 retake 18/20 (90%) -> [hw1 (retake) 18/20] (fewer points, but a higher percentage)",
    );
    it.todo(
      "hw1 18/20 (90%), hw1 retake 90/100 (90%) -> [hw1 18/20 (first attempt)] (equal percentages are a tie)",
    );
    it.todo("extra credit: hw1 95, hw1 retake 104 -> [hw1 (retake) 104]");
  });

  // Missing counts as 0, so it can lose to a graded attempt.
  describe("missing attempts", () => {
    it.todo("hw1 missing, hw1 retake 70 -> [hw1 (retake) 70]");
    it.todo("hw1 60, hw1 retake missing -> [hw1 60]");
    it.todo(
      "hw1 missing, hw1 retake missing -> [hw1 missing (first attempt)] (two zeros are a tie)",
    );
    it.todo(
      "hw1 0, hw1 retake missing -> [hw1 0 (first attempt)] (a 0 and a missing are a tie)",
    );
  });

  // The result does not depend on the order of the input.
  describe("order", () => {
    it.todo("hw1 retake 90 listed before hw1 80 -> [hw1 (retake) 90]");
    it.todo(
      "hw1 retake 80 listed before hw1 80 -> [hw1 80 (first attempt)] (a tie still counts attempt 1)",
    );
    it.todo(
      "hw1 80, hw2 90, hw2 retake 95, hw3 70 -> [hw1 80, hw2 (retake) 95, hw3 70] (assignments keep the order they first appear in)",
    );
  });

  describe("late scores", () => {
    it.todo(
      "hw1 late 70, hw1 retake 80 -> [hw1 (retake) 80] (a late score is compared like any other)",
    );
  });
});
