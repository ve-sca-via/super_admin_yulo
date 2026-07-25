import { View } from "react-native";
import { ChevronRight, FileText } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { DOCUMENT_TYPES } from "@/mocks/fixtures";

// Every document on this screen is already uploaded — unlike
// DocumentRow.jsx's 3-state (pending/next/uploaded) logic used on the
// onboarding hub, so rows are built inline here rather than reusing it.
function UploadedRow({ label }) {
  return (
    <View className="w-full flex-row items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-md shadow-black/10">
      <View className="size-10 items-center justify-center rounded-xl bg-success">
        <FileText size={18} color="#ffffff" />
      </View>
      <Text className="flex-1 font-jakarta-medium text-base text-foreground">{label}</Text>
      <View className="h-7 items-center justify-center rounded-full bg-success-tint px-3">
        <Text className="font-jakarta-semibold text-sm text-success">Uploaded</Text>
      </View>
      <ChevronRight size={20} color="#999999" />
    </View>
  );
}

export default function DocumentsUploaded() {
  return (
    <Screen edges={["top"]}>
      <AppBar title="Documents Uploaded" onBack={true} />

      <View className="gap-4 px-6 pb-6 pt-2">
        {DOCUMENT_TYPES.map((doc) => (
          <UploadedRow key={doc.type} label={doc.label} />
        ))}

        <Button className="mt-2" onPress={() => {}}>
          Request Changes
        </Button>
      </View>
    </Screen>
  );
}
