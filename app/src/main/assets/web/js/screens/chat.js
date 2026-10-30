// ChatList.swift ported: the conversation list, sorted by the last message, with search.
const ChatList = (() => {
  let searching = false;
  let query = "";

  function lastOf(p, id) {
    const list = Profile.chat(p, id);
    return list.length ? list[list.length - 1] : null;
  }

  function shown(p) {
    return p.friendList
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => query === "" || (f.displayName || "").toLowerCase().includes(query.toLowerCase()) || (f.name || "").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const x = lastOf(p, a.f.id)?.at ?? 0, y = lastOf(p, b.f.id)?.at ?? 0;
        return x !== y ? y - x : a.i - b.i;
      })
      .map(({ f }) => f);
  }

  function render() {
    const p = st.profile;
    $("chatSearchBox").hidden = !searching;
    $("chatSearchBtn").textContent = searching ? "x" : "magnifying-glass";
    const actions = searching ? "" : `
      <button class="caction" data-a="none"><span class="box"><span class="ic">person-play</span></span><span><div class="tt">Start party</div><div class="dd">Join experiences together</div></span><span class="ic arr">arrow-large-right</span></button>
      <button class="caction" data-a="none"><span class="box"><span class="ic">three-people</span></span><span><div class="tt">Communities</div><div class="dd">Create and explore communities</div></span><span class="ic arr">arrow-large-right</span></button>`;
    const empty = p.friendList.length === 0 ? `
      <div class="cempty">Add friends and they show up here.</div>
      <button class="cadd" data-a="none">Add Friends</button>` : "";
    const rows = shown(p).map(f => {
      const last = lastOf(p, f.id);
      return `<button class="crow" data-a="openchat" data-id="${f.id}">
        <span class="av39"></span>
        <span class="mid"><span class="nm">${escapeHtml(f.displayName || f.name)}</span><span class="last">${last ? escapeHtml(last.text) : " "}</span></span>
        ${last ? `<span class="when">${escapeHtml(Format.chatTime(last.at))}</span>` : ""}
      </button>`;
    }).join("");
    $("chatBody").innerHTML = actions + empty + rows;
  }

  function toggleSearch() {
    searching = !searching;
    query = "";
    $("chatQuery").value = "";
    render();
    if (searching) $("chatQuery").focus();
  }

  function bind() {
    $("chatQuery").addEventListener("input", e => { query = e.target.value; render(); });
  }
  function openChat(id) { ChatPage.open(id); }
  return { render, toggleSearch, bind, openChat };
})();
