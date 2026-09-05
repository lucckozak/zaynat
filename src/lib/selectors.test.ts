import { describe, expect, it } from "vitest";
import { employeeRating, reviewsForEmployee, salonRating, salonReviews } from "./selectors";
import { makeEmployee } from "./test-fixtures";
import type { Review } from "./types";

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "rev_1",
    kind: "session",
    customerId: "cust_1",
    rating: 5,
    createdAt: "2024-01-01T00:00:00.000Z",
    visible: true,
    ...overrides,
  };
}

describe("review moderation (visible flag)", () => {
  it("employeeRating excludes hidden reviews from the average and count", () => {
    const db = {
      employees: [makeEmployee({ id: "emp_1" })],
      reviews: [
        makeReview({ id: "r1", employeeId: "emp_1", rating: 5, visible: true }),
        makeReview({ id: "r2", employeeId: "emp_1", rating: 1, visible: false }),
      ],
    };
    const result = employeeRating(db, "emp_1");
    expect(result.average).toBe(5);
    expect(result.count).toBe(1);
    expect(result.isReal).toBe(true);
  });

  it("employeeRating falls back to the seeded number once every review is hidden", () => {
    const db = {
      employees: [makeEmployee({ id: "emp_1", rating: 4.5, reviewCount: 12 })],
      reviews: [makeReview({ id: "r1", employeeId: "emp_1", rating: 1, visible: false })],
    };
    const result = employeeRating(db, "emp_1");
    expect(result.average).toBe(4.5);
    expect(result.count).toBe(12);
    expect(result.isReal).toBe(false);
  });

  it("salonRating combines both 'salon' and 'session' kinds, excluding hidden ones", () => {
    const db = {
      employees: [makeEmployee({ id: "emp_1" })],
      reviews: [
        makeReview({ id: "r1", kind: "session", employeeId: "emp_1", rating: 5, visible: true }),
        makeReview({ id: "r2", kind: "salon", rating: 3, visible: true }),
        makeReview({ id: "r3", kind: "salon", rating: 1, visible: false }),
      ],
    };
    const result = salonRating(db);
    expect(result.count).toBe(2);
    expect(result.average).toBe(4); // (5 + 3) / 2
  });

  it("reviewsForEmployee never returns a hidden or a 'salon'-kind review", () => {
    const db = {
      users: [],
      reviews: [
        makeReview({ id: "r1", kind: "session", employeeId: "emp_1", visible: true }),
        makeReview({ id: "r2", kind: "session", employeeId: "emp_1", visible: false }),
        makeReview({ id: "r3", kind: "salon", rating: 5, visible: true }), // no employeeId
      ],
    };
    const result = reviewsForEmployee(db, "emp_1");
    expect(result.map((r) => r.review.id)).toEqual(["r1"]);
  });

  it("salonReviews only returns visible 'salon'-kind reviews", () => {
    const db = {
      users: [],
      reviews: [
        makeReview({ id: "r1", kind: "salon", visible: true }),
        makeReview({ id: "r2", kind: "salon", visible: false }),
        makeReview({ id: "r3", kind: "session", employeeId: "emp_1", visible: true }),
      ],
    };
    const result = salonReviews(db);
    expect(result.map((r) => r.review.id)).toEqual(["r1"]);
  });
});
