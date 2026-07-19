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
import Home from "@/screens/home/Home";
import FleetBadgeInfo from "@/screens/home/FleetBadgeInfo";
import IncomingOrder from "@/screens/orders/IncomingOrder";
import RejectReasonSheet from "@/screens/orders/RejectReasonSheet";
import SkipConfirmed from "@/screens/orders/SkipConfirmed";
import GoToPickup from "@/screens/delivery/GoToPickup";
import VegCheckpoint from "@/screens/delivery/VegCheckpoint";
import NavigateToCustomer from "@/screens/delivery/NavigateToCustomer";
import CodCollection from "@/screens/delivery/CodCollection";
import PaymentReceived from "@/screens/delivery/PaymentReceived";
import DeliverySummary from "@/screens/delivery/DeliverySummary";
import Earnings from "@/screens/earnings/Earnings";
import CashDeposit from "@/screens/earnings/CashDeposit";

const Stack = createNativeStackNavigator();

// Flat stack mirroring the flow-by-flow screen inventory from the plan doc —
// every one of the 32 screens gets a route from day one (real or stub) so
// in-app navigation never dead-ends while the remaining flows are built out.
const STUBS = [
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
      <Stack.Screen name="HomeOffline" component={Home} />
      <Stack.Screen
        name="FleetBadgeInfo"
        component={FleetBadgeInfo}
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
      <Stack.Screen name="OrdersIncomingVeg" component={IncomingOrder} initialParams={{ orderKey: "veg" }} />
      <Stack.Screen
        name="OrdersIncomingStandard"
        component={IncomingOrder}
        initialParams={{ orderKey: "standard" }}
      />
      <Stack.Screen
        name="OrdersReject"
        component={RejectReasonSheet}
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
      <Stack.Screen name="OrdersSkipConfirmed" component={SkipConfirmed} />
      <Stack.Screen name="DeliveryPickup" component={GoToPickup} />
      <Stack.Screen name="DeliveryVegCheckpoint" component={VegCheckpoint} />
      <Stack.Screen name="DeliveryNavigate" component={NavigateToCustomer} />
      <Stack.Screen name="DeliveryCodCollection" component={CodCollection} />
      <Stack.Screen name="DeliveryPaymentReceived" component={PaymentReceived} />
      <Stack.Screen name="DeliverySummary" component={DeliverySummary} />
      <Stack.Screen name="Earnings" component={Earnings} initialParams={{ period: "today" }} />
      <Stack.Screen name="EarningsWeekly" component={Earnings} initialParams={{ period: "weekly" }} />
      <Stack.Screen name="EarningsMonthly" component={Earnings} initialParams={{ period: "monthly" }} />
      <Stack.Screen name="EarningsCashDeposit" component={CashDeposit} />
      {STUBS.map(({ name, title, flow, showNav }) => (
        <Stack.Screen key={name} name={name}>
          {() => <PlaceholderScreen title={title} flow={flow} showNav={showNav ?? true} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
