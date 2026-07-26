import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const [, , cmd, ...args] = process.argv;
const API = "http://localhost:3000/api";

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  if (cmd === "approve-partner") {
    const [phone] = args;
    const res = await db.collection("deliverypartners").updateOne(
      { phone },
      { $set: { verificationStatus: "approved", verifiedAt: new Date(), verificationNotes: null } },
    );
    console.log("approved, matched:", res.matchedCount);
  } else if (cmd === "partner-status") {
    const [phone] = args;
    const p = await db.collection("deliverypartners").findOne({ phone });
    console.log(JSON.stringify({
      id: p?._id?.toString(),
      verificationStatus: p?.verificationStatus,
      fleetType: p?.fleetType,
      training: p?.training,
      status: p?.status,
    }));
  } else if (cmd === "setup-order-fixtures") {
    const ownerId = new mongoose.Types.ObjectId();
    const restaurant = await db.collection("restaurants").insertOne({
      ownerId,
      name: "Test Kitchen (Step 10 e2e)",
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      delivery: { radiusKm: 5 },
      settings: { gstPercent: 5, serviceChargePercent: 10 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const restaurantId = restaurant.insertedId;
    const staff = await db.collection("staffmembers").insertOne({
      restaurantId,
      staffCode: "CHEF01",
      name: "Test Chef",
      role: "chef",
      pinHash: "x",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const customer = await db.collection("users").insertOne({
      name: "Test Customer",
      email: `test.customer.${Date.now()}@example.com`,
      passwordHash: "x",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const staffToken = jwt.sign(
      { staffId: staff.insertedId.toString() },
      process.env.JWT_STAFF_SECRET,
      { expiresIn: "1h" },
    );
    console.log(JSON.stringify({
      restaurantId: restaurantId.toString(),
      staffId: staff.insertedId.toString(),
      userId: customer.insertedId.toString(),
      staffToken,
    }));
  } else if (cmd === "create-order") {
    const [restaurantId, userId, paymentMethod] = args;
    const order = await db.collection("orders").insertOne({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "delivery",
      items: [{ menuItemId: new mongoose.Types.ObjectId(), name: "Veg Thali", price: 220, quantity: 1 }],
      subtotal: 220,
      status: "placed",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cash",
      deliveryAddress: { street: "88 Test Ave", city: "Bengaluru", coordinates: [77.6, 12.97] },
      deliveryAssignment: { status: "unassigned", offerStatus: "none", history: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(JSON.stringify({ orderId: order.insertedId.toString() }));
  } else if (cmd === "confirm-order") {
    const [restaurantId, orderId, staffToken] = args;
    const res = await fetch(`${API}/staff/${restaurantId}/kitchen/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ newStatus: "confirmed" }),
    });
    console.log(JSON.stringify({ httpStatus: res.status, body: await res.json() }));
  } else if (cmd === "pickup-otp") {
    const [orderId] = args;
    const order = await db.collection("orders").findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    console.log(order?.deliveryAssignment?.pickupOtp ?? "");
  } else if (cmd === "order-status") {
    const [orderId] = args;
    const order = await db.collection("orders").findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    console.log(JSON.stringify({ status: order?.status, deliveryAssignment: order?.deliveryAssignment }));
  } else if (cmd === "cleanup-order-fixtures") {
    const [restaurantId, staffId, userId, ...orderIds] = args;
    const oids = orderIds.filter(Boolean).map((id) => new mongoose.Types.ObjectId(id));
    const results = {};
    if (oids.length) results.orders = (await db.collection("orders").deleteMany({ _id: { $in: oids } })).deletedCount;
    if (restaurantId) results.restaurant = (await db.collection("restaurants").deleteOne({ _id: new mongoose.Types.ObjectId(restaurantId) })).deletedCount;
    if (staffId) results.staff = (await db.collection("staffmembers").deleteOne({ _id: new mongoose.Types.ObjectId(staffId) })).deletedCount;
    if (userId) results.user = (await db.collection("users").deleteOne({ _id: new mongoose.Types.ObjectId(userId) })).deletedCount;
    console.log(JSON.stringify(results));
  } else if (cmd === "cleanup-partner") {
    const [phone] = args;
    const p = await db.collection("deliverypartners").findOne({ phone });
    if (p) {
      await db.collection("fleetchangerequests").deleteMany({ partnerId: p._id });
      await db.collection("supporttickets").deleteMany({ raisedBy: p._id });
      await db.collection("cashdeposits").deleteMany({ partnerId: p._id });
    }
    const res = await db.collection("deliverypartners").deleteOne({ phone });
    console.log("deleted partner:", res.deletedCount);
  } else {
    console.log("unknown cmd", cmd);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e.message, e.stack);
  process.exit(1);
});
