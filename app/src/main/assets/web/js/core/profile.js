const Profile = (() => {
// Port of Packages/SalBloxKit/Sources/SalBloxKit/Profile.swift (the model and its rules)
const { same, isBackground, makeItem } = Catalog;

function newProfile() {
  return {
    username: "Player1", displayName: "Player1", robux: 0, friends: 0, followers: 0, following: 0, bio: "",
    verified: false, badge: "none", crop: { scale: 2.4, x: 0, y: 0.72 }, items: [], games: [], experiences: [],
    friendList: [], requests: 0, notifications: 0, messages: 0, friendsBadge: 0, ledger: {}, trades: [], notices: [],
    outfits: [], chats: {}, definition: null, drawn: null, idCounter: 0, picturesAt: null,
  };
}

function clampCrop(c) {
  const s = Math.min(Math.max(c.scale, 0.8), 8), reach = s / 2;
  return { scale: s, x: Math.min(Math.max(c.x, -reach), reach), y: Math.min(Math.max(c.y, -reach), reach) };
}

const wearing = p => p.items.filter(i => i.wearing);
const backdrop = p => p.items.find(i => i.wearing && isBackground(i)) || null;
const owns = (p, item) => p.items.find(i => same(i, item)) || null;

function shownName(p) {
  const d = p.displayName.trim();
  return d === "" ? (p.username === "" ? "Player" : p.username) : d;
}
const shownUsername = p => (p.username === "" ? "Player" : p.username);

// Profile.wear: one background at a time; the same item is added once and toggled
function wear(p, item, on = true) {
  if (on && isBackground(item)) {
    for (const i of p.items) if (isBackground(i) && !same(i, item)) i.wearing = false;
  }
  const i = p.items.findIndex(x => same(x, item));
  if (i >= 0) {
    p.items[i].wearing = on;
    if (p.items[i].kind === null) p.items[i].kind = item.kind;
  } else {
    p.items.push({ ...item, wearing: on });
  }
}

function adopt(p, copiedItems) {
  p.items = p.items.filter(old => !(old.copied === true && !copiedItems.some(c => same(c, old))));
  for (const i of p.items) i.wearing = false;
  for (const item of copiedItems) {
    if (!owns(p, item)) p.items.push({ ...item, copied: true });
    wear(p, item);
  }
}

function newId(p) {
  const used = [...p.trades.map(t => t.id), ...p.notices.map(n => n.id), ...p.outfits.map(o => o.id)];
  p.idCounter = Math.max(p.idCounter, used.length ? Math.max(...used) : 0) + 1;
  return p.idCounter;
}

function removeFriend(p, id) {
  p.friendList = p.friendList.filter(f => f.id !== id);
  delete p.chats[String(id)];
  for (const n of p.notices) if (n.friend === id) n.friend = null;
}

function say(p, text, friend, mine, at = Date.now() / 1000) {
  const t = text.trim();
  if (t === "") return;
  (p.chats[String(friend)] = p.chats[String(friend)] || []).push({ mine, text: t, id: newId(p), at });
}

const chat = (p, friend) => p.chats[String(friend)] || [];

// Profile.buy: returns "bought" | "alreadyOwned" | "offSale" | "tooExpensive"
function buy(p, item) {
  if (owns(p, item)) return "alreadyOwned";
  if (item.price === null || item.price === undefined) return "offSale";
  if (item.price > p.robux) return "tooExpensive";
  p.robux -= item.price;
  if (item.price > 0) p.ledger["Purchases"] = (p.ledger["Purchases"] || 0) + item.price;
  wear(p, item, false);
  return "bought";
}

// Profile.topUp: adds Robux and records it in the ledger
function topUp(p, amount) {
  if (!(amount > 0)) return;
  p.robux += amount;
  p.ledger["Currency Purchases"] = (p.ledger["Currency Purchases"] || 0) + amount;
}


return { newProfile, clampCrop, wearing, backdrop, owns, shownName, shownUsername, wear, adopt, newId, removeFriend, say, chat, buy, topUp, makeItem };
})();
