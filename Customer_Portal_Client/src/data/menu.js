const hero = require("@/assets/home/restaurant-heritage-grill.png");
const logo = require("@/assets/home/cart-restaurant-avatar.png");

// Dish photography hasn't been shot yet, so every item borrows the nearest
// stand-in from the home feed's art. Beverages have no plausible stand-in and
// deliberately carry no image — MenuItemCard draws its fallback tile for those,
// which is also what protects the grid once the API starts returning items whose
// photos are still missing.
const photoBiryani = require("@/assets/home/dish-biryani.png");
const photoVeg = require("@/assets/home/category-veg-thali.png");
const photoPizza = require("@/assets/home/category-pizza.png");
const photoCurry = require("@/assets/home/category-butter-chicken.png");

// Two storefront layouts are drawn in the design and neither is a variant of the
// other: the photo-led grid, and the compact list a pure-veg kitchen with no
// dish photography gets. A menu names the one it's served through, so a single
// "Menu" route can keep answering every card tap on the feed.
export const LAYOUTS = {
  GRID: "grid",
  COMPACT: "compact",
};

// How a dish answers its Add button. Both shapes are optional — a dish carrying
// neither drops straight into the cart, which is what every seeded item did
// before customisation existed.
//
// `detail` is the full item page: a hero photo, what's in the dish, and the
// choice groups a composed plate is assembled from. `customisation` is the
// bottom sheet a simpler dish gets — one row of chips and a list of add-ons,
// close enough to the cart that it doesn't need a screen of its own.

// The biryani plate is built from the same two groups on both storefronts, so
// they're written once and shared rather than copied into each menu.
const SEASONAL_VEG_CHOICE = {
  id: "seasonal-veg",
  title: "Choice of seasonal veg",
  options: [
    {
      id: "bhindi-masala",
      name: "Bhindi Masala",
      description: "Stir-fried okra with aromatic spices",
    },
    {
      id: "aloo-gobhi-adraki",
      name: "Aloo Gobhi Adraki",
      description: "Cauliflower and potato with ginger juliennes",
    },
    {
      id: "baingan-bharta",
      name: "Baingan Bharta",
      description: "Smoked eggplant mash with charred onions",
    },
  ],
};

const RICE_CHOICE = {
  id: "rice",
  title: "Choice of rice",
  options: [
    {
      id: "steamed-basmati",
      name: "Steamed Basmati Rice",
      description: "Long-grain fragrant rice",
    },
    {
      id: "jeera-rice",
      name: "Jeera Rice [100gms]",
      description: "Cumin tempered butter rice",
      price: 20,
    },
  ],
};

const BIRYANI_ABOUT =
  "A curated selection of the season’s finest harvest. Includes paneer butter masala, daal makhani, choice of seasonal veg, aromatic rice, and freshly baked butter naan.";

