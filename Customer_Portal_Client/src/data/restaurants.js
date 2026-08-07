const heritageGrill = require("@/assets/home/restaurant-heritage-grill.png");
const biggys = require("@/assets/home/restaurant-biggys.png");
// This kitchen has no storefront photography of its own yet — its card borrows
// the veg thali tile, and its menu screen draws the tinted fallback rather than
// a picture.
const greenLeaf = require("@/assets/home/category-veg-thali.png");

// Placeholder storefront catalogue, shared by the home feed's "Restaurants near
// you" list and the search results screen so the two can't drift apart. Swap for
// `src/api/client` discovery queries once those endpoints land.
//
// `vegCuisines` is the veg-mode wording for the same kitchen — Figma's two
// search-results frames are identical apart from these labels — following the
// `vegLabel` swap the popular-search tiles already use.
export const RESTAURANTS = [
  {
    id: "heritage-grill",
    name: "The Heritage Grill",
    image: heritageGrill,
    rating: "4.5",
    cuisines: ["North Indian", "Mughlai", "Desserts"],
    vegCuisines: ["North Indian", "Rajasthani", "Desserts"],
    eta: "35 min",
    distance: "3.1 km",
    priceHint: "Items starting @129",
    pureVeg: true,
    greatOffer: true,
  },
  {
    // Names the compact menu in `data/menu` — the two have to agree, because
    // the storefront is looked up by name when the card is tapped.
    id: "green-leaf-kitchen",
    name: "Green Leaf Kitchen",
    image: greenLeaf,
    rating: "4.5",
    cuisines: ["North Indian", "Thali", "Desserts"],
    eta: "30 min",
    distance: "1.8 km",
    priceHint: "Items starting @60",
    pureVeg: true,
    greatOffer: true,
  },
  {
    id: "biggys",
    name: "Biggy’s",
    image: biggys,
    rating: "4.5",
    cuisines: ["Burgers", "French fries", "Cold drinks"],
    vegCuisines: ["Veg burgers", "French fries", "Cold drinks"],
    eta: "35 min",
    distance: "3.1 km",
    priceHint: "Items starting @129",
    pureVeg: false,
    favourite: true,
  },
];

// Both frames draw Biggy's with a filled heart, so the seed lives with the data
// rather than being re-typed by every screen that renders these cards.
export const INITIAL_FAVOURITES = Object.fromEntries(
  RESTAURANTS.filter((restaurant) => restaurant.favourite).map((restaurant) => [restaurant.id, true]),
);

// Veg mode only relabels the kitchen; it never drops a cuisine, which is what
// keeps both cards the same height across the two frames.
export function withVegCuisines(restaurant, vegOnly) {
  if (!vegOnly || !restaurant.vegCuisines) return restaurant;
  return { ...restaurant, cuisines: restaurant.vegCuisines };
}
