import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Plus } from "lucide-react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AddressCard from "@/components/checkout/AddressCard";
import AddressFormSheet from "@/components/checkout/AddressFormSheet";
import PageHeader from "@/components/customer/PageHeader";
import { accentFor } from "@/lib/accent";

const SCROLL_PADDING = 32;

// Figma "30 · Saved addresses". The address book as an account screen, as
// distinct from `checkout/DeliveryAddress`, which is the same list being asked a
// question: there is no confirm bar here, because nothing is being checked out.
// Choosing one still selects it — the address book has one selected address and
// tapping a card is how it moves, whichever screen you're on.
//
// Adding goes through the same sheet checkout uses, so an address created here
// is shaped exactly like one created on the way to paying.
export default function SavedAddresses() {
  const { addresses, selectedAddress, selectAddress, addAddress } = useCustomerAuth();
  const { vegOnly } = useFeed();
  const accent = accentFor(vegOnly);

  const [adding, setAdding] = useState(false);

  const saveAddress = (address) => {
    addAddress(address);
    setAdding(false);
  };

  return (
    <Screen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Saved addresses" />

        <Pressable
          onPress={() => setAdding(true)}
          style={{ backgroundColor: accent.tint }}
          className="mx-5 mt-6 h-14 flex-row items-center gap-3 rounded-[20px] px-5"
          accessibilityRole="button"
          accessibilityLabel="Add a new address"
        >
          <Plus size={22} color={accent.icon} strokeWidth={2.4} />

          <Text style={{ color: accent.icon }} className="font-jakarta-semibold text-[18px] leading-[25px]">
            Add a new address
          </Text>
        </Pressable>

        <View className="mt-5 gap-4 px-5">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              accent={accent}
              selected={address.id === selectedAddress?.id}
              onPress={() => selectAddress(address.id)}
            />
          ))}
        </View>
      </ScrollView>

      <AddressFormSheet
        visible={adding}
        accent={accent}
        onSave={saveAddress}
        onDismiss={() => setAdding(false)}
      />
    </Screen>
  );
}