// Placeholder storefront menu, the same role `data/restaurants` plays for the
// discovery feed — swap for a `src/api/client` menu query once that endpoint
// lands; the shape the screen consumes stays.
//
// `defaultOpen` is what the design shows on arrival: the first two sections
// expanded into their grids, everything below folded into a single card.
export const MENU = {
  id: "mommys-kitchen",
  name: "Mommy’s Kitchen",
  layout: LAYOUTS.GRID,
  tagline: "Artisanal thin crust pizza & pasta",
  hero,
  logo,
  rating: "4.5",
  costForTwo: "₹450 for two",
  area: "Andheri West",
  eta: "Delivery in 30–35 min",
  sections: [
    {
      id: "recommended",
      title: "Recommended",
      defaultOpen: true,
      items: [
        {
          id: "hyderabadi-biryani",
          name: "Hyderabadi Biryani",
          description: "Slow-cooked basmati, saffron, fried onion, mint",
          price: 201,
          image: photoBiryani,
          veg: false,
          tag: "Bestseller",
          detail: {
            badge: "Highly reordered",
            cuisine: "Gourmet Mughlai",
            serves: "Serves 1",
            about: BIRYANI_ABOUT,
            choices: [SEASONAL_VEG_CHOICE, RICE_CHOICE],
          },
        },
        {
          id: "steamed-momos",
          name: "Steamed momos",
          description: "Eight pieces, chilli-garlic dip",
          price: 180,
          image: photoVeg,
          veg: true,
        },
      ],
    },
    {
      id: "thin-crust-pizzas",
      title: "Thin crust pizzas",
      defaultOpen: true,
      items: [
        {
          id: "margherita",
          name: "Margherita",
          description: "Mozzarella, basil, freshly made tomato sauce",
          price: 295,
          mrp: 345,
          image: photoPizza,
          veg: true,
        },
        {
          id: "fiamma",
          name: "Fiamma",
          description: "Onions, chilli flakes, mozzarella, basil, fresh cream",
          price: 425,
          image: photoPizza,
          veg: true,
        },
      ],
    },
    {
      id: "breads",
      title: "Breads",
      items: [
        {
          id: "tandoori-roti",
          name: "Tandoori roti",
          description: "Whole wheat, clay oven",
          price: 45,
          image: photoVeg,
          veg: true,
        },
        {
          id: "butter-naan",
          name: "Butter naan",
          description: "Refined flour, brushed with white butter",
          price: 75,
          image: photoVeg,
          veg: true,
        },
        {
          id: "garlic-naan",
          name: "Garlic naan",
          description: "Chopped garlic, coriander, butter",
          price: 95,
          image: photoVeg,
          veg: true,
        },
        {
          id: "laccha-paratha",
          name: "Laccha paratha",
          description: "Layered, pan-finished in ghee",
          price: 85,
          image: photoVeg,
          veg: true,
        },
        {
          id: "missi-roti",
          name: "Missi roti",
          description: "Gram flour, ajwain, green chilli",
          price: 65,
          image: photoVeg,
          veg: true,
        },
        {
          id: "cheese-kulcha",
          name: "Cheese kulcha",
          description: "Amul cheese, onion, mint",
          price: 120,
          image: photoVeg,
          veg: true,
        },
      ],
    },
    {
      id: "curry",
      title: "Curry",
      items: [
        {
          id: "paneer-butter-masala",
          name: "Paneer butter masala",
          description: "Cottage cheese, tomato-cashew gravy, cream",
          price: 280,
          image: photoCurry,
          veg: true,
        },
        {
          id: "dal-makhani",
          name: "Dal makhani",
          description: "Black lentils simmered overnight, butter finish",
          price: 240,
          image: photoCurry,
          veg: true,
          tag: "Bestseller",
        },
        {
          id: "kadhai-paneer",
          name: "Kadhai paneer",
          description: "Bell pepper, onion, crushed coriander seed",
          price: 290,
          image: photoCurry,
          veg: true,
        },
        {
          id: "malai-kofta",
          name: "Malai kofta",
          description: "Paneer-potato dumplings, mild cashew gravy",
          price: 275,
          image: photoCurry,
          veg: true,
        },
        {
          id: "veg-kolhapuri",
          name: "Veg kolhapuri",
          description: "Mixed vegetables, roasted kolhapuri masala",
          price: 260,
          image: photoCurry,
          veg: true,
        },
        {
          id: "butter-chicken",
          name: "Butter chicken",
          description: "Tandoori chicken, tomato-butter gravy",
          price: 340,
          mrp: 380,
          image: photoCurry,
          veg: false,
          tag: "Bestseller",
        },
        {
          id: "chicken-tikka-masala",
          name: "Chicken tikka masala",
          description: "Charred tikka, onion-tomato masala",
          price: 350,
          image: photoCurry,
          veg: false,
        },
        {
          id: "mutton-rogan-josh",
          name: "Mutton rogan josh",
          description: "Kashmiri chilli, fennel, slow-braised mutton",
          price: 420,
          image: photoCurry,
          veg: false,
        },
      ],
    },
    {
      id: "beverages",
      title: "Beverages",
      items: [
        {
          id: "masala-chaas",
          name: "Masala chaas",
          description: "Spiced buttermilk, roasted cumin",
          price: 70,
          veg: true,
        },
        {
          id: "sweet-lassi",
          name: "Sweet lassi",
          description: "Thick curd, cardamom, pistachio",
          price: 110,
          veg: true,
        },
        {
          id: "fresh-lime-soda",
          name: "Fresh lime soda",
          description: "Sweet, salted or mixed",
          price: 90,
          veg: true,
        },
        {
          id: "cold-coffee",
          name: "Cold coffee",
          description: "Double shot, milk, vanilla ice cream",
          price: 150,
          veg: true,
        },
        {
          id: "virgin-mojito",
          name: "Virgin mojito",
          description: "Mint, lime, soda",
          price: 160,
          veg: true,
        },
      ],
    },
  ],
};

