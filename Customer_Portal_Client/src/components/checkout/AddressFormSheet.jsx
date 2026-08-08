import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { ADDRESS_LABELS } from "@/data/addresses";
import { ACCENTS } from "@/lib/accent";

// The design draws the "+ Add a new address" control but not the screen behind
// it — there's no map picker in the frames — so a new address is typed into a
// sheet over the list it joins. Swap for the map flow when it's designed; the
// address shape the book stores stays.
export default function AddressFormSheet({ visible, accent = ACCENTS.default, onSave, onDismiss }) {
  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState(ADDRESS_LABELS[0]);
  const [line, setLine] = useState("");

  // Reopening starts blank — a sheet that came back holding the last address
  // would invite saving it twice.
  useEffect(() => {
    if (!visible) return;
    setLabel(ADDRESS_LABELS[0]);
    setLine("");
  }, [visible]);

  const trimmed = line.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* The multiline address field puts the keyboard over the bottom of the
          window, which is exactly where this panel sits. Android resizes the
          window itself, so only iOS needs the padding. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
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
              Add a new address
            </Text>

            <Pressable onPress={onDismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color="#1A1A1A" />
            </Pressable>
          </View>

          <Text className="mt-6 font-jakarta-semibold text-[15px] leading-[22px] text-muted-foreground">
            Save as
          </Text>

          <View className="mt-3 flex-row gap-3">
            {ADDRESS_LABELS.map((option) => {
              const active = option === label;

              return (
                <Pressable
                  key={option}
                  onPress={() => setLabel(option)}
                  style={active ? { backgroundColor: accent.icon } : undefined}
                  className={
                    active
                      ? "h-11 items-center justify-center rounded-full px-6"
                      : "h-11 items-center justify-center rounded-full border border-border-strong bg-card px-6"
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={option}
                >
                  <Text
                    className={
                      active
                        ? "font-jakarta-semibold text-[15px] leading-[21px] text-white"
                        : "font-jakarta-medium text-[15px] leading-[21px] text-foreground"
                    }
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-6 font-jakarta-semibold text-[15px] leading-[22px] text-muted-foreground">
            Address
          </Text>

          <TextInput
            value={line}
            onChangeText={setLine}
            placeholder="Flat, building, area, city"
            placeholderTextColor="#999999"
            multiline
            className="mt-3 min-h-[88px] rounded-2xl border border-border bg-white p-4 font-jakarta text-[16px] leading-[23px] text-foreground"
            accessibilityLabel="Address"
          />

          <Button
            onPress={() => onSave({ label, line: trimmed })}
            disabled={!trimmed}
            size="lg"
            style={trimmed ? { backgroundColor: accent.icon } : undefined}
            className="mt-6 w-full"
          >
            Save address
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
