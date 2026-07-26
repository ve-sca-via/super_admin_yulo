import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import client from "@/api/client";
import { DOCUMENT_TYPES } from "@/mocks/fixtures";

// Every document on this screen is already uploaded — unlike
// DocumentRow.jsx's 3-state (pending/next/uploaded) logic used on the
// onboarding hub, so rows are built inline here rather than reusing it.
function UploadedRow({ label, uploaded }) {
  return (
    <View className="w-full flex-row items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-md shadow-black/10">
      <View className={`size-10 items-center justify-center rounded-xl ${uploaded ? "bg-success" : "bg-muted"}`}>
        <FileText size={18} color={uploaded ? "#ffffff" : "#999999"} />
      </View>
      <Text className="flex-1 font-jakarta-medium text-base text-foreground">{label}</Text>
      <View className={`h-7 items-center justify-center rounded-full px-3 ${uploaded ? "bg-success-tint" : "bg-muted"}`}>
        <Text className={`font-jakarta-semibold text-sm ${uploaded ? "text-success" : "text-muted-foreground"}`}>
          {uploaded ? "Uploaded" : "Not uploaded"}
        </Text>
      </View>
      <ChevronRight size={20} color="#999999" />
    </View>
  );
}

export default function DocumentsUploaded() {
  const navigation = useNavigation();
  const { data } = useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => client.get("/partner/profile"),
  });
  const documents = data?.partner?.documents ?? [];
  const uploadedTypes = new Set(documents.map((d) => d.type));

  return (
    <Screen edges={["top"]}>
      <AppBar title="Documents Uploaded" onBack={true} />

      <View className="gap-4 px-6 pb-6 pt-2">
        {DOCUMENT_TYPES.map((doc) => (
          <UploadedRow key={doc.type} label={doc.label} uploaded={uploadedTypes.has(doc.type)} />
        ))}

        <Button
          className="mt-2"
          // A real destination now that DocumentUploadHub.jsx (Step 3) actually handles re-upload —
          // was a literal no-op before.
          onPress={() => navigation.navigate("Onboarding", { screen: "OnboardingDocuments" })}
        >
          Request Changes
        </Button>
      </View>
    </Screen>
  );
}
