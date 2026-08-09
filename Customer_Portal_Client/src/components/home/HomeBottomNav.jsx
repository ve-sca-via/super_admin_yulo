import { useEffect } from "react";
import { View } from "react-native";
import { Bike, Clock, ScanLine } from "lucide-react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import PressableScale from "@/components/ui/PressableScale";
import Text from "@/components/ui/Text";
import { DURATION, EASE, PRESS_SCALE } from "@/lib/motion";

// Figma "bottom-nav" (300:350) — a floating pill with two tabs, not a docked
// tab bar, so it stays a plain control rather than a react-navigation tab bar.
const TABS = [
  { key: "delivery", label: "Delivery", Icon: Bike },
  // Figma draws this tab with "icon/clock", not a rewind glyph.
  { key: "history", label: "History", Icon: Clock },
];

const ACTIVE_INK = "#FF5E00";
const INACTIVE_INK = "#666666";
const ACTIVE_TINT = "#FDEAE0"; // --primary-tint
const TRANSPARENT = "rgba(253,234,224,0)";

// The tint used to appear under the selected tab in one frame. Crossfading it
// instead lets the eye follow the selection from one tab to the other, which is
// the whole job of a two-tab switch: saying which of the two you're now on.
function NavTab({ tab, selected, onPress }) {
  const progress = useSharedValue(selected ? 1 : 0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const next = selected ? 1 : 0;
    progress.value = reduced
      ? next
      : withTiming(next, { duration: DURATION.fast, easing: EASE.inOut });
  }, [selected, reduced, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [TRANSPARENT, ACTIVE_TINT]),
  }));

  const { Icon, label } = tab;

  return (
    <PressableScale
      onPress={onPress}
      scale={PRESS_SCALE.tight}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      className="h-full flex-1"
    >
      <Animated.View
        style={pillStyle}
        className="h-full w-full flex-row items-center justify-center gap-[7px] rounded-full"
      >
        {/* lucide draws with a plain `color` prop rather than a style, so the
            icon can't be interpolated alongside the pill — it swaps, and the
            tint moving underneath is what carries the transition. */}
        <Icon size={22} color={selected ? ACTIVE_INK : INACTIVE_INK} />

        <Text
          style={{ color: selected ? ACTIVE_INK : INACTIVE_INK }}
          className="font-jakarta-semibold text-[14px] leading-[18px]"
        >
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

export default function HomeBottomNav({ value = "delivery", onChange, onScan }) {
  return (
    <View className="h-[60px] w-full flex-row items-center justify-between rounded-full bg-card p-1.5 shadow-md shadow-black/10">
      <NavTab tab={TABS[0]} selected={TABS[0].key === value} onPress={() => onChange?.(TABS[0].key)} />

      <PressableScale
        onPress={onScan}
        scale={PRESS_SCALE.tight}
        accessibilityRole="button"
        accessibilityLabel="Scan QR Code"
        className="mx-2 h-[50px] w-[50px] items-center justify-center rounded-full bg-primary"
        style={{
          shadowColor: "#FF5E00",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <ScanLine size={24} color="#FFFFFF" />
      </PressableScale>

      <NavTab tab={TABS[1]} selected={TABS[1].key === value} onPress={() => onChange?.(TABS[1].key)} />
    </View>
  );
}
