import { Pressable, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

// One dish is the floor while a dish is being customised — nothing has been
// added yet for a zero to remove, so closing the sheet or leaving the item page
// is how a customer backs out. A line already in the cart is the exception: it
// passes `min={0}`, because counting down to nothing is how the checkout row
// removes a dish.
const MIN = 1;
const MAX = 20;

// The two sizes the design draws: the full control on the customisation
// surfaces, and the compact one that sits at the end of a checkout row.
const SIZES = {
  default: { box: "h-14 w-[124px] px-4", icon: 20, label: "text-[17px] leading-[24px]" },
  sm: { box: "h-9 w-[94px] px-3", icon: 16, label: "text-[15px] leading-[20px]" },
};

// The quantity control both customisation surfaces carry: filled with the
// accent's wash inside the sheet, outlined where it sits on the item page's
// bottom bar next to the pay button.
export default function QuantityStepper({
  value,
  accent,
  onChange,
  tone = "tint",
  size = "default",
  min = MIN,
  className,
}) {
  const outlined = tone === "outline";
  const metrics = SIZES[size];
  const set = (next) => onChange(Math.min(Math.max(next, min), MAX));

  return (
    <View
      style={outlined ? undefined : { backgroundColor: accent.tint }}
      className={cn(
        "flex-row items-center justify-between rounded-full",
        metrics.box,
        outlined && "border border-border-strong bg-card",
        className,
      )}
      accessibilityLabel={`Quantity, ${value}`}
    >
      <Pressable
        onPress={() => set(value - 1)}
        disabled={value <= min}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className={cn(value <= min && "opacity-40")}
      >
        <Minus size={metrics.icon} color={accent.icon} />
      </Pressable>

      <Text className={cn("font-jakarta-semibold text-foreground", metrics.label)}>{value}</Text>

      <Pressable
        onPress={() => set(value + 1)}
        disabled={value >= MAX}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className={cn(value >= MAX && "opacity-40")}
      >
        <Plus size={metrics.icon} color={accent.icon} />
      </Pressable>
    </View>
  );
}
