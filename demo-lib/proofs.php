<?php
/* SMR Admin → Proofs: designs sent to a client for sign-off on a private link (/p/<token>).
   A proof set has items (roller banner, business card…); each item has versions (v1, v2…), each version has pages (pictures).
   The client checks each item, ticks the checklist, types their name and signs it off, or asks for changes.
   Every sign-off records the name, time, IP, browser and a fingerprint (sha256) of exactly what they approved.
   A new version after sign-off needs signing off again. Jobs can't be handed over until their proofs are signed off. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/push.php';

const PROOF_MAX_BYTES = 25 * 1024 * 1024;
const PROOF_EXTS = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
const PROOF_CHECKS = [
    'Spelling and grammar, every word',
    'Names, phone numbers, emails, website and social handles',
    'Prices, dates, times and addresses',
    'Logo, colours and photos',
    'Size, shape and layout (what goes where)',
];
const PROOF_STATEMENT = "I have checked this proof carefully, including spelling, grammar, names, numbers, contact details, prices, dates, colours, size and layout. I approve it exactly as shown for printing / production / publishing. I understand that once I sign it off, SMR is not responsible for any mistakes in it, and any changes after this point may be charged as extra work.";

function proofs_db(): PDO {
    static $done = false;
    $pdo = db();
    if ($done) return $pdo;
    $done = true;
    $pdo->exec("CREATE TABLE IF NOT EXISTS proof_sets (
        id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, job_id INTEGER DEFAULT 0, client TEXT NOT NULL, person TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '',
        area TEXT DEFAULT 'graphics', title TEXT NOT NULL, note TEXT DEFAULT '', sent_at INTEGER DEFAULT 0, views INTEGER DEFAULT 0, last_view INTEGER DEFAULT 0,
        n_chase INTEGER DEFAULT 0, archived INTEGER DEFAULT 0, created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS proof_items (
        id INTEGER PRIMARY KEY, set_id INTEGER NOT NULL, n INTEGER DEFAULT 1, name TEXT NOT NULL, kind TEXT DEFAULT '', status TEXT DEFAULT 'draft',
        cur_ver INTEGER DEFAULT 0, ok_ver INTEGER DEFAULT 0, created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS proof_vers (
        id INTEGER PRIMARY KEY, item_id INTEGER NOT NULL, v INTEGER NOT NULL, note TEXT DEFAULT '', files TEXT DEFAULT '[]', ready INTEGER DEFAULT 0, created INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS proof_acts (
        id INTEGER PRIMARY KEY, set_id INTEGER NOT NULL, item_id INTEGER DEFAULT 0, ver_id INTEGER DEFAULT 0, kind TEXT NOT NULL, name TEXT DEFAULT '', text TEXT DEFAULT '',
        ip TEXT DEFAULT '', ua TEXT DEFAULT '', hash TEXT DEFAULT '', at INTEGER)");
    add_col($pdo, 'proof_vers', 'checks', "TEXT DEFAULT ''");   // {auto:[..], ai:{at, issues, text, err}}
    $pdo->exec("CREATE INDEX IF NOT EXISTS proof_items_s ON proof_items(set_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS proof_vers_i ON proof_vers(item_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS proof_acts_s ON proof_acts(set_id)");
    return $pdo;
}
function proof_dir(array $s): string { $d = private_dir() . '/proofs/' . $s['token']; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function proof_set(int $id): ?array { $st = proofs_db()->prepare('SELECT * FROM proof_sets WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function proof_by_token(string $t): ?array {
    if (!preg_match('/^[A-Za-z0-9_-]{12,40}$/', $t)) return null;
    $st = proofs_db()->prepare('SELECT * FROM proof_sets WHERE token = ?'); $st->execute([$t]); return $st->fetch() ?: null;
}
function proof_items(int $setId): array { $st = proofs_db()->prepare('SELECT * FROM proof_items WHERE set_id = ? ORDER BY n, id'); $st->execute([$setId]); return $st->fetchAll(); }
function proof_item(int $id): ?array { $st = proofs_db()->prepare('SELECT * FROM proof_items WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function proof_vers(int $itemId): array { $st = proofs_db()->prepare('SELECT * FROM proof_vers WHERE item_id = ? AND ready = 1 ORDER BY v'); $st->execute([$itemId]); return $st->fetchAll(); }
function proof_ver(int $id): ?array { $st = proofs_db()->prepare('SELECT * FROM proof_vers WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function proof_host(): string {
    $host = preg_replace('/^www\./', '', preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
    if ($host === '') $host = 'smrgraphics.co.uk';
    return (preg_match('/^(127\.|localhost)/', $host) ? 'http' : 'https') . '://' . $host;
}
function proof_url(array $s): string { return proof_host() . '/p/' . $s['token']; }
function proof_first(array $s): string { $n = trim((string) ($s['person'] !== '' ? $s['person'] : $s['client'])); return $n !== '' ? preg_split('/[\s,(]+/', $n)[0] : 'there'; }
function proof_ev(int $setId, string $kind, string $text = '', int $item = 0, int $ver = 0, string $name = '', string $hash = ''): void {
    proofs_db()->prepare('INSERT INTO proof_acts (set_id, item_id, ver_id, kind, name, text, ip, ua, hash, at) VALUES (?,?,?,?,?,?,?,?,?,?)')
        ->execute([$setId, $item, $ver, $kind, mb_substr($name, 0, 120), mb_substr($text, 0, 4000), in_array($kind, ['approve', 'changes'], true) ? client_ip() : '', in_array($kind, ['approve', 'changes'], true) ? mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300) : '', $hash, now()]);
}
/* Fingerprint of exactly what was signed off: every page's sha256 in order. */
function proof_ver_hash(array $v): string { $f = json_decode($v['files'], true) ?: []; return hash('sha256', implode('|', array_column($f, 'sha'))); }
function proof_push(string $t, string $b, string $tag): void { try { push_all($t, $b, '/demo-admin/#proofs', $tag); } catch (Throwable $e) {} }

