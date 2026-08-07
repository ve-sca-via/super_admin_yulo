import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

const rider = require("@/assets/onboarding/fast-delivery-illustration.png");

// Figma frame "02 · Onboarding — step 3" (node 365:452) is authored at
// 391x826 — the blob and illustration are scaled off that reference width
// so they keep their designed proportions on other device widths.
const FRAME_WIDTH = 391;
const BLOB_WIDTH = 363.734;
const BLOB_HEIGHT = 129.385;
const BLOB_X = 13.971;
const BLOB_Y = 8.544;
const ILLUSTRATION_ASPECT = 620 / 700;

function BlobDecoration({ scale }) {
  return (
    <Svg
      width={BLOB_WIDTH * scale}
      height={BLOB_HEIGHT * scale}
      viewBox={`0 0 ${BLOB_WIDTH} ${BLOB_HEIGHT}`}
      style={{ position: "absolute", top: BLOB_Y * scale, left: BLOB_X * scale }}
    >
      <Defs>
        <LinearGradient id="onboardingBlobStep3" x1="258.106" y1="129.385" x2="129.927" y2="-20.7465" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#A4161A" />
          <Stop offset="0.35" stopColor="#B11226" />
          <Stop offset="0.7" stopColor="#D9480F" />
          <Stop offset="1" stopColor="#F2A65A" />
        </LinearGradient>
      </Defs>
      <Path
        d="M36.6296 0.0740612C37.3164 0.038569 38.0045 0.0195324 38.6926 0.0169512L243.694 0.0329228L300.53 0.0101354C308.332 -0.00430342 316.161 0.0415938 323.962 0.000616466C334.439 -0.0544368 343.975 3.57738 351.471 11.0981C356.645 16.2832 360.35 22.7502 362.207 29.8378C364.205 37.5096 363.668 52.4651 363.668 60.8461L363.61 100.675C351.262 111.708 332.186 125.628 315.831 128.712C299.464 131.799 286.554 124.181 283.556 107.436C282.482 96.938 285.412 86.8591 284.08 76.1223C280.798 48.9224 260.462 37.2886 235.514 34.2782C173.228 26.7623 143.859 91.5723 86.0532 98.0988C58.4199 101.218 30.1289 88.9309 12.5287 67.4461C7.37586 61.1559 1.24026 51.5028 0.116319 43.1113C-1.55019 20.8599 14.8895 2.1172 36.6296 0.0740612Z"
        fill="url(#onboardingBlobStep3)"
      />
    </Svg>
  );
}

export default function OnboardingStep3({ onNext }) {
  const { width } = useWindowDimensions();
  const scale = width / FRAME_WIDTH;
  const illustrationWidth = width * 0.82;

  return (
    <Screen edges={["top", "bottom"]}>
      <BlobDecoration scale={scale} />

      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={rider}
          style={{ width: illustrationWidth, height: illustrationWidth * ILLUSTRATION_ASPECT }}
          resizeMode="contain"
        />

        <Text className="mt-8 text-center font-jakarta-extrabold text-[26px] uppercase leading-[32px] tracking-tight text-foreground">
          Fast delivery{"\n"}to your door
        </Text>

        <Text className="mt-4 text-center font-jakarta text-[15px] leading-[22px] text-muted-foreground">
          Track your order live and get your favorite meals delivered fresh and fast.
        </Text>
      </View>

      <View className="items-center gap-6 pb-10">
        <Pressable
          onPress={onNext}
          hitSlop={8}
          className="flex-row items-center gap-1 py-2"
          accessibilityLabel="Next"
        >
          <Text className="font-jakarta-bold text-[15px] uppercase tracking-wide text-muted-foreground">Next</Text>
          <ChevronRight size={18} color="#666666" />
        </Pressable>

        <OnboardingProgress index={2} count={3} />
      </View>
    </Screen>
  );
}
