import { Linking, ScrollView, View } from "react-native";

import Screen from "@/components/ui/Screen";
import PageHeader from "@/components/customer/PageHeader";
import SettingsRow from "@/components/customer/SettingsRow";

const SCROLL_PADDING = 32;

// The line the tracking screens already dial. Support is dispatcher-side and
// there's no ticketing endpoint yet, so the one row that can be made to work
// today is made to work rather than parked behind a placeholder.
const SUPPORT_PHONE = "tel:+911800000000";

// Figma "26 · Help & Support". Reasons, not features: every row is a sentence a
// customer would say out loud, and the two ways to reach a person are last
// because most complaints are answerable without one.
//
// The four topics open the support thread carrying what they're about — the
// thread itself is still the placeholder, so `topic` is ignored for now and is
// what the ticket will be filed under once support is built.
const TOPICS = [
  { id: "delayed", label: "Order is delayed" },
  { id: "missing-items", label: "Wrong or missing items" },
  { id: "veg-fleet", label: "Issue with veg-only fleet delivery" },
  { id: "payment", label: "Payment or refund query" },
];

export default function HelpSupport({ navigation }) {
  const openThread = (topic) => navigation.navigate("Support", { topic });

  const call = () => Linking.openURL(SUPPORT_PHONE).catch(() => {});

  return (
    <Screen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Help & Support" />

        <View className="mt-6 gap-4 px-5">
          {TOPICS.map((topic) => (
            <SettingsRow key={topic.id} label={topic.label} onPress={() => openThread(topic.id)} />
          ))}

          <SettingsRow
            label="Chat with delivery partner"
            onPress={() => openThread("delivery-partner")}
          />

          <SettingsRow label="Talk to support" onPress={call} />
        </View>
      </ScrollView>
    </Screen>
  );
}