// The compact storefront. Nothing here carries a photo — this kitchen's dishes
// haven't been shot at all, which is exactly the case the design draws: tinted
// tiles with a cutlery glyph instead of a food picture.
//
// "Main Course" is the one section long enough to be broken into named groups.
// Groups are what the index sheet indents under an opened section, and each one
// is a jump target of its own, so a 12-dish section is still one tap away from
// the row the customer wants.
export const VEG_MENU = {
  id: "green-leaf-kitchen",
  name: "Green Leaf Kitchen",
  layout: LAYOUTS.COMPACT,
  cuisine: "North Indian, Thali",
  costForTwo: "₹300 for two",
  rating: "4.5",
  ratingCount: "2.3k",
  eta: "30 min",
  pureVeg: true,
  deliveryNote: "Veg-only fleet delivery available",
  // The index sheet's search field suggests a dish rather than describing
  // itself, the way the frames draw it.
  searchHint: "Gobhi",
  sections: [
    {
      id: "recommended-for-you",
      title: "Recommended for you",
      items: [
        {
          id: "paneer-butter-masala",
          name: "Paneer Butter Masala",
          description: "Cottage cheese cubes in a rich tomato-butter gravy",
          price: 320,
          veg: true,
          customisation: {
            groups: [
              {
                id: "spice-level",
                title: "Spice level (choose one)",
                defaultId: "medium",
                options: [
                  { id: "mild", name: "Mild" },
                  { id: "medium", name: "Medium" },
                  { id: "spicy", name: "Spicy" },
                ],
              },
            ],
            addOns: [{ id: "extra-butter", name: "Extra butter dollop", price: 30 }],
          },
        },
        {
          id: "dal-makhani",
          name: "Dal Makhani",
          description: "Slow-cooked black lentils finished with butter and cream",
          price: 320,
          veg: true,
        },
        {
          id: "gobhi-musallam",
          name: "Gobhi Musallam",
          description: "Whole cauliflower, cashew-yoghurt marinade, clay oven",
          price: 340,
          veg: true,
          tag: "Bestseller",
        },
        {
          id: "paneer-tikka",
          name: "Paneer Tikka",
          description: "Char-grilled paneer, bell pepper, ajwain",
          price: 295,
          veg: true,
        },
      ],
    },
    {
      id: "signature-thalis",
      title: "Signature Thalis",
      items: [
        {
          id: "rajasthani-thali",
          name: "Rajasthani Thali",
          description: "Dal baati churma, gatte ki sabzi, bajra roti, ghee",
          price: 420,
          veg: true,
        },
        {
          id: "punjabi-thali",
          name: "Punjabi Thali",
          description: "Two curries, dal, rice, breads, salad, sweet",
          price: 380,
          mrp: 430,
          veg: true,
        },
        {
          id: "everyday-thali",
          name: "Everyday Thali",
          description: "Seasonal sabzi, dal tadka, rice, three phulkas",
          price: 240,
          veg: true,
        },
      ],
    },
    {
      id: "chefs-specials",
      title: "Chef's Specials",
      items: [
        {
          id: "veg-hyderabadi-biryani",
          name: "Veg Hyderabadi Biryani",
          description: "Sealed handi, saffron, fried onion, choice of seasonal veg",
          price: 201,
          veg: true,
          tag: "Bestseller",
          detail: {
            badge: "Highly reordered",
            cuisine: "Gourmet Rajasthani",
            serves: "Serves 1",
            about: BIRYANI_ABOUT,
            // The compact storefront's rows carry no photography, but its item
            // page is a full-bleed hero — it borrows the same stand-in art the
            // grid menu's biryani uses.
            image: photoBiryani,
            choices: [SEASONAL_VEG_CHOICE, RICE_CHOICE],
          },
        },
        {
          id: "subz-dum-biryani",
          name: "Subz Dum Biryani",
          description: "Sealed handi, saffron, fried onion, burani raita",
          price: 360,
          veg: true,
          tag: "Bestseller",
        },
        {
          id: "nadru-yakhni",
          name: "Nadru Yakhni",
          description: "Lotus stem in a fennel-scented yoghurt curry",
          price: 350,
          veg: true,
        },
        {
          id: "kathal-ke-kebab",
          name: "Kathal Ke Kebab",
          description: "Jackfruit, roasted chana, mint chutney",
          price: 310,
          veg: true,
        },
      ],
    },
    {
      id: "main-course",
      title: "Main Course",
      groups: [
        {
          id: "royal-heritage-curries",
          title: "Royal Heritage Curries",
          items: [
            {
              id: "shahi-paneer",
              name: "Shahi Paneer",
              description: "Cashew-melon seed gravy, kewra, silver leaf",
              price: 330,
              veg: true,
            },
            {
              id: "navratan-korma",
              name: "Navratan Korma",
              description: "Nine vegetables, mild saffron cream",
              price: 315,
              veg: true,
            },
            {
              id: "malai-kofta",
              name: "Malai Kofta",
              description: "Paneer-potato dumplings, cashew gravy",
              price: 325,
              veg: true,
            },
          ],
        },
        {
          id: "tandoori-delicacies",
          title: "Tandoori Delicacies",
          items: [
            {
              id: "tandoori-broccoli",
              name: "Tandoori Broccoli",
              description: "Cheddar-yoghurt marinade, smoked in the clay oven",
              price: 330,
              veg: true,
            },
            {
              id: "bharwan-aloo",
              name: "Bharwan Aloo",
              description: "Potato barrels stuffed with khoya and raisin",
              price: 285,
              veg: true,
            },
            {
              id: "soya-chaap-malai",
              name: "Soya Chaap Malai",
              description: "Cream, cheese, white pepper, cardamom",
              price: 300,
              veg: true,
            },
          ],
        },
        {
          id: "seasonal-vegetable-specials",
          title: "Seasonal Vegetable Specials",
          items: [
            {
              id: "sarson-ka-saag",
              name: "Sarson Ka Saag",
              description: "Mustard greens, white butter, makki roti on the side",
              price: 290,
              veg: true,
            },
            {
              id: "bhindi-kurkuri",
              name: "Bhindi Kurkuri",
              description: "Crisp okra, chaat masala, lime",
              price: 260,
              veg: true,
            },
            {
              id: "baingan-bharta",
              name: "Baingan Bharta",
              description: "Fire-roasted aubergine, onion, green chilli",
              price: 275,
              veg: true,
            },
          ],
        },
        {
          id: "artisanal-dals",
          title: "Artisanal Dals",
          items: [
            {
              id: "dal-tadka",
              name: "Dal Tadka",
              description: "Yellow lentils, ghee-garlic tempering",
              price: 230,
              veg: true,
            },
            {
              id: "panchmel-dal",
              name: "Panchmel Dal",
              description: "Five lentils, Rajasthani spicing",
              price: 250,
              veg: true,
            },
            {
              id: "dal-palak",
              name: "Dal Palak",
              description: "Moong dal, spinach, cumin",
              price: 240,
              veg: true,
            },
          ],
        },
      ],
    },
    {
      id: "breads-accompaniments",
      title: "Breads & Accompaniments",
      items: [
        {
          id: "laccha-paratha",
          name: "Laccha Paratha",
          description: "Layered, pan-finished in ghee",
          price: 85,
          veg: true,
        },
        {
          id: "butter-naan",
          name: "Butter Naan",
          description: "Refined flour, brushed with white butter",
          price: 60,
          veg: true,
        },
        {
          id: "khameeri-roti",
          name: "Khameeri Roti",
          description: "Naturally leavened, clay oven",
          price: 70,
          veg: true,
        },
        {
          id: "burani-raita",
          name: "Burani Raita",
          description: "Whisked curd, roasted garlic, red chilli",
          price: 90,
          veg: true,
        },
        {
          id: "masala-papad",
          name: "Masala Papad",
          description: "Roasted papad, onion, tomato, coriander",
          price: 60,
          veg: true,
        },
      ],
    },
    {
      id: "desserts",
      title: "Desserts",
      items: [
        {
          id: "gulab-jamun",
          name: "Gulab Jamun",
          description: "Two pieces, warm cardamom syrup",
          price: 120,
          veg: true,
        },
        {
          id: "shahi-tukda",
          name: "Shahi Tukda",
          description: "Fried bread, rabri, pistachio",
          price: 160,
          veg: true,
        },
        {
          id: "moong-dal-halwa",
          name: "Moong Dal Halwa",
          description: "Slow-roasted in ghee, almond slivers",
          price: 180,
          veg: true,
        },
      ],
    },
    {
      id: "beverages",
      title: "Beverages",
      items: [
        {
          id: "masala-chaas",
          name: "Masala Chaas",
          description: "Spiced buttermilk, roasted cumin",
          price: 70,
          veg: true,
        },
        {
          id: "sweet-lassi",
          name: "Sweet Lassi",
          description: "Thick curd, cardamom, pistachio",
          price: 110,
          veg: true,
        },
        {
          id: "kesar-thandai",
          name: "Kesar Thandai",
          description: "Saffron, fennel, melon seed, chilled milk",
          price: 150,
          veg: true,
        },
        {
          id: "filter-coffee",
          name: "Filter Coffee",
          description: "Chicory blend, frothed by hand",
          price: 90,
          veg: true,
        },
      ],
    },
  ],
};

