import NavigationScreen from "./NavigationScreen";

function handleArrive(navigation, order, orderKey) {
  // Only veg orders get the checkpoint verification step — matches
  // FleetBadgeInfo's "Veg handling certification" promise; standard orders
  // go straight to navigating to the customer.
  const next = order.fleetType === "veg" ? "DeliveryVegCheckpoint" : "DeliveryNavigate";
  navigation.navigate(next, { orderKey });
}

export default function GoToPickup() {
  return <NavigationScreen stage="pickup" mapLabel="Navigate to restaurant" onArrive={handleArrive} />;
}
