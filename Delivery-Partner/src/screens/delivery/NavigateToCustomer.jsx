import NavigationScreen from "./NavigationScreen";

function handleArrive(navigation, order, orderKey) {
  // COD orders need cash collected before the trip can close; prepaid
  // orders have nothing left to collect and go straight to the payout summary.
  const next = order.payment === "cod" ? "DeliveryCodCollection" : "DeliverySummary";
  navigation.navigate(next, { orderKey });
}

export default function NavigateToCustomer() {
  return (
    <NavigationScreen stage="dropoff" mapLabel="Navigate to customer" onArrive={handleArrive} />
  );
}