/* Summary of a set: per-item status and the totals. */
function proof_state(array $s): array {
    $items = proof_items((int) $s['id']);
    $n = ['total' => 0, 'ok' => 0, 'changes' => 0, 'waiting' => 0, 'draft' => 0];
    foreach ($items as $it) { $n['total']++; $n[$it['status'] === 'approved' ? 'ok' : ($it['status'] === 'changes' ? 'changes' : ($it['status'] === 'waiting' ? 'waiting' : 'draft'))]++; }
    $state = !$n['total'] ? 'empty' : ($n['ok'] === $n['total'] ? 'done' : ($n['changes'] ? 'changes' : ($n['waiting'] ? ((int) $s['sent_at'] ? 'waiting' : 'ready') : 'draft')));
    return ['n' => $n, 'state' => $state];
}
/* Proofs linked to a job: [needed, all signed off, sets]. */
function proof_for_job(int $jobId): array {
    if (!$jobId) return ['sets' => 0, 'done' => true, 'open' => 0];
    $st = proofs_db()->prepare('SELECT * FROM proof_sets WHERE job_id = ? AND archived = 0'); $st->execute([$jobId]);
    $sets = $st->fetchAll(); $open = 0;
    foreach ($sets as $s) { $p = proof_state($s); $open += $p['n']['total'] - $p['n']['ok']; }
    return ['sets' => count($sets), 'done' => $open === 0, 'open' => $open];
}

