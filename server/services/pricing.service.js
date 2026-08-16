// Pure, framework-agnostic price computation for a customized menu item — no Express
// req/res, no DB calls, no throwing. Reused unchanged by the cart and checkout to
// re-validate a customer's selections and total server-side rather than trusting
// whatever price the client sends.
//
// optionGroups: OptionGroup documents/lean-objects — [{ _id, title,
//   type: 'single_choice' | 'addons', required, minSelect, maxSelect,
//   options: [{ _id, name, priceDeltaMinor, maxQty }] }]
// selections: [{ groupId, optionId, qty? }] — `qty` only matters for 'addons' groups;
//   a single_choice selection is always treated as qty 1 regardless of what's sent.
//
// Returns { valid: true, errors: [], totalPriceMinor } or
//         { valid: false, errors: [...], totalPriceMinor: null } — callers decide
// whether/how to turn `errors` into an HTTP response (e.g. 400 VALIDATION_ERROR).
export const computeItemPrice = (basePriceMinor, optionGroups = [], selections = []) => {
  let totalPriceMinor = basePriceMinor;
  const errors = [];

  for (const group of optionGroups) {
    const groupSelections = selections.filter((s) => String(s.groupId) === String(group._id));
    const distinctCount = groupSelections.length;

    // single_choice: implicitly "exactly 1 if required, 0 or 1 otherwise" — minSelect/
    // maxSelect on the group are only meaningful for 'addons' groups (see the model).
    const min = group.type === 'single_choice' ? (group.required ? 1 : 0) : (group.minSelect ?? 0);
    const max = group.type === 'single_choice' ? 1 : group.maxSelect; // null = unlimited

    if (distinctCount < min) {
      errors.push(`"${group.title}" requires at least ${min} selection(s)`);
    }
    if (max != null && distinctCount > max) {
      errors.push(`"${group.title}" allows at most ${max} selection(s)`);
    }

    for (const selection of groupSelections) {
      const option = group.options.find((o) => String(o._id) === String(selection.optionId));
      if (!option) {
        errors.push(`Unknown option in "${group.title}"`);
        continue;
      }

      const maxQty = option.maxQty ?? 1;
      const qty = group.type === 'addons' ? (selection.qty ?? 1) : 1;
      if (qty < 1 || qty > maxQty) {
        errors.push(`"${option.name}" quantity must be between 1 and ${maxQty}`);
        continue;
      }

      totalPriceMinor += option.priceDeltaMinor * qty;
    }
  }

  return errors.length > 0
    ? { valid: false, errors, totalPriceMinor: null }
    : { valid: true, errors: [], totalPriceMinor };
};
