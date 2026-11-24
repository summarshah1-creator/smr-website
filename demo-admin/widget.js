// SMR_WIDGET_V2 · SMR Studio widget for Scriptable (Home Screen small / medium / large, Lock Screen rectangle / inline / circle).
// This file is downloaded by the small loader script on the phone every time the widget refreshes,
// so changes here reach the phone by themselves. Widget parameter (long-press the widget → Edit Widget → Parameter):
//   today (default) · money · leads · care · all      Put several in a Smart Stack and swipe between them.
module.exports = async function (FEED) {
  const ADMIN = FEED.replace(/\/demo-admin\/feed\.php.*$/, "/demo-admin/");
  const LOGO = FEED.replace(/\/demo-admin\/feed\.php.*$/, "/demo-admin/widget-logo.png");
  const C = { bg1: new Color("#17132e"), bg2: new Color("#08080f"), ink: Color.white(), mute: new Color("#a3a3bd"),
    pink: new Color("#e9a6ff"), red: new Color("#ff6b84"), amber: new Color("#ffc061"), green: new Color("#7ff0bd"), blue: new Color("#a9b4ff") };
  const fm = FileManager.local();

  async function getData() {
    const path = fm.joinPath(fm.cacheDirectory(), "smr-today.json");
    try {
      const r = new Request(FEED); r.timeoutInterval = 12;
      const j = await r.loadJSON();
      if (j && j.now) { fm.writeString(path, JSON.stringify(j)); return j; }
    } catch (e) {}
    if (fm.fileExists(path)) { const j = JSON.parse(fm.readString(path)); j.stale = true; return j; }
    return null;
  }
  async function getLogo() {
    const path = fm.joinPath(fm.cacheDirectory(), "smr-studio-logo.png");
    if (fm.fileExists(path) && (Date.now() - fm.modificationDate(path).getTime()) < 7 * 864e5) return fm.readImage(path);
    try { const img = await new Request(LOGO + "?v=1").loadImage(); fm.writeImage(path, img); return img; } catch (e) {}
    return fm.fileExists(path) ? fm.readImage(path) : null;
  }
  const money = p => "£" + (Math.round((p || 0) / 100)).toLocaleString("en-GB");
  const hm = t => { const d = new Date(t * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const when = t => { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const d = Math.floor((t * 1000 - d0) / 864e5); return d < 0 ? "overdue" : d === 0 ? "today" : d === 1 ? "tomorrow" : new Date(t * 1000).toLocaleDateString("en-GB", { weekday: "short" }); };
  const whyCol = w => /^Overdue/.test(w || "") ? C.red : /^Due today/.test(w || "") ? C.amber : C.mute;
  function txt(st, s, size, col, weight, lines) {
    const t = st.addText(String(s)); t.textColor = col || C.ink; t.font = weight === "b" ? Font.boldSystemFont(size) : weight === "h" ? Font.heavySystemFont(size) : Font.mediumSystemFont(size);
    if (lines) t.lineLimit = lines; return t;
  }
  // a tappable row: tapping it opens that part of SMR Studio (medium + large widgets)
  function row(w, hash, build) { const r = w.addStack(); r.centerAlignContent(); r.url = ADMIN + "#" + hash; build(r); return r; }

  const fam = config.widgetFamily || "large";
  const view = String(args.widgetParameter || "today").trim().toLowerCase();
  const d = await getData();
  const cl = (d && d.cl) || {};

  /* ---------- Lock Screen ---------- */
  if (fam === "accessoryInline") {
    const w = new ListWidget(); w.url = ADMIN + "#today";
    const m = d && d.today && d.today[0];
    w.addText(d ? (d.next ? "▶ " + d.next.title : "All clear") + (m ? " · " + (m.all_day ? "" : hm(m.start) + " ") + m.title : "") : "SMR: no connection");
    return Script.setWidget(w);
  }
  if (fam === "accessoryCircular") {
    const w = new ListWidget(); w.url = ADMIN + "#today"; w.addAccessoryWidgetBackground = true;
    const n = d ? d.overdue + d.due_today : 0;
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const a = s.addText(String(n)); a.font = Font.heavySystemFont(20); a.centerAlignText();
    const b = s.addText("to do"); b.font = Font.mediumSystemFont(9); b.centerAlignText();
    return Script.setWidget(w);
  }
  if (fam === "accessoryRectangular") {
    const w = new ListWidget(); w.url = ADMIN + "#today"; w.addAccessoryWidgetBackground = true;
    if (!d) { w.addText("SMR Studio: no connection"); return Script.setWidget(w); }
    const a = w.addText(d.next ? "▶ " + d.next.title : "Nothing waiting on you"); a.font = Font.boldSystemFont(13); a.lineLimit = 2;
    const extra = [d.overdue ? d.overdue + " overdue" : "", cl.unpaid ? cl.unpaid + " unpaid" : "", cl.leads ? cl.leads + " to chase" : ""].filter(Boolean).join(" · ");
    const b = w.addText(extra || (d.today && d.today[0] ? (d.today[0].all_day ? "" : hm(d.today[0].start) + " ") + d.today[0].title : "")); b.font = Font.mediumSystemFont(11); b.lineLimit = 1;
    return Script.setWidget(w);
  }

  /* ---------- Home Screen ---------- */
  const w = new ListWidget();
  const g = new LinearGradient(); g.colors = [C.bg1, C.bg2]; g.locations = [0, 1]; w.backgroundGradient = g;
  w.setPadding(fam === "small" ? 12 : 14, 14, 12, 14);
  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  const page = { today: "today", money: "clients", leads: "leads", care: "clients", all: "today" }[view] || "today";
  w.url = ADMIN + "#" + page;

  // header: SMR Studio logo + what this widget shows
  const head = w.addStack(); head.centerAlignContent();
  const logo = await getLogo();
  if (logo) { const im = head.addImage(logo); im.imageSize = new Size(fam === "small" ? 78 : 96, fam === "small" ? 13 : 16); }
  else txt(head, "SMR Studio", 12, C.pink, "h");
  head.addSpacer();
  const label = { today: new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), money: "MONEY", leads: "LEADS", care: "CARE", all: "OVERVIEW" }[view] || "";
  if (fam !== "small" || view !== "today") txt(head, label, 10, C.mute, "b");
  w.addSpacer(fam === "small" ? 6 : 8);

  if (!d) { txt(w, "Couldn't reach SMR Studio. Check your connection.", 12, C.mute); return Script.setWidget(w); }

  const max = fam === "large" ? 6 : fam === "medium" ? 2 : 0;
  const sec = (t) => { txt(w, t, 9.5, C.mute, "h"); w.addSpacer(3); };
  const counts = (items) => { // row of small numbers, each tappable
    const r = w.addStack(); r.spacing = fam === "small" ? 8 : 12;
    items.filter(Boolean).forEach(([n, l, col, hash]) => { const s = r.addStack(); s.layoutVertically(); s.url = ADMIN + "#" + hash; txt(s, n, fam === "small" ? 15 : 17, col, "h"); txt(s, l, 9, C.mute, "b"); });
  };

  if (view === "money") {
    const owed = (cl.job_overdue || 0);
    if (fam === "small") {
      txt(w, money(cl.monthly) + "/mo", 18, C.ink, "h"); txt(w, "monthly plans", 10, C.mute, "b"); w.addSpacer(6);
      txt(w, (cl.unpaid || 0) + " unpaid · " + money(owed) + " overdue", 11, (cl.unpaid || owed) ? C.red : C.green, "b", 2);
    } else {
      counts([[money(cl.monthly), "a month", C.blue, "clients"], [money(owed), "overdue", owed ? C.red : C.green, "jobs"], [String(cl.unpaid || 0), "unpaid months", cl.unpaid ? C.red : C.green, "clients"], [String(cl.inv || 0), "invoices to send", cl.inv ? C.amber : C.mute, "clients"]]);
      w.addSpacer(8);
      const list = [].concat((cl.bills || []).map(b => [b.client + " · monthly", money(b.amount), b.state === "grace" ? C.red : C.amber, "clients"]),
        Object.keys(cl.debtors || {}).map(k => [k + " · job", money(cl.debtors[k]), C.red, "jobs"]));
      if (!list.length) txt(w, "Nobody owes you anything right now 🎉", 12, C.green, "b");
      list.slice(0, max).forEach(x => row(w, x[3], r => { txt(r, x[0], 12, C.ink, "m", 1); r.addSpacer(); txt(r, x[1], 12, x[2], "b"); }));
      if (fam === "large" && cl.reminders) { w.addSpacer(6); txt(w, cl.reminders + " payment reminder" + (cl.reminders > 1 ? "s" : "") + " written and ready to send", 11, C.amber, "b", 2); }
    }
  } else if (view === "leads") {
    const L = cl.lead_list || [];
    if (fam === "small") {
      txt(w, String(cl.leads || 0), 26, cl.leads ? C.amber : C.green, "h"); txt(w, "leads to chase", 10, C.mute, "b"); w.addSpacer(4);
      if (L[0]) txt(w, L[0].name + " · " + when(L[0].next), 11, C.ink, "b", 2);
    } else {
      counts([[String(cl.leads || 0), "to chase", cl.leads ? C.amber : C.green, "leads"], [String(cl.open_leads || 0), "open", C.blue, "leads"], [money(cl.pipeline), "if they all came in", C.pink, "leads"]]);
      w.addSpacer(8);
      if (!L.length) txt(w, "No follow-ups booked. Add a lead in SMR Studio.", 12, C.mute, "m", 2);
      L.slice(0, max).forEach(l => row(w, "leads", r => { txt(r, (l.next * 1000 < Date.now() + 3600e3 ? "● " : "○ "), 10, l.next * 1000 < Date.now() + 3600e3 ? C.amber : C.mute, "b"); txt(r, l.name + (l.what ? " · " + l.what : ""), 12, C.ink, "m", 1); r.addSpacer(4); txt(r, when(l.next), 10, C.mute, "b"); }));
    }
  } else if (view === "care") {
    const K = cl.care_list || [];
    txt(w, K.length ? K.length + " check" + (K.length > 1 ? "s" : "") + " due" : "All client sites look fine", fam === "small" ? 14 : 15, K.length ? C.amber : C.green, "b", 2);
    w.addSpacer(6);
    K.slice(0, fam === "small" ? 2 : max).forEach(k => row(w, "clients", r => { txt(r, (k.bad ? "⚠︎ " : "• "), 11, k.bad ? C.red : C.amber, "b"); txt(r, k.client + " · " + k.title, 12, C.ink, "m", 1); }));
  } else {
    // today (and "all" = today + a money/leads line)
    if (d.next) {
      const n = row(w, "today", r => { const s = r.addStack(); s.layoutVertically(); txt(s, "DO THIS NEXT", 9.5, C.pink, "h"); s.addSpacer(2); txt(s, d.next.title, fam === "small" ? 14 : 16, C.ink, "b", fam === "small" ? 3 : 2); s.addSpacer(1); txt(s, (d.next.person ? d.next.person + " · " : "") + d.next.why, 11, whyCol(d.next.why), "b", 1); });
    } else txt(w, "Nothing waiting on you. Chase a lead?", 14, C.ink, "b", 3);
    if (fam !== "small") {
      w.addSpacer(8);
      const evs = d.today && d.today.length ? d.today : (d.tomorrow || []);
      sec(d.today && d.today.length ? "TODAY" : "TOMORROW");
      if (!evs.length) txt(w, "No meetings today or tomorrow", 12, C.mute, "m", 1);
      evs.slice(0, fam === "large" ? 3 : 1).forEach(e => row(w, "today", r => { txt(r, e.all_day ? "All day " : hm(e.start) + "  ", 12, C.pink, "b"); txt(r, e.title + (e.prep ? "  · " + e.prep + " prep" : ""), 12, C.ink, "m", 1); }));
      if (fam === "large") {
        w.addSpacer(8); sec("UP NEXT");
        (d.top || []).slice(1, 5).forEach(t => row(w, "today", r => { txt(r, (t.pri === 1 ? "● " : "○ "), 11, t.pri === 1 ? C.red : C.mute, "b"); txt(r, t.title, 12, C.ink, "m", 1); r.addSpacer(4); txt(r, t.why, 10, whyCol(t.why), "b", 1); }));
      }
    }
  }

  // footer: the numbers that matter, each one opens its page
  w.addSpacer();
  const f = w.addStack(); f.centerAlignContent(); f.spacing = 8;
  const chip = (s, col, hash) => { const c = f.addStack(); c.url = ADMIN + "#" + hash; txt(c, s, 10.5, col, "b"); };
  if (d.overdue) chip("⚠︎ " + d.overdue + " overdue", C.red, "today");
  if (view !== "money" && (cl.unpaid || cl.job_overdue)) chip("£ " + ((cl.unpaid || 0) + Object.keys(cl.debtors || {}).length) + " owe", C.amber, "clients");
  if (view !== "leads" && cl.leads && fam !== "small") chip("☎︎ " + cl.leads + " to chase", C.pink, "leads");
  if (d.done_today && fam !== "small") chip("✓ " + d.done_today, C.green, "today");
  f.addSpacer();
  if (d.stale) txt(f, "offline", 9.5, C.mute);
  else if (fam !== "small") txt(f, "updated " + hm(d.now), 9.5, C.mute);
  Script.setWidget(w);
  if (!config.runsInWidget) { fam === "small" ? await w.presentSmall() : fam === "medium" ? await w.presentMedium() : await w.presentLarge(); }
};
