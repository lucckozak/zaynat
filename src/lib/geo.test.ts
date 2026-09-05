import { describe, expect, it } from "vitest";
import { distanceKm } from "./geo";

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 25.2, lng: 55.3 }, { lat: 25.2, lng: 55.3 })).toBe(0);
  });

  it("matches the known straight-line distance between Dubai and Abu Dhabi (~120km)", () => {
    const dubai = { lat: 25.2048, lng: 55.2708 };
    const abuDhabi = { lat: 24.4539, lng: 54.3773 };
    const km = distanceKm(dubai, abuDhabi);
    expect(km).toBeGreaterThan(100);
    expect(km).toBeLessThan(130);
  });

  it("is symmetric", () => {
    const a = { lat: 25.2, lng: 55.3 };
    const b = { lat: 24.1, lng: 54.5 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 10);
  });
});
