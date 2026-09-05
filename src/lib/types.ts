export type Role = "CUSTOMER" | "EMPLOYEE" | "ADMIN";

export type Emirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "Umm Al Quwain"
  | "Ras Al Khaimah"
  | "Fujairah";

export const EMIRATES: Emirate[] = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export type SubscriptionPlanId = "starter" | "professional" | "premium";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

export type DomainStatus =
  | "not_configured"
  | "pending"
  | "verified"
  | "active"
  | "error"
  | "suspended";

/**
 * Platform-owned record for one salon tenant — kept deliberately SEPARATE
 * from that tenant's own `Database`/`SalonSettings`. Subscription, contract,
 * domain and marketplace status are the platform operator's business, not
 * the salon's; salon-owned data (services, employees, customers, branding)
 * lives only in the per-tenant `Database` (see `src/lib/data/seed.ts`).
 *
 * Prototype note: this is simulated client-side (localStorage), same as the
 * rest of this app — no real billing, DNS/SSL, or payment processing is
 * wired up. See the "Multi-tenant simulation" section of the README.
 */
export interface TenantMeta {
  id: string;
  /** used in the `?salon=` deep link and shown in the Super Admin list */
  slug: string;
  label: string;
  emirate: Emirate;
  city: string;
  area: string;
  /** which starter template this tenant was created from */
  presetId: string;
  createdAt: string;
  subscriptionPlan: SubscriptionPlanId;
  subscriptionStatus: SubscriptionStatus;
  /** ISO date; only meaningful while subscriptionStatus === "trial" */
  trialEndsAt?: string;
  suspension: {
    suspended: boolean;
    reason?: string;
    suspendedAt?: string;
  };
  domain: {
    custom?: string;
    status: DomainStatus;
  };
  marketplace: {
    visible: boolean;
    featured: boolean;
    /** approximate pin for "nearest to me" marketplace sorting; optional — a salon with no pin just can't be distance-sorted */
    lat?: number;
    lng?: number;
  };
  contract: {
    status: "unsigned" | "signed" | "cancelled";
    version: string;
    startDate?: string;
    renewalDate?: string;
  };
}

/**
 * A real owner's identity spans however many salon "locations" they run —
 * each location is still a fully independent `TenantMeta` + `Database`
 * (own staff, services, hours, customers), but they share one login and
 * can be switched between from inside the dashboard. Kept as its own
 * platform-level record (like `TenantMeta`) rather than folded into any
 * one tenant's `Database`, since it deliberately outlives and spans them.
 */
export interface OwnerLocation {
  salonId: string;
  /** that location's own admin User.id, inside its own Database — needed to write a session there when switching */
  adminUserId: string;
}

export interface OwnerAccount {
  id: string;
  email: string;
  /** prototype only — plaintext for the mock auth layer, same as User.password */
  password: string;
  firstName: string;
  lastName: string;
  locations: OwnerLocation[];
  createdAt: string;
}

/**
 * Configurable by the Zaynat team in Super Admin → Settings, shown on the
 * pricing page. Like employeeLimit already was, none of these limits are
 * mechanically enforced anywhere in this prototype (there's no concept yet
 * of one owner identity linked across several salon tenants to check a
 * count against) — this is the plan's advertised shape, not a gate.
 */
export interface SubscriptionPlanConfig {
  id: SubscriptionPlanId;
  label: string;
  monthlyPriceAed: number;
  employeeLimit: number;
  /** how many separate salons one owner can run on this plan; >=999 displays as "unlimited" (same convention as employeeLimit) */
  salonLimit: number;
  marketplaceVisibility: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
}

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: "starter",
    label: "Starter",
    monthlyPriceAed: 199,
    employeeLimit: 3,
    salonLimit: 1,
    marketplaceVisibility: false,
    customDomain: false,
    prioritySupport: false,
  },
  {
    id: "professional",
    label: "Professional",
    monthlyPriceAed: 299,
    employeeLimit: 10,
    salonLimit: 3,
    marketplaceVisibility: true,
    customDomain: false,
    prioritySupport: false,
  },
  {
    id: "premium",
    label: "Premium",
    monthlyPriceAed: 499,
    employeeLimit: 999,
    salonLimit: 999,
    marketplaceVisibility: true,
    customDomain: true,
    prioritySupport: true,
  },
];

export interface AuditLogEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  reason?: string;
  meta?: Record<string, string>;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type TimeBlockType = "BREAK" | "VACATION" | "BLOCKED";

/** 0 = Sunday ... 6 = Saturday (matches JS Date.getDay()) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  /** ISO date (yyyy-mm-dd) */
  dateOfBirth?: string;
  /** prototype only — plaintext for the mock auth layer */
  password: string;
  createdAt: string;
  /** customer blacklist — blocked customers can't self-book online */
  blocked?: boolean;
  blockedReason?: string;
}

export interface Employee {
  id: string;
  userId: string;
  jobTitle: string;
  bio: string;
  profileImage: string;
  active: boolean;
  rating?: number;
  reviewCount?: number;
  serviceIds: string[];
  /** commission on completed + confirmed revenue, 0-100 */
  commissionPercent?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  /** price in AED */
  price: number;
  image: string;
  active: boolean;
  popular?: boolean;
}

export interface WorkingHour {
  id: string;
  employeeId: string;
  dayOfWeek: DayOfWeek;
  /** "HH:mm" or null when the employee does not work that day */
  startTime: string | null;
  endTime: string | null;
}

/** Recurring weekly break, e.g. a daily lunch. */
export interface RecurringBreak {
  id: string;
  employeeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  label: string;
}

