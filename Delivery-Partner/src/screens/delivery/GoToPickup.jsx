import NavigationScreen from "./NavigationScreen";

function handleArrive(navigation, order, orderKey) {
  // Both veg and standard orders pass through the at-restaurant checkpoint
  // (order items + pickup OTP) — matches Figma's "14 – Veg Checkpoint" and
  // "14 – Regular order Checkpoint" frames. Only veg orders additionally see
  // the packaging-verification checklist there; see VegCheckpoint.jsx's
  // `isVeg` branch.
  navigation.navigate("DeliveryVegCheckpoint", { orderKey });
}

export default function GoToPickup() {
  return <NavigationScreen stage="pickup" mapLabel="Navigate to restaurant" onArrive={handleArrive} />;
}
