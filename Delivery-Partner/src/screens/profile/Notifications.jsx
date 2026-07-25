import { useState } from "react";
import { Switch, View } from "react-native";
import { Package, Settings, Target, Volume2, Wallet } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";

const TOGGLES = [
  { key: "orders", label: "New order alerts", Icon: Package },
  { key: "payments", label: "Payment & earnings updates", Icon: Wallet },
  { key: "promotions", label: "Promotions & offers", Icon: Target },
  { key: "appUpdates", label: "App updates", Icon: Settings },
  { key: "soundVibration", label: "Sound & vibration", Icon: Volume2 },
];

function ToggleRow({ label, Icon }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <View className="w-full flex-row items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-md shadow-black/10">
      <View className="h-10 w-10 items-center justify-center">
        <Icon size={22} color="#666" />
      </View>
      <Text className="flex-1 font-jakarta-medium text-base text-foreground">{label}</Text>
      <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: "#ff5f00" }} />
    </View>
  );
}

export default function Notifications() {
  const navigation = useNavigation();

  return (
    <Screen edges={["top"]}>
      <AppBar title="Notifications" onBack={true} />

      <View className="flex-1 gap-4 px-6 pb-6 pt-2">
        {TOGGLES.map(({ key, label, Icon }) => (
          <ToggleRow key={key} label={label} Icon={Icon} />
        ))}

        <View className="pt-6">
          <Button onPress={() => navigation.goBack()}>Save preferences</Button>
        </View>
      </View>
    </Screen>
  );
}
