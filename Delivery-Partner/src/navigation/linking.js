// URL-based navigation for the React Navigation stack. Two things this
// unlocks: (1) shareable/bookmarkable URLs on the Expo web target — useful
// for testing and for the eventual admin/support tooling — and (2) the
// eventual seam for native deep links (e.g. tapping a push notification for
// a new order should jump straight to OrdersIncomingVeg). `prefixes` is left
// empty since no native URL scheme is configured yet in app.json — add one
// there (`"scheme": "..."`) before wiring real push-notification deep links.
export const linking = {
  prefixes: [],
  config: {
    screens: {
      Onboarding: {
        screens: {
          OnboardingPhoneEntry: "onboarding/phone",
          OnboardingOtp: "onboarding/otp",
          OnboardingDocuments: "onboarding/documents",
          OnboardingDocumentCapture: "onboarding/documents/:docType/capture",
          OnboardingStatus: "onboarding/status",
          OnboardingTraining: "onboarding/training/:moduleId",
          OnboardingTrainingComplete: "onboarding/training/:moduleId/complete",
        },
      },
      HomeOffline: "home",
      FleetBadgeInfo: "home/fleet-badge",
      OrdersIncomingVeg: "orders/incoming/veg",
      OrdersIncomingStandard: "orders/incoming/standard",
      OrdersReject: "orders/incoming/reject",
      OrdersSkipConfirmed: "orders/skip-confirmed",
      DeliveryPickup: "delivery/pickup/:orderKey?",
      DeliveryVegCheckpoint: "delivery/veg-checkpoint/:orderKey?",
      DeliveryNavigate: "delivery/navigate/:orderKey?",
      DeliveryCodCollection: "delivery/cod-collection/:orderKey?",
      DeliveryPaymentReceived: "delivery/payment-received/:orderKey?",
      DeliverySummary: "delivery/summary/:orderKey?",
      Earnings: "earnings",
      EarningsWeekly: "earnings/weekly",
      EarningsMonthly: "earnings/monthly",
      EarningsCashDeposit: "earnings/cash-deposit",
      Profile: "profile",
      ProfilePersonalDetails: "profile/personal-details",
      ProfileHelpSupport: "profile/help-support",
      ProfileSettings: "profile/settings",
      ProfileFleetChange: "profile/fleet-change",
      ProfileFleetChangeSubmitted: "profile/fleet-change/submitted",
      EdgeFleetDecision: "edge/fleet-decision",
      EdgeVegViolation: "edge/veg-violation",
    },
  },
};
