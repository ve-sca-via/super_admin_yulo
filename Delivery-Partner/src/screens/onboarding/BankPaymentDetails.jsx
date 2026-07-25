import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPES, mockBankDetails, PAYMENT_PREFERENCES } from "@/mocks/fixtures";

function Field({ label, children }) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-jakarta-medium text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <View className="h-11 w-full flex-row gap-1 rounded-full bg-[#f5f5f5] p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              "h-9 flex-1 items-center justify-center rounded-full",
              selected && "bg-primary",
            )}
          >
            <Text
              className={cn(
                "text-xs",
                selected
                  ? "font-jakarta-semibold text-white"
                  : "font-jakarta-medium text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BankPaymentDetails() {
  const navigation = useNavigation();
  const [bankName, setBankName] = useState(mockBankDetails.bankName);
  const [accountHolderName, setAccountHolderName] = useState(mockBankDetails.accountHolderName);
  const [accountNumber, setAccountNumber] = useState(mockBankDetails.accountNumber);
  const [accountType, setAccountType] = useState(mockBankDetails.accountType);
  const [ifsc, setIfsc] = useState(mockBankDetails.ifsc);
  const [branchName, setBranchName] = useState(mockBankDetails.branchName);
  const [upiId, setUpiId] = useState(mockBankDetails.upiId);
  const [paymentPreference, setPaymentPreference] = useState(mockBankDetails.paymentPreference);

  return (
    <Screen>
      <AppBar title="Bank & payment details" />

      <ScrollView className="w-full px-6 pt-4" contentContainerClassName="gap-4 pb-6">
        <View className="gap-2">
          <Text className="font-jakarta-semibold text-[13px] text-muted-foreground">
            Step 4 of 4 · Bank &amp; payment
          </Text>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
          </View>
        </View>

        <Field label="Bank name">
          <Input value={bankName} onChangeText={setBankName} className="rounded-2xl" />
        </Field>

        <Field label="Account holder name">
          <Input value={accountHolderName} onChangeText={setAccountHolderName} className="rounded-2xl" />
        </Field>

        <Field label="Account number">
          <Input
            value={accountNumber}
            onChangeText={setAccountNumber}
            autoCapitalize="characters"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Account type">
          <SegmentedControl options={ACCOUNT_TYPES} value={accountType} onChange={setAccountType} />
        </Field>

        <Field label="IFSC code">
          <Input value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" className="rounded-2xl" />
        </Field>

        <Field label="Branch name">
          <Input value={branchName} onChangeText={setBranchName} className="rounded-2xl" />
        </Field>

        <Field label="UPI ID">
          <Input
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Payment preference">
          <SegmentedControl
            options={PAYMENT_PREFERENCES}
            value={paymentPreference}
            onChange={setPaymentPreference}
          />
        </Field>

        <View className="w-full pt-2">
          <Button onPress={() => navigation.navigate("OnboardingStatus")}>Finish setup</Button>
        </View>

        <Text className="text-center text-xs text-muted-foreground">
          Payouts are settled daily to your selected account or UPI ID.
        </Text>
      </ScrollView>
    </Screen>
  );
}
