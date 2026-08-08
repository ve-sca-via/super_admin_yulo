import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export function useRestaurantMenu(restaurantId) {
  // Fetch Restaurant Profile
  const restaurantQuery = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => client.get(`/restaurants/${restaurantId}`),
    enabled: !!restaurantId,
  });

  // Fetch Menu
  const menuQuery = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => client.get(`/restaurants/${restaurantId}/menu`),
    enabled: !!restaurantId,
  });

  // Map backend menu (categories -> subcategories -> items) into UI sections
  const sections = [];
  if (menuQuery.data) {
    // Assuming backend returns an array of categories directly or an object with categories
    const categories = Array.isArray(menuQuery.data) ? menuQuery.data : menuQuery.data.categories || [];
    
    categories.forEach(category => {
      // Map category to a section
      const sectionItems = [];
      
      // If it has subcategories
      if (category.subcategories) {
          category.subcategories.forEach(sub => {
              if (sub.items) {
                  sectionItems.push(...sub.items);
              }
          });
      }
      
      // If items are directly on category
      if (category.items) {
          sectionItems.push(...category.items);
      }

      sections.push({
        id: category._id || category.id,
        title: category.name,
        defaultOpen: true, // we can default everything to open initially
        items: sectionItems.map(item => ({
            id: item._id,
            name: item.name,
            price: item.sellingPrice || item.effectivePrice, // Using selling/effective price
            veg: item.foodType !== "non_veg",
            description: item.description,
            image: null, // Typically no thumbnails in this API yet
            bestseller: !!item.isBestseller,
            customisable: item.optionGroups?.length > 0,
            originalItem: item // preserve the original backend item
        }))
      });
    });
  }

  return {
    restaurant: restaurantQuery.data,
    menuSections: sections,
    isLoading: restaurantQuery.isLoading || menuQuery.isLoading,
  };
}
