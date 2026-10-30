// The screens. Data comes from the ported core (Store, Profile, Robux, Format).
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const SAVE_KEY = "salblox-core-v1";
const st = Store.createStore(loadProfile());
function loadProfile() {
  const base = Profile.newProfile();
  try { return Object.assign(base, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); } catch (e) { return base; }
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(st.profile)); } catch (e) {} }
function $(id) { return document.getElementById(id); }
const TABS = ["home", "moments", "chat", "me"];
let addFriendSource = null; // set by the data layer when Roblox is connected
function showTab(t) {
  for (const n of TABS) document.getElementById("s-" + n).hidden = n !== t;
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  if (t === "chat") ChatList.render();
}
function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2000); }

function renderMenu() {
  setBadge("mbFriends", st.profile.friendsBadge);
  setBadge("mbMessages", st.profile.messages);
  $("mName").textContent = Profile.shownName(st.profile);
  $("mUser").textContent = "@" + Profile.shownUsername(st.profile);
  $("mRobux").textContent = Format.grouped(st.profile.robux);
  $("rBal").textContent = Format.grouped(st.profile.robux);
}
function setBadge(id, n) { const el = $(id); el.hidden = !(n > 0); el.textContent = n > 99 ? "99+" : String(n || ""); }
function openMenu() { renderMenu(); $("menu").classList.add("open"); $("dim").hidden = false; }
function closeMenu() { $("menu").classList.remove("open"); $("dim").hidden = true; }

// Edit profile: values are written to the profile as they change, like the app's bindings
function fillEdit() {
  const p = st.profile;
  $("f-user").value = p.username;
  $("f-name").value = p.displayName;
  $("f-robux").value = p.robux === 0 ? "" : String(p.robux);
  $("f-friends").value = p.friends === 0 ? "" : String(p.friends);
  $("f-followers").value = p.followers === 0 ? "" : String(p.followers);
  $("f-following").value = p.following === 0 ? "" : String(p.following);
  $("f-bio").value = p.bio;
  paintVerified();
  document.querySelectorAll("#badgeSeg button").forEach(b => b.classList.toggle("on", b.dataset.b === p.badge));
}
function bindEdit() {
  const p = () => st.profile;
  $("f-user").addEventListener("input", e => { const v = Format.cleanUsername(e.target.value); e.target.value = v; p().username = v; save(); });
  $("f-name").addEventListener("input", e => { p().displayName = e.target.value.slice(0, 20); save(); });
  $("f-robux").addEventListener("input", e => { const n = Format.number(e.target.value); p().robux = n; e.target.value = n === 0 ? "" : String(n); save(); renderMenu(); });
  $("f-friends").addEventListener("input", e => { const n = Format.number(e.target.value); p().friends = n; e.target.value = n === 0 ? "" : String(n); save(); });
  $("f-followers").addEventListener("input", e => { const n = Format.number(e.target.value); p().followers = n; e.target.value = n === 0 ? "" : String(n); save(); });
  $("f-following").addEventListener("input", e => { const n = Format.number(e.target.value); p().following = n; e.target.value = n === 0 ? "" : String(n); save(); });
  $("f-bio").addEventListener("input", e => { p().bio = e.target.value.slice(0, 1000); e.target.value = p().bio; save(); });
  $("f-ver").addEventListener("click", () => { p().verified = !p().verified; save(); paintVerified(); });
}
function paintVerified() {
  const on = st.profile.verified;
  const box = $("verBox");
  box.className = "vbox " + (on ? "on" : "off");
  box.innerHTML = on ? '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 L5.8 10.5 L11.5 3.8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "";
  $("f-ver").setAttribute("aria-pressed", String(on));
}
function tidyNames() {
  const p = st.profile;
  if (p.username === "") p.username = "Player";
  if (p.displayName.trim() === "") p.displayName = p.username;
  save();
}
function openEdit() { fillEdit(); $("s-edit").hidden = false; }
function closeEdit() { tidyNames(); $("s-edit").hidden = true; renderMenu(); }

