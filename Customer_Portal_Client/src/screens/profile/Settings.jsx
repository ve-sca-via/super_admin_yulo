import { ScrollView, View } from "react-native";

import Screen from "@/components/ui/Screen";
import PageHeader from "@/components/customer/PageHeader";
import SettingsRow from "@/components/customer/SettingsRow";

const SCROLL_PADDING = 32;

// Figma "32 · Settings". The app's own switches, as opposed to the customer's
// things — those are on the profile screen above it.
//
// Everything except notifications is a screen that hasn't been built, so each
// row carries the title its screen will have and lands on the shared
// placeholder; swap a row's target for the real screen as its flow comes up in
// the build order.
const ROWS = [
  { id: "notifications", label: "Notifications", route: "Notifications" },
  { id: "language", label: "Language" },
  { id: "payment", label: "Payment methods" },
  { id: "privacy", label: "Privacy & data" },
  { id: "terms", label: "Terms of service" },
  { id: "about", label: "About Yulo stores" },
];

export default function Settings({ navigation }) {
  const open = (row) =>
    row.route
      ? navigation.navigate(row.route)
      : navigation.navigate("Placeholder", { title: row.label, flow: "the settings flow" });

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Settings" />

        <View className="mt-6 gap-4 px-5">
          {ROWS.map((row) => (
            <SettingsRow key={row.id} label={row.label} onPress={() => open(row)} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
