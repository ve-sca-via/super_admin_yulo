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

  // Both "Deposit cash" (primary) and "I've deposited at store" (secondary)
  // are real completion paths in the updated design — no QR/maps affordance
  // exists here anymore — so both close out the screen the same way.
  function handleDeposited() {
    navigation.navigate("EarningsDepositConfirmed");
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

        <Button onPress={handleDeposited}>Deposit cash</Button>
        <Button variant="secondary" size="sm" onPress={handleDeposited}>
          I&rsquo;ve deposited at store
        </Button>
      </View>
    </Screen>
  );
}
