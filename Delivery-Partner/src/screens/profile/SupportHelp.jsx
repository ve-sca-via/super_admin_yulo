import { Pressable, View } from "react-native";
import { Bug, ChevronRight, Mail, MessageCircle, Phone } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";

const SUPPORT_ROWS = [
  { key: "call", label: "Call support", Icon: Phone },
  { key: "chat", label: "Chat with us", Icon: MessageCircle },
  { key: "report", label: "Report an issue", Icon: Bug },
  { key: "email", label: "Email us", Icon: Mail },
];

// No telephony/chat/email backend wired yet — rows are stubbed no-ops,
// matching how other not-yet-backed actions are handled in this codebase.
export default function SupportHelp() {
  return (
    <Screen edges={["top"]}>
      <AppBar title="Support & Help" onBack={true} />

      <View className="flex-1 gap-4 px-6 pb-6 pt-2">
        {SUPPORT_ROWS.map(({ key, label, Icon }) => (
          <Pressable
            key={key}
            onPress={() => {}}
            className="w-full flex-row items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-md shadow-black/10"
          >
            <View className="h-10 w-10 items-center justify-center">
              <Icon size={22} color="#666" />
            </View>
            <Text className="flex-1 font-jakarta-medium text-base text-foreground">{label}</Text>
            <ChevronRight size={20} color="#999" />
          </Pressable>
        ))}

        <View className="pt-6">
          <Button onPress={() => {}}>Call support now</Button>
        </View>
      </View>
    </Screen>
  );
}
