export function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Zero-padded on both sides (e.g. "00:42"), unlike formatDuration — used for
// the Home screen's duty-time clock, which grows past 99 minutes on a long shift.
export function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ₹ with Indian comma grouping (₹2,140.00, ₹8,760.00) — the Earnings
// screens' weekly/monthly totals are large enough that plain toFixed(2)
// reads wrong.
export function formatCurrency(amount) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
