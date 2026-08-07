import { View } from "react-native";
import { Check } from "lucide-react-native";

import Card from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import { TIMELINE, stageIndex } from "@/data/orders";

// Figma "Delivery timeline". Every stage of the order is listed, including the
// ones still ahead of it — a list that only showed what had already happened
// would leave the customer guessing how many steps are left.
//
// The ticks are green whatever accent the app is wearing: they mark what the
// kitchen and the partner have done, not the brand, so they read the same on the
// veg frame. Only the stage in progress takes the live blue, which is what makes
// it findable in a column of otherwise identical rows.
const DONE = { ring: "#E4F1E5", ink: "#2E7D32" };
const LIVE = { ring: "#E3EDFB", ink: "#1A56C4" };
const RAIL_DONE = "#2E7D32";
const RAIL_AHEAD = "#E8E2D9";

const DOT_SIZE = 26;

function StageDot({ state }) {
  if (state === "done") {
    return (
      <View
        style={{ width: DOT_SIZE, height: DOT_SIZE, backgroundColor: DONE.ring }}
        className="items-center justify-center rounded-full"
      >
        <Check size={15} color={DONE.ink} strokeWidth={3} />
      </View>
    );
  }

  if (state === "live") {
    return (
      <View
        style={{ width: DOT_SIZE, height: DOT_SIZE, backgroundColor: LIVE.ring }}
        className="items-center justify-center rounded-full"
      >
        <View style={{ backgroundColor: LIVE.ink }} className="size-2.5 rounded-full" />
      </View>
    );
  }

  return (
    <View
      style={{ width: DOT_SIZE, height: DOT_SIZE, borderColor: RAIL_AHEAD }}
      className="rounded-full border-2 bg-[#F7F7F7]"
    />
  );
}

export default function DeliveryTimeline({ stage, className }) {
  const current = stageIndex(stage);

  return (
    <Card className={className}>
      <Text className="font-jakarta-extrabold text-[20px] leading-[28px] text-foreground">
        Delivery timeline
      </Text>

      <View className="mt-4">
        {TIMELINE.map((step, index) => {
          const state = index < current ? "done" : index === current ? "live" : "ahead";
          const last = index === TIMELINE.length - 1;

          return (
            <View key={step.id} className="flex-row">
              <View className="items-center">
                <StageDot state={state} />

                {/* The rail is only green as far as the order has actually got:
                    the segment leaving the stage in progress is still ahead of
                    it, so it stays grey. */}
                {last ? null : (
                  <View
                    style={{ backgroundColor: index < current ? RAIL_DONE : RAIL_AHEAD }}
                    className="w-[3px] flex-1 rounded-full"
                  />
                )}
              </View>

              <View className={last ? "flex-1 pl-3.5" : "flex-1 pb-6 pl-3.5"}>
                <Text
                  className={
                    state === "ahead"
                      ? "font-jakarta-semibold text-[19px] leading-[26px] text-muted-foreground"
                      : "font-jakarta-semibold text-[19px] leading-[26px] text-foreground"
                  }
                >
                  {step.label}
                </Text>

                {step.at ? (
                  <Text className="font-jakarta text-[15px] leading-[21px] text-muted-foreground">
                    {step.at}
                  </Text>
                ) : null}

                {/* Only the stage in progress carries a note, and only while it
                    is in progress — "Tracking live" under a stage the order has
                    already left would be a lie about the map above. */}
                {state === "live" && step.note ? (
                  <Text className="font-jakarta-medium text-[15px] leading-[21px] text-[#1A56C4]">
                    {step.note}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
