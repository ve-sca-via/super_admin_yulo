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
