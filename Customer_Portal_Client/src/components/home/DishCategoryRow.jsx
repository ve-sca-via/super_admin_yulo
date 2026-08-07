import { Image, Pressable, ScrollView, View } from "react-native";

import Text from "@/components/ui/Text";

// Figma "Category Row" (250:426) — 64px cells, each an 88x88 dish cut-out
// scaled into the cell plus a wrapping label underneath.
const CELL_WIDTH = 64;
const IMAGE_SIZE = 64;

export default function DishCategoryRow({ items, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingHorizontal: 20 }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect?.(item)}
          style={{ width: CELL_WIDTH }}
          className="items-center"
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          {/* Figma puts a drop-shadow on this node, but RN shadows are drawn
              from the view box rather than the alpha channel — a rectangle
              behind these transparent cut-outs reads as an artefact. */}
          <Image source={item.image} style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }} resizeMode="contain" />

          <Text
            numberOfLines={2}
            className="mt-1 text-center font-jakarta-semibold text-[14px] leading-[18px] text-muted-foreground"
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
