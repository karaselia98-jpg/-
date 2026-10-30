// RobuxPage.swift ported: packs, plans, FAQ. Buying and subscribing only change the pretend balance.
const RobuxPage = (() => {
  // same order and prices as RobuxPage.swift
  const PACKS = [[22500, "$199.99"], [10000, "$99.99"], [4500, "$49.99"], [3150, "$34.99"], [1700, "$19.99"],
    [1200, "$14.99"], [800, "$9.99"], [400, "$4.99"], [80, "$0.99"], [40, "$0.49"]];
  const PLANS = [
    { id: 0, name: "Roblox Plus", price: "$4.99", robux: 0, perks: [["tag", "Up to 20% off on items and avatars"], ["controller", "Free private servers"], ["robux", "Send Robux for free"], ["paint-brush", "Customize profile and app theme"]] },
    { id: 1, name: "Plus 500", price: "$10.99", was: "$11.24", robux: 500, perks: [["premium", "Everything in Plus"], ["robux", "+500 Robux every month"], ["pig", "$11.24 total value"]] },
    { id: 2, name: "Plus 1000", price: "$15.99", was: "$17.24", robux: 1000, perks: [["premium", "Everything in Plus"], ["robux", "+1,000 Robux every month"], ["pig", "$17.24 total value"]] },
    { id: 3, name: "Plus 2000", price: "$25.99", was: "$28.24", robux: 2000, perks: [["premium", "Everything in Plus"], ["robux", "+2,000 Robux every month"], ["pig", "$28.24 total value"]] },
  ];
  const FAQS = [
    { q: "What are Robux?", a: "Robux is the virtual currency that can be purchased using your local currency or with Roblox Gift Card credits. It allows users to customize their avatar and purchase special abilities and items in experiences." },
    { q: "Where are my Robux?", a: "Your Robux balance and transaction history can be found under My Transactions.\n\nIn the desktop and mobile app, you can find your Robux balance by logging into the account where the Robux were purchased or earned, tapping on the Robux icon at the top right of the app, and see your balance displayed at the top.\n\nOn the web browser, log in to the account where the Robux were purchased or earned and your Robux balance is shown in the upper right corner." },
    { q: "Do Robux expire?", a: "Robux do not expire. Once purchased, they will remain in the user's account until they are spent. Users can hold onto and utilize their Robux at any time." },
  ];
  const closedFaq = new Set();
  let shownPlan = 0;
  let pending = null; // { kind: "buy" | "plan", ... } while the dialog is open

  function row([robux, price]) {
    const hi = robux === 80;
    return `<div class="rrow">
      <span class="ic" style="font-size:21px">robux</span>
      <span class="rnum">${Format.grouped(robux)}</span>
      ${hi ? '<span class="foryou"><span class="ic" style="font-size:12px">circle-star</span>For you</span>' : ""}
      <span style="flex:1"></span>
      <button class="rbuy ${hi ? "hi" : ""}" data-a="buypack" data-n="${robux}" data-p="${price}">${price}</button>
    </div>`;
  }

  function planCard(p) {
    return `<div class="plan">
      <div class="phead"><span class="pname">${escapeHtml(p.name)}</span><span style="flex:1"></span>
        ${p.was ? `<span class="pwas">${escapeHtml(p.was)}</span>` : ""}<span class="pprice">${escapeHtml(p.price)}</span></div>
      <div class="perks">${p.perks.map(([icon, text]) => `<div class="perk"><span class="ic">${icon}</span><span>${escapeHtml(text)}</span></div>`).join("")}</div>
      <button class="psub" data-a="plan" data-id="${p.id}">${escapeHtml(p.price)}/month</button>
    </div>`;
  }

  function faq(i) {
    const open = !closedFaq.has(i);
    return `<div class="faq">
      <button class="fq" data-a="faq" data-i="${i}"><span>${escapeHtml(FAQS[i].q)}</span><span style="flex:1"></span><span class="ic" style="font-size:22px">${open ? "chevron-small-up" : "chevron-small-down"}</span></button>
      ${open ? `<div class="fa">${escapeHtml(FAQS[i].a)}</div>` : ""}
    </div>`;
  }

  function render() {
    $("rBal").textContent = Format.grouped(st.profile.robux);
    $("rPacks").innerHTML = PACKS.map(row).join("");
    $("rPlans").innerHTML = PLANS.map(planCard).join("");
    $("rDots").innerHTML = PLANS.map(p => `<span class="dot ${p.id === shownPlan ? "on" : ""}"></span>`).join("");
    $("rFaq").innerHTML = FAQS.map((_, i) => faq(i)).join("");
  }

  function open() { render(); $("s-robux").hidden = false; }
  function close() { $("s-robux").hidden = true; }

  function ask(title, message, ok, run) {
    pending = { run };
    $("dlgTitle").textContent = title;
    $("dlgMsg").textContent = message;
    $("dlgOk").textContent = ok;
    $("dlg").hidden = false;
  }
  function answer(yes) {
    const job = pending; pending = null;
    $("dlg").hidden = true;
    if (yes && job) job.run();
  }

  function buyPack(robux, price) {
    ask("Buy Robux", `${Format.grouped(robux)} Robux for ${price}. Nothing is charged: this adds them to your pretend balance.`, "Buy", () => {
      Profile.topUp(st.profile, robux); save(); render(); renderMenu(); toast("+" + Format.grouped(robux) + " Robux");
    });
  }
  function subscribe(id) {
    const p = PLANS.find(x => x.id === id);
    if (!p) return;
    const extra = p.robux > 0 ? ` and ${Format.grouped(p.robux)} Robux.` : ".";
    ask("Subscribe to " + p.name, `${p.price}/month. Nothing is charged: your profile gets Roblox Plus${extra}`, "Subscribe", () => {
      st.profile.badge = "plus";
      Profile.topUp(st.profile, p.robux); save(); render(); renderMenu(); toast("Subscribed to " + p.name);
    });
  }

  function onClick(a, el) {
    if (a === "buypack") return buyPack(Number(el.dataset.n), el.dataset.p);
    if (a === "plan") return subscribe(Number(el.dataset.id));
    if (a === "faq") {
      const i = Number(el.dataset.i);
      closedFaq.has(i) ? closedFaq.delete(i) : closedFaq.add(i);
      return render();
    }
  }

  return { open, close, render, onClick, answer };
})();
