// Shaped after server/models/DeliveryPartner.js, plus a `fleetType` field the
// backend doesn't have yet (see plan doc — the Figma design introduces a
// Veg Fleet vs Standard Fleet distinction that needs a real schema addition
// once the backend phase starts).
export const DOCUMENT_TYPES = [
  { type: "aadhar_card", label: "Aadhaar / Voter ID" },
  { type: "pan_card", label: "PAN Card" },
  { type: "driving_license", label: "Driving licence" },
  { type: "bank_details", label: "Bank account details" },
  { type: "profile_photo", label: "Selfie / live photo" },
];

export const mockPartner = {
  _id: "partner_demo_1",
  fullName: "Raja Kumar",
  phone: "9876543210",
  email: "raja.kumar@example.com",
  fleetType: "veg",
  status: "active",
  rating: 4.8,
  totalDeliveries: 342,
  documents: {
    aadhar_card: "uploaded",
  },
};

// Two example incoming-order offers, one per fleet type — shaped roughly
// after server/models/Order.js's `deliveryAssignment` fields, plus the
// veg/standard split that doesn't exist on the backend yet.
export const mockOrders = {
  veg: {
    restaurantName: "Pure Greens Kitchen",
    restaurantAddress: "12, MG Road, Indiranagar, Bengaluru",
    fleetType: "veg",
    pickupKm: 1.2,
    dropKm: 3.8,
    totalKm: 5.0,
    fare: 58,
    payment: "prepaid",
    countdownSeconds: 18,
    pickupEtaMin: 4,
    pickupOtp: "5729",
    items: [
      { name: "Veg biryani", qty: 1 },
      { name: "Paneer butter masala", qty: 2 },
      { name: "Garlic naan", qty: 3 },
    ],
    customerName: "Ananya S.",
    customerAddress: "402, Prestige Apartments, Koramangala",
    customerEtaMin: 9,
    // Payout breakdown shown on Delivery Summary — doesn't need to equal
    // `fare` above: surge/tip are only finalized at drop-off, same as any
    // real delivery app.
    payout: { basePay: 30, distancePay: 20, surge: 8, tip: 10, penalty: 0 },
  },
  standard: {
    restaurantName: "Spice Route Kitchen",
    restaurantAddress: "44, Church Street, Bengaluru",
    fleetType: "standard",
    pickupKm: 0.9,
    dropKm: 4.2,
    totalKm: 5.1,
    fare: 64,
    payment: "cod",
    codAmount: 350, // shown on the incoming-order offer card — an estimate
    dropoffAmount: 485, // finalized total collected at handover
    countdownSeconds: 22,
    pickupEtaMin: 6,
    pickupOtp: "8341",
    items: [
      { name: "Chicken biryani", qty: 2 },
      { name: "Butter naan", qty: 4 },
    ],
    customerName: "Rohit M.",
    customerAddress: "12B, Lakeview Residency, HSR Layout",
    customerEtaMin: 11,
  },
};

export const SKIP_REASONS = [
  "Restaurant too far",
  "Drop location too far",
  "Too many active orders",
  "Taking a break",
  "Other",
];

// Cash-in-hand shown on the Earnings screens — matches Home.jsx's
// ONLINE_MOCK.cashInHand. The Cash Deposit screen's own ₹605 figure is a
// separate, later snapshot (post COD-collection — see PaymentReceived.jsx),
// not meant to stay in lockstep with this one.
export const CASH_IN_HAND = 120;

export const EARNINGS_BY_PERIOD = {
  today: {
    label: "today",
    totalEarned: 342.5,
    orders: 7,
    incentiveBonus: 120,
    idlePay: 12,
    basePay: 210,
    distancePay: 92.5,
    peakSurge: 28,
    tips: 12,
    penalties: 0,
  },
  weekly: {
    label: "this week",
    totalEarned: 2140,
    orders: 38,
    incentiveBonus: 640,
    idlePay: 86,
    basePay: 1180,
    distancePay: 520,
    peakSurge: 165,
    tips: 89,
    penalties: 40,
  },
  monthly: {
    label: "this month",
    totalEarned: 8760,
    orders: 154,
    incentiveBonus: 2300,
    idlePay: 342,
    basePay: 4820,
    distancePay: 2150,
    peakSurge: 640,
    tips: 368,
    penalties: 120,
  },
};
