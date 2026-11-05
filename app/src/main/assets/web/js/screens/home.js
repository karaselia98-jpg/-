// HomeView.swift ported. Data comes from Roblox.home() in the app; that call is not ported yet,
// so the home screen asks the data source and shows the app's own failure state until it is connected.
const Home = (() => {
  let tab = "forYou";
  let rows = [];           // [{ title, games: [Game] }] — same shape Roblox.home() returns
  let failure = null;
  let loading = false;

  function wideCard(g, width) {
    const stat = g.rating === null || g.rating === undefined
      ? `<span class="ic">two-people</span>${Format.short(g.playing)} Playing`
      : `<span class="ic">thumb-up</span>${g.rating}% Rating`;
    return `<div class="wcard" style="${width ? "width:" + width + "px" : ""}">
      <div class="wimg">${g.wide ? `<img src="${g.wide}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : ""}</div>
      <div class="wt">${escapeHtml(g.name)}</div>
      <div class="wsub">${stat}</div>
    </div>`;
  }

  function section(title, body, chevron = false) {
    return `<div><div class="hsec"><b>${escapeHtml(title)}</b>${chevron ? '<span class="ic" style="font-size:20px">chevron-large-right</span>' : ""}</div>${body}</div>`;
  }

  function status() {
    if (rows.length === 0 && loading) return `<div class="hstatus">Loading…</div>`;
    if (rows.length === 0 && failure) return `<div class="hstatus">${escapeHtml(failure)}</div>`;
    return "";
  }

  function forYou() {
    const profile = st.profile;
    const top = rows.find(r => r.title === "Top Playing Now") || rows[0];
    const recommended = top ? top.games.slice(0, 4) : [];
    const revisited = rows.find(r => r.title === "Top Revisited");
    const cont = profile.games.length ? profile.games : (revisited ? revisited.games.slice(0, 8) : []);
    const friends = `<div class="fr">
      <button data-a="friends"><div class="circ"><span class="ic">person-plus</span></div><div class="fl" style="margin-top:8.5px">Add Friends</div><div class="fs"> </div></button>
      ${profile.friendList.map(f => `<button data-a="none"><div class="circ">${f.online ? '<span class="on-dot"><i></i></span>' : ""}</div><div class="fl">${escapeHtml(f.displayName || f.name)}</div><div class="fs">${escapeHtml(f.status || " ")}</div></button>`).join("")}
    </div>`;
    return `
      <div class="hname"><span class="hface"></span><span>${escapeHtml(Profile.shownName(profile))}</span></div>
      ${friends}
      ${section("Recommended For You", `<div class="hgrid">${recommended.map(g => wideCard(g)).join("")}</div>`)}
      ${status()}
      ${cont.length ? section("Continue", `<div class="hrow">${cont.map(g => wideCard(g, 194)).join("")}</div>`, true) : ""}`;
  }

  function charts() {
    return rows.map(r => section(r.title, `<div class="hrow">${r.games.map(g => wideCard(g, 194)).join("")}</div>`)).join("") + status();
  }

  function render() {
    const slot = document.querySelector("#s-home .wordmark-slot");
    if (slot && !document.getElementById("homeWordmarkImg")) slot.innerHTML = '<img id="homeWordmarkImg" alt="Roblox" style="width:auto;height:19.2px;max-width:none;object-fit:contain;object-position:left center;display:block">';
    const logo = document.getElementById("homeWordmarkImg");
    if (logo && !logo.dataset.loaded) { logo.dataset.loaded = "1"; logo.src = "data:image/png;base64,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"; }
    $("homeBody").innerHTML = tab === "charts" ? charts() : forYou();
    document.querySelectorAll(".htabs button").forEach(b => b.classList.toggle("on", b.dataset.t === tab));
    const n = st.profile.notifications || 0;
    const bell = $("bellCnt"); bell.hidden = n === 0; bell.textContent = String(n);
  }

  // Loads the sections. The source is provided by the data layer; with none, the app's failure state is shown.
  async function load(source) {
    if (loading) return;
    loading = true; render();
    try {
      const got = source ? await source() : [];
      if (got && got.length) { rows = got; failure = null; }
      else failure = "Roblox sent nothing to show.";
    } catch (e) {
      failure = String(e && e.message || e);
    } finally {
      loading = false; render();
    }
  }

  function setTab(t) { tab = t; render(); }
  return { render, load, setTab };
})();