const MENUS = [MENU, VEG_MENU];

// Every storefront on the feed still opens a menu, and only two of them are
// seeded — anything else falls through to the grid menu, which is the behaviour
// the screen had before a second one existed.
export function menuFor(restaurantName) {
  return MENUS.find((menu) => menu.name === restaurantName) ?? MENU;
}

export const DIETS = {
  ALL: "all",
  VEG: "veg",
  NON_VEG: "non-veg",
};

export function formatPrice(value) {
  return `₹${value}`;
}

// The index sheet prints its counts two digits wide, so a nine-dish section and
// a twenty-two-dish one keep their numerals on the same right edge.
export function formatCount(value) {
  return String(value).padStart(2, "0");
}

// A section holds dishes directly or splits them across named groups; callers
// that only care how many dishes are under a heading shouldn't have to know
// which shape they were handed.
export function sectionItems(section) {
  return section.groups ? section.groups.flatMap((group) => group.items) : (section.items ?? []);
}

// The item page is reached by id from whichever storefront was open, so the
// dish has to be findable without knowing which section — or which group inside
// it — the customer tapped it in.
export function findItem(menu, itemId) {
  for (const section of menu.sections) {
    const found = sectionItems(section).find((item) => item.id === itemId);
    if (found) return found;
  }
  return null;
}