function openRobux() { renderMenu(); RobuxPage.open(); }
function closeRobux() { RobuxPage.close(); renderMenu(); }

document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const a = el.dataset.a;
  if (a === "menu") openMenu();
  else if (a === "closemenu") closeMenu();
  else if (a === "edit") { closeMenu(); openEdit(); }
  else if (a === "moments") { closeMenu(); showTab("moments"); }
  else if (a === "closeedit") closeEdit();
  else if (a === "robux") { closeMenu(); openRobux(); }
  else if (a === "closerobux") closeRobux();
  else if (a === "badge") {
    st.profile.badge = el.dataset.b; save();
    document.querySelectorAll("#badgeSeg button").forEach(b => b.classList.toggle("on", b === el));
  }
  else if (a === "toast") toast(el.dataset.m);
  else if (a === "htab") Home.setTab(el.dataset.t);
  else if (a === "chatsearch") ChatList.toggleSearch();
  else if (a === "closefriends") Friends.close();
  else if (a === "openchat") ChatPage.open(Number(el.dataset.id));
  else if (a === "closechat") ChatPage.close();
  else if (a === "cpswitch") ChatPage.toggleSide();
  else if (a === "cpsend") ChatPage.send();
  else if (a === "cpdelete") ChatPage.remove(Number(el.dataset.id));
  else if (a === "friends") { closeMenu(); Friends.open(); }
  else if (a === "addfriend") Friends.add();
  else if (a === "openfriend") Friends.openFriend(Number(el.dataset.id));
  else if (a === "fchat") Friends.chat();
  else if (a === "ftrust") Friends.toggleTrust();
  else if (a === "fmore") Friends.moreMenu();
  else if (a === "tab") showTab(el.dataset.t);
  else if (a === "sendrobux") toast("Sending Robux is not converted yet");
  else if (a === "dlgcancel") RobuxPage.answer(false);
  else if (a === "dlgok") RobuxPage.answer(true);
  else if (a === "faq" || a === "plan" || a === "buypack") RobuxPage.onClick(a, el);
});
bindEdit();
ChatList.bind();
ChatPage.bind();
renderMenu();
Home.render();
// Games come from the avatar server (/home), which runs Roblox.home() on the server side.
// Put your server's address here (https, public). Empty means no server is connected yet.
const SERVER_URL = "";
async function homeSource() {
  if (!SERVER_URL) throw new Error("No server connected yet.");
  let r;
  try { r = await fetch(SERVER_URL + "/home"); }
  catch (e) { throw new Error("Couldn't reach the server."); }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || "Roblox didn't answer.");
  return body;
}
// No-server path (Android app): the app's Java side makes the Roblox requests, see MainActivity.java.
// Same calls and same parsing as Roblox.home() in the Swift app.
async function httpGet(url) {
  if (window.SalBloxNative) {
    const body = window.SalBloxNative.get(url);
    if (body === null || body === undefined || body === "") throw new Error("Roblox didn't answer.");
    return body;
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error("Roblox didn't answer.");
  return await r.text();
}
async function homeSourceNative() {
  const sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
  const sorts = Parse.sorts(await httpGet("https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=" + encodeURIComponent(sid)));
  const ids = [...new Set(sorts.flatMap(s => s.games.slice(0, 12).map(g => g.id)))];
  const wide = {};
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const q = new URLSearchParams({ universeIds: chunk.join(","), countPerUniverse: "1", size: "768x432", format: "Png" });
    Object.assign(wide, Parse.wideThumbs(await httpGet("https://thumbnails.roblox.com/v1/games/multiget/thumbnails?" + q.toString())));
  }
  return sorts.map(s => ({ title: s.title, games: s.games.slice(0, 12).map(g => ({ ...g, wide: wide[g.id] ?? null })) }));
}
function pickHomeSource() {
  if (window.SalBloxNative) return homeSourceNative;
  return homeSource;
}
Home.load(pickHomeSource());
