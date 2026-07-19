import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingProvider } from "@/context/OnboardingContext";
import PlaceholderScreen from "@/components/partner/PlaceholderScreen";

import PhoneEntry from "@/screens/onboarding/PhoneEntry";
import OtpVerification from "@/screens/onboarding/OtpVerification";
import DocumentUploadHub from "@/screens/onboarding/DocumentUploadHub";
import DocumentCapture from "@/screens/onboarding/DocumentCapture";
import VerificationStatus from "@/screens/onboarding/VerificationStatus";
import TrainingModule from "@/screens/onboarding/TrainingModule";
import TrainingComplete from "@/screens/onboarding/TrainingComplete";

const Stack = createNativeStackNavigator();

// Flat stack mirroring the flow-by-flow screen inventory from the plan doc —
// every one of the 32 screens gets a route from day one (real or stub) so
// in-app navigation never dead-ends while the remaining flows are built out.
const STUBS = [
  { name: "HomeOffline", title: "Home (Offline)", flow: "Flow 2 — Going Online" },
  { name: "HomeOnline", title: "Home (Online / Idle)", flow: "Flow 2 — Going Online" },
  { name: "FleetBadgeInfo", title: "Fleet Badge Info Sheet", flow: "Flow 2 — Going Online" },

  { name: "OrdersIncomingVeg", title: "Incoming Order (Veg Fleet)", flow: "Flow 3 — Order Assignment" },
  { name: "OrdersIncomingStandard", title: "Incoming Order (Standard Fleet)", flow: "Flow 3 — Order Assignment" },
  { name: "OrdersReject", title: "Reject Reason Sheet", flow: "Flow 3 — Order Assignment" },
  { name: "OrdersSkipConfirmed", title: "Skip Confirmed", flow: "Flow 3 — Order Assignment" },

  { name: "DeliveryPickup", title: "Go to Pickup", flow: "Flow 4 — Pickup → Deliver" },
  { name: "DeliveryVegCheckpoint", title: "Veg Checkpoint (At Restaurant)", flow: "Flow 4 — Pickup → Deliver" },
  { name: "DeliveryNavigate", title: "Navigate to Customer", flow: "Flow 4 — Pickup → Deliver" },
  { name: "DeliveryCodCollection", title: "COD Collection", flow: "Flow 4 — Pickup → Deliver" },
  { name: "DeliveryPaymentReceived", title: "Payment Received", flow: "Flow 4 — Pickup → Deliver" },
  { name: "DeliverySummary", title: "Delivery Summary", flow: "Flow 4 — Pickup → Deliver" },

  { name: "Earnings", title: "Earnings", flow: "Flow 5 — Earnings" },
  { name: "EarningsWeekly", title: "Earnings (Weekly)", flow: "Flow 5 — Earnings" },
  { name: "EarningsMonthly", title: "Earnings (Monthly)", flow: "Flow 5 — Earnings" },
  { name: "EarningsCashDeposit", title: "Cash Deposit", flow: "Flow 5 — Earnings" },

  { name: "Profile", title: "Profile", flow: "Flow 6 — Profile & Account" },
  { name: "ProfilePersonalDetails", title: "Personal Details", flow: "Flow 6 — Profile & Account" },
  { name: "ProfileHelpSupport", title: "Help & Support", flow: "Flow 6 — Profile & Account" },
  { name: "ProfileSettings", title: "App Settings", flow: "Flow 6 — Profile & Account" },
  { name: "ProfileFleetChange", title: "Fleet Change Request", flow: "Flow 6 — Profile & Account" },
  { name: "ProfileFleetChangeSubmitted", title: "Request Submitted", flow: "Flow 6 — Profile & Account", showNav: false },

  { name: "EdgeFleetDecision", title: "Customer Fleet Decision Prompt", flow: "Flow 7 — Edge Cases", showNav: false },
  { name: "EdgeVegViolation", title: "Veg Violation Detected", flow: "Flow 7 — Edge Cases", showNav: false },
];

function OnboardingStack() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingPhoneEntry" component={PhoneEntry} />
        <Stack.Screen name="OnboardingOtp" component={OtpVerification} />
        <Stack.Screen name="OnboardingDocuments" component={DocumentUploadHub} />
        <Stack.Screen name="OnboardingDocumentCapture" component={DocumentCapture} />
        <Stack.Screen name="OnboardingStatus" component={VerificationStatus} />
        <Stack.Screen name="OnboardingTraining" component={TrainingModule} />
        <Stack.Screen name="OnboardingTrainingComplete" component={TrainingComplete} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingStack} />
      {STUBS.map(({ name, title, flow, showNav }) => (
        <Stack.Screen key={name} name={name}>
          {() => <PlaceholderScreen title={title} flow={flow} showNav={showNav ?? true} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
