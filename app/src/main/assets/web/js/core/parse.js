const Parse = (() => {
// Port of Packages/SalBloxKit/Sources/SalBloxKit/Parse*.swift (the parts the app's tests cover)
const { makeItem } = Catalog;
const { Game } = Games;

// Swift's JSONDecoder: returns null when the JSON is bad or a required field is missing
function json(data) {
  try { return typeof data === "string" ? JSON.parse(data) : JSON.parse(new TextDecoder().decode(data)); }
  catch (e) { return null; }
}
const isNum = v => typeof v === "number" && Number.isFinite(v);
const isStr = v => typeof v === "string";
const opt = (v, ok) => v === undefined || v === null || ok(v);

// decodes every entry or none, like Codable does for an array
function every(list, check, map) {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const x of list) {
    if (!check(x)) return null;
    out.push(map(x));
  }
  return out;
}

function rating(up, down) {
  return up + down === 0 ? null : Math.round((up * 100) / (up + down));
}

function user(data) {
  const r = json(data);
  if (!r || !Array.isArray(r.data) || r.data.length === 0) return null;
  const u = r.data[0];
  if (!isNum(u.id) || !isStr(u.name) || !isStr(u.displayName)) return null;
  return { id: u.id, name: u.name, displayName: u.displayName, verified: u.hasVerifiedBadge ?? false };
}

function person(data) {
  const r = json(data);
  if (!r || !isNum(r.id) || !isStr(r.name)) return null;
  return { id: r.id, name: r.name, displayName: r.displayName ?? r.name, bio: r.description ?? "", verified: r.hasVerifiedBadge ?? false };
}

function users(data) {
  const r = json(data);
  return every(r && r.data, u => isNum(u.id) && isStr(u.name) && opt(u.displayName, isStr),
    u => ({ id: u.id, name: u.name, displayName: u.displayName ?? u.name, verified: u.hasVerifiedBadge ?? false })) ?? [];
}

function friendIds(data) {
  const r = json(data);
  return every(r && r.data, f => isNum(f.id), f => f.id) ?? [];
}

function communities(data) {
  const r = json(data);
  const rows = every(r && r.data, e => e.group && isNum(e.group.id) && isStr(e.group.name),
    e => ({ group: e.group, role: e.role })) ?? [];
  return rows.filter(e => !e.group.name.startsWith("[ Content Deleted"))
    .map(e => ({ id: e.group.id, name: e.group.name, members: e.group.memberCount ?? 0,
      verified: e.group.hasVerifiedBadge ?? false, role: e.role && e.role.name ? e.role.name : "" }));
}

function badges(data) {
  const r = json(data);
  return every(r && r.badges, b => isNum(b.id) && isStr(b.name), b => ({ id: b.id, name: b.name, icon: b.icon ?? null })) ?? [];
}

function count(data) {
  const r = json(data);
  return r && isNum(r.count) ? r.count : null;
}

function favorites(data) {
  const r = json(data);
  return every(r && r.data, g => isNum(g.id) && isStr(g.name), g => Game(g.id, g.name, 0)) ?? [];
}

// { targetId: imageUrl } for completed entries only
function images(data) {
  const r = json(data);
  const rows = every(r && r.data, t => isNum(t.targetId) && isStr(t.state), t => t);
  if (!rows) return {};
  const out = {};
  for (const t of rows) if (t.state === "Completed") out[t.targetId] = t.imageUrl ?? null;
  return out;
}

function pending(data) {
  return new TextDecoder().decode(data).includes('"Pending"');
}

function wearing(data) {
  const r = json(data);
  return r && Array.isArray(r.assetIds) && r.assetIds.every(isNum) ? r.assetIds : [];
}

function worn(data) {
  const r = json(data);
  const rows = every(r && r.assets, a => isNum(a.id) && opt(a.name, isStr), a => a);
  if (!rows) return [];
  return rows.map(a => makeItem({ id: a.id, name: a.name ?? "Item", creator: "", price: null, wearing: true,
    kind: a.assetType && isNum(a.assetType.id) ? a.assetType.id : null }));
}

function asset(data) {
  const r = json(data);
  if (!r || !isNum(r.AssetId) || !isStr(r.Name)) return null;
  const limited = (r.IsLimited ?? false) || (r.IsLimitedUnique ?? false);
  const resale = limited && r.CollectiblesItemDetails ? r.CollectiblesItemDetails.CollectibleLowestResalePrice ?? null : null;
  return makeItem({ id: r.AssetId, name: r.Name, creator: r.Creator && r.Creator.Name ? r.Creator.Name : "Roblox",
    price: resale ?? r.PriceInRobux ?? null, limited: limited ? true : null, kind: r.AssetTypeId ?? null });
}

const COLLECTIBLE = ["Collectible", "Limited", "LimitedUnique"];
function catalog(data) {
  const r = json(data);
  const rows = every(r && r.data, i => isNum(i.id) && isStr(i.itemType) && isStr(i.name), i => i);
  if (!rows) return [];
  return rows.map(i => {
    const restrictions = i.itemRestrictions ?? [];
    const collectible = restrictions.some(x => COLLECTIBLE.includes(x));
    const soldOut = collectible && (i.unitsAvailableForConsumption ?? 0) === 0 && (i.lowestResalePrice ?? 0) > 0;
    return makeItem({ id: i.id, bundle: i.itemType === "Bundle", name: i.name, creator: i.creatorName ?? "Roblox",
      price: soldOut ? i.lowestResalePrice : (i.price ?? i.lowestPrice ?? null),
      creatorVerified: i.creatorHasVerifiedBadge ?? null, limited: collectible ? true : null, kind: i.assetType ?? null });
  });
}

function catalogCursor(data) {
  const r = json(data);
  const c = r ? r.nextPageCursor : null;
  return isStr(c) && c !== "" ? c : null;
}

function votes(data) {
  const r = json(data);
  const rows = every(r && r.data, v => isNum(v.id), v => v);
  if (!rows) return {};
  const out = {};
  for (const v of rows) out[v.id] = rating(v.upVotes ?? 0, v.downVotes ?? 0);
  return out;
}

function playing(data) {
  const r = json(data);
  const rows = every(r && r.data, g => isNum(g.id), g => g);
  if (!rows) return {};
  const out = {};
  for (const g of rows) if (!(g.id in out)) out[g.id] = g.playing ?? 0;
  return out;
}

function games(data) {
  const r = json(data);
  const groups = r && Array.isArray(r.searchResults) ? r.searchResults : null;
  if (!groups) return [];
  const out = [];
  for (const g of groups) {
    if (g.contentGroupType !== "Game" || !Array.isArray(g.contents)) continue;
    for (const c of g.contents) {
      if (isNum(c.universeId) && isStr(c.name)) out.push(Game(c.universeId, c.name, c.playerCount ?? 0));
    }
  }
  return out;
}

function sorts(data) {
  const r = json(data);
  if (!r || !Array.isArray(r.sorts)) return [];
  const out = [];
  for (const s of r.sorts) {
    if (!Array.isArray(s.games) || s.games.length === 0) continue;
    out.push({ title: s.sortDisplayName ?? "", games: s.games.map(g => Object.assign(Game(g.universeId, g.name, g.playerCount ?? 0),
      { rating: rating(g.totalUpVotes ?? 0, g.totalDownVotes ?? 0) })) });
  }
  return out;
}

function wideThumbs(data) {
  const r = json(data);
  const rows = every(r && r.data, u => isNum(u.universeId), u => u);
  if (!rows) return {};
  const out = {};
  for (const u of rows) {
    const done = (u.thumbnails || []).find(t => t.state === "Completed");
    out[u.universeId] = done ? done.imageUrl ?? null : null;
  }
  return out;
}

function slides(data) {
  const r = json(data);
  const first = r && Array.isArray(r.data) ? r.data[0] : null;
  if (!first || !Array.isArray(first.thumbnails)) return [];
  return first.thumbnails.filter(t => t.state === "Completed" && isStr(t.imageUrl)).map(t => t.imageUrl);
}

return { rating, user, person, users, friendIds, communities, badges, count, favorites, images, pending, wearing, worn, asset, catalog, catalogCursor, votes, playing, games, sorts, wideThumbs, slides };
})();
