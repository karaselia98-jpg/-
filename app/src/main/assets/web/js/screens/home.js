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
    const homeScreen = document.getElementById("s-home");
    if (homeScreen && !document.getElementById("homeWordmarkImg")) homeScreen.insertAdjacentHTML("afterbegin", '<div class="home-wordmark-bar"><img id="homeWordmarkImg" alt="Roblox"></div>');
    const logo = document.getElementById("homeWordmarkImg");
    if (logo && !logo.src.startsWith("data:")) fetch("wordmark.png.b64").then(r => r.text()).then(b64 => { logo.src = "data:image/png;base64," + b64.trim(); }).catch(() => {});
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
