import { describe, expect, it } from "vitest";
import { clamp, formatDuration, formatPrice, fullName, initials, toHref, uid } from "./utils";

describe("formatPrice", () => {
  it("formats a whole number with the given currency", () => {
    expect(formatPrice(250)).toBe("AED 250");
    expect(formatPrice(99, "USD")).toBe("USD 99");
  });
});

describe("formatDuration", () => {
  it("formats minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
  });
  it("formats whole hours", () => {
    expect(formatDuration(120)).toBe("2 hr");
  });
  it("formats hours plus minutes", () => {
    expect(formatDuration(90)).toBe("1 hr 30 min");
  });
});

describe("initials / fullName", () => {
  it("builds initials from first and last name", () => {
    expect(initials("Layla", "Khan")).toBe("LK");
  });
  it("joins first and last name", () => {
    expect(fullName({ firstName: "Layla", lastName: "Khan" })).toBe("Layla Khan");
  });
});

describe("uid", () => {
  it("prefixes the id and never collides across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid("salon")));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(id.startsWith("salon_")).toBe(true);
  });
});

describe("clamp", () => {
  it("keeps a value inside the given range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("toHref", () => {
  it("leaves a URL with a scheme untouched", () => {
    expect(toHref("https://instagram.com/foo")).toBe("https://instagram.com/foo");
    expect(toHref("http://example.com")).toBe("http://example.com");
  });
  it("adds https:// to a bare domain", () => {
    expect(toHref("instagram.com/foo")).toBe("https://instagram.com/foo");
  });
  it("trims surrounding whitespace before checking", () => {
    expect(toHref("  tiktok.com/@foo  ")).toBe("https://tiktok.com/@foo");
  });
});