/** One-off unavailable period (vacation, ad-hoc block, single break). */
export interface TimeBlock {
  id: string;
  employeeId: string;
  /** ISO datetime */
  start: string;
  /** ISO datetime */
  end: string;
  type: TimeBlockType;
  reason?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  employeeId: string;
  serviceId: string;
  /** ISO datetime */
  start: string;
  /** ISO datetime */
  end: string;
  status: AppointmentStatus;
  customerNotes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  /** channel the booking came through */
  source: "ONLINE" | "ADMIN" | "WALK_IN";
  /** promo/discount applied at booking time (display-only, no real payments) */
  couponCode?: string;
  discountAmount?: number;
  giftCardCode?: string;
  giftCardAmountUsed?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  active: boolean;
  /** ISO date; undefined = no expiry */
  expiresAt?: string;
  maxRedemptions?: number;
  redemptions: number;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  active: boolean;
  purchaserName?: string;
  recipientEmail?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface OpeningHour {
  dayOfWeek: DayOfWeek;
  /** "HH:mm" or null when the salon is closed */
  open: string | null;
  close: string | null;
}

export interface SalonSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  /** id of the salon preset this demo is currently styled as */
  presetId: string;
  /** brand colours — drive the whole UI at runtime */
  theme: { primary: string; accent: string };
  /** backgroundless logo image (data URL) shown instead of the name in headers/nav */
  logoUrl?: string;
  /** browser-tab icon (data URL); falls back to the default /favicon.ico when unset */
  faviconUrl?: string;
  /** heading/display font — an id from src/lib/fonts.ts (FONT_CHOICES); falls back to the default there when unset/unknown */
  typography?: string;
  /** homepage hero photo (data URL); falls back to the default stock photo when unset */
  heroImageUrl?: string;
  /** homepage hero paragraph; falls back to the default copy when unset */
  heroDescription?: string;
  /** public social profile links shown in the site footer, only when set */
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  openingHours: OpeningHour[];
  /** buffer in minutes reserved after every appointment */
  bufferMinutes: number;
  /** how many hours before the start a customer may still cancel / reschedule */
  cancellationWindowHours: number;
  /** grid granularity for offered start times */
  slotIntervalMinutes: number;
  /** earliest a same-day online booking may start, in hours from now */
  minLeadTimeHours: number;
  /** how far ahead the calendar opens, in days */
  maxAdvanceDays: number;
  notifications: {
    customerConfirmation: boolean;
    customerReminder: boolean;
    employeeNewBooking: boolean;
    adminNewBooking: boolean;
  };
}

export interface Database {
  users: User[];
  employees: Employee[];
  services: Service[];
  workingHours: WorkingHour[];
  recurringBreaks: RecurringBreak[];
  timeBlocks: TimeBlock[];
  appointments: Appointment[];
  settings: SalonSettings;
  /** log of stubbed outbound emails */
  emailLog: EmailMessage[];
  coupons: Coupon[];
  giftCards: GiftCard[];
  reviews: Review[];
  /** the admin's own activity feed — see AdminNotification below */
  adminNotifications: AdminNotification[];
}

/**
 * The salon admin's own notification centre — distinct from `emailLog`
 * (a record of stubbed emails addressed to customers/employees, useful
 * for a different reason: proving what *they* would have received).
 * This is specifically "things the person running the salon should
 * know about," generated by the same appointment-lifecycle events
 * (see `notifyBooking` in store.tsx) rather than a separate system, so
 * it can never drift out of sync with what actually happened.
 */
export interface AdminNotification {
  id: string;
  kind: "NEW_BOOKING" | "CANCELLED" | "RESCHEDULED";
  title: string;
  body: string;
  appointmentId?: string;
  createdAt: string;
  read: boolean;
}

/**
 * A real customer review, one of two kinds:
 *  - "session": rates one specific COMPLETED appointment (and therefore
 *    that appointment's employee/service) — appointmentId/employeeId/
 *    serviceId are all set. One per appointment (see `addReview`).
 *  - "salon": an overall rating of the salon as a whole, not tied to one
 *    appointment/employee — appointmentId/employeeId/serviceId are all
 *    unset. Still gated on having at least one COMPLETED appointment (so
 *    it's a real customer), one per customer (see `addSalonReview`).
 * Both kinds only ever exist once a customer actually submits one — this
 * replaces the seeded `Employee.rating`/`reviewCount` numbers as the
 * source of truth the moment at least one exists; see
 * `employeeRating`/`salonRating` in selectors.ts, which combine both
 * kinds into the salon's overall rating (a session review still reflects
 * on the salon as a whole) while `reviewsForEmployee` only ever sees
 * "session" reviews (they're the only kind with an employeeId at all).
 *
 * `visible` is the salon owner's own moderation control (Admin →
 * Reviews) — a hidden review is excluded from every public rating/list,
 * not just softened; the owner can hide or unhide, never edit content.
 */
export interface Review {
  id: string;
  kind: "salon" | "session";
  appointmentId?: string;
  customerId: string;
  employeeId?: string;
  serviceId?: string;
  /** 1-5 */
  rating: number;
  comment?: string;
  createdAt: string;
  visible: boolean;
}

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  kind:
    | "BOOKING_CONFIRMATION"
    | "REMINDER"
    | "CANCELLATION"
    | "RESCHEDULE"
    | "EMPLOYEE_NOTIFICATION"
    | "ADMIN_NOTIFICATION"
    | "BIRTHDAY"
    | "REVIEW_REQUEST"
    | "MARKETING";
}

export const ACTIVE_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};
