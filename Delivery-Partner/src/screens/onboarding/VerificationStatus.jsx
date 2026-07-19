import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Hourglass } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import Stepper from "@/components/partner/Stepper";
import { useOnboarding } from "@/context/OnboardingContext";

export default function VerificationStatus() {
  const navigation = useNavigation();
  const { verificationStatus, approveVerification, training } = useOnboarding();
  const step = verificationStatus === "approved" ? 2 : 1;

  function handleContinueToTraining() {
    approveVerification();
    navigation.navigate("OnboardingTraining", { moduleId: training.moduleId });
  }

  return (
    <Screen>
      <AppBar title="Application status" />

      <View className="w-full items-center gap-8 px-6 pt-12">
        <View className="size-20 items-center justify-center rounded-2xl bg-warning-tint">
          <Hourglass size={36} color="#f59e0b" strokeWidth={1.5} />
        </View>

        <View className="items-center gap-1.5">
          <Text className="text-center font-jakarta-bold text-xl text-foreground">
            Documents under review
          </Text>
          <Text className="text-center text-base text-muted-foreground">
            We&rsquo;ll notify you within 24 hours once your documents are verified.
          </Text>
        </View>

        <View className="w-full pt-3">
          <Stepper steps={["Submitted", "Under review", "Approved"]} step={step} />
        </View>

        <View className="w-full gap-3.5 pt-11">
          <Button>Contact support</Button>
          <Button variant="secondary" size="sm" onPress={() => navigation.navigate("OnboardingDocuments")}>
            View uploaded documents
          </Button>
        </View>

        {/* DEV-ONLY: real approval happens on the admin side after the 24h
            review window — this lets the rest of Flow 1 be walked through
            without a backend. Remove once verification is wired to the API. */}
        <Pressable
          onPress={handleContinueToTraining}
          className="w-full rounded-full border border-dashed border-border-strong py-2"
        >
          <Text className="text-center font-jakarta-medium text-xs text-muted-foreground">
            Dev preview: skip wait → continue to training
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
