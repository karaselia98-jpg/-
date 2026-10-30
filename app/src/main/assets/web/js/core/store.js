const Store = (() => {
// Port of the state rules in App/Data/Store.swift: wearing with undo/redo, trying on, outfits.
// Drawing, networking and file storage are not here yet (they need the Roblox layer).
const Pr = Profile;
const { key: keyOf } = Catalog;

function createStore(profile = Pr.newProfile(), storage = null) {
  return { profile, undone: [], redone: [], trial: null, storage };
}

const wornKeys = st => Pr.wearing(st.profile).map(keyOf);

function setWorn(st, keys) {
  for (const i of st.profile.items) i.wearing = keys.includes(keyOf(i));
}

// Store.wear: records the previous look for undo; a change clears the redo history
function wear(st, item, on = true) {
  const before = wornKeys(st);
  Pr.wear(st.profile, item, on);
  if (wornKeys(st).join() !== before.join()) {
    st.undone.push(before);
    st.redone = [];
    return true;
  }
  return false;
}

function undo(st) {
  if (st.undone.length === 0) return false;
  const keys = st.undone.pop();
  st.redone.push(wornKeys(st));
  setWorn(st, keys);
  return true;
}

function redo(st) {
  if (st.redone.length === 0) return false;
  const keys = st.redone.pop();
  st.undone.push(wornKeys(st));
  setWorn(st, keys);
  return true;
}

function setBody(st, definition) {
  if (definition === st.profile.definition) return false;
  st.profile.definition = definition;
  return true;
}

// Store.tryOn / keepTrial: the shown look includes the item being tried on
function shownProfile(st) {
  if (!st.trial) return st.profile;
  const p = JSON.parse(JSON.stringify(st.profile));
  Pr.wear(p, st.trial);
  return p;
}
function tryOn(st, item) {
  if ((st.trial && keyOf(st.trial)) === (item && keyOf(item))) return;
  st.trial = item || null;
}
function keepTrial(st) {
  if (!st.trial) return;
  Pr.wear(st.profile, st.trial);
  st.trial = null;
}

function saveOutfit(st, name) {
  const n = name.trim();
  const id = Pr.newId(st.profile);
  const outfitObj = { id, name: n === "" ? `Avatar ${st.profile.outfits.length + 1}` : n, keys: wornKeys(st) };
  st.profile.outfits.push(outfitObj);
  return outfitObj;
}

function deleteOutfit(st, id) {
  st.profile.outfits = st.profile.outfits.filter(o => o.id !== id);
}

return { createStore, wear, undo, redo, setBody, shownProfile, tryOn, keepTrial, saveOutfit, deleteOutfit };
})();
