<?php
/* Luton Community Hub (live copy at smrgraphics.co.uk/hub, hub.smrgraphics.co.uk later hub.smrdigital.co.uk).
   Stands in for the Claude artifact's capabilities so the same app.js runs on our server:
     db      → hub_docs table (collection path + doc id → JSON), same access rules as the artifact declared
     user    → id() = a random visitor id kept in an httpOnly cookie; isOwner() = logged in to SMR Admin
     sample  → the AI writer, through demo-lib/ai.php (the key saved in SMR Admin → Proofs ⚙, shared monthly cap)
   Rules (from the artifact): approved = everyone reads, owner writes · subs = owner reads, you write your own doc ·
   appeals = everyone reads + writes (size/rate limited) · analytics = owner reads, you write your own doc ·
   data/users/<you> = only you. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);
date_default_timezone_set('Europe/London');

function hub_db(): PDO {
    static $ok = false; $pdo = db();
    if (!$ok) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS hub_docs (col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, at INTEGER NOT NULL, by TEXT DEFAULT '', PRIMARY KEY (col, id))");
        $pdo->exec("CREATE TABLE IF NOT EXISTS hub_kv (k TEXT PRIMARY KEY, v TEXT)");
        $ok = true;
    }
    return $pdo;
}
function hub_me(): string {
    $v = (string) ($_COOKIE['hub_vid'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{20,40}$/', $v)) { $v = rand_token(18); set_cookie('hub_vid', $v, now() + 2 * 365 * 86400, '/', 'Lax'); $_COOKIE['hub_vid'] = $v; }
    return $v;
}
function hub_kv(string $k): string { $st = hub_db()->prepare('SELECT v FROM hub_kv WHERE k = ?'); $st->execute([$k]); $v = $st->fetchColumn(); return $v === false ? '' : (string) $v; }
function hub_kv_set(string $k, string $v): void { hub_db()->prepare('INSERT OR REPLACE INTO hub_kv (k, v) VALUES (?, ?)')->execute([$k, $v]); }
function hub_owner(): bool { return (bool) admin_token(); }
/* Can this visitor read / write collection $col (and doc $id)? */
function hub_can(string $col, string $id, bool $write): bool {
    $me = hub_me(); $own = hub_owner();
    if ($col === 'approved') return $write ? $own : true;
    if ($col === 'appeals') return true;
    if ($col === 'subs' || $col === 'analytics') return $write ? ($id === $me || $own) : ($own || $id === $me);
    if ($col === 'data/users/' . $me) return true;
    if (strpos($col, 'data/users/') === 0) return $own && !$write;
    return false;
}
function hub_col(): string { $c = (string) ($_GET['c'] ?? ''); if (!preg_match('#^[A-Za-z0-9_/-]{1,80}$#', $c)) json_out(['error' => 'bad collection'], 400); return $c; }
function hub_id(): string { $i = (string) ($_GET['id'] ?? ''); if (!preg_match('/^[A-Za-z0-9_.:@-]{1,120}$/', $i)) json_out(['error' => 'bad id'], 400); return $i; }

$a = $_GET['a'] ?? '';
$ip = hash('sha256', client_ip() . 'hub');

if ($a === 'whoami') json_out(['me' => hub_me(), 'owner' => hub_owner()]);

