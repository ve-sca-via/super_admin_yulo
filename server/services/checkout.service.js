import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import * as cartService from './cart.service.js';
import * as menuService from './menu.service.js';

const UPSELL_LIMIT = 5;

// "reuse GET /api/restaurants/:id/menu/search or top-rated items from that restaurant —
// don't build a separate recommendation engine" — this is the "top-rated items" reading:
// bestseller-badged items first, then most recent, excluding whatever's already in the
// cart. Built from the same cached getMenu() data the menu endpoints already use, not a
// fresh MenuItem query.
const getUpsellItems = async (restaurantId, excludeMenuItemIds) => {
  const menu = await menuService.getMenu(restaurantId);
  const excluded = new Set(excludeMenuItemIds.map(String));

  const allItems = [];
  for (const category of menu) {
    allItems.push(...(category.items || []));
    for (const sub of category.subCategories || []) allItems.push(...(sub.items || []));
  }

  return allItems
    .filter((item) => !excluded.has(String(item._id)))
    .sort((a, b) => {
      const aBestseller = a.badges?.includes('bestseller') ? 1 : 0;
      const bBestseller = b.badges?.includes('bestseller') ? 1 : 0;
      if (aBestseller !== bBestseller) return bBestseller - aBestseller;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, UPSELL_LIMIT);
};

// `cartId` (if the caller passes one — there's only ever one cart per user, see Prompt 9)
// is accepted but unused; this always reads the caller's own current cart.
export const getCheckoutSummary = async (userId) => {
  const [{ cart, bill }, user] = await Promise.all([
    cartService.getCart(userId),
    User.findById(userId).select('savedAddresses preferences').lean(),
  ]);

  const address = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0] || null;

  let upsellItems = [];
  let vegFleetEligible = false;

  if (cart.restaurantId) {
    const restaurant = await Restaurant.findById(cart.restaurantId).select('vegFleetAvailable').lean();
    vegFleetEligible = Boolean(user.preferences?.vegModeEnabled && restaurant?.vegFleetAvailable);
    upsellItems = await getUpsellItems(
      cart.restaurantId,
      cart.items.map((i) => i.menuItemId)
    );
  }

  return { address, cart, bill, upsellItems, vegFleetEligible };
};
