import type {
  Appointment,
  DayOfWeek,
  Employee,
  SalonSettings,
  Service,
  WorkingHour,
} from "./types";

/**
 * Minimal, fully-valid fixtures for tests that exercise the pure business
 * logic in availability.ts / tenants.ts / etc. without needing a real
 * seeded Database. Each factory fills every required field with a sane
 * default so a test only has to override what it actually cares about.
 */

export function makeSettings(overrides: Partial<SalonSettings> = {}): SalonSettings {
  const allDaysOpen = [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => ({
    dayOfWeek: dayOfWeek as DayOfWeek,
    open: "09:00",
    close: "18:00",
  }));
  return {
    name: "Test Salon",
    tagline: "Testing, tailored to you.",
    address: "1 Test Street",
    phone: "+971 50 000 0000",
    email: "test@salon.app",
    currency: "AED",
    presetId: "maison",
    theme: { primary: "#000000", accent: "#111111" },
    openingHours: allDaysOpen,
    bufferMinutes: 15,
    cancellationWindowHours: 24,
    slotIntervalMinutes: 30,
    minLeadTimeHours: 0,
    maxAdvanceDays: 30,
    notifications: {
      customerConfirmation: true,
      customerReminder: true,
      employeeNewBooking: true,
      adminNewBooking: true,
    },
    ...overrides,
  };
}

export function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "emp_1",
    userId: "usr_emp_1",
    jobTitle: "Therapist",
    bio: "",
    profileImage: "",
    active: true,
    serviceIds: ["svc_1"],
    ...overrides,
  };
}

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: "svc_1",
    name: "Test Service",
    description: "",
    category: "Facials",
    durationMinutes: 60,
    price: 100,
    image: "",
    active: true,
    ...overrides,
  };
}

export function makeWorkingHour(overrides: Partial<WorkingHour> = {}): WorkingHour {
  return {
    id: "wh_1",
    employeeId: "emp_1",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    ...overrides,
  };
}

export function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt_1",
    customerId: "cust_1",
    employeeId: "emp_1",
    serviceId: "svc_1",
    start: "2024-01-01T10:00:00.000Z",
    end: "2024-01-01T11:00:00.000Z",
    status: "CONFIRMED",
    createdAt: "2023-12-01T00:00:00.000Z",
    source: "ONLINE",
    ...overrides,
  };
}