if ($a === 'list') {   // every doc in a collection (+ a stamp so the page can poll cheaply)
    $c = hub_col();
    if (!hub_can($c, '', false)) {
        // subs / analytics for a visitor: only their own doc
        if (in_array($c, ['subs', 'analytics'], true)) { $st = hub_db()->prepare('SELECT id, data, at FROM hub_docs WHERE col = ? AND id = ?'); $st->execute([$c, hub_me()]); }
        else json_out(['error' => 'not allowed'], 403);
    } else { $st = hub_db()->prepare('SELECT id, data, at FROM hub_docs WHERE col = ? ORDER BY at'); $st->execute([$c]); }
    $docs = []; $stamp = 0;
    foreach ($st->fetchAll() as $r) { $docs[] = ['id' => $r['id'], 'data' => json_decode($r['data'], true)]; $stamp = max($stamp, (int) $r['at']); }
    json_out(['docs' => $docs, 'stamp' => $stamp . ':' . count($docs)]);
}
if ($a === 'get') {
    $c = hub_col(); $i = hub_id();
    if (!hub_can($c, $i, false)) json_out(['error' => 'not allowed'], 403);
    $st = hub_db()->prepare('SELECT data FROM hub_docs WHERE col = ? AND id = ?'); $st->execute([$c, $i]);
    $d = $st->fetchColumn();
    json_out(['exists' => $d !== false, 'data' => $d !== false ? json_decode($d, true) : null]);
}
if ($a === 'set') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['error' => 'POST only'], 405);
    $c = hub_col(); $i = hub_id();
    if (!hub_can($c, $i, true)) json_out(['error' => 'not allowed'], 403);
    $raw = (string) file_get_contents('php://input');
    $limit = hub_owner() ? 2000000 : ($c === 'analytics' ? 400000 : 200000);
    if (strlen($raw) > $limit) json_out(['error' => 'too big'], 413);
    $data = json_decode($raw, true); if (!is_array($data)) json_out(['error' => 'bad data'], 400);
    if (!hub_owner()) { if (too_many('hubw:' . $ip, 240, 3600)) json_out(['error' => 'slow down'], 429); note_fail('hubw:' . $ip); }
    hub_db()->prepare('INSERT OR REPLACE INTO hub_docs (col, id, data, at, by) VALUES (?, ?, ?, ?, ?)')->execute([$c, $i, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), now(), hub_owner() ? 'owner' : hub_me()]);
    // a new submission → push to the owner's phone (at most one every 10 minutes)
    if ($c === 'subs' && !hub_owner()) {
        $last = (int) (hub_db()->query("SELECT v FROM hub_kv WHERE k = 'push'")->fetchColumn() ?: 0);
        if (now() - $last > 600) {
            hub_db()->prepare("INSERT OR REPLACE INTO hub_kv (k, v) VALUES ('push', ?)")->execute([(string) now()]);
            json_out_then(['ok' => true], function () {
                try { require_once dirname(__DIR__) . '/demo-lib/push.php'; push_all('Community Hub: something new to check', 'A new request is waiting in the approval queue.', '/demo-admin/#hub'); } catch (Throwable $e) {}
            });
        }
    }
    json_out(['ok' => true]);
}
if ($a === 'ai') {   // the hub's writing helper (claude.use('sample'))
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['error' => 'POST only'], 405);
    if (!hub_owner()) { if (too_many('hubai:' . $ip, 15, 3600)) json_out(['error' => 'rate_limited'], 429); note_fail('hubai:' . $ip); }
    $in = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $prompt = mb_substr(trim((string) ($in['prompt'] ?? '')), 0, 6000);
    if ($prompt === '') json_out(['error' => 'empty'], 400);
    /* Fair use per organisation (owner 24 Nov): a monthly number of generations for each organisation (or visitor,
       while accounts are off), set in SMR Admin → Community Hub. The owner is never counted. */
    $who = preg_replace('/[^a-z0-9-]/', '', strtolower((string) ($in['org'] ?? ''))) ?: hub_me();
    $ukey = 'aiorg-' . date('Y-m') . '-' . substr(hash('sha256', $who), 0, 24);
    $cap = (int) (hub_kv('ai_org_cap') ?: 60);
    $used = (int) hub_kv($ukey);
    if (!hub_owner() && $used >= $cap) json_out(['error' => 'org_cap', 'cap' => $cap], 429);
    require_once dirname(__DIR__) . '/demo-lib/ai.php';
    $max = min(1600, max(300, (int) ($in['max'] ?? 900)));
    try { $t = ai_call([['type' => 'text', 'text' => $prompt]], $max); if (!hub_owner()) hub_kv_set($ukey, (string) ($used + 1)); json_out(['text' => $t, 'left' => hub_owner() ? null : max(0, $cap - $used - 1), 'cap' => $cap]); }
    catch (Throwable $e) { json_out(['error' => 'unavailable', 'msg' => $e->getMessage()], 503); }
}
if ($a === 'ai_cfg') {   // SMR Admin → Community Hub: fair-use cap per organisation per month
    if (!hub_owner()) json_out(['error' => 'owner only'], 403);
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') { if (!same_origin()) json_out(['error' => 'bad origin'], 403); $in = json_decode((string) file_get_contents('php://input'), true) ?: []; $c = max(0, min(10000, (int) ($in['cap'] ?? 60))); hub_kv_set('ai_org_cap', (string) $c); }
    $ym = date('Y-m'); $st = hub_db()->prepare("SELECT COUNT(*), COALESCE(SUM(CAST(v AS INTEGER)),0) FROM hub_kv WHERE k LIKE ?"); $st->execute(['aiorg-' . $ym . '-%']); [$orgs, $uses] = $st->fetch(PDO::FETCH_NUM);
    json_out(['cap' => (int) (hub_kv('ai_org_cap') ?: 60), 'orgs' => (int) $orgs, 'uses' => (int) $uses]);
}
/* ---------- short links with tap counts (built, switched off: window.HUB_SHORTLINKS in server.js) ----------
   Table hub_links (slug, url, owner = visitor/org id, title, taps, at). Taps are counted by hub/s.php, the redirect
   handler to put on the short domain (see CLAUDE.md). */
