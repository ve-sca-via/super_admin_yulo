// The order the tracking screens draw. Placeholder contents until the orders
// endpoint lands — swap for a `src/api/client` query then; the shape the screens
// consume stays.
//
// One seed, not one per screen: the map-led tracking screen and the compact
// veg-fleet one are the same order in two states, so the id, the partner and the
// stage they read have to come from the same place or they'd drift.

// Every stage an order walks through, in order. The stage the order is *at* is
// what both timelines measure against — nothing stores "done" per step, because
// a stored flag is one more thing that can disagree with the stage.
export const STAGES = ["placed", "preparing", "pickedUp", "onTheWay", "delivered"];

// `at` is stamped by the kitchen and the dispatcher as each stage is reached, so
// a stage still ahead of the order simply has none.
//
// Two labels per stage: the map-led screen prints the short one beside a time
// ("Picked up · 08:35 pm"), the compact screen has no times and prints the
// worded one instead ("Picked up by delivery partner").
export const TIMELINE = [
  { id: "placed", label: "Order placed", statusLabel: "Order confirmed", at: "08:15 pm" },
  { id: "preparing", label: "Preparing", statusLabel: "Food is being prepared", at: "08:22 pm" },
  { id: "pickedUp", label: "Picked up", statusLabel: "Picked up by delivery partner", at: "08:35 pm" },
  { id: "onTheWay", label: "On the way", statusLabel: "On the way to you", note: "Tracking live" },
  { id: "delivered", label: "Delivered", statusLabel: "Delivered" },
];

// `vegName` is the veg-mode wording for the same line, following the `vegLabel`
// swap the popular-search tiles and `vegCuisines` already use. It only relabels
// the placeholder — a real order comes back from the API already naming what was
// actually cooked, and nothing about an order that has been paid for changes
// because the customer flipped a browsing switch afterwards.
//
// `icon` names the glyph drawn beside the line (see components/orders/
// OrderSummaryCard), not the dish — there are no order photos to show.
export const TRACKED_ORDER = {
  id: "#HH-98234",
  etaMinutes: 12,
  stage: "onTheWay",
  restaurant: {
    name: "Biryani Palace",
    rating: "4.8",
    cuisine: "Gourmet Mughlai",
    vegCuisine: "Gourmet Rajasthani",
  },
  partner: {
    name: "Rahul S.",
    initials: "RS",
    rating: "4.9",
    deliveries: "2,400+ deliveries",
  },
  lines: [
    {
      id: "awadhi-dum-biryani",
      name: "Awadhi Dum Biryani",
      vegName: "Awadhi Veg Dum Biryani",
      notes: "Large • Extra salan",
      price: 749,
      quantity: 1,
      icon: "bowl",
    },
    {
      id: "galouti-kebab",
      name: "Galouti Kebab (4 pcs)",
      vegName: "Kathal Galouti Kebab (4 pcs)",
      notes: "Chef's signature",
      price: 525,
      quantity: 1,
      icon: "platter",
    },
  ],
  // What actually left the customer's account, fees and taxes included — not the
  // sum of the lines above. It's stated rather than recomputed because the bill
  // was settled at payment and tracking must quote that figure, not a fresh one.
  totalPaid: 1384,
};

// Orders that have already been delivered — what the history screen lists and
// what the order-details screen opens one of. Kept apart from `TRACKED_ORDER`
// above on purpose: that one is the single order still on the road, and the two
// answer different questions ("where is it?" versus "what did I have?"), which
// is why a history row carries a count and a total rather than lines and an ETA.
//
// `placedAt` is pre-worded rather than a timestamp because there's no date
// library here and the design prints relative days ("Today", "Yesterday"). The
// orders endpoint will send an ISO string and this becomes a format call.
//
// `vegFleet` records that the order actually travelled in the separate bag, not
// that it was asked for — the history screen only claims it for orders where the
// promise was kept.
export const ORDER_HISTORY = [
  {
    id: "#YU-20481",
    restaurantName: "Green Leaf Kitchen",
    placedAt: "Today, 8:12 PM",
    itemCount: 3,
    total: 859,
    vegFleet: true,
  },
  {
    id: "#YU-20362",
    restaurantName: "Spice Route Thali House",
    placedAt: "Yesterday, 1:30 PM",
    itemCount: 2,
    total: 420,
    vegFleet: false,
  },
  {
    id: "#YU-20115",
    restaurantName: "Sagar Ratna Express",
    placedAt: "12 Jul, 9:05 PM",
    itemCount: 4,
    total: 610,
    vegFleet: true,
  },
];

// Order details is reached with an id from the history list, and without one
// from anywhere that means "the order that just finished" — the most recent
// delivered order, which is the first row.
export function deliveredOrder(id) {
  return ORDER_HISTORY.find((order) => order.id === id) ?? ORDER_HISTORY[0];
}

export function stageIndex(stage) {
  return STAGES.indexOf(stage);
}

// The bill total is the one figure on these screens big enough to need grouping,
// and it's grouped the Indian way — ₹1,38,400, not ₹138,400. `formatPrice` is
// left alone for the line prices, which are three digits and read fine ungrouped.
// Done by hand rather than through `toLocaleString`, because Hermes ships without
// the ICU data that would honour the locale and would silently drop the commas.
export function formatTotal(value) {
  const digits = String(Math.round(value));
  if (digits.length <= 3) return `₹${digits}`;

  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `₹${head},${digits.slice(-3)}`;
}

// Veg mode relabels a line the way it relabels a kitchen's cuisines — it never
// drops one, so both variants of the screen keep the same rows.
export function lineName(line, vegOnly) {
  return vegOnly && line.vegName ? line.vegName : line.name;
}

export function cuisineFor(restaurant, vegOnly) {
  return vegOnly && restaurant.vegCuisine ? restaurant.vegCuisine : restaurant.cuisine;
}

// A veg line is drawn in green whatever accent the app is wearing — the mark is
// the dish's, not the brand's, the same rule OrderPlaced's tick follows.
export function lineIsVeg(line, vegOnly) {
  return vegOnly || !!line.veg;
}
