# Postmortem: Delivery Partner phone login fails with 409 "email already exists" + 401

## Symptom

Logging into the Delivery Partner app via phone/OTP intermittently fails with:
- `409 Conflict` — `"email already exists"`
- immediately followed by `401 Unauthorized`

...even though the login form never asks for or submits an email address.

## Where the errors actually come from

**Login flow** (`controllers/partner/auth.controller.js` → `verifyOtpHandler`):
```js
const { phone, otp } = req.body;
await otpService.verifyOtp(phone, otp);

let partner = await DeliveryPartner.findOne({ phone });
if (!partner) {
  partner = await DeliveryPartner.create({
    phone,
    verificationStatus: 'pending_documents',
    status: 'inactive',
  });
}
```
This looks up by `phone` only and self-registers (`findOrCreate`-style) a new partner on first login. It never touches `email`.

**The 409** comes from a generic Mongo duplicate-key handler in `middleware/errorHandler.js`:
```js
if (err.code === 11000) {
  const field = Object.keys(err.keyPattern)[0];
  return res.status(409).json({ code: 'DUPLICATE_KEY', message: `${field} already exists` });
}
```
It just reports whichever field collided — here, `email` — regardless of whether the client ever sent one.

**The 401** is a downstream symptom, not a separate bug: because `DeliveryPartner.create()` threw and no partner document/token was produced, the app has no access token. Its next authenticated request is rejected by `middleware/authenticatePartner.js` with `401 UNAUTHORIZED — No token provided`.

## Root cause

`models/DeliveryPartner.js` defines:
```js
email: { type: String, unique: true, sparse: true, lowercase: true, trim: true }
```
`sparse: true` is what should let many riders have *no* email at all — a sparse unique index simply skips documents that are missing the field.

The catch: **Mongoose only creates indexes that are missing on startup; it never edits the options of an index that already exists with the same key.** This field used to be `{ required: true, unique: true }` (no `sparse`). Any database created *before* the schema was changed still has the old **non-sparse** unique index on `email_1`, and the code has had no way of knowing that on its own.

A non-sparse unique index treats a *missing* field as an indexed value of `null` for every document. So:

1. Rider A signs up via phone-only OTP → document has no `email` field → occupies the `email: null` slot in the index → succeeds.
2. Rider B signs up via phone-only OTP → also has no `email` → collides with Rider A's `null` slot → MongoDB throws `E11000 duplicate key error ... email_1 ... { email: null }`.
3. Generic error handler turns that into `409 "email already exists"`.
4. Failed signup ⇒ no token ⇒ next request ⇒ `401`.

This is a classic "schema says one thing, live index says another" bug — Mongoose's `autoIndex` does **not** reconcile changed index *options* (unique/sparse/etc.), only missing indexes entirely.

## Fix

`server/scripts/fixDeliveryPartnerEmailIndex.js` — a one-off, idempotent migration:
```js
const emailIndex = indexes.find((i) => i.name === 'email_1');
if (!emailIndex) {
  // fresh DB: nothing to do, it'll be created sparse
} else if (emailIndex.sparse) {
  // already fixed: nothing to do
} else {
  await DeliveryPartner.collection.dropIndex('email_1');
  await DeliveryPartner.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
}
```
Run once per environment (local/staging/prod) whose database predates the schema change:
```bash
cd super_admin_yulo/server
node server/scripts/fixDeliveryPartnerEmailIndex.js
```
No application code changes are required — the schema was already correct; only the persisted index needed to catch up.

## Lesson for future schema changes

Whenever an existing field's index options change (adding `sparse`, switching `unique` on/off, changing a compound index's keys), treat it like a real migration:
- Write a one-off script (like this one) that inspects the live index and drops/recreates it if it doesn't match.
- Don't rely on Mongoose's `autoIndex`/`syncIndexes` to "just handle it" on deploy — `autoIndex` only *adds* missing indexes by default; it doesn't alter or drop indexes whose definition changed. (`Model.syncIndexes()` *would* reconcile this automatically, but this project isn't calling it on startup.)
- Run the migration against every environment (dev, staging, prod) — a bug like this can lie dormant in fresh local databases (which get the correct index from scratch) while actively breaking any environment with pre-existing data.
