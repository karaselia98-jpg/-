// ChatPage.swift ported: one conversation. Lines are stored per friend in the profile.
const ChatPage = (() => {
  let friendId = null;
  let asThem = false;

  function friend() { return st.profile.friendList.find(f => f.id === friendId) || null; }

  function render() {
    const lines = Profile.chat(st.profile, friendId);
    const f = friend();
    $("cpTitle").textContent = f ? (f.displayName || f.name) : "Chat";
    $("cpLines").innerHTML = lines.map(l => `
      <div class="cline ${l.mine ? "mine" : ""}" data-id="${l.id}">
        ${l.mine ? "" : '<span class="cav28"></span>'}
        <span class="bubble ${l.mine ? "mine" : "theirs"}">${escapeHtml(l.text)}</span>
      </div>`).join("");
    const btn = $("cpSwitch");
    btn.classList.toggle("on", asThem);
    btn.innerHTML = `<span class="ic">${asThem ? "person" : "two-arrows-switch-right"}</span>`;
    $("cpField").placeholder = asThem ? "Their message" : "Say something";
    $("cpSend").disabled = $("cpField").value.trim() === "";
    const body = $("cpBody"); body.scrollTop = body.scrollHeight;
  }

  function open(id) {
    friendId = id;
    asThem = false;
    $("cpField").value = "";
    $("s-chatpage").hidden = false;
    render();
  }
  function close() { $("s-chatpage").hidden = true; }

  function toggleSide() { asThem = !asThem; render(); }

  function send() {
    const text = $("cpField").value.trim();
    if (!text || friendId === null) return;
    Profile.say(st.profile, text, friendId, !asThem);
    save();
    $("cpField").value = "";
    render();
  }

  function remove(lineId) {
    const list = st.profile.chats[String(friendId)];
    if (!list) return;
    st.profile.chats[String(friendId)] = list.filter(l => l.id !== lineId);
    save(); render();
  }

  function bind() {
    // long-press a line (contextmenu) = the app's "Delete" menu item
    $("cpLines").addEventListener("contextmenu", e => {
      const line = e.target.closest(".cline");
      if (!line) return;
      e.preventDefault();
      if (window.confirm("Delete this message?")) remove(Number(line.dataset.id));
    });
    $("cpField").addEventListener("input", () => { $("cpSend").disabled = $("cpField").value.trim() === ""; });
    $("cpField").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } });
  }

  return { open, close, render, toggleSide, send, remove, bind };
})();
