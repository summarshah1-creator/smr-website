// SMR Today: Scriptable widget for SMR Admin (Home Screen: small / medium / large, Lock Screen: rectangle / inline / circle).
// Copied from SMR Admin → Today → ⚙ → Copy widget script. The link below is private: don't share it.
const FEED = "__FEED__";
const ADMIN = FEED.replace(/\/demo-admin\/feed\.php.*$/, "/demo-admin/#today");

const C = { bg1: new Color("#14112a"), bg2: new Color("#08080f"), ink: Color.white(), mute: new Color("#a3a3bd"),
  pink: new Color("#e9a6ff"), red: new Color("#ff6b84"), amber: new Color("#ffc061"), green: new Color("#7ff0bd") };

async function getData() {
  const fm = FileManager.local(), path = fm.joinPath(fm.cacheDirectory(), "smr-today.json");
  try {
    const r = new Request(FEED); r.timeoutInterval = 12;
    const j = await r.loadJSON();
    if (j && j.now) { fm.writeString(path, JSON.stringify(j)); return j; }
  } catch (e) {}
  if (fm.fileExists(path)) { const j = JSON.parse(fm.readString(path)); j.stale = true; return j; }
  return null;
}
const hm = t => { const d = new Date(t * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const whyCol = w => /^Overdue/.test(w || "") ? C.red : /^Due today/.test(w || "") ? C.amber : C.mute;
const meetTxt = e => (e.all_day ? "Today" : hm(e.start)) + "  " + e.title;
function txt(st, s, size, col, weight, lines) {
  const t = st.addText(s); t.textColor = col || C.ink; t.font = weight === "b" ? Font.boldSystemFont(size) : weight === "h" ? Font.heavySystemFont(size) : Font.mediumSystemFont(size);
  if (lines) t.lineLimit = lines; return t;
}
function base() {
  const w = new ListWidget(); const g = new LinearGradient(); g.colors = [C.bg1, C.bg2]; g.locations = [0, 1]; w.backgroundGradient = g;
  w.url = ADMIN; w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000); return w;
}
function footer(w, d) {
  const f = w.addStack(); f.centerAlignContent();
  if (d.overdue) { txt(f, "⚠︎ " + d.overdue + " overdue", 11, C.red, "b"); f.addSpacer(8); }
  if (d.owing && d.owing.length) { txt(f, "£ " + d.owing.length + " owe you", 11, C.red, "b"); f.addSpacer(8); }
  if (d.cl && d.cl.unpaid) { txt(f, "£ " + d.cl.unpaid + " unpaid", 11, C.amber, "b"); f.addSpacer(8); }
  if (d.cl && d.cl.leads) { txt(f, "☎︎ " + d.cl.leads + " lead" + (d.cl.leads > 1 ? "s" : ""), 11, C.pink, "b"); f.addSpacer(8); }
  if (d.done_today) txt(f, "✓ " + d.done_today, 11, C.green, "b");
  f.addSpacer();
  if (d.stale) txt(f, "offline", 10, C.mute);
}

async function build(fam) {
  const d = await getData();
  if (fam === "accessoryInline") {
    const w = new ListWidget(); w.url = ADMIN;
    const m = d && d.today && d.today[0];
    w.addText(d ? (d.next ? "▶ " + d.next.title : "All clear") + (m ? " · " + (m.all_day ? "" : hm(m.start) + " ") + m.title : "") : "SMR: no connection");
    return w;
  }
  if (fam === "accessoryCircular") {
    const w = new ListWidget(); w.url = ADMIN; w.addAccessoryWidgetBackground = true;
    const n = d ? d.overdue + d.due_today : 0;
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const a = s.addText(String(n)); a.font = Font.heavySystemFont(20); a.centerAlignText();
    const b = s.addText("to do"); b.font = Font.mediumSystemFont(9); b.centerAlignText();
    return w;
  }
  if (fam === "accessoryRectangular") {
    const w = new ListWidget(); w.url = ADMIN; w.addAccessoryWidgetBackground = true;
    if (!d) { w.addText("SMR Today: no connection"); return w; }
    const a = w.addText(d.next ? "▶ " + d.next.title : "Nothing waiting on you"); a.font = Font.boldSystemFont(13); a.lineLimit = 2;
    const m = d.today && d.today.find(e => e.all_day || e.start > d.now - 1800);
    const line = m ? meetTxt(m) : (d.next ? (d.next.person ? d.next.person + " · " : "") + d.next.why : "");
    const b = w.addText(line); b.font = Font.mediumSystemFont(11); b.lineLimit = 1;
    const extra = [d.overdue ? d.overdue + " overdue" : "", d.owing && d.owing.length ? d.owing.length + " owe you" : ""].filter(Boolean).join(" · ");
    if (extra) { const c = w.addText(extra); c.font = Font.mediumSystemFont(10); }
    return w;
  }
  const w = base(); w.setPadding(14, 14, 12, 14);
  if (!d) { txt(w, "SMR Today", 14, C.pink, "b"); w.addSpacer(6); txt(w, "Couldn't reach SMR Admin. Check the link in the script.", 12, C.mute); return w; }
  const head = w.addStack(); head.centerAlignContent(); txt(head, "DO THIS NEXT", 10, C.pink, "h"); head.addSpacer();
  if (fam !== "small") txt(head, new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), 10, C.mute, "b");
  w.addSpacer(4);
  if (d.next) {
    txt(w, d.next.title, fam === "small" ? 14 : 16, C.ink, "b", fam === "small" ? 3 : 2);
    w.addSpacer(2);
    txt(w, (d.next.person ? d.next.person + " · " : "") + d.next.why + (d.next.owes ? " · £ due" : ""), 11, whyCol(d.next.why), "b", 1);
  } else txt(w, "Nothing waiting on you. Chase a lead?", 14, C.ink, "b", 3);
  if (fam === "small") { w.addSpacer(); footer(w, d); return w; }
  w.addSpacer(8);
  const sec = (title) => { txt(w, title, 10, C.mute, "h"); w.addSpacer(3); };
  sec(d.today && d.today.length ? "TODAY" : d.tomorrow && d.tomorrow.length ? "TOMORROW" : "MEETINGS");
  const evs = d.today && d.today.length ? d.today : (d.tomorrow || []);
  if (!evs.length) txt(w, "No meetings today or tomorrow", 12, C.mute, "m", 1);
  evs.slice(0, fam === "large" ? 4 : 2).forEach(e => { const r = w.addStack(); txt(r, e.all_day ? "All day " : hm(e.start) + "  ", 12, C.pink, "b"); txt(r, e.title + (e.prep ? "  · " + e.prep + " prep" : ""), 12, C.ink, "m", 1); });
  if (fam === "large") {
    w.addSpacer(8); sec("UP NEXT");
    (d.top || []).slice(1, 6).forEach(t => { const r = w.addStack(); txt(r, (t.pri === 1 ? "● " : "○ "), 11, t.pri === 1 ? C.red : C.mute, "b"); txt(r, t.title, 12, C.ink, "m", 1); r.addSpacer(4); txt(r, t.why, 10, whyCol(t.why), "b", 1); });
    if (d.owing && d.owing.length) { w.addSpacer(6); txt(w, "£ OWE YOU: " + d.owing.join(", "), 11, C.red, "b", 2); }
  }
  w.addSpacer(); footer(w, d);
  return w;
}

const fam = config.widgetFamily || "medium";
const widget = await build(fam);
if (config.runsInWidget || config.runsInAccessoryWidget) Script.setWidget(widget);
else { await widget.presentMedium(); }
Script.complete();
