import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { ACCENTS } from "@/lib/accent";

// The free-text note checkout collects twice: instructions for the rider, and a
// request for the kitchen. Nothing is saved until the button is pressed, so
// dismissing the sheet leaves whatever was already on the order untouched.
export default function NoteSheet({
  visible,
  title,
  placeholder,
  value = "",
  accent = ACCENTS.default,
  onSave,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);

  // The sheet opens on what's already on the order — editing a note has to start
  // from the note, not from an empty field.
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* The field autofocuses, so the keyboard is always up on this sheet —
          without this the panel keeps its place at the bottom of the window and
          the Save button ends up underneath it. Android resizes the window
          itself, so only iOS needs the padding. */}
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
              {title}
            </Text>

            <Pressable onPress={onDismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color="#1A1A1A" />
            </Pressable>
          </View>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            multiline
            autoFocus
            className="mt-5 min-h-[104px] rounded-2xl border border-border bg-white p-4 font-jakarta text-[16px] leading-[23px] text-foreground"
            accessibilityLabel={title}
          />

          <Button
            onPress={() => onSave(draft.trim())}
            size="lg"
            style={{ backgroundColor: accent.icon }}
            className="mt-5 w-full"
          >
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
