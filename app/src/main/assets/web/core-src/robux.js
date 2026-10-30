// Port of Packages/SalBloxKit/Sources/SalBloxKit/Robux.swift
export const PACKS = [[40, "$0.49"], [80, "$0.99"], [320, "$3.99"], [400, "$4.99"], [800, "$9.99"], [1200, "$14.99"],
  [1700, "$19.99"], [3150, "$34.99"], [4500, "$49.99"], [10000, "$99.99"], [22500, "$199.99"]];

export function robuxPacksFor(shortfall) {
  if (!(shortfall > 0)) return [];
  const i = PACKS.findIndex(p => p[0] >= shortfall);
  if (i < 0) return [];
  const out = [{ robux: PACKS[i][0], price: PACKS[i][1], better: false }];
  if (i + 1 < PACKS.length) out.push({ robux: PACKS[i + 1][0], price: PACKS[i + 1][1], better: true });
  return out;
}

export const Ledger = {
  incoming: ["Sales of Goods", "Premium Stipends", "Premium Payouts", "Group Payouts", "Currency Purchases"],
  outgoing: ["Purchases"],
  pending: "Pending Robux",
  periods: ["Past Day", "Past Week", "Past Month", "Past Year"],
  amount(monthly, period) {
    switch (period) {
      case "Past Day": return Math.trunc(monthly / 30);
      case "Past Week": return Math.trunc((monthly * 7) / 30);
      case "Past Year": return monthly * 12;
      default: return monthly;
    }
  }
};