// Every choice group is a "pick one", so a group can never be left unanswered:
// the page opens on the option the menu marks default, or the first one.
export function defaultSelection(groups = []) {
  return Object.fromEntries(
    groups.map((group) => [group.id, group.defaultId ?? group.options[0].id]),
  );
}

function optionIn(group, selection) {
  return group.options.find((option) => option.id === selection[group.id]);
}

// One price for both customisation surfaces: the base plus whatever the chosen
// options and ticked add-ons cost, multiplied by the quantity. The button's
// figure and the line that lands in the cart come from the same call, so they
// can't disagree.
export function totalFor({
  base,
  groups = [],
  selection = {},
  addOns = [],
  chosenAddOns = [],
  quantity = 1,
}) {
  const options = groups.reduce((sum, group) => sum + (optionIn(group, selection)?.price ?? 0), 0);

  const extras = addOns.reduce(
    (sum, addOn) => sum + (chosenAddOns.includes(addOn.id) ? addOn.price : 0),
    0,
  );

  return (base + options + extras) * quantity;
}

// An item priced below its MRP earns the "Save ₹50"-style badge the design puts
// in the corner of the photo, so the badge can never disagree with the two
// prices printed underneath it.
export function savingFor(item) {
  return item.mrp && item.mrp > item.price ? item.mrp - item.price : 0;
}

function matchesDiet(item, diet) {
  if (diet === DIETS.VEG) return item.veg;
  if (diet === DIETS.NON_VEG) return !item.veg;
  return true;
}

function matchesQuery(item, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    item.name.toLowerCase().includes(needle) ||
    (item.description ?? "").toLowerCase().includes(needle)
  );
}

// Sections left with nothing to show are dropped rather than rendered empty —
// the counts beside each heading are the filtered counts, so the number always
// describes what's actually under it. Groups are held to the same rule: one that
// loses every dish goes, and a section whose groups all go with it goes too.
export function filterSections(sections, { diet, query }) {
  const keep = (item) => matchesDiet(item, diet) && matchesQuery(item, query);

  return sections
    .map((section) =>
      section.groups
        ? {
            ...section,
            groups: section.groups
              .map((group) => ({ ...group, items: group.items.filter(keep) }))
              .filter((group) => group.items.length > 0),
          }
        : { ...section, items: (section.items ?? []).filter(keep) },
    )
    .filter((section) => sectionItems(section).length > 0);
}
