import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import DocumentRow from "@/components/partner/DocumentRow";
import ProgressBar from "@/components/partner/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";
import { DOCUMENT_TYPES } from "@/mocks/fixtures";

export default function DocumentUploadHub() {
  const navigation = useNavigation();
  const {
    documents,
    uploadedCount,
    totalDocuments,
    nextDocType,
    onboardingStatusError,
    refreshOnboardingStatus,
  } = useOnboarding();

  const allUploaded = uploadedCount === totalDocuments;

  function statusFor(type) {
    if (documents[type] === "uploaded") return "uploaded";
    if (type === nextDocType) return "next";
    return "pending";
  }

  return (
    <Screen>
      <AppBar title="Upload documents" />

      <ScrollView className="w-full px-6 pt-2" contentContainerClassName="gap-3 pb-6">
        <Text className="text-sm text-muted-foreground">Verification takes up to 24 hours</Text>

        {onboardingStatusError && (
          <Text
            className="text-center text-sm text-destructive"
            onPress={() => refreshOnboardingStatus()}
          >
            Couldn&rsquo;t refresh document status — tap to retry
          </Text>
        )}

        <View className="gap-2">
          <ProgressBar value={(uploadedCount / totalDocuments) * 100} />
          <Text className="font-jakarta-medium text-xs text-muted-foreground">
            {uploadedCount} of {totalDocuments} documents uploaded
          </Text>
        </View>

        <View className="gap-4 pt-1">
          {DOCUMENT_TYPES.map(({ type, label }) => (
            <DocumentRow
              key={type}
              label={label}
              status={statusFor(type)}
              onPress={() =>
                navigation.navigate(
                  type === "profile_photo" ? "SelfieCapture" : "OnboardingDocumentCapture",
                  { docType: type },
                )
              }
            />
          ))}
        </View>

        <View className="w-full pt-5">
          <Button
            variant={allUploaded ? "default" : "disabled"}
            disabled={!allUploaded}
            onPress={() => navigation.navigate("OnboardingVehicleDetails")}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
