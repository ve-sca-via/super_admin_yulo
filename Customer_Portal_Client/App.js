import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { FeedProvider } from "@/context/FeedContext";
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // A font that fails to load must not leave the app on a blank screen forever
  // — fall through to the system face and render.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomerAuthProvider>
          <FeedProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </FeedProvider>
        </CustomerAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
