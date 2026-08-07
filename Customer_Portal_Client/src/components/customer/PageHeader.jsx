import { Pressable, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

// The header every account screen wears (Figma frames 25–32): one arrow, one
// large title, nothing else. Distinct from `AppBar`, which is the compact
// 14/20px bar the older flows use — these screens draw the title at display size
// and the two can't be the same component without a size prop that lies about
// which of them a screen is.
//
// The arrow is top-aligned rather than centred so a title that wraps onto a
// second line ("Notification preferences") keeps it beside the first line
// instead of floating into the middle of the block.
export default function PageHeader({ title, className, onBack }) {
  const navigation = useNavigation();
  const back = onBack ?? (navigation.canGoBack() ? () => navigation.goBack() : null);

  return (
    <View className={cn("flex-row items-start gap-4 px-6 pt-2", className)}>
      {back ? (
        <Pressable
          onPress={back}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mt-1.5"
        >
          <ArrowLeft size={26} color="#1A1A1A" strokeWidth={2.4} />
        </Pressable>
      ) : null}

      <Text className="flex-1 font-jakarta-extrabold text-[30px] leading-[38px] text-foreground">
        {title}
      </Text>
    </View>
  );
}
