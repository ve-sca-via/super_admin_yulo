import { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { formatCurrency } from "@/lib/format";

// Snapshot amount for this screen — see fixtures.js CASH_IN_HAND comment for
// why this doesn't read from the same constant as the Earnings screens.
const AMOUNT_TO_DEPOSIT = 605;

export default function CashDeposit() {
  const navigation = useNavigation();
  // "Find nearest deposit point" would need real maps integration we don't
  // have yet — left as a static affordance, same as the Call buttons on the
  // delivery screens. "I've deposited at store" is the one real completion
  // path, so that's what closes out the screen.
  const [deposited, setDeposited] = useState(false);

  function handleDeposited() {
    setDeposited(true);
    navigation.navigate("HomeOffline");
  }

  return (
    <Screen>
      <AppBar title="Deposit cash" />

      <View className="w-full gap-4 px-6 pt-5">
        <View className="w-full gap-2 rounded-[20px] bg-card px-4 py-3.5 shadow-md shadow-black/10">
          <Text className="font-jakarta-medium text-xs text-muted-foreground">
            Cash in hand to deposit
          </Text>
          <Text className="font-jakarta-bold text-[36px] leading-[45px] text-foreground">
            {formatCurrency(AMOUNT_TO_DEPOSIT)}
          </Text>
        </View>

        <View className="w-full items-center gap-2 rounded-[20px] bg-card px-4 pb-9 pt-2 shadow-md shadow-black/10">
          <Text className="py-1.5 text-center text-sm text-muted-foreground">
            Scan at any deposit point
          </Text>
          <View className="size-[148px] items-center justify-center rounded-xl bg-muted">
            <Text className="text-sm text-muted-foreground">QR Code</Text>
          </View>
        </View>

        <View className="w-full flex-row items-center gap-3 py-1.5">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-sm text-muted-foreground">or</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Button variant="secondary" size="sm" onPress={handleDeposited}>
          {deposited ? "Deposit recorded ✓" : "I've deposited at store"}
        </Button>
        <Button>Find nearest deposit point</Button>
      </View>
    </Screen>
  );
}
