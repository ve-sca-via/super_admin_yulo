import { Modal, Pressable, View } from "react-native";
import { Check, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import { ACCENTS } from "@/lib/accent";

// The pick-one sheet checkout raises twice: once for the delivery tip, once for
// how the order is paid for. Both are a short list where the choice takes effect
// immediately, so neither carries a confirm button — tapping a row is the answer.
export default function OptionSheet({
  visible,
  title,
  options,
  value,
  accent = ACCENTS.default,
  onSelect,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View className="flex-1">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View
          style={{ paddingBottom: insets.bottom + 24 }}
          className="mt-auto rounded-t-3xl bg-card px-6 pt-4"
        >
          <View className="h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="mt-5 flex-row items-center gap-3">
            <Text className="flex-1 font-jakarta-bold text-[22px] leading-[30px] text-foreground">
              {title}
            </Text>

            <Pressable onPress={onDismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color="#1A1A1A" />
            </Pressable>
          </View>

          <View className="mt-4">
            {options.map((option) => {
              const active = option.id === value;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => onSelect(option.id)}
                  className="flex-row items-center gap-4 py-4"
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={option.label}
                >
                  <View
                    style={active ? { borderColor: accent.icon, backgroundColor: accent.icon } : undefined}
                    className="size-6 items-center justify-center rounded-full border-[1.5px] border-border-strong"
                  >
                    {active ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>

                  <View className="flex-1">
                    <Text className="font-jakarta-semibold text-[17px] leading-[24px] text-foreground">
                      {option.label}
                    </Text>

                    {option.note ? (
                      <Text className="font-jakarta text-[13px] leading-[18px] text-muted-foreground">
                        {option.note}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
