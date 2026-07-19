import { View } from "react-native";

import { cn } from "@/lib/utils";
import Text from "@/components/ui/Text";

export default function AppBar({ title, theme = "light", className }) {
  const dark = theme === "dark";
  return (
    <View
      className={cn("h-14 w-full flex-row items-center px-6", dark ? "bg-[#141414]" : "bg-card", className)}
    >
      <Text
        className={cn(
          dark ? "font-jakarta-semibold text-[14px] text-white" : "font-jakarta-bold text-[20px] text-foreground",
        )}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
