// What the payment screen offers, in the order it lists them. Placeholder
// contents until the payments endpoint lands — the gateway decides which
// instruments are actually live for a customer, and this list is what that
// response will replace; the shape the screen consumes stays.
//
// `brand` names the mark drawn beside the row (see components/payment/
// PaymentBrand), not the instrument itself — two rows could share a mark.
export const PAYMENT_GROUPS = [
  {
    id: "upi",
    title: "UPI",
    methods: [
      { id: "phonepe", brand: "phonepe", label: "PhonePe UPI" },
      { id: "gpay", brand: "gpay", label: "Google Pay UPI" },
      { id: "paytm", brand: "paytm", label: "Paytm" },
      { id: "cred", brand: "cred", label: "Cred" },
    ],
  },
  {
    id: "cards",
    title: "Cards",
    methods: [{ id: "card", brand: "card", label: "Credit / Debit Card" }],
  },
  {
    id: "netbanking",
    title: "Net Banking",
    methods: [{ id: "netbanking", brand: "bank", label: "Net Banking" }],
  },
];

// The screen opens with one instrument already picked so the pay button has
// something to pay with — the customer changes it rather than choosing from
// nothing.
export const DEFAULT_METHOD_ID = "phonepe";

// Every other surface prints whole rupees (`formatPrice`), because a bill to the
// paisa reads like a rounding error. The pay button is the exception: this is
// the figure that leaves the customer's account, and payment screens state it
// exactly.
export function formatAmount(value) {
  return `₹${value.toFixed(2)}`;
}
