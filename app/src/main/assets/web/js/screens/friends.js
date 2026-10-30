// FriendsListView.swift and FriendSheet.swift ported. Adding by username needs the Roblox data layer,
// so that action reports it instead of inventing a result.
const Friends = (() => {
  let openId = null;
  let trusted = false;

  function render() {
    const p = st.profile;
    const listed = p.friendList.length;
    const more = p.friends - listed;
    $("fCount").textContent = `Friends (${Format.grouped(Math.max(p.friends, listed))})`;
    $("fList").innerHTML = p.friendList.map(f => {
      const status = f.status && f.status !== "" ? f.status : (f.online ? "Online" : "Offline");
      const live = f.online && f.status && f.status !== "";
      return `<button class="frow" data-a="openfriend" data-id="${f.id}">
        <span class="av48">${f.online ? '<span class="online-dot"><i></i></span>' : ""}</span>
        <span class="mid"><span class="nm">${escapeHtml(f.displayName || f.name)}</span><span class="st ${live ? "live" : ""}">${escapeHtml(status)}</span></span>
        <span class="ic">chevron-large-right</span>
      </button>`;
    }).join("");
    $("fMore").textContent = more > 0 ? `and ${Format.grouped(more)} more` : "";
    $("fMore").hidden = !(more > 0);
  }

  function open() { $("s-friends").hidden = false; render(); }
  function close() { $("s-friends").hidden = true; }

  function openFriend(id) {
    openId = id;
    trusted = false;
    const f = st.profile.friendList.find(x => x.id === id);
    if (!f) return;
    $("fDisplay").textContent = f.displayName || f.name;
    $("fUser").textContent = "@" + f.name;
    $("fSheetNote").textContent = "";
    $("fTrustBtn").textContent = "Add trusted friend";
    $("s-friend").hidden = false;
  }
  function closeFriend() { $("s-friend").hidden = true; openId = null; }

  async function add() {
    const who = $("addName").value.trim();
    if (!who) return;
    const note = $("addNote");
    if (typeof addFriendSource !== "function") {
      note.textContent = "Adding friends needs the Roblox connection.";
      return;
    }
    note.textContent = "";
    try {
      const added = await addFriendSource(who);
      note.textContent = added ? `Added ${who}.` : `${who} is already in your friends.`;
      $("addName").value = "";
      render();
    } catch (e) { note.textContent = e.message || String(e); }
  }

  function chat() { closeFriend(); close(); showTab("chat"); ChatList.openChat(openId); }
  function unfriend() {
    if (openId === null) return;
    Profile.removeFriend(st.profile, openId); save();
    closeFriend(); render();
  }
  function moreMenu() {
    if (openId === null) return;
    const isFriend = st.profile.friendList.some(f => f.id === openId);
    if (isFriend) unfriend();
    else $("fSheetNote").textContent = "Adding a friend by id needs the Roblox connection.";
  }
  function toggleTrust() {
    trusted = !trusted;
    $("fTrustBtn").textContent = trusted ? "Trusted friend" : "Add trusted friend";
  }

  return { render, open, close, openFriend, closeFriend, add, chat, moreMenu, toggleTrust };
})();
