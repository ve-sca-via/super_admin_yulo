import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Check } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { formatCurrency } from "@/lib/format";

// Snapshot figures matching CashDeposit.jsx's AMOUNT_TO_DEPOSIT — this
// screen is reached right after that screen's submit action, before any
// real deposit-history backend exists.
const AMOUNT_DEPOSITED = 605;
const DEPOSIT_POINT = "Spice Route Kitchen";
const DEPOSITED_AT = "Today, 6:42 PM";

const ROWS = [
  { label: "Amount deposited", value: formatCurrency(AMOUNT_DEPOSITED) },
  { label: "Method", value: "Store deposit" },
  { label: "Deposit point", value: DEPOSIT_POINT },
  { label: "Date & time", value: DEPOSITED_AT },
];

export default function DepositConfirmed() {
  const navigation = useNavigation();

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-[200px] w-full items-center gap-5 bg-success px-6 pb-6 pt-[26px]">
        <View className="size-16 items-center justify-center rounded-full bg-white">
          <Check size={28} color="#22a853" strokeWidth={3} />
        </View>
        <View className="items-center gap-0.5">
          <Text className="font-jakarta-bold text-2xl text-white">Cash deposited</Text>
          <Text className="text-sm text-white">
            {formatCurrency(AMOUNT_DEPOSITED)} · Deposited at store
          </Text>
        </View>
      </View>

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        <View className="w-full gap-3.5 rounded-[20px] bg-card p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-base text-foreground">Deposit summary</Text>
          <View className="gap-3.5">
            {ROWS.map((row) => (
              <View key={row.label} className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">{row.label}</Text>
                <Text className="text-sm text-foreground">{row.value}</Text>
              </View>
            ))}
          </View>
          <View className="h-px w-full bg-border" />
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-bold text-base text-foreground">Cash in hand now</Text>
            <Text className="font-jakarta-bold text-xl text-primary">{formatCurrency(0)}</Text>
          </View>
        </View>

        <Button onPress={() => navigation.navigate("HomeOffline")}>Done</Button>
      </View>

      <BottomNav />
    </Screen>
  );
}