/* Client-side shape (also used by the admin page). */
function proof_public(array $s, bool $owner = false): array {
    $items = [];
    foreach (proof_items((int) $s['id']) as $it) {
        $vers = [];
        foreach (proof_vers((int) $it['id']) as $v) {
            $pages = array_map(function ($f, $i) use ($s, $v) { return ['src' => '/proofs/f.php?k=' . $s['token'] . '&v=' . $v['id'] . '&i=' . $i, 'w' => (int) $f['w'], 'h' => (int) $f['h']]; }, json_decode($v['files'], true) ?: [], array_keys(json_decode($v['files'], true) ?: []));
            $vers[] = ['id' => (int) $v['id'], 'v' => (int) $v['v'], 'note' => $v['note'], 'at' => (int) $v['created'], 'pages' => $pages] + ($owner ? ['checks' => json_decode((string) ($v['checks'] ?? ''), true) ?: null] : []);
        }
        if (!$vers && !$owner) continue;
        $acts = proofs_db()->prepare("SELECT kind, name, text, at, ver_id, hash FROM proof_acts WHERE item_id = ? AND kind IN ('approve','changes') ORDER BY at");
        $acts->execute([(int) $it['id']]);
        $items[] = ['id' => (int) $it['id'], 'name' => $it['name'], 'kind' => $it['kind'], 'status' => $it['status'], 'cur' => (int) $it['cur_ver'], 'ok' => (int) $it['ok_ver'],
            'vers' => $vers, 'acts' => array_map(function ($a) { return ['kind' => $a['kind'], 'name' => $a['name'], 'text' => $a['text'], 'at' => (int) $a['at'], 'ver' => (int) $a['ver_id'], 'ref' => strtoupper(substr($a['hash'], 0, 10))]; }, $acts->fetchAll())];
    }
    return ['token' => $s['token'], 'client' => $s['client'], 'title' => $s['title'], 'note' => $s['note'], 'items' => $items, 'checks' => PROOF_CHECKS, 'statement' => PROOF_STATEMENT];
}

/* ---------- reminders (from pl_tick via jobs_tick) ---------- */
function proofs_tick(): array {
    $now = now(); $log = [];
    foreach (proofs_db()->query('SELECT * FROM proof_sets WHERE archived = 0 AND sent_at > 0')->fetchAll() as $s) {
        $p = proof_state($s);
        if ($p['state'] !== 'waiting') continue;
        $since = max((int) $s['sent_at'], (int) $s['n_chase']);
        if ($now - $since < 2 * 86400) continue;
        proofs_db()->prepare('UPDATE proof_sets SET n_chase = ? WHERE id = ?')->execute([$now, (int) $s['id']]);
        proof_push('Proof not signed off: ' . $s['client'], $s['title'] . ' · ' . $p['n']['waiting'] . ' item' . ($p['n']['waiting'] > 1 ? 's' : '') . ' waiting. Chase them: nothing gets made until they sign it off.', 'proof-chase-' . $s['id']);
        $log[] = 'proof chase ' . $s['id'];
    }
    return $log;
}

/* AI proof-read of one version (runs after the upload response, so you never wait). Quiet: results only show in Proofs. */
function proof_ai_check(array $s, array $it, array $v): void {
    require_once __DIR__ . '/ai.php';
    if (ai_key() === '') return;
    $chk = json_decode((string) ($v['checks'] ?? ''), true) ?: [];
    $paths = array_map(function ($f) use ($s) { return proof_dir($s) . '/' . basename($f['f']); }, json_decode($v['files'], true) ?: []);
    $last = proofs_db()->prepare("SELECT text FROM proof_acts WHERE item_id = ? AND kind = 'changes' ORDER BY at DESC LIMIT 1"); $last->execute([(int) $it['id']]);
    try {
        $r = ai_check_design($paths, ['client' => $s['client'], 'item' => $it['name'], 'kind' => $it['kind'], 'phone' => $s['phone'], 'email' => $s['email'], 'changes' => (int) $v['v'] > 1 ? (string) $last->fetchColumn() : '']);
        $chk['ai'] = ['at' => now(), 'issues' => $r['issues'], 'text' => mb_substr($r['text'], 0, 3000)];
    } catch (Throwable $e) { $chk['ai'] = ['at' => now(), 'err' => $e->getMessage(), 'issues' => []]; }
    proofs_db()->prepare('UPDATE proof_vers SET checks = ? WHERE id = ?')->execute([json_encode($chk), (int) $v['id']]);
}
