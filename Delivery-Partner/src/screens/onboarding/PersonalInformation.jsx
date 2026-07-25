import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { cn } from "@/lib/utils";
import { mockPersonalInfo } from "@/mocks/fixtures";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

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

export default function PersonalInformation() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState(mockPersonalInfo.fullName);
  const [email, setEmail] = useState(mockPersonalInfo.email);
  const [mobileNumber, setMobileNumber] = useState(mockPersonalInfo.mobileNumber);
  const [dob, setDob] = useState(mockPersonalInfo.dob);
  const [gender, setGender] = useState(mockPersonalInfo.gender);
  const [aadhaarNumber, setAadhaarNumber] = useState(mockPersonalInfo.aadhaarNumber);
  const [panNumber, setPanNumber] = useState(mockPersonalInfo.panNumber);

  return (
    <Screen>
      <AppBar title="Personal information" />

      <ScrollView className="w-full px-6 pt-4" contentContainerClassName="gap-4 pb-6">
        <View className="gap-2">
          <Text className="font-jakarta-semibold text-[13px] text-muted-foreground">
            Step 1 of 4 · Personal information
          </Text>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-full rounded-full bg-primary" style={{ width: "25%" }} />
          </View>
        </View>

        <Field label="Full name">
          <Input value={fullName} onChangeText={setFullName} className="rounded-2xl" />
        </Field>

        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Mobile number">
          <Input
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            className="rounded-2xl"
          />
        </Field>

        <Field label="Date of birth">
          <Input value={dob} onChangeText={setDob} className="rounded-2xl" />
        </Field>

        <Field label="Gender">
          <SegmentedControl options={GENDERS} value={gender} onChange={setGender} />
        </Field>

        <Field label="Aadhaar number">
          <Input
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            keyboardType="number-pad"
            className="rounded-2xl"
          />
        </Field>

        <Field label="PAN number">
          <Input
            value={panNumber}
            onChangeText={setPanNumber}
            autoCapitalize="characters"
            className="rounded-2xl"
          />
        </Field>

        <View className="w-full pt-2">
          <Button onPress={() => navigation.navigate("OnboardingDocuments")}>Continue</Button>
        </View>

        <Text className="text-center text-xs text-muted-foreground">
          Your Aadhaar &amp; PAN are used only for identity verification and background checks.
        </Text>
      </ScrollView>
    </Screen>
  );
}
