import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { cn } from "@/lib/utils";
import { mockVehicle, VEHICLE_TYPES } from "@/mocks/fixtures";

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

export default function VehicleDetailsForm() {
  const navigation = useNavigation();
  const [type, setType] = useState(mockVehicle.type);
  const [model, setModel] = useState(mockVehicle.model);
  const [registrationNumber, setRegistrationNumber] = useState(mockVehicle.registrationNumber);
  const [rcNumber, setRcNumber] = useState(mockVehicle.rcNumber);
  const [insuranceProvider, setInsuranceProvider] = useState(mockVehicle.insuranceProvider);
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(
    mockVehicle.insurancePolicyNumber,
  );
  const [insuranceValidTill, setInsuranceValidTill] = useState(mockVehicle.insuranceValidTill);

  return (
    <Screen>
      <AppBar title="Vehicle details" />

      <ScrollView className="w-full px-6 pt-4" contentContainerClassName="gap-4 pb-6">
        <View className="gap-2">
          <Text className="font-jakarta-semibold text-[13px] text-muted-foreground">
            Step 3 of 4 · Vehicle details
          </Text>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-full rounded-full bg-primary" style={{ width: "75%" }} />
          </View>
        </View>

        <Field label="Vehicle type">
          <SegmentedControl options={VEHICLE_TYPES} value={type} onChange={setType} />
        </Field>

        <Field label="Vehicle model">
          <Input value={model} onChangeText={setModel} className="rounded-2xl" />
        </Field>

        <Field label="Vehicle registration number">
          <Input
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            autoCapitalize="characters"
            className="rounded-2xl"
          />
        </Field>

        <Field label="RC number">
          <Input
            value={rcNumber}
            onChangeText={setRcNumber}
            autoCapitalize="characters"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Insurance provider">
          <Input value={insuranceProvider} onChangeText={setInsuranceProvider} className="rounded-2xl" />
        </Field>

        <Field label="Insurance policy number">
          <Input
            value={insurancePolicyNumber}
            onChangeText={setInsurancePolicyNumber}
            autoCapitalize="characters"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Insurance validity">
          <Input value={insuranceValidTill} onChangeText={setInsuranceValidTill} className="rounded-2xl" />
        </Field>

        <View className="w-full pt-2">
          <Button onPress={() => navigation.navigate("OnboardingBankDetails")}>Continue</Button>
        </View>

        <Text className="text-center text-xs text-muted-foreground">
          Make sure your RC and insurance are valid — we&rsquo;ll verify these against your uploaded
          documents.
        </Text>
      </ScrollView>
    </Screen>
  );
}
