import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

const boxIllustration = require("@/assets/onboarding/everything-delivered-illustration.png");
const bottomBlob = require("@/assets/onboarding/step2-bottom-blob.png");

// Figma frame "ChatGPT Image Aug 3, 2026, 11_25_46 PM 2" (node 446:906) is
// authored at 398x899 — decoration and illustration are scaled off that
// reference width so they keep their designed proportions on other widths.
const FRAME_WIDTH = 398;
const TOP_BLOB_WIDTH = 361.303;
const TOP_BLOB_HEIGHT = 132.232;
const TOP_BLOB_X = 18;
const TOP_BLOB_Y = 9;
const ILLUSTRATION_ASPECT = 420 / 398;
const BOTTOM_BLOB_WIDTH = 260;
const BOTTOM_BLOB_HEIGHT = 69;

function TopBlobDecoration({ scale }) {
  return (
    <Svg
      width={TOP_BLOB_WIDTH * scale}
      height={TOP_BLOB_HEIGHT * scale}
      viewBox={`0 0 ${TOP_BLOB_WIDTH} ${TOP_BLOB_HEIGHT}`}
      style={{ position: "absolute", top: 0, left: TOP_BLOB_X * scale }}
    >
      <Defs>
        <LinearGradient id="onboardingBlobStep2" x1="256.382" y1="132.232" x2="124.847" y2="-17.5033" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#A4161A" />
          <Stop offset="0.35" stopColor="#B11226" />
          <Stop offset="0.7" stopColor="#D9480F" />
          <Stop offset="1" stopColor="#F2A65A" />
        </LinearGradient>
      </Defs>
      <Path
        d="M34.1411 0.2585C35.4773 0.0671059 38.7479 0.0398157 40.2335 0.030436L240.657 0.0544515L298.685 0.035935C307.475 0.0278491 316.455 -0.0881443 325.238 0.145095C334.117 0.380881 343.219 4.97972 349.492 11.2127C354.718 16.457 358.395 23.0443 360.117 30.2478C361.741 36.9304 361.227 50.6838 361.221 58.0007L361.251 99.2451C355.39 102.611 349.733 105.932 344.084 109.64C325.62 121.759 295.175 145.5 275.437 122.723C262.353 104.065 280.845 81.6481 271.478 59.4158C266.825 48.3712 258.861 39.5086 247.704 34.9255C194.351 13.7718 147.189 62.8935 100.784 80.531C57.7857 96.8739 16.4745 81.4136 0 37.6278C2.69786 18.0548 13.838 3.38622 34.1411 0.2585Z"
        fill="url(#onboardingBlobStep2)"
      />
    </Svg>
  );
}

export default function OnboardingStep2({ onNext }) {
  const { width } = useWindowDimensions();
  const scale = width / FRAME_WIDTH;
  const illustrationWidth = width;

  return (
    <Screen edges={["top", "bottom"]}>
      <TopBlobDecoration scale={scale} />

      <View className="flex-1 items-center justify-center">
        <Image
          source={boxIllustration}
          style={{ width: illustrationWidth, height: illustrationWidth * ILLUSTRATION_ASPECT }}
          resizeMode="contain"
        />

        <View className="px-9 items-center">
          <Text className="mt-6 text-center font-jakarta-extrabold text-[26px] uppercase leading-[32px] tracking-tight text-foreground">
            Everything{"\n"}Delivered
          </Text>

          <Text className="mt-4 text-center font-jakarta text-[15px] leading-[22px] text-muted-foreground">
            From meals and groceries to gifts, toys, bags, and more—all in one app.
          </Text>
        </View>
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

        <OnboardingProgress index={1} count={3} />
      </View>

      <Image
        source={bottomBlob}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: BOTTOM_BLOB_WIDTH * scale,
          height: BOTTOM_BLOB_HEIGHT * scale,
        }}
        resizeMode="stretch"
      />
    </Screen>
  );
}
