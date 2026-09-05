import { describe, expect, it } from "vitest";
import { slotsForEmployee } from "./availability";
import {
  makeAppointment,
  makeEmployee,
  makeService,
  makeSettings,
  makeWorkingHour,
} from "./test-fixtures";

// 2024-01-01 is a Monday (dayOfWeek === 1), matching the fixtures' working
// hours/opening hours below.
const MONDAY = new Date("2024-01-01T00:00:00");

function ctx(overrides: {
  appointments?: ReturnType<typeof makeAppointment>[];
  workingHours?: ReturnType<typeof makeWorkingHour>[];
  settings?: Partial<ReturnType<typeof makeSettings>>;
  now?: Date;
} = {}) {
  return {
    db: {
      appointments: overrides.appointments ?? [],
      employees: [makeEmployee()],
      services: [makeService()],
      workingHours: overrides.workingHours ?? [makeWorkingHour()],
      recurringBreaks: [],
      timeBlocks: [],
      settings: makeSettings(overrides.settings),
    },
    now: overrides.now,
  };
}

describe("slotsForEmployee", () => {
  it("offers slots across the whole open window when nothing is booked", () => {
    const slots = slotsForEmployee(ctx(), makeEmployee(), makeService(), MONDAY);
    // 09:00 open, 18:00 close, 60min service, 30min grid -> last start 17:00
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:00");
    expect(slots).not.toContain("17:30"); // would end at 18:30, past close
  });

  it("returns no slots when the employee doesn't work that day", () => {
    const slots = slotsForEmployee(
      ctx({ workingHours: [makeWorkingHour({ startTime: null, endTime: null })] }),
      makeEmployee(),
      makeService(),
      MONDAY,
    );
    expect(slots).toEqual([]);
  });

  it("returns no slots for an inactive employee", () => {
    const slots = slotsForEmployee(
      ctx(),
      makeEmployee({ active: false }),
      makeService(),
      MONDAY,
    );
    expect(slots).toEqual([]);
  });

  it("returns no slots when the employee doesn't offer this service", () => {
    const slots = slotsForEmployee(
      ctx(),
      makeEmployee({ serviceIds: ["some-other-service"] }),
      makeService(),
      MONDAY,
    );
    expect(slots).toEqual([]);
  });

  it("excludes a slot that would overlap an existing appointment", () => {
    // Booked 10:00-11:00 local time on the fixture Monday.
    const booked = makeAppointment({ start: "2024-01-01T10:00:00", end: "2024-01-01T11:00:00" });
    const slots = slotsForEmployee(ctx({ appointments: [booked] }), makeEmployee(), makeService(), MONDAY);
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("10:30");
  });

  it("keeps the buffer clear on both sides of an existing appointment", () => {
    // bufferMinutes=15 (fixture default), 30min service, 15min grid;
    // appointment 10:00-11:00. A slot must leave 15min clear on each side,
    // so the last bookable start before it is 09:15 (ends 09:45, +15min
    // buffer = 10:00, exactly touching — not overlapping), and the next
    // bookable start after it is 11:15 (11:00 appointment end + buffer).
    const booked = makeAppointment({ start: "2024-01-01T10:00:00", end: "2024-01-01T11:00:00" });
    const slots = slotsForEmployee(
      ctx({ appointments: [booked], settings: { slotIntervalMinutes: 15 } }),
      makeEmployee(),
      makeService({ durationMinutes: 30 }),
      MONDAY,
    );
    expect(slots).toContain("09:15");
    expect(slots).not.toContain("09:30"); // would end 10:00, inside the 15min buffer
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("11:00"); // would start inside the buffer after the appointment
    expect(slots).toContain("11:15");
  });

  it("never double-books the exact same slot for two customers", () => {
    // Simulates two customers trying to book the same 10:00 slot: after the
    // first booking exists, that slot must no longer be offered.
    const before = slotsForEmployee(ctx(), makeEmployee(), makeService(), MONDAY);
    expect(before).toContain("10:00");

    const afterFirstBooking = slotsForEmployee(
      ctx({ appointments: [makeAppointment({ start: "2024-01-01T10:00:00", end: "2024-01-01T11:00:00" })] }),
      makeEmployee(),
      makeService(),
      MONDAY,
    );
    expect(afterFirstBooking).not.toContain("10:00");
  });

  it("hides slots earlier than minLeadTimeHours from now, today", () => {
    const slots = slotsForEmployee(
      ctx({ settings: { minLeadTimeHours: 2 }, now: new Date("2024-01-01T09:30:00") }),
      makeEmployee(),
      makeService(),
      MONDAY,
    );
    // now=09:30 + 2h lead time = 11:30 earliest bookable start
    expect(slots).not.toContain("09:00");
    expect(slots).not.toContain("11:00");
    expect(slots).toContain("11:30");
  });

  it("respects the salon's own opening hours, not just the employee's", () => {
    const slots = slotsForEmployee(
      ctx({ settings: { openingHours: makeSettings().openingHours.map((o) => ({ ...o, close: "10:30" })) } }),
      makeEmployee(),
      makeService(),
      MONDAY,
    );
    // salon closes 10:30, 60min service -> only 09:00 and 09:30 fit
    expect(slots).toEqual(["09:00", "09:30"]);
  });
});
