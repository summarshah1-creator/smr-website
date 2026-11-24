// SMR_WIDGET_V4 · SMR Studio widget for Scriptable (Home Screen small / medium / large, Lock Screen rectangle / inline / circle).
// Downloaded by the small loader script on the phone every time the widget refreshes, so changes here reach the phone by themselves.
// Widget parameter (long-press → Edit Widget → Parameter): today (default) · money · leads · care. Stack several and swipe between them.
// Owner 24 Nov: it must be nice to look at, not "coding": one big friendly headline, soft cards, icons, few words, nothing cramped.
module.exports = async function (FEED, VIEW) {
  const ROOT = FEED.replace(/\/demo-admin\/feed\.php.*$/, "");
  const ADMIN = ROOT + "/demo-admin/";
  const fm = FileManager.local();
  const C = {
    bg1: new Color("#221a4d"), bg2: new Color("#0e0c20"), card: new Color("#ffffff", 0.08), card2: new Color("#ffffff", 0.13),
    ink: Color.white(), soft: new Color("#ffffff", 0.72), mute: new Color("#ffffff", 0.5),
    pink: new Color("#ff9ad5"), purple: new Color("#a99bff"), green: new Color("#72e8b8"), red: new Color("#ff8094"), amber: new Color("#ffc870"), blue: new Color("#8fd0ff")
  };
  const tint = (c, a) => new Color(c.hex, a);

  async function getData() {
    const path = fm.joinPath(fm.cacheDirectory(), "smr-today.json");
    try { const r = new Request(FEED); r.timeoutInterval = 12; const j = await r.loadJSON(); if (j && j.now) { fm.writeString(path, JSON.stringify(j)); return j; } } catch (e) {}
    if (fm.fileExists(path)) { const j = JSON.parse(fm.readString(path)); j.stale = true; return j; }
    return null;
  }
  async function getLogo() {
    const path = fm.joinPath(fm.cacheDirectory(), "smr-studio-logo.png");
    if (fm.fileExists(path) && (Date.now() - fm.modificationDate(path).getTime()) < 7 * 864e5) return fm.readImage(path);
    try { const img = await new Request(ADMIN + "widget-logo.png?v=1").loadImage(); fm.writeImage(path, img); return img; } catch (e) {}
    return fm.fileExists(path) ? fm.readImage(path) : null;
  }

  /* ---------- little building blocks ---------- */
  const F = { r: s => Font.regularRoundedSystemFont(s), m: s => Font.mediumRoundedSystemFont(s), s: s => Font.semiboldRoundedSystemFont(s), b: s => Font.boldRoundedSystemFont(s), h: s => Font.heavyRoundedSystemFont(s) };
  function txt(st, s, size, col, w, lines) { const t = st.addText(String(s)); t.font = F[w || "m"](size); t.textColor = col || C.ink; t.lineLimit = lines || 1; t.minimumScaleFactor = 0.8; return t; }
  function icon(st, name, size, col) { const sym = SFSymbol.named(name); if (!sym) return; sym.applyFont(Font.semiboldSystemFont(size)); const im = st.addImage(sym.image); im.imageSize = new Size(size, size); im.tintColor = col; return im; }
  function box(st, w, h, bg, r, pad) { const b = st.addStack(); if (w || h) b.size = new Size(w || 0, h || 0); if (bg) b.backgroundColor = bg; b.cornerRadius = r == null ? 16 : r; const p = pad == null ? 10 : pad; b.setPadding(p, p + 2, p, p + 2); return b; }
  function go(st, hash) { st.url = ADMIN + "#" + hash; }
  const money = p => "£" + Math.round((p || 0) / 100).toLocaleString("en-GB");
  const hm = t => { const d = new Date(t * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const dayName = t => { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const d = Math.floor((t * 1000 - d0) / 864e5); return d < 0 ? "Overdue" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : new Date(t * 1000).toLocaleDateString("en-GB", { weekday: "long" }); };
  const hello = () => { const h = new Date().getHours(); return h < 12 ? "Morning, Summar" : h < 18 ? "Afternoon, Summar" : "Evening, Summar"; };
  const initials = n => String(n || "?").replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  const plainWhy = w => String(w || "").replace(/^Overdue.*$/, "Overdue").replace(/^Due today.*$/, "Due today");
  // small round chip with text, e.g. [Today]
  function chip(st, s, col) { const c = st.addStack(); c.backgroundColor = tint(col, 0.18); c.cornerRadius = 9; c.setPadding(3, 8, 3, 8); txt(c, s, 11, col, "s"); return c; }
  // coloured circle with initials
  function avatar(st, name, col, size) { const a = st.addStack(); a.size = new Size(size, size); a.cornerRadius = size / 2; a.backgroundColor = tint(col, 0.22); a.centerAlignContent(); txt(a, initials(name), size * 0.4, col, "b"); return a; }
  // number tile: icon, big number, label
  function tile(st, w, h, sym, num, label, col, hash) {
    const t = box(st, w, h, C.card, 16, 10); t.layoutVertically(); if (hash) go(t, hash);
    const top = t.addStack(); top.centerAlignContent(); icon(top, sym, 13, col); top.addSpacer();
    t.addSpacer(); txt(t, num, 22, C.ink, "b"); txt(t, label, 11, C.soft, "m");
    return t;
  }
  // list row: avatar · name + small line · chip on the right
  function personRow(st, w, name, sub, right, col, hash) {
    const r = box(st, w, 0, C.card, 14, 8); r.centerAlignContent(); if (hash) go(r, hash);
    avatar(r, name, col, 28); r.addSpacer(9);
    const tx = r.addStack(); tx.layoutVertically(); txt(tx, name, 13.5, C.ink, "s"); if (sub) txt(tx, sub, 11.5, C.mute, "m");
    r.addSpacer(); if (right) chip(r, right, col);
    return r;
  }

  const fam = config.widgetFamily || "large";
  const view = String(args.widgetParameter || VIEW || "today").trim().toLowerCase();
  const d = await getData();
  const cl = (d && d.cl) || {};

  /* ---------- Lock Screen (iOS styles it in your clock colour; parameter today / money / care / leads picks what it shows) ---------- */
  if (fam.indexOf("accessory") === 0) {
    const owedL = (cl.job_overdue || 0) + (cl.bills || []).reduce((x, y) => x + y.amount, 0);
    const careN = (cl.care_list || []).length;
    const todo = d ? (d.overdue || 0) + (d.due_today || 0) : 0;
    const L = {
      today: { url: "today", sym: "checklist", big: String(todo), small: "to do", line: d && d.next ? d.next.title : "Nothing waiting on you",
               sub: [d && d.overdue ? d.overdue + " overdue" : "", d && d.due_today ? d.due_today + " today" : "", cl.leads ? cl.leads + " to chase" : ""].filter(Boolean).join(" · ") || "You're on top of it",
               inline: d && d.next ? "Next: " + d.next.title : "All clear today" },
      money: { url: "clients", sym: "sterlingsign.circle", big: owedL ? "£" + (owedL >= 100000 ? Math.round(owedL / 100000) + "k" : Math.round(owedL / 100)) : "0", small: "owed",
               line: owedL ? money(owedL) + " owed to you" : "Nobody owes you", sub: money(cl.monthly) + " a month" + (cl.inv ? " · " + cl.inv + " invoices to send" : ""),
               inline: owedL ? money(owedL) + " owed to you" : "All paid up" },
      care: { url: "clients", sym: "globe", big: String(careN), small: "sites", line: careN ? careN + (careN === 1 ? " site needs you" : " sites need you") : "All sites fine",
              sub: careN ? (cl.care_list[0].client + ": " + cl.care_list[0].title) : "Up-time, padlocks and renewals OK", inline: careN ? careN + " client sites need you" : "All client sites fine" },
      leads: { url: "leads", sym: "person.2", big: String(cl.leads || 0), small: "leads", line: cl.leads ? cl.leads + " leads to chase" : "No leads to chase",
               sub: cl.pipeline ? money(cl.pipeline) + " up for grabs" : "Add one in SMR Studio", inline: cl.leads ? cl.leads + " leads to chase today" : "No leads to chase" }
    }[view] || null;
    const v = L || { url: "today", sym: "checklist", big: String(todo), small: "to do", line: "SMR Studio", sub: "", inline: "SMR Studio" };
    const w = new ListWidget(); w.url = ADMIN + "#" + v.url; w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
    if (!d) { w.addText("SMR Studio"); return Script.setWidget(w); }
    if (fam === "accessoryInline") { w.addText(v.inline); return Script.setWidget(w); }
    w.addAccessoryWidgetBackground = true;
    if (fam === "accessoryCircular") {
      const s2 = w.addStack(); s2.layoutVertically(); s2.centerAlignContent();
      const ic = SFSymbol.named(v.sym); if (ic) { const im = s2.addImage(ic.image); im.imageSize = new Size(12, 12); im.centerAlignImage(); }
      const a = s2.addText(v.big); a.font = Font.heavyRoundedSystemFont(v.big.length > 3 ? 15 : 20); a.centerAlignText(); a.minimumScaleFactor = 0.6;
      const b = s2.addText(v.small); b.font = Font.mediumRoundedSystemFont(9); b.centerAlignText();
      return Script.setWidget(w);
    }
    // accessoryRectangular
    const top = w.addStack(); top.centerAlignContent();
    const ic = SFSymbol.named(v.sym); if (ic) { const im = top.addImage(ic.image); im.imageSize = new Size(11, 11); top.addSpacer(4); }
    const t0 = top.addText("SMR STUDIO"); t0.font = Font.semiboldRoundedSystemFont(10); t0.textOpacity = 0.75;
    const a = w.addText(v.line); a.font = Font.boldRoundedSystemFont(14); a.lineLimit = 2; a.minimumScaleFactor = 0.8;
    if (v.sub) { const b = w.addText(v.sub); b.font = Font.mediumRoundedSystemFont(11.5); b.lineLimit = 1; b.textOpacity = 0.85; }
    return Script.setWidget(w);
  }

  /* ---------- Home Screen ---------- */
  const W = fam === "small" ? 146 : 334;   // usable width inside the padding
  const w = new ListWidget();
  const g = new LinearGradient(); g.colors = [C.bg1, C.bg2]; g.locations = [0, 1]; w.backgroundGradient = g;
  w.setPadding(14, 14, 14, 14);
  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  w.url = ADMIN + "#" + ({ money: "clients", leads: "leads", care: "clients" }[view] || "today");

  // header: logo left, small label right
  const head = w.addStack(); head.centerAlignContent();
  const logo = await getLogo();
  if (logo) { const im = head.addImage(logo); im.imageSize = new Size(fam === "small" ? 72 : 88, fam === "small" ? 12 : 14.6); }
  head.addSpacer();
  if (fam !== "small") txt(head, d && d.stale ? "Offline" : new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), 11, C.mute, "s");
  w.addSpacer(fam === "small" ? 8 : 10);

  if (!d) { txt(w, "Can't reach SMR Studio right now", 15, C.ink, "s", 2); w.addSpacer(); return Script.setWidget(w); }

  const owedTotal = (cl.job_overdue || 0) + (cl.bills || []).reduce((a, b) => a + b.amount, 0);
  const debtors = [].concat((cl.bills || []).map(b => ({ name: b.client, amt: b.amount, sub: "Monthly plan" })), Object.keys(cl.debtors || {}).map(k => ({ name: k, amt: cl.debtors[k], sub: "Job" }))).sort((a, b) => b.amt - a.amt);
  const leads = cl.lead_list || [];
  const care = (cl.care_list || []).map(k => Object.assign({}, k, { title: k.bad && /up/i.test(k.title) && /Website/i.test(k.title) ? "Website is down" : k.bad && /SSL/i.test(k.title) ? "Padlock certificate problem" : k.title }));

  if (view === "money") {
    if (fam === "small") {
      txt(w, owedTotal ? "Owed to you" : "Nobody owes you", 12, C.soft, "s"); w.addSpacer(2);
      txt(w, owedTotal ? money(owedTotal) : "All paid", 30, owedTotal ? C.amber : C.green, "h");
      w.addSpacer();
      const r = w.addStack(); r.centerAlignContent(); icon(r, "arrow.triangle.2.circlepath", 12, C.purple); r.addSpacer(5); txt(r, money(cl.monthly) + " a month", 12, C.soft, "s");
    } else {
      const top = w.addStack(); top.centerAlignContent();
      const l = top.addStack(); l.layoutVertically();
      txt(l, owedTotal ? "Owed to you" : "Nobody owes you anything", 13, C.soft, "s"); txt(l, owedTotal ? money(owedTotal) : "All paid up", 30, owedTotal ? C.amber : C.green, "h");
      top.addSpacer();
      const m = box(top, 0, 0, tint(C.purple, 0.16), 14, 8); m.layoutVertically(); go(m, "clients");
      txt(m, money(cl.monthly), 17, C.ink, "b"); txt(m, "a month", 11, C.soft, "m");
      w.addSpacer(10);
      const n = fam === "large" ? 3 : 1;
      if (!debtors.length) { const ok = box(w, W, 0, C.card, 14, 10); ok.centerAlignContent(); icon(ok, "checkmark.circle.fill", 16, C.green); ok.addSpacer(8); txt(ok, "Everyone's paid. Nice.", 13.5, C.ink, "s"); }
      debtors.slice(0, n).forEach((x, i) => { if (i) w.addSpacer(6); personRow(w, W, x.name, x.sub, money(x.amt), C.amber, x.sub === "Job" ? "jobs" : "clients"); });
      if (fam === "large") {
        w.addSpacer(10);
        const tr = w.addStack(); tr.spacing = 8;
        tile(tr, 106, 74, "doc.text.fill", String(cl.inv || 0), "Invoices", C.blue, "clients");
        tile(tr, 106, 74, "bell.fill", String(cl.reminders || 0), "Reminders", C.pink, "jobs");
        tile(tr, 106, 74, "hand.thumbsup.fill", String(cl.to_agree || 0), "Quotes out", C.purple, "jobs");
      }
    }
  } else if (view === "leads") {
    const n = cl.leads || 0;
    if (fam === "small") {
      txt(w, n ? "Chase today" : "No one to chase", 12, C.soft, "s"); w.addSpacer(2);
      txt(w, String(n), 34, n ? C.pink : C.green, "h");
      w.addSpacer();
      if (leads[0]) txt(w, leads[0].name, 13, C.ink, "s");
    } else {
      const top = w.addStack(); top.centerAlignContent();
      const l = top.addStack(); l.layoutVertically();
      txt(l, n ? "Chase today" : "No one to chase today", 13, C.soft, "s"); txt(l, n ? String(n) + (n === 1 ? " lead" : " leads") : "All caught up", 28, n ? C.pink : C.green, "h");
      top.addSpacer();
      if (cl.pipeline) { const m = box(top, 0, 0, tint(C.pink, 0.15), 14, 8); m.layoutVertically(); txt(m, money(cl.pipeline), 17, C.ink, "b"); txt(m, "up for grabs", 11, C.soft, "m"); }
      w.addSpacer(10);
      const rows = fam === "large" ? 5 : 1;
      if (!leads.length) { const ok = box(w, W, 0, C.card, 14, 10); txt(ok, "Add a lead in SMR Studio and it shows here", 13, C.soft, "m", 2); }
      leads.slice(0, rows).forEach((x, i) => { if (i) w.addSpacer(6); const when = dayName(x.next); personRow(w, W, x.name, x.what || x.next_what || "", when, when === "Overdue" || when === "Today" ? C.pink : C.purple, "leads"); });
    }
  } else if (view === "care") {
    const bad = care.filter(k => k.bad).length;
    const head2 = care.length ? (bad ? bad + (bad === 1 ? " site needs you" : " sites need you") : care.length + " check" + (care.length === 1 ? "" : "s") + " due") : "All sites look good";
    if (fam === "small") {
      icon(w, care.length ? (bad ? "exclamationmark.triangle.fill" : "wrench.and.screwdriver.fill") : "checkmark.shield.fill", 26, care.length ? (bad ? C.red : C.amber) : C.green);
      w.addSpacer(8); txt(w, head2, 16, C.ink, "b", 2); w.addSpacer();
      if (care[0]) txt(w, care[0].client, 12, C.soft, "s");
    } else {
      const top = w.addStack(); top.centerAlignContent();
      icon(top, care.length ? (bad ? "exclamationmark.triangle.fill" : "wrench.and.screwdriver.fill") : "checkmark.shield.fill", 24, care.length ? (bad ? C.red : C.amber) : C.green);
      top.addSpacer(10); txt(top, head2, 20, C.ink, "b");
      w.addSpacer(10);
      care.slice(0, fam === "large" ? 5 : 1).forEach((k, i) => { if (i) w.addSpacer(6); personRow(w, W, k.client, k.title, k.bad ? "Fix it" : "Due", k.bad ? C.red : C.amber, "clients"); });
    }
  } else {
    /* today */
    if (fam === "small") {
      txt(w, "Next up", 12, C.pink, "s"); w.addSpacer(3);
      txt(w, d.next ? d.next.title : "Nothing waiting on you", 15, C.ink, "b", 4);
      w.addSpacer();
      const r = w.addStack(); r.centerAlignContent();
      if (d.overdue) { icon(r, "exclamationmark.circle.fill", 12, C.red); r.addSpacer(4); txt(r, d.overdue + " overdue", 12, C.red, "s"); }
      else { icon(r, "checkmark.circle.fill", 12, C.green); r.addSpacer(4); txt(r, "On track", 12, C.green, "s"); }
    } else {
      if (fam === "large") { txt(w, hello(), 22, C.ink, "b"); w.addSpacer(10); }
      const row = w.addStack(); row.spacing = 8;
      const nx = box(row, fam === "large" ? W : 218, fam === "large" ? 96 : 112, C.card2, 18, 12); nx.layoutVertically(); go(nx, "today");
      const lab = nx.addStack(); lab.centerAlignContent(); icon(lab, "sparkles", 12, C.pink); lab.addSpacer(5); txt(lab, "Next up", 12, C.pink, "s");
      nx.addSpacer(5); txt(nx, d.next ? d.next.title : "Nothing waiting on you. Chase a lead?", fam === "large" ? 16 : 15, C.ink, "b", 2);
      nx.addSpacer();
      if (d.next) txt(nx, [d.next.person, plainWhy(d.next.why)].filter(Boolean).join("  ·  "), 12, /Overdue/.test(d.next.why) ? C.red : C.soft, "s");
      const ev = (d.today && d.today[0]) || (d.tomorrow && d.tomorrow[0]);
      const evTxt = ev ? (ev.all_day ? (d.today && d.today[0] ? "Today" : "Tomorrow") : hm(ev.start)) : "Free";
      const evLab = ev ? ev.title : "No meetings";
      if (fam === "medium") {
        const col = row.addStack(); col.layoutVertically(); col.spacing = 8;
        const t1 = box(col, 108, 52, C.card, 14, 8); t1.layoutVertically(); go(t1, "today");
        const a = t1.addStack(); a.centerAlignContent(); icon(a, "calendar", 11, C.blue); a.addSpacer(4); txt(a, evTxt, 13, C.ink, "b"); txt(t1, evLab, 11, C.soft, "m");
        const t2 = box(col, 108, 52, d.overdue ? tint(C.red, 0.16) : C.card, 14, 8); t2.layoutVertically(); go(t2, "today");
        txt(t2, String(d.overdue || 0), 18, d.overdue ? C.red : C.green, "b"); txt(t2, "overdue", 11, C.soft, "m");
      } else {
        w.addSpacer(8);
        const tr = w.addStack(); tr.spacing = 8;
        const t1 = box(tr, 163, 64, C.card, 16, 10); t1.layoutVertically(); go(t1, "today");
        const a = t1.addStack(); a.centerAlignContent(); icon(a, "calendar", 12, C.blue); a.addSpacer(5); txt(a, ev ? (d.today && d.today[0] ? "Today " : "Tomorrow ") + evTxt : "No meetings", 12, C.blue, "s");
        t1.addSpacer(); txt(t1, ev ? evLab : "A clear diary", 14, C.ink, "s");
        const t2 = box(tr, 163, 64, d.overdue ? tint(C.red, 0.16) : C.card, 16, 10); t2.layoutVertically(); go(t2, "today");
        const b = t2.addStack(); b.centerAlignContent(); icon(b, d.overdue ? "exclamationmark.circle.fill" : "checkmark.circle.fill", 12, d.overdue ? C.red : C.green); b.addSpacer(5); txt(b, d.overdue ? "Running late" : "On track", 12, d.overdue ? C.red : C.green, "s");
        t2.addSpacer(); txt(t2, d.overdue ? d.overdue + " overdue" : "Nothing overdue", 14, C.ink, "s");
        w.addSpacer(10);
        txt(w, "Also on your list", 12, C.mute, "s"); w.addSpacer(5);
        (d.top || []).slice(1, 4).forEach((t, i) => {
          if (i) w.addSpacer(5);
          const r = w.addStack(); r.centerAlignContent(); go(r, "today");
          const dot = r.addStack(); dot.size = new Size(7, 7); dot.cornerRadius = 4; dot.backgroundColor = /Overdue/.test(t.why) ? C.red : /Due today/.test(t.why) ? C.amber : C.purple;
          r.addSpacer(9); txt(r, t.title, 13.5, C.ink, "m"); r.addSpacer();
        });
      }
    }
  }

  // footer on the big widget only: three calm counts
  if (fam === "large") {
    w.addSpacer();
    const f = w.addStack(); f.centerAlignContent(); f.spacing = 14;
    const pill = (sym, s, col, hash) => { const p = f.addStack(); p.centerAlignContent(); go(p, hash); icon(p, sym, 11, col); p.addSpacer(4); txt(p, s, 12, col, "s"); };
    if (owedTotal && view !== "money") pill("sterlingsign.circle.fill", money(owedTotal) + " owed", C.amber, "clients");
    if (cl.leads && view !== "leads") pill("person.2.fill", cl.leads + " to chase", C.pink, "leads");
    if (d.done_today) pill("checkmark.circle.fill", d.done_today + " done", C.green, "today");
  } else w.addSpacer();

  Script.setWidget(w);
  if (!config.runsInWidget) { fam === "small" ? await w.presentSmall() : fam === "medium" ? await w.presentMedium() : await w.presentLarge(); }
};
