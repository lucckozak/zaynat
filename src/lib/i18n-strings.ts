export type Locale = "en" | "ar";

/**
 * Translations for the salon's own public site CHROME only — nav labels,
 * footer sections, buttons — not a salon owner's own free-text content
 * (name, tagline, hero description, service names) which stays exactly
 * as they typed it, in whichever language that is. Zaynat's own
 * marketing/admin/super-admin surfaces are deliberately out of scope
 * (see isPlatformRoute() in i18n.tsx) — this only ever applies to a
 * salon's public booking site, the actual bilingual UAE customer
 * surface.
 *
 * These are a first pass, not reviewed by a native Arabic speaker — same
 * honesty bar as the Legal page's own disclaimer. Worth a real review
 * before this is customer-facing in production.
 */
export const STRINGS = {
  en: {
    navHome: "Home",
    navTreatments: "Treatments",
    navSpecialists: "Specialists",
    navBook: "Book",
    signIn: "Sign in",
    signOut: "Sign out",
    bookAppointment: "Book appointment",
    myArea: "My area",
    footerVisit: "Visit",
    footerOpeningHours: "Opening hours",
    footerTreatments: "Treatments",
    footerSpecialists: "Specialists",
    footerBook: "Book",
    footerPrototype: "Prototype.",
    tabHome: "Home",
    tabBook: "Book",
    tabBookings: "Bookings",
    tabProfile: "Profile",
    heroBookAppointment: "Book an appointment",
    heroExploreTreatments: "Explore treatments",
    heroOpenDays: "Open 7 days",
    heroAverageRating: "average rating",
    heroClientsCared: "clients cared for this year",
    langToggle: "العربية",
    closed: "Closed",
  },
  ar: {
    navHome: "الرئيسية",
    navTreatments: "الخدمات",
    navSpecialists: "المختصون",
    navBook: "الحجز",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    bookAppointment: "حجز موعد",
    myArea: "حسابي",
    footerVisit: "الزيارة",
    footerOpeningHours: "ساعات العمل",
    footerTreatments: "الخدمات",
    footerSpecialists: "المختصون",
    footerBook: "الحجز",
    footerPrototype: "نموذج أولي.",
    tabHome: "الرئيسية",
    tabBook: "الحجز",
    tabBookings: "حجوزاتي",
    tabProfile: "حسابي",
    heroBookAppointment: "حجز موعد",
    heroExploreTreatments: "استكشاف الخدمات",
    heroOpenDays: "مفتوح ٧ أيام",
    heroAverageRating: "متوسط التقييم",
    heroClientsCared: "عميل هذا العام",
    langToggle: "English",
    closed: "مغلق",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];