function sl_db(): PDO { $p = hub_db(); static $ok = false; if (!$ok) { $p->exec("CREATE TABLE IF NOT EXISTS hub_links (slug TEXT PRIMARY KEY, url TEXT NOT NULL, owner TEXT NOT NULL, title TEXT DEFAULT '', taps INTEGER DEFAULT 0, at INTEGER NOT NULL)"); $p->exec("CREATE TABLE IF NOT EXISTS hub_taps (slug TEXT, day TEXT, src TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (slug, day, src))"); $ok = true; } return $p; }
if (in_array($a, ['sl_list', 'sl_make', 'sl_del', 'sl_stats'], true)) {
    $me = hub_me(); $own = hub_owner(); $p = sl_db();
    if ($a === 'sl_list') { $st = $own && !empty($_GET['all']) ? $p->query('SELECT * FROM hub_links ORDER BY at DESC LIMIT 500') : $p->prepare('SELECT * FROM hub_links WHERE owner = ? ORDER BY at DESC'); if (!($own && !empty($_GET['all']))) $st->execute([$me]); json_out(['links' => $st->fetchAll(PDO::FETCH_ASSOC)]); }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['error' => 'POST only'], 405);
    $in = json_decode((string) file_get_contents('php://input'), true) ?: [];
    if ($a === 'sl_make') {
        if (!$own && too_many('hubsl:' . $ip, 30, 3600)) json_out(['error' => 'rate_limited'], 429); note_fail('hubsl:' . $ip);
        $url = trim((string) ($in['url'] ?? '')); if (!preg_match('#^https?://[^\s<>"]{3,1900}$#i', $url)) json_out(['error' => 'bad_url'], 400);
        $slug = strtolower(trim((string) ($in['slug'] ?? ''))); if ($slug === '') $slug = strtolower(substr(rand_token(6), 0, 6));
        if (!preg_match('/^[a-z0-9][a-z0-9-]{1,39}$/', $slug) || in_array($slug, ['admin', 'api', 'hub', 's', 'www'], true)) json_out(['error' => 'bad_slug'], 400);
        try { $p->prepare('INSERT INTO hub_links (slug, url, owner, title, taps, at) VALUES (?, ?, ?, ?, 0, ?)')->execute([$slug, $url, $me, mb_substr((string) ($in['title'] ?? ''), 0, 80), now()]); } catch (Throwable $e) { json_out(['error' => 'taken'], 409); }
        json_out(['ok' => true, 'slug' => $slug]);
    }
    $slug = strtolower((string) ($in['slug'] ?? '')); $st = $p->prepare('SELECT owner FROM hub_links WHERE slug = ?'); $st->execute([$slug]); $o = $st->fetchColumn();
    if ($o === false) json_out(['error' => 'not_found'], 404); if ($o !== $me && !$own) json_out(['error' => 'not yours'], 403);
    if ($a === 'sl_del') { $p->prepare('DELETE FROM hub_links WHERE slug = ?')->execute([$slug]); $p->prepare('DELETE FROM hub_taps WHERE slug = ?')->execute([$slug]); json_out(['ok' => true]); }
    $st = $p->prepare('SELECT day, src, n FROM hub_taps WHERE slug = ? ORDER BY day DESC LIMIT 400'); $st->execute([$slug]); json_out(['taps' => $st->fetchAll(PDO::FETCH_ASSOC)]);
}
if ($a === 'summary') {   // SMR Admin → Community Hub: what's waiting
    if (!hub_owner()) json_out(['error' => 'owner only'], 403);
    $done = [];
    foreach (hub_db()->query("SELECT id FROM hub_docs WHERE col = 'approved'")->fetchAll() as $r) $done[$r['id']] = 1;
    $items = [];
    foreach (hub_db()->query("SELECT id, data FROM hub_docs WHERE col = 'subs'")->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: [];
        foreach (($d['items'] ?? []) as $k => $it) { $sid = $r['id'] . '_' . $k; if (!isset($done[$sid])) $items[] = ['kind' => (string) ($it['kind'] ?? ''), 'at' => (int) (($it['at'] ?? 0) / 1000), 'title' => (string) ($it['data']['title'] ?? $it['data']['org'] ?? $it['data']['name'] ?? '')]; }
    }
    usort($items, function ($x, $y) { return $y['at'] - $x['at']; });
    $ai = ['on' => false];
    try { require_once dirname(__DIR__) . '/demo-lib/ai.php'; $ai = ai_public(); unset($ai['hint']); } catch (Throwable $e) {}
    json_out(['pending' => count($items), 'latest' => array_slice($items, 0, 8), 'appeals' => (int) hub_db()->query("SELECT COUNT(*) FROM hub_docs WHERE col = 'appeals'")->fetchColumn(), 'ai' => $ai]);
}
json_out(['error' => 'unknown action'], 404);
