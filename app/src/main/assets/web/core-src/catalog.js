// Port of Packages/SalBloxKit/Sources/SalBloxKit/Catalog.swift
export const BACKGROUND_KIND = 92;

export function makeItem({ id, bundle = false, name, creator = "Roblox", price = null, thumb = null, wearing = false,
  creatorVerified = null, limited = null, copied = null, kind = null }) {
  return { id, bundle, name, creator, price, thumb, wearing, creatorVerified, limited, copied, kind };
}

export const isBackground = item => item.kind === BACKGROUND_KIND;
export const same = (a, b) => a.id === b.id && a.bundle === b.bundle;
export const key = item => (item.bundle ? "b" : "") + String(item.id);
export const showsCreatorCheck = item => item.creatorVerified ?? (item.creator === "Roblox");

export function shelfOf(item) {
  if (item.bundle) return "Avatars";
  const k = item.kind ?? 0;
  if ([17, 18, 41, 76, 77, 78, 79, 27, 28, 29, 30, 31].includes(k) || (k >= 27 && k <= 31)) return "Body";
  if (k === 2 || k === 11 || k === 12 || (k >= 64 && k <= 72)) return "Clothing";
  if (k === BACKGROUND_KIND) return "Backgrounds";
  if ((k >= 48 && k <= 56) || k === 61) return "Animations";
  return "Accessories";
}

// same slot list and kinds as Catalog.swift (Slot.all)
export const SLOTS = [
  { name: "Full Body", shelf: "Body", kinds: [27, 28, 29, 30, 31], taxonomy: "kfHzJwaNYM8s2CWRqYUhRa" },
  { name: "Hair", shelf: "Body", kinds: [41], taxonomy: "d6a7M7r9MMrpf7z7VxW9ZS" },
  { name: "Head", shelf: "Body", kinds: [17, 79, 18, 76, 77, 78], taxonomy: "s5NLP7BS9PRLKvUVca4XKg" },
  { name: "Build", shelf: "Body", kinds: [], taxonomy: "" },
  { name: "Skin", shelf: "Body", kinds: [], taxonomy: "" },
  { name: "Top", shelf: "Clothing", kinds: [64, 65], taxonomy: "pJ71PxerdfEuarTNRtSZYs" },
  { name: "Outerwear", shelf: "Clothing", kinds: [67, 68], taxonomy: "kPZpEVNdProGcqMbj1jDKJ" },
  { name: "Bottom", shelf: "Clothing", kinds: [66, 69, 72], taxonomy: "1MvRtnnsy2FJWmkErSBxBa" },
  { name: "Shoes", shelf: "Clothing", kinds: [70, 71], taxonomy: "uLRgNoJ1awZkhpVw9WyvKo" },
  { name: "Shirt Classic", shelf: "Clothing", kinds: [11], taxonomy: "2a2rf9qyeTd8W5iegK2Prc" },
  { name: "Pants Classic", shelf: "Clothing", kinds: [12], taxonomy: "49cFNAJWuwiJJVUSADG6DR" },
  { name: "T-Shirt Classic", shelf: "Clothing", kinds: [2], taxonomy: "43H35nJKHzCQM63q3wPaJG" },
  { name: "Head", shelf: "Accessories", kinds: [8], taxonomy: "thukPQUFe5EHxRrtsgq43u" },
  { name: "Face", shelf: "Accessories", kinds: [42], taxonomy: "b5rkQhGSfwhfTK177y6ERa" },
  { name: "Neck", shelf: "Accessories", kinds: [43], taxonomy: "tvckLAbtDAGwF9Y2sph2Ce" },
  { name: "Back", shelf: "Accessories", kinds: [46], taxonomy: "7yGywzp5JeDsNjhXWJqSw3" },
  { name: "Waist", shelf: "Accessories", kinds: [47], taxonomy: "6jYQPDtkVwQZcKtvVpyYAN" },
  { name: "Shoulder", shelf: "Accessories", kinds: [44], taxonomy: "8i1sggNTrxoN799hpRrR1S" },
  { name: "Front", shelf: "Accessories", kinds: [45], taxonomy: "kj535RzJxHTCnXPBLo5KaE" },
  { name: "Gear", shelf: "Accessories", kinds: [19], taxonomy: "gUtxkR951g3VPgRkb5ay8u" },
  { name: "Other", shelf: "Accessories", kinds: [], taxonomy: "wNYJso48d1XnhMyFWT3oX3" },
  { name: "Emotes", shelf: "Animations", kinds: [61], taxonomy: "ioNxAT977DFP2hMnAJbsbF" },
  { name: "Animations", shelf: "Animations", kinds: [48, 49, 50, 51, 52, 53, 54, 55, 56], taxonomy: "whf6kUVBwk2xdwKUmRYN6G" },
];

export function slotHolds(slot, item) {
  if (item.bundle) return false;
  if (item.kind === null || item.kind === undefined) return slot.shelf === "Accessories" && slot.name === "Other";
  return slot.kinds.includes(item.kind);
}
