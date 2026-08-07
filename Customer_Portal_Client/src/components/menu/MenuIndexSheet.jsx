import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, useWindowDimensions, View } from "react-native";
import { Mic, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import VegModeBanner from "@/components/home/VegModeBanner";
import { ACCENTS } from "@/lib/accent";
import { formatCount, sectionItems } from "@/data/menu";

// The list is capped at a share of the window rather than a fixed height, so a
// short menu sits at its natural size and a long one scrolls instead of pushing
// the search field off the top of the sheet.
const LIST_HEIGHT_RATIO = 0.55;

// What the floating "Menu" button opens: the section index, so a long menu can
// be jumped through without scrolling past every dish. Picking a section expands
// it and scrolls it to the top of the screen.
//
// A section split into named groups doesn't jump on the first tap — it opens in
// place and lists its groups, each its own jump target. The count stays on the
// section, since that's the number of dishes the customer lands among either
// way.
export default function MenuIndexSheet({
  visible,
  sections,
  accent = ACCENTS.default,
  vegOnly = false,
  query,
  onChangeQuery,
  placeholder = "Search in menu",
  onSelect,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Which section has its groups showing. Sheet-local: it's a way of reading the
  // index, not a change to how the menu underneath is folded.
  const [openId, setOpenId] = useState(null);

  // A reopened sheet starts collapsed, so it never comes back holding a section
  // the customer opened several storefronts ago.
  useEffect(() => {
    if (!visible) setOpenId(null);
  }, [visible]);

  const handleSectionPress = (section) => {
    if (!section.groups) {
      onSelect?.(section.id);
      return;
    }
    setOpenId((current) => (current === section.id ? null : section.id));
  };

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
          className="absolute inset-0 bg-black/40"
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close menu index"
        />

        {/* Veg mode's confirmation rides above the dimmed backdrop rather than
            inside the sheet — the customer has to be able to see it's on while
            they're picking which part of the menu to read. */}
        {vegOnly ? (
          <View style={{ paddingTop: insets.top + 4 }} className="absolute inset-x-0 top-0 px-2">
            <VegModeBanner className="w-full justify-center rounded-2xl px-4 py-3" />
          </View>
        ) : null}

        <View className="mt-auto rounded-t-3xl bg-background px-6 pb-10 pt-4">
          <View className="h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="mt-5 h-14 flex-row items-center rounded-full bg-card px-5 shadow-md shadow-black/10">
            <Search size={22} color={accent.icon} />

            <TextInput
              value={query}
              onChangeText={onChangeQuery}
              placeholder={placeholder}
              placeholderTextColor="#999999"
              returnKeyType="search"
              className="h-full flex-1 px-4 font-jakarta-medium text-[16px] text-foreground"
              accessibilityLabel="Search in menu"
            />

            <View className="mr-3 h-6 w-px bg-border" />

            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voice search"
              // No speech capture is wired up yet; the control is drawn in the
              // design and stays inert until it is.
              onPress={() => {}}
            >
              <Mic size={22} color={accent.icon} />
            </Pressable>
          </View>

          {sections.length ? (
            <ScrollView
              style={{ maxHeight: height * LIST_HEIGHT_RATIO }}
              className="mt-3"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {sections.map((section) => {
                const open = openId === section.id;
                const count = sectionItems(section).length;

                return (
                  <View key={section.id}>
                    <Pressable
                      onPress={() => handleSectionPress(section)}
                      className="flex-row items-center gap-3 py-4"
                      accessibilityRole="button"
                      accessibilityState={section.groups ? { expanded: open } : undefined}
                      accessibilityLabel={`${section.title}, ${count} ${count === 1 ? "item" : "items"}`}
                    >
                      <Text
                        numberOfLines={2}
                        className="shrink font-jakarta-semibold text-[21px] leading-[28px] text-foreground"
                      >
                        {section.title}
                      </Text>

                      {section.groups && open ? (
                        <View
                          style={{ backgroundColor: accent.tint }}
                          className="size-7 items-center justify-center rounded-full"
                        >
                          <X size={15} color={accent.icon} />
                        </View>
                      ) : null}

                      <View className="flex-1" />

                      <Text className="font-jakarta-semibold text-[21px] leading-[28px] text-foreground">
                        {formatCount(count)}
                      </Text>
                    </Pressable>

                    {section.groups && open
                      ? section.groups.map((group) => (
                          <Pressable
                            key={group.id}
                            onPress={() => onSelect?.(group.id)}
                            className="py-3 pl-[72px]"
                            accessibilityRole="button"
                            accessibilityLabel={`${group.title}, in ${section.title}`}
                          >
                            <Text
                              numberOfLines={1}
                              className="font-jakarta text-[19px] leading-[26px] text-foreground"
                            >
                              {group.title}
                            </Text>
                          </Pressable>
                        ))
                      : null}
                  </View>
                );
              })}

              <View className="mt-4 h-px bg-border" />
            </ScrollView>
          ) : (
            <Text className="py-10 text-center font-jakarta-medium text-[14px] leading-[20px] text-muted-foreground">
              No sections match this search.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
