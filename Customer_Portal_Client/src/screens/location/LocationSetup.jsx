import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { MapPin, Search } from "lucide-react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import BackButton from "@/components/customer/BackButton";

export default function LocationSetup({ onNext }) {
  const { setDeliveryLocation } = useCustomerAuth();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  // Once there's an address in the field, that's what the customer is trying to
  // submit — the buttons swap below so the primary one commits it instead of
  // firing a GPS lookup that would throw the typing away. The keyboard's return
  // key stays a second route to the same action.
  const hasTypedAddress = query.trim().length > 0;

  const handleUseCurrentLocation = async () => {
    setError("");
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Enter your address manually instead.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const label = place
        ? [place.name, place.street, place.city].filter(Boolean).join(", ")
        : "Current location";

      // Only latitude/longitude are kept: the rest of the GeolocationPosition
      // (accuracy, heading, speed, a timestamp) is a snapshot of one moment and
      // has no meaning once it's been persisted and reloaded days later.
      setDeliveryLocation({
        label,
        city: place?.city ?? null,
        pincode: place?.postalCode ?? null,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
      onNext();
    } catch {
      setError("Couldn't get your location. Try entering it manually.");
    } finally {
      setLocating(false);
    }
  };

  // There's no server-side geocoding, so a typed address can't be resolved to
  // coordinates — the feed falls back to the city centre for it. Saying so is
  // better than silently showing restaurants near somewhere else.
  const handleManualSubmit = () => {
    if (!hasTypedAddress) return;
    setDeliveryLocation({ label: query.trim(), coords: null });
    onNext();
  };

  return (
    <Screen edges={["top", "bottom"]}>
      {/* "Use this address" only appears once something has been typed, which
          means the keyboard is up whenever it matters — without this it sits
          underneath the keyboard on iOS and the address can't be submitted
          except through the return key. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="h-60 items-center justify-center bg-success-tint">
          <View className="absolute left-4 top-4">
            <BackButton className="size-10 items-center justify-center rounded-full bg-white" />
          </View>
          <MapPin size={40} color="#FF5E00" />
        </View>

        <View className="flex-1 px-6 pt-6">
          <Text className="font-jakarta-extrabold text-[22px] leading-[28px] text-foreground">
            Where should we deliver to?
          </Text>

          <Text className="mt-2 font-jakarta text-[14px] leading-[20px] text-muted-foreground">
            We use your location to show restaurants that deliver to you
          </Text>

          <View className="mt-6 h-12 w-full flex-row items-center gap-2 rounded-full border border-border bg-white px-4">
            <Search size={18} color="#999999" />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={(t) => {
                setError("");
                setQuery(t);
              }}
              onSubmitEditing={handleManualSubmit}
              placeholder="Enter your flat, area, or landmark"
              placeholderTextColor="#999999"
              returnKeyType="search"
              className="flex-1 font-jakarta text-[15px] text-foreground"
              accessibilityLabel="Delivery address"
            />
          </View>

          {error ? (
            <Text className="mt-3 font-jakarta text-[13px] text-destructive">{error}</Text>
          ) : null}
        </View>

        <View className="gap-3 px-6 pb-10">
          {hasTypedAddress ? (
            <>
              <Button onPress={handleManualSubmit}>Use this address</Button>
              <Button variant="secondary" disabled={locating} onPress={handleUseCurrentLocation}>
                {locating ? "Locating..." : "Use current location"}
              </Button>
            </>
          ) : (
            <>
              <Button disabled={locating} onPress={handleUseCurrentLocation}>
                {locating ? "Locating..." : "Use current location"}
              </Button>
              <Button variant="secondary" onPress={() => inputRef.current?.focus()}>
                Enter address manually
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
