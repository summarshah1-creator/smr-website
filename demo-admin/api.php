<?php
/* Demo Manager admin API. Every action except login needs the admin cookie + CSRF header. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);

$a = $_GET['a'] ?? '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_out(['error' => 'POST only'], 405);
if (!same_origin()) json_out(['error' => 'Bad origin'], 403);
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0;
$in = $isJson ? (json_decode((string) file_get_contents('php://input'), true) ?: []) : $_POST;
$ipKey = 'admin:' . hash('sha256', client_ip());

/* ---------- login (PIN) ---------- */
if ($a === 'login') {
    if (too_many($ipKey, 6, 900) || too_many('admin:all', 20, 3600)) json_out(['error' => 'Too many attempts. Wait 15 minutes and try again.'], 429);
    $pin = preg_replace('/\s/', '', (string) ($in['pin'] ?? ''));
    if ($pin === '' || !password_verify($pin, admin_hash())) { note_fail($ipKey); note_fail('admin:all'); usleep(400000); json_out(['error' => 'Wrong PIN.'], 403); }
    json_out(['ok' => true] + admin_login_cookie());
}

$tok = admin_token();
if (!$tok) json_out(['error' => 'Please log in again.', 'login' => true], 401);
if (!hash_equals($tok['csrf'], (string) ($_SERVER['HTTP_X_CSRF'] ?? ''))) json_out(['error' => 'Please reload the page.'], 403);

/* ---------- helpers ---------- */
function link_url(array $l): string {
    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
    $host = preg_replace('/^www\./', '', $host);
    $local = preg_match('/^(127\.|localhost)/', $host);
    return ($local ? 'http' : 'https') . '://' . $host . link_path($l);
}
function link_row(array $l): array {
    [$status, $left] = link_status($l);
    $max = $l['mode'] === 'single' ? 1 : ($l['mode'] === 'limited' ? (int) $l['max_uses'] : null);
    $expiry = 0;
    if ($l['mode'] === 'shared') $expiry = (int) $l['expires_at'];
    else {
        $st = db()->prepare('SELECT MAX(expires_at) FROM sessions WHERE link_id = ?');
        $st->execute([$l['id']]);
        $expiry = (int) $st->fetchColumn();
    }
    $st2 = db()->prepare('SELECT COUNT(*) AS n, MAX(last_seen) AS seen, (SELECT last_app FROM sessions WHERE link_id = ? ORDER BY last_seen DESC LIMIT 1) AS app FROM sessions WHERE link_id = ?');
    $st2->execute([$l['id'], $l['id']]);
    $ss = $st2->fetch() ?: [];
    return ['id' => (int) $l['id'], 'label' => $l['label'], 'views' => (int) $l['views'], 'last_view' => (int) $l['last_view'], 'devices' => (int) ($ss['n'] ?? 0), 'last_seen' => (int) ($ss['seen'] ?? 0), 'last_app' => (string) ($ss['app'] ?? ''), 'url' => link_url($l), 'pin' => $l['pin'], 'apps' => link_apps($l),
        'mode' => $l['mode'], 'max_uses' => $max, 'uses' => (int) $l['uses'], 'duration' => (int) $l['duration'], 'tips' => (int) $l['tips'], 'direct' => (int) ($l['direct'] ?? 0), 'deck' => (int) ($l['deck'] ?? 1), 'open' => (int) $l['duration'] === 0 ? 1 : 0,
        'created_at' => (int) $l['created_at'], 'activated_at' => (int) $l['activated_at'], 'expires_at' => $expiry,
        'status' => $status, 'left' => $left];
}
function get_link(array $in): array {
    $st = db()->prepare('SELECT * FROM links WHERE id = ?');
    $st->execute([(int) ($in['id'] ?? 0)]);
    $l = $st->fetch();
    if (!$l) json_out(['error' => 'Link not found.'], 404);
    return $l;
}
function slugify(string $s): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return substr($s !== '' ? $s : 'demo', 0, 32);
}
function rrmdir(string $dir): void {
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $f) { $f->isDir() && !$f->isLink() ? @rmdir($f->getPathname()) : @unlink($f->getPathname()); }
    @rmdir($dir);
}
function upload_error(array $f): ?string {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) return null;
    $e = $f['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($e === UPLOAD_ERR_INI_SIZE || $e === UPLOAD_ERR_FORM_SIZE) return 'That file is bigger than the server allows (' . ini_get('upload_max_filesize') . ').';
    if ($e === UPLOAD_ERR_NO_FILE) return 'Choose a file first.';
    return 'The upload did not finish. Please try again.';
}

/* Safely unpack a deployable web build. The folder holding the shallowest index.html becomes the app root. */
function extract_build(string $zipPath, string $dest): array {
    if (!class_exists('ZipArchive')) throw new RuntimeException('ZIP support is not enabled on this server.');
    $z = new ZipArchive();
    if ($z->open($zipPath) !== true) throw new RuntimeException('That file is not a valid ZIP.');
    if ($z->numFiles > MAX_ZIP_FILES) throw new RuntimeException('The ZIP has too many files.');
    $danger = '/\.(php\d?|phtml|phar|pht|cgi|pl|py|sh|bash|asp|aspx|jsp|shtml|htaccess|htpasswd|ini|exe|dll|so|bat|cmd)$/i';
    $entries = []; $index = null; $declared = 0;
    for ($i = 0; $i < $z->numFiles; $i++) {
        $st = $z->statIndex($i);
        $name = str_replace('\\', '/', $st['name']);
        if ($name === '' || substr($name, -1) === '/') continue;
        if (strpos($name, '__MACOSX/') === 0 || basename($name) === '.DS_Store') continue;
        if ($name[0] === '/' || strpos($name, ':') !== false || preg_match('#(^|/)\.\.(/|$)#', $name) || strpos($name, "\0") !== false) {
            throw new RuntimeException('The ZIP contains an unsafe file path.');
        }
        if ($z->getExternalAttributesIndex($i, $os, $attr) && $os === ZipArchive::OPSYS_UNIX && ((($attr >> 16) & 0170000) === 0120000)) {
            throw new RuntimeException('The ZIP contains a symbolic link, which is not allowed.');
        }
        if (preg_match($danger, $name) || preg_match('#(^|/)\.ht#i', $name)) throw new RuntimeException('The ZIP contains a server file (' . basename($name) . '). Only built website files are allowed.');
        $declared += (int) $st['size'];
        if ($declared > MAX_ZIP_BYTES) throw new RuntimeException('The unpacked app is too large.');
        $entries[$i] = $name;
        if (strtolower(basename($name)) === 'index.html') {
            $depth = substr_count($name, '/');
            if ($index === null || $depth < substr_count($index, '/')) $index = $name;
        }
    }
    if ($index === null) throw new RuntimeException('No index.html found. Upload the built web folder (for Flutter: build/web).');
    $prefix = strpos($index, '/') === false ? '' : substr($index, 0, strrpos($index, '/') + 1);
    if (!@mkdir($dest, 0750, true) && !is_dir($dest)) throw new RuntimeException('Could not create the demo folder.');
    $written = 0; $count = 0; $skipped = [];
    foreach ($entries as $i => $name) {
        if ($prefix !== '' && strpos($name, $prefix) !== 0) { $skipped[] = $name; continue; }
        $rel = substr($name, strlen($prefix));
        $segs = explode('/', $rel);
        $hidden = false;
        foreach ($segs as $sg) if ($sg === '' || $sg[0] === '.') $hidden = true;
        $base = strtolower(basename($rel));
        if ($hidden || !mime_for($rel) || preg_match('/\.map$/', $base) || in_array($base, ['sw.js', 'service-worker.js', 'flutter_service_worker.js'], true)) { $skipped[] = $rel; continue; }
        $target = $dest . '/' . $rel;
        if (!is_dir(dirname($target)) && !@mkdir(dirname($target), 0750, true)) throw new RuntimeException('Could not write ' . $rel);
        $in = $z->getStream($z->getNameIndex($i));
        $out = fopen($target, 'wb');
        if (!$in || !$out) throw new RuntimeException('Could not unpack ' . $rel);
        while (!feof($in)) {
            $buf = fread($in, 65536);
            $written += strlen($buf);
            if ($written > MAX_ZIP_BYTES) { fclose($in); fclose($out); throw new RuntimeException('The unpacked app is too large.'); }
            fwrite($out, $buf);
        }
        fclose($in); fclose($out);
        $count++;
    }
    $z->close();
    if (!is_file($dest . '/index.html')) throw new RuntimeException('No index.html at the top of the app.');
    return ['files' => $count, 'skipped' => count($skipped)];
}

/* ---------- planner: tasks, meetings, prep, reminders (demo-lib/planner.php) ---------- */
if (strpos($a, 'pl_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/planner.php';
    $pdo = pl_db(); $now = now();
    $out = function (array $extra = []) use ($now) {
        $rows = array_map(function ($r) use ($now) { return pl_row($r, $now); }, pl_all(true));
        $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
        $base = (preg_match('/^(127\.|localhost)/', $host) ? 'http' : 'https') . '://' . $host . '/demo-admin/feed.php?k=' . pl_key();
        json_out_then($extra + ['ok' => true, 'items' => $rows, 'sum' => pl_summary($now), 'cfg' => pl_cfg(), 'feed' => $base, 'what' => PL_WHAT, 'areas' => PL_AREAS], function () { pl_tick(); });
    };
    $str = function ($k, $max = 300) use (&$in) { return mb_substr(trim((string) ($in[$k] ?? '')), 0, $max); };
    $getRow = function ($id) use ($pdo) { $st = $pdo->prepare('SELECT * FROM pl_items WHERE id = ?'); $st->execute([(int) $id]); $r = $st->fetch(); if (!$r) json_out(['error' => 'Not found.'], 404); return $r; };
    switch ($a) {
    case 'pl_list': $out();
    case 'pl_save':
        $kind = ($in['kind'] ?? 'task') === 'event' ? 'event' : 'task';
        $title = $str('title', 200);
        if ($title === '') json_out(['error' => 'Give it a title.'], 400);
        $f = ['kind' => $kind, 'title' => $title, 'person' => $str('person', 120), 'phone' => preg_replace('/[^0-9+ ]/', '', $str('phone', 30)), 'platform' => $str('platform', 60),
            'area' => isset(PL_AREAS[$in['area'] ?? '']) ? $in['area'] : 'digital', 'wait' => in_array($in['wait'] ?? '', ['me', 'them', 'none'], true) ? $in['wait'] : 'me',
            'what' => isset(PL_WHAT[$in['what'] ?? '']) ? $in['what'] : 'other', 'pri' => max(1, min(3, (int) ($in['pri'] ?? 2))),
            'due' => max(0, (int) ($in['due'] ?? 0)), 'due_t' => (int) !empty($in['due_t']), 'start' => max(0, (int) ($in['start'] ?? 0)), 'end' => max(0, (int) ($in['end'] ?? 0)),
            'all_day' => (int) !empty($in['all_day']), 'location' => $str('location', 160), 'notes' => $str('notes', 4000), 'owes' => (int) !empty($in['owes']), 'owes_amt' => $str('owes_amt', 30),
            'grp' => $str('grp', 60), 'event_id' => max(0, (int) ($in['event_id'] ?? 0)), 'updated' => $now];
        if ($kind === 'event' && !$f['start']) json_out(['error' => 'Pick a day for the meeting.'], 400);
        if ($kind === 'event' && $f['end'] < $f['start']) $f['end'] = $f['start'] + 3600;
        $id = (int) ($in['id'] ?? 0); $askPrep = false;
        if ($id) {
            $old = $getRow($id);
            $reset = ((int) $old['due'] !== $f['due'] || (int) $old['start'] !== $f['start']) ? ', n_due = 0, n_over = 0, n_overc = 0, n_day = 0, n_soon = 0, snooze = 0' : '';
            $sets = implode(', ', array_map(function ($k) { return $k . ' = ?'; }, array_keys($f)));
            $pdo->prepare("UPDATE pl_items SET $sets$reset WHERE id = ?")->execute(array_merge(array_values($f), [$id]));
            $askPrep = $kind === 'event' && !(int) $old['prep_asked'];
        } else {
            $f['created'] = $now;
            $pdo->prepare('INSERT INTO pl_items (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f));
            $id = (int) $pdo->lastInsertId(); $askPrep = $kind === 'event';
        }
        $out(['id' => $id, 'ask_prep' => $askPrep]);
    case 'pl_done':
        $r = $getRow($in['id'] ?? 0);
        $undo = !empty($in['undo']);
        $pdo->prepare('UPDATE pl_items SET status = ?, done_at = ?, updated = ? WHERE id = ?')->execute([$undo ? 'open' : 'done', $undo ? 0 : $now, $now, (int) $r['id']]);
        // Ticking off "waiting on me" with a follow-up date set creates the chase
        if (!$undo && !empty($in['chase']) && (int) $in['chase'] > $now) {
            $pdo->prepare('INSERT INTO pl_items (kind, title, person, phone, platform, area, wait, what, pri, due, notes, grp, created, updated) VALUES (\'task\',?,?,?,?,?,\'them\',?,?,?,?,?,?,?)')
                ->execute(['Chase: ' . preg_replace('/^Chase: /', '', $r['title']), $r['person'], $r['phone'], $r['platform'], $r['area'], 'reply', (int) $r['pri'], (int) $in['chase'], 'Sent ' . date('j M', $now) . '. ' . $r['notes'], $r['grp'], $now, $now]);
        }
        $out();
    case 'pl_snooze':
        $r = $getRow($in['id'] ?? 0);
        $until = max($now + 600, (int) ($in['until'] ?? 0));
        $pdo->prepare('UPDATE pl_items SET snooze = ?, n_due = 0, n_over = 0, n_overc = 0, updated = ? WHERE id = ?')->execute([$until, $now, (int) $r['id']]);
        $out();
    case 'pl_del':
        $r = $getRow($in['id'] ?? 0);
        $pdo->prepare('DELETE FROM pl_items WHERE id = ?')->execute([(int) $r['id']]);
        if ($r['kind'] === 'event') $pdo->prepare('UPDATE pl_items SET event_id = 0 WHERE event_id = ?')->execute([(int) $r['id']]);
        $out();
    case 'pl_prep':
        $e = $getRow($in['event_id'] ?? 0);
        if ($e['kind'] !== 'event') json_out(['error' => 'Not a meeting.'], 400);
        $pdo->prepare('UPDATE pl_items SET prep_asked = 1 WHERE id = ?')->execute([(int) $e['id']]);
        $s = (int) $e['start'];
        // Prep is due at midday the day before; if that has passed, two hours from now (but before the meeting)
        $due = pl_day0($s) - 12 * 3600;
        if ($due < $now + 1800) $due = min($now + 7200, max($now + 600, $s - 3600));
        $ins = $pdo->prepare('INSERT INTO pl_items (kind, title, person, phone, area, wait, what, pri, due, due_t, notes, grp, event_id, created, updated) VALUES (\'task\',?,?,?,?,\'me\',?,1,?,1,?,?,?,?,?)');
        $n = 0;
        foreach ((array) ($in['items'] ?? []) as $it) {
            $t = mb_substr(trim((string) ($it['title'] ?? '')), 0, 160); if ($t === '') continue;
            $w = isset(PL_WHAT[$it['what'] ?? '']) ? $it['what'] : 'other';
            $ins->execute([$t, $e['person'], $e['phone'], $e['area'], $w, $due, 'Prep for: ' . $e['title'] . ' (' . ((int) $e['all_day'] ? date('D j M', $s) : date('D j M H:i', $s)) . ')', $e['grp'], (int) $e['id'], $now, $now]);
            $n++;
        }
        $out(['prep_added' => $n]);
    case 'pl_cfg':
        $c = pl_cfg();
        foreach (['brief', 'evening', 'quiet_from', 'quiet_to'] as $k) if (isset($in[$k]) && preg_match('/^\d{1,2}:\d{2}$/', (string) $in[$k])) $c[$k] = (string) $in[$k];
        foreach (['push', 'sunday'] as $k) if (isset($in[$k])) $c[$k] = (int) !empty($in[$k]);
        pl_set('cfg', json_encode($c));
        $out();
    case 'pl_newkey':
        pl_set('feed_key', rand_token(18));
        $out();
    case 'pl_notes':
        json_out(['ok' => true, 'notes' => pl_notes()]);
    case 'pl_note_add':
        $t = $str('t', 160);
        if ($t === '') json_out(['error' => 'Write a note first.'], 400);
        $n = pl_notes();
        if (count($n) >= 30) json_out(['error' => 'Too many notes. Tick some off first.'], 400);
        $n[] = ['id' => 'n' . $now . substr(rand_token(6), 0, 4), 't' => $t, 'c' => $now];
        pl_notes_save($n);
        json_out(['ok' => true, 'notes' => $n]);
    case 'pl_note_del':
        $id = $str('id', 40);
        $n = array_values(array_filter(pl_notes(), function ($x) use ($id) { return ($x['id'] ?? '') !== $id; }));
        pl_notes_save($n);
        json_out(['ok' => true, 'notes' => $n]);
    case 'pl_tick':
        json_out(['ok' => true, 'log' => pl_tick(true)]);
    }
    json_out(['error' => 'Unknown action'], 400);
}

/* ---------- proofs: client sign-off links (demo-lib/proofs.php) ---------- */
if (strpos($a, 'pf_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/proofs.php';
    require_once dirname(__DIR__) . '/demo-lib/jobs.php';
    require_once dirname(__DIR__) . '/demo-lib/ai.php';
    $pdo = proofs_db(); $now = now();
    $str = function ($k, $max = 300) use (&$in) { return mb_substr(trim((string) ($in[$k] ?? '')), 0, $max); };
    $set = function () use ($in) { $s = proof_set((int) ($in['id'] ?? 0)); if (!$s) json_out(['error' => 'Proof not found.'], 404); return $s; };
    $msg = function (array $s): string {
        return 'Hi ' . proof_first($s) . ', your proof for ' . $s['title'] . " is ready to check:\n" . proof_url($s)
            . "\n\nPlease go through every item carefully (spelling, numbers, contact details, colours, layout). If it's all right, sign it off on the page; if anything needs changing, tap Request changes and tell me what. Nothing goes to print until it's signed off.\n\nSummar, SMR";
    };
    $row = function (array $s) use ($msg, $now) {
        $p = proof_state($s); $pub = proof_public($s, true);
        $thumb = '';
        foreach ($pub['items'] as $it) if ($it['vers']) { $thumb = end($it['vers'])['pages'][0]['src'] ?? ''; break; }
        $job = (int) $s['job_id'] ? job_by_id((int) $s['job_id']) : null;
        $acts = proofs_db()->prepare('SELECT kind, name, text, at, item_id FROM proof_acts WHERE set_id = ? ORDER BY at DESC LIMIT 40'); $acts->execute([(int) $s['id']]);
        return ['id' => (int) $s['id'], 'token' => $s['token'], 'url' => proof_url($s), 'client' => $s['client'], 'person' => $s['person'], 'phone' => $s['phone'], 'email' => $s['email'],
            'area' => $s['area'], 'title' => $s['title'], 'note' => $s['note'], 'job_id' => (int) $s['job_id'], 'job' => $job ? $job['title'] : '', 'sent_at' => (int) $s['sent_at'],
            'views' => (int) $s['views'], 'last_view' => (int) $s['last_view'], 'archived' => (int) $s['archived'], 'created' => (int) $s['created'], 'updated' => (int) $s['updated'],
            'state' => $p['state'], 'n' => $p['n'], 'thumb' => $thumb, 'items' => $pub['items'], 'msg' => $msg($s), 'acts' => $acts->fetchAll()];
    };
    $out = function (array $extra = [], $after = null) use ($pdo, $row) {
        $rows = array_map($row, $pdo->query('SELECT * FROM proof_sets ORDER BY archived, updated DESC LIMIT 200')->fetchAll());
        $jobs = array_map(function ($j) { return ['id' => (int) $j['id'], 'title' => $j['title'], 'client' => $j['client'], 'person' => $j['person'], 'phone' => $j['phone'], 'email' => $j['email'], 'area' => $j['area']]; },
            jobs_db()->query("SELECT * FROM jobs WHERE status IN ('draft','sent','agreed') ORDER BY updated DESC LIMIT 60")->fetchAll());
        $sum = ['waiting' => 0, 'changes' => 0, 'ready' => 0, 'done' => 0];
        foreach ($rows as $r) if (!$r['archived'] && isset($sum[$r['state']])) $sum[$r['state']]++;
        $data = $extra + ['ok' => true, 'sets' => $rows, 'jobs' => $jobs, 'sum' => $sum, 'checks' => PROOF_CHECKS, 'mail' => (bool) mail_cfg(), 'ai' => ai_public()];
        if ($after) json_out_then($data, $after); else json_out($data);
    };
    switch ($a) {
    case 'pf_list': $out();
    case 'pf_save':
        $f = ['client' => $str('client', 120), 'person' => $str('person', 120), 'phone' => preg_replace('/[^0-9+ ]/', '', $str('phone', 30)), 'email' => strtolower($str('email', 160)),
            'area' => in_array($in['area'] ?? '', ['graphics', 'digital', 'marketing', 'plates'], true) ? $in['area'] : 'graphics', 'title' => $str('title', 160), 'note' => $str('note', 1500),
            'job_id' => max(0, (int) ($in['job_id'] ?? 0)), 'updated' => $now];
        if ($f['client'] === '') json_out(['error' => 'Who is the proof for?'], 400);
        if ($f['title'] === '') json_out(['error' => 'Give it a name, e.g. "Shop sign + menu boards".'], 400);
        if ($f['email'] !== '' && !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) json_out(['error' => 'That email address doesn\'t look right.'], 400);
        $id = (int) ($in['id'] ?? 0);
        if ($id) { $set(); $pdo->prepare('UPDATE proof_sets SET ' . implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($f))) . ' WHERE id = ?')->execute(array_merge(array_values($f), [$id])); }
        else {
            do { $tok = rand_token(12); } while (proof_by_token($tok));
            $f += ['token' => $tok, 'created' => $now];
            $pdo->prepare('INSERT INTO proof_sets (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f));
            $id = (int) $pdo->lastInsertId();
            proof_ev($id, 'note', 'Proof created');
        }
        $out(['id' => $id]);
    case 'pf_item':   // add or rename an item
        $s = $set(); $iid = (int) ($in['item'] ?? 0);
        $name = $str('name', 120); if ($name === '') json_out(['error' => 'Name the item, e.g. "Roller banner".'], 400);
        if ($iid) { $pdo->prepare('UPDATE proof_items SET name = ?, kind = ?, updated = ? WHERE id = ? AND set_id = ?')->execute([$name, $str('kind', 80), $now, $iid, (int) $s['id']]); }
        else {
            $n = (int) $pdo->query('SELECT COALESCE(MAX(n),0) FROM proof_items WHERE set_id = ' . (int) $s['id'])->fetchColumn() + 1;
            $pdo->prepare('INSERT INTO proof_items (set_id, n, name, kind, created, updated) VALUES (?,?,?,?,?,?)')->execute([(int) $s['id'], $n, $name, $str('kind', 80), $now, $now]);
            $iid = (int) $pdo->lastInsertId();
        }
        $pdo->prepare('UPDATE proof_sets SET updated = ? WHERE id = ?')->execute([$now, (int) $s['id']]);
        $out(['item' => $iid]);
    case 'pf_item_del':
        $s = $set(); $it = proof_item((int) ($in['item'] ?? 0));
        if (!$it || (int) $it['set_id'] !== (int) $s['id']) json_out(['error' => 'Not found.'], 404);
        foreach ($pdo->query('SELECT * FROM proof_vers WHERE item_id = ' . (int) $it['id'])->fetchAll() as $v) foreach (json_decode($v['files'], true) ?: [] as $f) @unlink(proof_dir($s) . '/' . $f['f']);
        $pdo->prepare('DELETE FROM proof_vers WHERE item_id = ?')->execute([(int) $it['id']]);
        $pdo->prepare('DELETE FROM proof_items WHERE id = ?')->execute([(int) $it['id']]);
        $out();
    case 'pf_ver_start':
        $s = $set(); $it = proof_item((int) ($in['item'] ?? 0));
        if (!$it || (int) $it['set_id'] !== (int) $s['id']) json_out(['error' => 'Not found.'], 404);
        $pdo->prepare('DELETE FROM proof_vers WHERE item_id = ? AND ready = 0')->execute([(int) $it['id']]);
        $v = (int) $pdo->query('SELECT COALESCE(MAX(v),0) FROM proof_vers WHERE item_id = ' . (int) $it['id'])->fetchColumn() + 1;
        $pdo->prepare('INSERT INTO proof_vers (item_id, v, note, created) VALUES (?,?,?,?)')->execute([(int) $it['id'], $v, $str('note', 600), $now]);
        json_out(['ok' => true, 'ver' => (int) $pdo->lastInsertId(), 'v' => $v]);
    case 'pf_ver_up':   // one page (multipart: file + ver + i + w + h)
        $s = $set(); $v = proof_ver((int) ($_POST['ver'] ?? 0));
        $it = $v ? proof_item((int) $v['item_id']) : null;
        if (!$v || !$it || (int) $it['set_id'] !== (int) $s['id'] || (int) $v['ready']) json_out(['error' => 'Upload not found. Start again.'], 404);
        $up = $_FILES['file'] ?? null;
        if (!$up || $up['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'The picture didn\'t upload. Try again.'], 400);
        if ($up['size'] > PROOF_MAX_BYTES) json_out(['error' => 'That picture is over 25 MB.'], 400);
        $mime = (string) (function_exists('mime_content_type') ? mime_content_type($up['tmp_name']) : '');
        $ext = array_search($mime, PROOF_EXTS, true) ?: strtolower(pathinfo((string) $up['name'], PATHINFO_EXTENSION));
        if (!isset(PROOF_EXTS[$ext])) json_out(['error' => 'Use JPG, PNG or WebP pictures (PDFs are turned into pictures for you).'], 400);
        $i = max(0, min(60, (int) ($_POST['i'] ?? 0)));
        $name = 'v' . $v['id'] . '-' . $i . '-' . bin2hex(random_bytes(4)) . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
        if (!move_uploaded_file($up['tmp_name'], proof_dir($s) . '/' . $name)) json_out(['error' => 'Could not save the picture.'], 500);
        $files = json_decode($v['files'], true) ?: [];
        $files[$i] = ['f' => $name, 'w' => (int) ($_POST['w'] ?? 0), 'h' => (int) ($_POST['h'] ?? 0), 'sha' => hash_file('sha256', proof_dir($s) . '/' . $name)];
        ksort($files);
        $pdo->prepare('UPDATE proof_vers SET files = ? WHERE id = ?')->execute([json_encode(array_values($files)), (int) $v['id']]);
        json_out(['ok' => true]);
    case 'pf_ver_done':
        $s = $set(); $v = proof_ver((int) ($in['ver'] ?? 0));
        $it = $v ? proof_item((int) $v['item_id']) : null;
        if (!$v || !$it || (int) $it['set_id'] !== (int) $s['id']) json_out(['error' => 'Upload not found.'], 404);
        if (!json_decode($v['files'], true)) json_out(['error' => 'No pictures were uploaded.'], 400);
        $auto = array_slice(array_values(array_filter((array) ($in['auto'] ?? []), 'is_string')), 0, 12);
        $pdo->prepare('UPDATE proof_vers SET ready = 1, checks = ? WHERE id = ?')->execute([json_encode(['auto' => array_map(function ($x) { return mb_substr($x, 0, 200); }, $auto)]), (int) $v['id']]);
        $pdo->prepare("UPDATE proof_items SET cur_ver = ?, status = 'waiting', updated = ? WHERE id = ?")->execute([(int) $v['id'], $now, (int) $it['id']]);
        $pdo->prepare('UPDATE proof_sets SET updated = ? WHERE id = ?')->execute([$now, (int) $s['id']]);
        proof_ev((int) $s['id'], 'note', 'Version ' . $v['v'] . ' of ' . $it['name'] . ' added' . ($it['status'] === 'approved' ? ' (was signed off: needs signing off again)' : ''), (int) $it['id'], (int) $v['id']);
        $vNow = proof_ver((int) $v['id']);
        $out(['checking' => ai_key() !== ''], function () use ($s, $it, $vNow) { proof_ai_check($s, $it, $vNow); });
    case 'pf_check':   // run the AI proof-read again on an item's latest version
        $s = $set(); $it = proof_item((int) ($in['item'] ?? 0));
        if (!$it || (int) $it['set_id'] !== (int) $s['id'] || !(int) $it['cur_ver']) json_out(['error' => 'Nothing to check.'], 404);
        proof_ai_check($s, $it, proof_ver((int) $it['cur_ver']));
        $out();
    case 'pf_ai':   // AI key + monthly limit
        if (array_key_exists('key', $in)) {
            $k = trim((string) $in['key']);
            if ($k === '') ai_kv_set('key', '');
            else {
                if (!preg_match('/^sk-ant-[A-Za-z0-9_-]{20,}$/', $k)) json_out(['error' => 'That doesn\'t look like an Anthropic API key. It starts with sk-ant-.'], 400);
                ai_kv_set('key', mail_encrypt($k));
                try { ai_call([['type' => 'text', 'text' => 'Reply with OK.']], 5); } catch (Throwable $e) { ai_kv_set('key', ''); json_out(['error' => 'The key didn\'t work: ' . $e->getMessage()], 400); }
            }
        }
        if (isset($in['cap'])) ai_kv_set('cap', (string) max(1, min(100, (float) $in['cap'])));
        $out();
    case 'pf_sent':
        $s = $set();
        $pdo->prepare('UPDATE proof_sets SET sent_at = ?, n_chase = 0, updated = ? WHERE id = ?')->execute([$now, $now, (int) $s['id']]);
        if (!empty($in['email'])) {
            if (!filter_var((string) $s['email'], FILTER_VALIDATE_EMAIL) || !($cfg = mail_cfg())) json_out(['error' => 'Add their email, and set up the Email tab first.'], 400);
            try { [$m] = mail_build($cfg, [$s['email']], [], 'Your proof to check: ' . $s['title'], $msg($s)); smtp_send($cfg, [$s['email']], $m); }
            catch (Throwable $e) { json_out(['error' => 'The email could not be sent: ' . $e->getMessage()], 400); }
            proof_ev((int) $s['id'], 'note', 'Proof emailed to ' . $s['email']);
        } else proof_ev((int) $s['id'], 'note', 'Proof link sent');
        $out();
    case 'pf_archive':
        $s = $set(); $pdo->prepare('UPDATE proof_sets SET archived = ?, updated = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $now, (int) $s['id']]); $out();
    case 'pf_delete':
        $s = $set(); rrmdir_any(private_dir() . '/proofs/' . $s['token']);
        foreach (proof_items((int) $s['id']) as $it) $pdo->prepare('DELETE FROM proof_vers WHERE item_id = ?')->execute([(int) $it['id']]);
        $pdo->prepare('DELETE FROM proof_items WHERE set_id = ?')->execute([(int) $s['id']]);
        $pdo->prepare('DELETE FROM proof_acts WHERE set_id = ?')->execute([(int) $s['id']]);
        $pdo->prepare('DELETE FROM proof_sets WHERE id = ?')->execute([(int) $s['id']]);
        $out();
    }
    json_out(['error' => 'Unknown action'], 400);
}

/* ---------- clients, monthly plans, invoices, care, leads (demo-lib/clients.php) ---------- */
if (strpos($a, 'cl_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/clients.php';
    require_once dirname(__DIR__) . '/demo-lib/proofs.php';
    require_once dirname(__DIR__) . '/demo-lib/ai.php';
    $pdo = cl_db(); $now = now();
    $str = function ($k, $max = 300) use (&$in) { return mb_substr(trim((string) ($in[$k] ?? '')), 0, $max); };
    $pence = function ($k) use (&$in) { return max(0, (int) round(((float) ($in[$k] ?? 0)) * 100)); };
    $client = function () use (&$in) { $c = cl_get((int) ($in['cid'] ?? $in['id'] ?? 0)); if (!$c) json_out(['error' => 'Client not found.'], 404); return $c; };
    $plan = function () use (&$in) { $p = cl_plan((int) ($in['plan'] ?? 0)); if (!$p) json_out(['error' => 'Plan not found.'], 404); return $p; };
    $bill = function () use (&$in, $pdo) { $st = $pdo->prepare('SELECT * FROM cl_bills WHERE id = ?'); $st->execute([(int) ($in['bill'] ?? 0)]); $b = $st->fetch(); if (!$b) json_out(['error' => 'Payment not found.'], 404); return $b; };
    $care = function () use (&$in, $pdo) { $st = $pdo->prepare('SELECT * FROM cl_care WHERE id = ?'); $st->execute([(int) ($in['care'] ?? 0)]); $k = $st->fetch(); if (!$k) json_out(['error' => 'Check not found.'], 404); return $k; };
    $lead = function () use (&$in, $pdo) { $st = $pdo->prepare('SELECT * FROM leads WHERE id = ?'); $st->execute([(int) ($in['lead'] ?? 0)]); $l = $st->fetch(); if (!$l) json_out(['error' => 'Lead not found.'], 404); return $l; };
    $out = function (array $extra = []) use ($pdo, $now, &$in) {
        static $synced = false;
        if (!$synced) { $synced = true; cl_sync();
            // any paid job payment without an invoice yet gets one (e.g. paid before invoices existed)
            foreach (jobs_db()->query("SELECT p.id FROM job_pays p LEFT JOIN invoices i ON i.src = 'job' AND i.src_id = p.id WHERE p.status = 'paid' AND i.id IS NULL")->fetchAll() as $r) inv_from_job_pay((int) $r['id']);
        }
        $plans = array_map(function ($p) use ($now) { return cl_plan_row($p, $now); }, $pdo->query("SELECT * FROM cl_plans WHERE status != 'ended' OR updated > " . ($now - 60 * 86400) . ' ORDER BY created DESC')->fetchAll());
        $care = array_map(function ($k) use ($now) { return care_row($k, $now); }, $pdo->query('SELECT * FROM cl_care ORDER BY due')->fetchAll());
        $clients = array_map(function ($c) use ($plans, $care, $now) { return cl_summary_row($c, $plans, $care, $now); }, $pdo->query("SELECT * FROM clients ORDER BY status = 'archived', updated DESC")->fetchAll());
        $invs = array_map('inv_row', $pdo->query('SELECT * FROM invoices ORDER BY created DESC LIMIT 120')->fetchAll());
        $leads = array_map(function ($l) use ($now) { return lead_row($l, $now); }, $pdo->query("SELECT * FROM leads WHERE status NOT IN ('won','lost') OR updated > " . ($now - 90 * 86400) . ' ORDER BY next_at = 0, next_at, updated DESC')->fetchAll());
        $data = $extra + ['ok' => true, 'clients' => $clients, 'plans' => $plans, 'care' => $care, 'invoices' => $invs, 'leads' => $leads, 'sum' => clients_summary($now),
            'cfg' => cl_cfg() + ['stripe' => jobs_stripe_key() !== '', 'mail' => (bool) mail_cfg()], 'ai' => ai_public(), 'types' => CL_TYPES, 'lstatus' => LEAD_STATUS, 'lsources' => LEAD_SOURCES,
            'areas' => JOB_AREAS, 'care_tpl' => array_map(function ($t) { return ['kind' => $t[0], 'title' => $t[1], 'every' => $t[2], 'tip' => $t[3]]; }, CARE_TPL)];
        if (!empty($in['cid'])) { $c = cl_get((int) $in['cid']); if ($c) $data['page'] = cl_page($c, $now); }
        json_out($data);
    };
    switch ($a) {
    case 'cl_list': $out();
    case 'cl_save':
        $f = ['name' => $str('name', 120), 'person' => $str('person', 120), 'phone' => preg_replace('/[^0-9+ ]/', '', $str('phone', 30)), 'email' => strtolower($str('email', 160)),
            'type' => isset(CL_TYPES[$in['type'] ?? '']) ? $in['type'] : 'other', 'address' => $str('address', 400), 'website' => $str('website', 200), 'instagram' => ltrim($str('instagram', 80), '@'),
            'notes' => $str('notes', 4000), 'updated' => $now];
        if ($f['name'] === '') json_out(['error' => 'Give the client a name.'], 400);
        if ($f['email'] !== '' && !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) json_out(['error' => 'That email address doesn\'t look right.'], 400);
        $f['keyp'] = cl_kp($f['phone']); $f['keyn'] = cl_kn($f['name']);
        $id = (int) ($in['id'] ?? 0);
        if ($id) { $client(); $s = implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($f))); $pdo->prepare("UPDATE clients SET $s WHERE id = ?")->execute(array_merge(array_values($f), [$id])); }
        else {
            if ($dup = cl_find($f['phone'], $f['name'])) json_out(['error' => 'You already have ' . $dup['name'] . ' (same name or number).', 'cid' => (int) $dup['id']], 400);
            $f += ['created' => $now, 'source' => 'admin', 'status' => 'active'];
            $pdo->prepare('INSERT INTO clients (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f));
            $id = (int) $pdo->lastInsertId(); cl_log($id, 'Client added');
        }
        $in['cid'] = $id; $out(['id' => $id]);
    case 'cl_logo':   // {id, png: data URL (square PNG made in the browser) | ''} = upload or remove the client's logo
        $c = $client(); $file = cl_logo_path((int) $c['id']);
        $d = (string) ($in['png'] ?? '');
        if ($d === '') { @unlink($file); $pdo->prepare('UPDATE clients SET logo = 0, updated = ? WHERE id = ?')->execute([$now, (int) $c['id']]); $in['cid'] = (int) $c['id']; $out(); }
        if (!preg_match('#^data:image/png;base64,#', $d)) json_out(['error' => 'That picture didn\'t come through. Try another one.'], 400);
        $bin = base64_decode(substr($d, 22), true);
        if ($bin === false || strlen($bin) > 600000 || substr($bin, 0, 8) !== "\x89PNG\r\n\x1a\n") json_out(['error' => 'That picture is too big or not a picture.'], 400);
        @mkdir(dirname($file), 0700, true); file_put_contents($file, $bin);
        $pdo->prepare('UPDATE clients SET logo = ?, updated = ? WHERE id = ?')->execute([$now, $now, (int) $c['id']]); cl_log((int) $c['id'], 'Logo added');
        $in['cid'] = (int) $c['id']; $out();
    case 'cl_status':   // active / past / archived
        $c = $client(); $st = in_array($in['status'] ?? '', ['active', 'past', 'archived'], true) ? $in['status'] : 'active';
        $pdo->prepare('UPDATE clients SET status = ?, updated = ? WHERE id = ?')->execute([$st, $now, (int) $c['id']]); $in['cid'] = (int) $c['id']; $out();
    case 'cl_delete':
        $c = $client();
        foreach (['cl_plans', 'cl_bills', 'cl_care', 'cl_log'] as $t) $pdo->prepare("DELETE FROM $t WHERE client_id = ?")->execute([(int) $c['id']]);
        $pdo->prepare('UPDATE leads SET client_id = 0 WHERE client_id = ?')->execute([(int) $c['id']]);
        $pdo->prepare('DELETE FROM clients WHERE id = ?')->execute([(int) $c['id']]); unset($in['cid']); $out();
    case 'cl_cfg':
        $c = cl_cfg();
        foreach (['biz' => 80, 'addr' => 300, 'email' => 120, 'phone' => 40, 'web' => 80, 'vat' => 30, 'footer' => 300] as $k => $m) if (isset($in[$k])) $c[$k] = $str($k, $m);
        if (isset($in['grace'])) $c['grace'] = max(3, min(60, (int) $in['grace']));
        if (isset($in['next_no']) && (int) $in['next_no'] > 0) $c['next_no'] = (int) $in['next_no'];
        $c['email'] = strtolower($c['email']);
        job_kv_set('cl_cfg', json_encode($c)); $out();

    /* monthly plans */
    case 'cl_plan_save':
        $c = $client();
        $f = ['title' => $str('title', 120), 'incl' => $str('incl', 2000), 'amount' => $pence('amount'), 'day' => max(1, min(28, (int) ($in['day'] ?? 1))), 'method' => ($in['method'] ?? '') === 'cash' ? 'cash' : 'card',
            'grace' => max(3, min(60, (int) ($in['grace'] ?? cl_cfg()['grace']))), 'notes' => $str('notes', 2000), 'updated' => $now];
        if ($f['title'] === '') json_out(['error' => 'Name the plan, e.g. "Ordering app · hosting, updates & support".'], 400);
        if ($f['amount'] < 100) json_out(['error' => 'Put in the monthly price.'], 400);
        if (($in['kind'] ?? 'monthly') !== 'monthly') json_out(['error' => 'Commission deals are coming soon. Track them separately for now.'], 400);
        $pid = (int) ($in['plan'] ?? 0);
        if ($pid) {
            $p = $plan();
            if ($p['stripe_sub'] !== '' && (int) $p['amount'] !== $f['amount']) json_out(['error' => 'This plan is already paying by card. To change the price, end it and set up a new one (so they agree to the new amount).'], 400);
            $s = implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($f))); $pdo->prepare("UPDATE cl_plans SET $s WHERE id = ?")->execute(array_merge(array_values($f), [$pid]));
        } else {
            do { $tok = rand_token(12); } while (cl_plan_by_token($tok));
            $f += ['client_id' => (int) $c['id'], 'token' => $tok, 'kind' => 'monthly', 'status' => $f['method'] === 'cash' ? 'active' : 'draft', 'start' => $f['method'] === 'cash' ? $now : 0, 'created' => $now];
            $pdo->prepare('INSERT INTO cl_plans (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f));
            cl_log((int) $c['id'], 'Monthly plan added: ' . $f['title'] . ' · ' . money($f['amount']) . '/month (' . $f['method'] . ')');
        }
        $in['cid'] = (int) $c['id']; $out();
    case 'cl_plan_sent':
        $p = $plan(); if ($p['status'] === 'draft') $pdo->prepare("UPDATE cl_plans SET status = 'sent', updated = ? WHERE id = ?")->execute([$now, (int) $p['id']]);
        cl_log((int) $p['client_id'], 'Payment set-up link sent'); $in['cid'] = (int) $p['client_id']; $out();
    case 'cl_plan_status':   // pause / resume / end
        $p = $plan(); $to = $in['to'] ?? '';
        if ($to === 'paused') { $pdo->prepare("UPDATE cl_plans SET status = 'paused', paused_at = ?, updated = ? WHERE id = ?")->execute([$now, $now, (int) $p['id']]); cl_log((int) $p['client_id'], 'Service paused (unpaid)'); }
        elseif ($to === 'active') { $pdo->prepare("UPDATE cl_plans SET status = 'active', paused_at = 0, updated = ? WHERE id = ?")->execute([$now, (int) $p['id']]); cl_log((int) $p['client_id'], 'Plan active again'); }
        elseif ($to === 'ended') {
            if ($p['stripe_sub'] !== '') { try { stripe_call('DELETE', 'subscriptions/' . rawurlencode($p['stripe_sub'])); } catch (Throwable $e) { json_out(['error' => 'Stripe didn\'t cancel it: ' . $e->getMessage()], 400); } }
            $pdo->prepare("UPDATE cl_plans SET status = 'ended', updated = ? WHERE id = ?")->execute([$now, (int) $p['id']]); cl_log((int) $p['client_id'], 'Plan ended: ' . $p['title']);
        }
        $in['cid'] = (int) $p['client_id']; $out();
    case 'cl_plan_sync': $p = $plan(); cl_plan_sync($p); $in['cid'] = (int) $p['client_id']; $out();
    case 'cl_bill_paid': $b = $bill(); cl_bill_paid((int) $b['id'], in_array($in['method'] ?? '', ['cash', 'card', 'other'], true) ? $in['method'] : 'cash'); $in['cid'] = (int) $b['client_id']; $out();
    case 'cl_bill_more': $b = $bill(); $pdo->prepare('UPDATE cl_bills SET extra_days = extra_days + ?, stage = MIN(stage, 3) WHERE id = ?')->execute([max(1, min(30, (int) ($in['days'] ?? 7))), (int) $b['id']]);
        cl_log((int) $b['client_id'], 'Gave them ' . (int) ($in['days'] ?? 7) . ' more days to pay'); $in['cid'] = (int) $b['client_id']; $out();
    case 'cl_bill_void': $b = $bill(); $pdo->prepare("UPDATE cl_bills SET status = 'void', wa_due = 0 WHERE id = ?")->execute([(int) $b['id']]); cl_log((int) $b['client_id'], 'Wrote off ' . money((int) $b['amount'])); $in['cid'] = (int) $b['client_id']; $out();
    case 'cl_bill_reminded': $b = $bill(); $pdo->prepare('UPDATE cl_bills SET wa_due = 0 WHERE id = ?')->execute([(int) $b['id']]); cl_log((int) $b['client_id'], 'Payment reminder sent on WhatsApp'); $in['cid'] = (int) $b['client_id']; $out();
    case 'cl_bill_add':   // cash plan: add this month's bill by hand
        $p = $plan(); $per = preg_match('/^\d{4}-\d{2}$/', (string) ($in['period'] ?? '')) ? $in['period'] : date('Y-m');
        $pdo->prepare('INSERT OR IGNORE INTO cl_bills (plan_id, client_id, period, amount, due, created) VALUES (?,?,?,?,?,?)')->execute([(int) $p['id'], (int) $p['client_id'], $per, (int) $p['amount'], $now, $now]);
        $in['cid'] = (int) $p['client_id']; $out();

    /* invoices */
    case 'cl_inv_sent':
        $i = inv_get((int) ($in['inv'] ?? 0)); if (!$i) json_out(['error' => 'Invoice not found.'], 404);
        $via = in_array($in['via'] ?? '', ['whatsapp', 'email', 'copy'], true) ? $in['via'] : 'copy';
        if ($via === 'email') {
            if (!filter_var((string) $i['email'], FILTER_VALIDATE_EMAIL)) json_out(['error' => 'No email address for them. Add one on their client page.'], 400);
            $cfg = mail_cfg(); if (!$cfg) json_out(['error' => 'Set up the Email tab first.'], 400);
            try { [$msg] = mail_build($cfg, [$i['email']], [], 'Invoice ' . inv_no($i) . ' from ' . cl_cfg()['biz'], inv_msg($i)); smtp_send($cfg, [$i['email']], $msg); }
            catch (Throwable $e) { json_out(['error' => 'The email didn\'t send: ' . $e->getMessage()], 400); }
        }
        $pdo->prepare('UPDATE invoices SET sent_at = ?, sent_via = ? WHERE id = ?')->execute([$now, $via, (int) $i['id']]);
        if ((int) $i['client_id']) cl_log((int) $i['client_id'], 'Invoice ' . inv_no($i) . ' sent (' . $via . ')');
        $out();
    case 'cl_inv_new':   // a manual invoice (e.g. cash work done outside Jobs)
        $c = $client(); $items = job_items_clean($in['items'] ?? []);
        if (!$items) json_out(['error' => 'Add at least one line.'], 400);
        $paid = !empty($in['paid']);
        $id = inv_make(['client_id' => (int) $c['id'], 'client' => $c['name'], 'person' => $c['person'], 'phone' => $c['phone'], 'email' => $c['email'], 'address' => $c['address'], 'title' => $str('title', 160),
            'items' => $items, 'total' => job_total($items), 'paid' => (int) $paid, 'paid_at' => $paid ? $now : 0, 'method' => $paid ? (in_array($in['method'] ?? '', ['cash', 'card', 'other'], true) ? $in['method'] : 'cash') : '', 'src' => 'manual', 'note' => $str('note', 600)]);
        $in['cid'] = (int) $c['id']; $out(['inv' => $id]);
    case 'cl_inv_skip':   // don't need to send this one
        $i = inv_get((int) ($in['inv'] ?? 0)); if (!$i) json_out(['error' => 'Invoice not found.'], 404);
        $pdo->prepare("UPDATE invoices SET sent_at = ?, sent_via = 'skipped' WHERE id = ?")->execute([$now, (int) $i['id']]); $out();

    /* care & renewals */
    case 'cl_care_add':   // several templates at once
        $c = $client(); $target = $str('target', 200);
        if ($target !== '' && $c['website'] === '') $pdo->prepare('UPDATE clients SET website = ? WHERE id = ?')->execute([$target, (int) $c['id']]);
        $n = 0;
        foreach ((array) ($in['items'] ?? []) as $it) {
            $tpl = (string) ($it['tpl'] ?? ''); $T = CARE_TPL[$tpl] ?? null;
            $title = mb_substr(trim((string) ($it['title'] ?? ($T[1] ?? ''))), 0, 120); if ($title === '') continue;
            $kind = $T[0] ?? (in_array($it['kind'] ?? '', ['renew', 'check'], true) ? $it['kind'] : 'check');
            $every = isset(CARE_EVERY[$it['every'] ?? '']) ? $it['every'] : ($T[2] ?? 'month');
            $due = (int) ($it['due'] ?? 0) ?: ($kind === 'check' ? $now + 7 * 86400 : 0);
            $pdo->prepare('INSERT INTO cl_care (client_id, tpl, kind, title, target, every, due, client_pays, price, notes, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
                ->execute([(int) $c['id'], $tpl, $kind, $title, $target, $every, $due, (int) !empty($it['client_pays']), max(0, (int) round(((float) ($it['price'] ?? 0)) * 100)), mb_substr((string) ($it['notes'] ?? ''), 0, 600), $now, $now]);
            $n++;
        }
        cl_log((int) $c['id'], $n . ' care check' . ($n === 1 ? '' : 's') . ' added');
        $in['cid'] = (int) $c['id']; $out(['added' => $n]);
    case 'cl_care_save':
        $k = $care();
        $pdo->prepare('UPDATE cl_care SET title = ?, target = ?, every = ?, due = ?, client_pays = ?, price = ?, notes = ?, status = ?, updated = ? WHERE id = ?')
            ->execute([$str('title', 120) ?: $k['title'], $str('target', 200), isset(CARE_EVERY[$in['every'] ?? '']) ? $in['every'] : $k['every'], max(0, (int) ($in['due'] ?? 0)), (int) !empty($in['client_pays']), $pence('price'), $str('notes', 600), ($in['status'] ?? 'on') === 'off' ? 'off' : 'on', $now, (int) $k['id']]);
        $in['cid'] = (int) $k['client_id']; $out();
    case 'cl_care_done':   // ticked off: log it, set the next date
        $k = $care(); $note = $str('note', 600); $ok = ($in['ok'] ?? 1) ? 1 : 0;
        $from = $k['kind'] === 'renew' && (int) $k['due'] > 0 ? (int) $k['due'] : $now;
        $next = care_next($k['every'], $from); if ($k['kind'] === 'renew' && isset($in['next']) && (int) $in['next'] > 0) $next = (int) $in['next'];
        $pdo->prepare('UPDATE cl_care SET last_done = ?, last_ok = ?, last_result = ?, due = ?, updated = ? WHERE id = ?')->execute([$now, $ok, $note !== '' ? $note : ($k['kind'] === 'renew' ? 'Renewed' : 'Done'), $next, $now, (int) $k['id']]);
        $pdo->prepare('INSERT INTO cl_care_log (care_id, at, ok, text) VALUES (?,?,?,?)')->execute([(int) $k['id'], $now, $ok, $note !== '' ? $note : ($k['kind'] === 'renew' ? 'Renewed' : 'Done')]);
        cl_log((int) $k['client_id'], $k['title'] . ': ' . ($k['kind'] === 'renew' ? 'renewed' : 'done') . ($note !== '' ? ' (' . $note . ')' : ''));
        $in['cid'] = (int) ($in['cid'] ?? 0) ?: 0; $out();
    case 'cl_care_snooze': $k = $care(); $pdo->prepare('UPDATE cl_care SET due = ?, updated = ? WHERE id = ?')->execute([$now + max(1, min(60, (int) ($in['days'] ?? 3))) * 86400, $now, (int) $k['id']]); $out();
    case 'cl_care_run':
        $k = $care(); [$ok, $txt, $due] = care_run($k);
        $pdo->prepare('UPDATE cl_care SET last_run = ?, last_ok = ?, last_result = ?, due = ?, fails = ?, updated = ? WHERE id = ?')->execute([$now, (int) $ok, $txt, $due ?: (int) $k['due'], $ok ? 0 : (int) $k['fails'] + 1, $now, (int) $k['id']]);
        $pdo->prepare('INSERT INTO cl_care_log (care_id, at, ok, text) VALUES (?,?,?,?)')->execute([(int) $k['id'], $now, (int) $ok, $txt]);
        $in['cid'] = (int) ($in['cid'] ?? 0); $out(['result' => $txt, 'good' => $ok]);
    case 'cl_care_del': $k = $care(); $pdo->prepare('DELETE FROM cl_care WHERE id = ?')->execute([(int) $k['id']]); $pdo->prepare('DELETE FROM cl_care_log WHERE care_id = ?')->execute([(int) $k['id']]); $out();

    /* leads */
    case 'cl_lead_parse':   // "tell me about the lead" → fields (AI if the key is set)
        $t = $str('text', 3000); if ($t === '') json_out(['error' => 'Write a line or two about the lead.'], 400);
        json_out(['ok' => true, 'fields' => lead_parse($t), 'ai' => ai_key() !== '']);
    case 'cl_lead_save':
        $f = ['name' => $str('name', 120), 'business' => $str('business', 120), 'phone' => preg_replace('/[^0-9+ ]/', '', $str('phone', 30)), 'email' => strtolower($str('email', 160)),
            'area' => isset(JOB_AREAS[$in['area'] ?? '']) ? $in['area'] : '', 'what' => $str('what', 300), 'value' => $pence('value'), 'source' => isset(LEAD_SOURCES[$in['source'] ?? '']) ? $in['source'] : '',
            'status' => isset(LEAD_STATUS[$in['status'] ?? '']) ? $in['status'] : 'new', 'next_at' => max(0, (int) ($in['next_at'] ?? 0)), 'next_what' => $str('next_what', 160), 'notes' => $str('notes', 4000),
            'lost_why' => $str('lost_why', 300), 'updated' => $now];
        if ($f['name'] === '' && $f['business'] === '') json_out(['error' => 'Who is it? A name or a business.'], 400);
        $lid = (int) ($in['lead'] ?? 0);
        if ($lid) { $lead(); $s = implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($f))); $pdo->prepare("UPDATE leads SET $s WHERE id = ?")->execute(array_merge(array_values($f), [$lid])); }
        else { $f += ['via' => $str('via', 20) ?: 'admin', 'created' => $now]; $pdo->prepare('INSERT INTO leads (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f)); $lid = (int) $pdo->lastInsertId(); }
        $out(['lead' => $lid]);
    case 'cl_lead_add_text':   // from other Claude chats (workflow "Add a lead"): free text in, parsed, saved
        $t = $str('text', 3000); if ($t === '') json_out(['error' => 'Empty.'], 400);
        $f = lead_parse($t);
        $pdo->prepare('INSERT INTO leads (name, business, phone, email, area, what, value, source, status, next_at, next_what, notes, via, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([$f['name'] ?? '', $f['business'] ?? '', $f['phone'] ?? '', $f['email'] ?? '', $f['area'] ?? '', $f['what'] ?? '', (int) ($f['value'] ?? 0), $f['source'] ?? '', $f['status'] ?? 'new',
                (int) ($f['next_at'] ?? strtotime('tomorrow 10:00')), $f['next_what'] ?? '', $t, 'claude', $now, $now]);
        $lid = (int) $pdo->lastInsertId();
        try { push_all('New lead added', trim(($f['business'] ?? '') . ' ' . ($f['name'] ?? '')) . ($f['what'] ?? '' ? ': ' . $f['what'] : ''), '/demo-admin/#leads', 'lead-' . $lid); } catch (Throwable $e) {}
        json_out(['ok' => true, 'lead' => $lid, 'fields' => $f]);
    case 'cl_lead_move':   // status / follow-up quick changes
        $l = $lead(); $f = ['updated' => $now];
        if (isset($in['status']) && isset(LEAD_STATUS[$in['status']])) $f['status'] = $in['status'];
        if (isset($in['next_at'])) $f['next_at'] = max(0, (int) $in['next_at']);
        if (isset($in['next_what'])) $f['next_what'] = $str('next_what', 160);
        if (isset($in['lost_why'])) $f['lost_why'] = $str('lost_why', 300);
        if (isset($in['add_note']) && trim((string) $in['add_note']) !== '') $f['notes'] = trim($l['notes'] . "\n" . date('j M') . ': ' . $str('add_note', 600));
        $s = implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($f))); $pdo->prepare("UPDATE leads SET $s WHERE id = ?")->execute(array_merge(array_values($f), [(int) $l['id']]));
        $out();
    case 'cl_lead_win':   // won: becomes a client
        $l = $lead();
        $cid = cl_upsert(['name' => $l['business'] !== '' ? $l['business'] : $l['name'], 'person' => $l['business'] !== '' ? $l['name'] : '', 'phone' => $l['phone'], 'email' => $l['email']], 'lead');
        $pdo->prepare("UPDATE leads SET status = 'won', client_id = ?, next_at = 0, updated = ? WHERE id = ?")->execute([$cid, $now, (int) $l['id']]);
        cl_log($cid, 'Won from a lead' . ($l['what'] !== '' ? ': ' . $l['what'] : ''));
        $in['cid'] = $cid; $out(['cid' => $cid]);
    case 'cl_lead_del': $l = $lead(); $pdo->prepare('DELETE FROM leads WHERE id = ?')->execute([(int) $l['id']]); $out();
    }
    json_out(['error' => 'Unknown action'], 400);
}

/* ---------- jobs & payments (demo-lib/jobs.php) ---------- */
if (strpos($a, 'j_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/jobs.php';
    $pdo = jobs_db(); $now = now();
    $out = function (array $extra = []) use ($pdo, $now) {
        $rows = array_map(function ($j) use ($now) { return job_row($j, $now); }, $pdo->query("SELECT * FROM jobs WHERE status != 'cancelled' OR cancelled_at > " . ($now - 30 * 86400) . ' ORDER BY updated DESC')->fetchAll());
        json_out($extra + ['ok' => true, 'jobs' => $rows, 'sum' => jobs_summary($rows), 'cfg' => jobs_cfg_public(), 'terms' => JOB_TERMS, 'handover' => JOB_HANDOVER, 'areas' => JOB_AREAS, 'extras' => JOB_EXTRAS, 'audit' => JOB_AUDIT]);
    };
    $str = function ($k, $max = 300) use (&$in) { return mb_substr(trim((string) ($in[$k] ?? '')), 0, $max); };
    $job = function () use ($in) { $j = job_by_id((int) ($in['id'] ?? 0)); if (!$j) json_out(['error' => 'Job not found.'], 404); return $j; };
    switch ($a) {
    case 'j_list': $out();
    case 'j_save':
        $items = job_items_clean($in['items'] ?? []);
        $f = ['client' => $str('client', 120), 'person' => $str('person', 120), 'phone' => preg_replace('/[^0-9+ ]/', '', $str('phone', 30)), 'email' => strtolower($str('email', 160)),
            'area' => isset(JOB_AREAS[$in['area'] ?? '']) ? $in['area'] : 'graphics', 'title' => $str('title', 160), 'items' => json_encode($items), 'total' => job_total($items),
            'deadline' => max(0, (int) ($in['deadline'] ?? 0)), 'handover' => isset(JOB_HANDOVER[$in['handover'] ?? '']) ? $in['handover'] : 'collection',
            'terms' => isset(JOB_TERMS[$in['terms'] ?? '']) ? $in['terms'] : 'deposit', 'deposit_pct' => max(10, min(90, (int) ($in['deposit_pct'] ?? 50))), 'pay_by' => max(0, (int) ($in['pay_by'] ?? 0)),
            'card_ok' => (int) !empty($in['card_ok']), 'cash_ok' => (int) !empty($in['cash_ok']), 'auto_email' => (int) !empty($in['auto_email']),
            'extra' => $str('extra', 600), 'notes' => $str('notes', 4000), 'public_note' => $str('public_note', 1500), 'updated' => $now];
        if ($f['client'] === '') json_out(['error' => 'Who is the job for?'], 400);
        if ($f['title'] === '') json_out(['error' => 'Give the job a short name, e.g. "Roller banner + 500 leaflets".'], 400);
        if ($f['email'] !== '' && !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) json_out(['error' => 'That email address doesn\'t look right.'], 400);
        if ($f['terms'] === 'bydate' && !$f['pay_by']) json_out(['error' => 'Pick the date they need to pay by.'], 400);
        if (!$f['card_ok'] && !$f['cash_ok']) $f['card_ok'] = 1;
        $id = (int) ($in['id'] ?? 0);
        if ($id) {
            $old = $job();
            // Price, what's included, deadline or payment terms changed after they agreed: they must agree again
            $big = $old['items'] !== $f['items'] || (int) $old['total'] !== $f['total'] || (int) $old['deadline'] !== $f['deadline'] || $old['terms'] !== $f['terms']
                || (int) $old['deposit_pct'] !== $f['deposit_pct'] || (int) $old['pay_by'] !== $f['pay_by'] || $old['handover'] !== $f['handover'];
            if ($big && (int) $old['agreed_at'] && $old['status'] !== 'delivered') { $f['agreed_at'] = 0; $f['changed_at'] = $now; $f['status'] = 'sent'; job_ev($id, 'Quote changed after agreement: they need to agree again'); }
            $sets = implode(', ', array_map(function ($k) { return $k . ' = ?'; }, array_keys($f)));
            $pdo->prepare("UPDATE jobs SET $sets WHERE id = ?")->execute(array_merge(array_values($f), [$id]));
        } else {
            $f += ['token' => job_token(), 'status' => 'draft', 'created' => $now];
            $pdo->prepare('INSERT INTO jobs (' . implode(', ', array_keys($f)) . ') VALUES (' . implode(',', array_fill(0, count($f), '?')) . ')')->execute(array_values($f));
            $id = (int) $pdo->lastInsertId();
            job_ev($id, 'Job created');
        }
        job_sync_pays(job_by_id($id));
        $out(['id' => $id]);
    case 'j_sent':   // the owner sent (or copied) the agreement link
        $j = $job();
        if ($j['status'] === 'draft') { $pdo->prepare("UPDATE jobs SET status = 'sent', sent_at = ?, updated = ? WHERE id = ?")->execute([$now, $now, (int) $j['id']]); job_ev((int) $j['id'], 'Quote link sent'); }
        elseif (!(int) $j['sent_at']) $pdo->prepare('UPDATE jobs SET sent_at = ? WHERE id = ?')->execute([$now, (int) $j['id']]);
        if (!empty($in['email']) && filter_var((string) $j['email'], FILTER_VALIDATE_EMAIL)) {
            if (!job_email($j, 'Your quote from SMR: ' . $j['title'], job_msg_send($j))) json_out(['error' => 'The email could not be sent. Check your email is set up in the Email tab.'], 400);
            job_ev((int) $j['id'], 'Quote emailed to ' . $j['email']);
        }
        $out();
    case 'j_paid':   // cash (or other) marked by the owner
        $j = $job();
        $st = $pdo->prepare('SELECT * FROM job_pays WHERE id = ? AND job_id = ?'); $st->execute([(int) ($in['pay'] ?? 0), (int) $j['id']]); $p = $st->fetch();
        if (!$p) json_out(['error' => 'Payment not found.'], 404);
        if (!empty($in['undo'])) { $pdo->prepare("UPDATE job_pays SET status = 'due', method = '', paid_at = 0 WHERE id = ?")->execute([(int) $p['id']]); job_ev((int) $j['id'], 'Payment un-ticked: ' . $p['label']); }
        else job_mark_paid((int) $p['id'], in_array($in['method'] ?? '', ['cash', 'card', 'other'], true) ? $in['method'] : 'cash');
        $pdo->prepare('UPDATE jobs SET updated = ? WHERE id = ?')->execute([$now, (int) $j['id']]);
        $out();
    case 'j_reminded':   // the owner sent the WhatsApp reminder
        $j = $job();
        $pdo->prepare('UPDATE job_pays SET wa_due = 0 WHERE id = ? AND job_id = ?')->execute([(int) ($in['pay'] ?? 0), (int) $j['id']]);
        job_ev((int) $j['id'], 'WhatsApp reminder sent');
        $out();
    case 'j_agreed':   // agreed in person / on WhatsApp: the owner records it
        $j = $job();
        $pdo->prepare("UPDATE jobs SET status = 'agreed', agreed_at = ?, agreed_name = ?, agreed_ip = 'owner', changed_at = 0, sent_at = MAX(sent_at, ?), updated = ? WHERE id = ?")
            ->execute([$now, mb_substr('Recorded by Summar: ' . $str('how', 100), 0, 140), $now, $now, (int) $j['id']]);
        job_sync_pays(job_by_id((int) $j['id']));
        job_ev((int) $j['id'], 'Agreement recorded by you (' . $str('how', 100) . ')');
        $out();
    case 'j_deliver':
        $j = $job(); $pays = job_pays((int) $j['id']);
        if (!empty($in['undo'])) { $pdo->prepare("UPDATE jobs SET status = 'agreed', delivered_at = 0, override = 0, updated = ? WHERE id = ?")->execute([$now, (int) $j['id']]); job_ev((int) $j['id'], 'Hand-over undone'); $out(); }
        if (!(int) $j['agreed_at']) json_out(['error' => 'They haven\'t agreed to the quote yet.'], 400);
        $lock = job_lock($j, $pays); $pf = proof_for_job((int) $j['id']);
        if ($lock > 0 && empty($in['override'])) json_out(['error' => 'Locked: ' . money($lock) . ' must be paid before hand-over.', 'locked' => $lock], 409);
        if (!$pf['done'] && empty($in['override'])) json_out(['error' => 'Locked: the proof isn\'t signed off yet (' . $pf['open'] . ' item' . ($pf['open'] > 1 ? 's' : '') . ' left).'], 409);
        $pdo->prepare("UPDATE jobs SET status = 'delivered', delivered_at = ?, override = ?, updated = ? WHERE id = ?")->execute([$now, $lock > 0 ? 1 : 0, $now, (int) $j['id']]);
        job_ev((int) $j['id'], ($lock > 0 ? 'Handed over WITHOUT full payment (' . money($lock) . ' unpaid)' : 'Handed over') . (!$pf['done'] ? ' · proof NOT signed off' : ''));
        $out();
    case 'j_cancel':
        $j = $job();
        $undo = !empty($in['undo']);
        $pdo->prepare('UPDATE jobs SET status = ?, cancelled_at = ?, updated = ? WHERE id = ?')->execute([$undo ? ((int) $j['agreed_at'] ? 'agreed' : ((int) $j['sent_at'] ? 'sent' : 'draft')) : 'cancelled', $undo ? 0 : $now, $now, (int) $j['id']]);
        job_ev((int) $j['id'], $undo ? 'Brought back' : 'Cancelled');
        $out();
    case 'j_delete':
        $j = $job();
        $pdo->prepare('DELETE FROM job_pays WHERE job_id = ?')->execute([(int) $j['id']]);
        $pdo->prepare('DELETE FROM job_events WHERE job_id = ?')->execute([(int) $j['id']]);
        $pdo->prepare('DELETE FROM jobs WHERE id = ?')->execute([(int) $j['id']]);
        $out();
    case 'j_check':   // look up card payments that may have gone through
        foreach ($pdo->query("SELECT * FROM job_pays WHERE status != 'paid' AND session != ''")->fetchAll() as $p) job_check_session($p);
        $out();
    case 'j_cfg':
        $c = jobs_cfg();
        if (isset($in['terms'])) $c['terms'] = mb_substr(trim((string) $in['terms']), 0, 3000) ?: JOB_DEFAULT_TERMS;
        if (isset($in['push'])) $c['push'] = (int) !empty($in['push']);
        if (isset($in['stripe'])) {
            $k = trim((string) $in['stripe']);
            if ($k === '') $c['stripe'] = '';
            else {
                if (!preg_match('/^(sk|rk)_(live|test)_[A-Za-z0-9]{20,}$/', $k)) json_out(['error' => 'That doesn\'t look like a Stripe secret key. It starts with sk_live_ (or rk_live_ for a restricted key).'], 400);
                $c['stripe'] = mail_encrypt($k);
                job_kv_set('cfg', json_encode($c));
                try { stripe_call('GET', 'balance'); } catch (Throwable $e) { $c['stripe'] = ''; job_kv_set('cfg', json_encode($c)); json_out(['error' => 'Stripe didn\'t accept that key: ' . $e->getMessage()], 400); }
            }
        }
        job_kv_set('cfg', json_encode($c));
        $out();
    }
    json_out(['error' => 'Unknown action'], 400);
}

/* ---------- email ---------- */
if (strpos($a, 'mail_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/mail.php';
    $box = function (SmrImap $m, string $f): string {
        if ($f !== 'sent') return 'INBOX';
        $s = $m->special('sent');
        if (!$s) throw new RuntimeException('No Sent folder found in this mailbox.');
        return $s;
    };
    $need = function (): array { $c = mail_cfg(); if (!$c) json_out(['error' => 'Set up your email first.', 'setup' => true], 400); return $c; };
    $addrs = function ($v): array {
        $out = [];
        foreach (preg_split('/[,;\s]+/', (string) $v) as $e) { $e = trim($e, ' <>'); if ($e === '') continue;
            if (!filter_var($e, FILTER_VALIDATE_EMAIL)) json_out(['error' => '"' . $e . '" is not an email address.'], 400);
            $out[] = $e; }
        return array_values(array_unique($out));
    };
    try {
        switch ($a) {
        case 'mail_cfg':
            json_out(mail_cfg_public());
        case 'mail_setup':
            $email = strtolower(trim((string) ($in['email'] ?? '')));
            $host = strtolower(trim((string) ($in['host'] ?? '')));
            $name = mb_substr(trim((string) ($in['name'] ?? '')), 0, 80);
            $pass = (string) ($in['password'] ?? '');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['error' => 'Enter your email address.'], 400);
            if (!preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $host)) json_out(['error' => 'Enter the mail server name.'], 400);
            $old = mail_cfg();
            if ($pass === '' && !$old) json_out(['error' => 'Enter your email password.'], 400);
            $test = ['email' => $email, 'host' => $host, 'name' => $name, 'password' => $pass !== '' ? $pass : $old['password']];
            new SmrImap($test);
            mail_cfg_save($email, $name, $host, $pass);
            if (isset($in['sig_on'])) { $g = mail_sig(); mail_sig_save(!empty($in['sig_on']), $g['name'], $g['title'], $g['phone']); }
            json_out(['ok' => true] + mail_cfg_public());
        case 'mail_forget':
            mail_cfg_clear();
            json_out(['ok' => true]);
        case 'mail_unread':
            $m = new SmrImap($need());
            json_out(['unread' => $m->unseen()]);
        case 'mail_list':
            $m = new SmrImap($need());
            $f = ($in['folder'] ?? '') === 'sent' ? 'sent' : 'inbox';
            $m->select($box($m, $f));
            $uids = $m->uids();
            $before = (int) ($in['before'] ?? 0);
            if ($before) $uids = array_values(array_filter($uids, function ($u) use ($before) { return $u < $before; }));
            $page = array_slice($uids, -30);
            $rows = $m->headers($page);
            try { foreach ($rows as $r) mail_contacts_add($f === 'sent' ? $r['to'] : [$r['from']], 1, (int) $r['date']); } catch (Throwable $e) {}
            json_out(['folder' => $f, 'rows' => $rows, 'more' => count($uids) > count($page), 'unread' => $m->unseen()]);
        case 'mail_contacts':
            // First time: read the senders/recipients of your recent email (300 in the inbox, 300 sent) to fill the address book.
            mail_contacts_table();
            $flag = db()->query("SELECT 1 FROM mail_contacts WHERE email = '~filled'")->fetchColumn();
            if (!$flag) {
                $m = new SmrImap($need());
                foreach (['inbox', 'sent'] as $f) {
                    try { $m->select($box($m, $f)); $u = array_slice($m->uids(), -300);
                        foreach (array_chunk($u, 100) as $ch) foreach ($m->headers($ch) as $r) mail_contacts_add($f === 'sent' ? $r['to'] : [$r['from']], $f === 'sent' ? 3 : 1, (int) $r['date']);
                    } catch (Throwable $e) {}
                }
                db()->exec("INSERT OR IGNORE INTO mail_contacts (email, name, n, last) VALUES ('~filled', '', 0, 0)");
            }
            $list = [];
            foreach (db()->query("SELECT email, name FROM mail_contacts WHERE email <> '~filled' ORDER BY n DESC, last DESC LIMIT 1500") as $r) $list[] = [$r['email'], $r['name']];
            json_out(['contacts' => $list]);
        case 'mail_get':
            $m = new SmrImap($need());
            $f = ($in['folder'] ?? '') === 'sent' ? 'sent' : 'inbox';
            $uid = (int) ($in['uid'] ?? 0);
            $m->select($box($m, $f), false);
            $raw = $m->raw($uid);
            if ($raw === '') json_out(['error' => 'That email was not found. It may have been moved or deleted.'], 404);
            $m->flag($uid, '\\Seen');
            $p = mail_parse($raw);
            [$hh] = mail_split(preg_replace("/\r\n?/", "\n", $raw));
            $text = $p['text'] !== '' ? $p['text'] : trim(html_entity_decode(strip_tags(preg_replace('#<(br|/p|/div|/tr|/h\d)[^>]*>#i', "\n", preg_replace('#<(style|script|head)[^>]*>.*?</\1>#is', '', $p['html']))), ENT_QUOTES, 'UTF-8'));
            json_out(['uid' => $uid, 'folder' => $f,
                'from' => mail_addr_list($hh['from'] ?? '')[0] ?? ['name' => '', 'email' => ''],
                'reply_to' => mail_addr_list($hh['reply-to'] ?? '')[0]['email'] ?? '',
                'to' => mail_addr_list($hh['to'] ?? ''), 'cc' => mail_addr_list($hh['cc'] ?? ''), 'bcc' => mail_addr_list($hh['bcc'] ?? ''),
                'subject' => mail_hdr_decode($hh['subject'] ?? ''), 'date' => strtotime($hh['date'] ?? '') ?: 0,
                'message_id' => trim($hh['message-id'] ?? ''), 'references' => trim($hh['references'] ?? ''),
                'text' => mb_substr(preg_replace("/\n{3,}/", "\n\n", $text), 0, 20000),
                'atts' => array_values(array_filter($p['atts'], function ($x) { return !$x['inline']; }))]);
        case 'mail_att_up':
            // One piece (up to 1.5 MB) of one file; pieces arrive in order and are joined on the server.
            $dir = mail_att_dir((string) ($in['draft'] ?? ''));
            $i = (int) ($in['i'] ?? -1); $off = (int) ($in['off'] ?? -1); $total = (int) ($in['total'] ?? -1);
            $name = mail_att_name((string) ($in['name'] ?? ''));
            if ($i < 0 || $i > 99 || $off < 0 || $total < 0) json_out(['error' => 'Bad upload.'], 400);
            if (mail_att_blocked($name)) json_out(['error' => '"' . $name . '" can\'t be emailed: Gmail and Outlook block this type of file. Put it in a ZIP or send a link instead.'], 400);
            if ($total > MAIL_ATT_MAX) json_out(['error' => '"' . $name . '" is over 25 MB, too big to email. Send it as a link instead.'], 400);
            $f = $_FILES['file'] ?? null;
            if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) json_out(['error' => 'The upload was interrupted. Try again.'], 400);
            if (!is_dir($dir)) @mkdir($dir, 0750, true);
            @touch($dir);
            $part = "$dir/$i.part";
            if ($off === 0) @unlink($part);
            clearstatcache();
            $have = is_file($part) ? filesize($part) : 0;
            if ($have !== $off) json_out(['error' => 'The upload got out of step. Remove the file and add it again.', 'have' => $have], 409);
            $used = 0; foreach ((array) glob("$dir/*.json") as $j) if (basename($j) !== "$i.json") $used += (int) (json_decode((string) file_get_contents($j), true)['size'] ?? 0);
            if ($used + $total > MAIL_ATT_MAX) json_out(['error' => 'That would take this email over 25 MB, the most Gmail and Outlook accept. Send big files as a link instead.'], 400);
            if (file_put_contents($part, file_get_contents($f['tmp_name']), FILE_APPEND) === false) json_out(['error' => 'Could not save the file.'], 500);
            clearstatcache();
            $now = filesize($part);
            if ($now > $total) { @unlink($part); json_out(['error' => 'The upload went wrong. Add the file again.'], 400); }
            if ($now === $total) {
                rename($part, "$dir/$i.bin");
                file_put_contents("$dir/$i.json", json_encode(['name' => $name, 'size' => $total, 'type' => mail_att_mime($name)]));
                json_out(['ok' => true, 'done' => true, 'total' => $used + $total, 'warn' => ($used + $total) > MAIL_ATT_WARN]);
            }
            json_out(['ok' => true, 'done' => false]);
        case 'mail_att_del':
            $dir = mail_att_dir((string) ($in['draft'] ?? ''));
            $i = (int) ($in['i'] ?? -1);
            foreach (['part', 'bin', 'json'] as $e) @unlink("$dir/$i.$e");
            json_out(['ok' => true]);
        case 'mail_draft_save':
            mail_drafts_table();
            $id = (string) ($in['draft'] ?? '');
            mail_att_dir($id); // checks the id
            $keepStr = function ($v, $n) { return mb_substr((string) $v, 0, $n); };
            $d = ['to' => $keepStr($in['to'] ?? '', 2000), 'cc' => $keepStr($in['cc'] ?? '', 2000), 'bcc' => $keepStr($in['bcc'] ?? '', 2000), 'subject' => $keepStr($in['subject'] ?? '', 300),
                'html' => mail_clean_html((string) ($in['html'] ?? '')), 'text' => $keepStr($in['text'] ?? '', 100000), 'quote' => $keepStr($in['quote'] ?? '', 100000),
                'in_reply_to' => $keepStr($in['in_reply_to'] ?? '', 500), 'references' => $keepStr($in['references'] ?? '', 4000), 'uid' => (int) ($in['uid'] ?? 0),
                'reply' => !empty($in['reply']), 'fwd' => array_slice(array_values(array_filter((array) ($in['fwd'] ?? []), 'is_array')), 0, 40)];
            $ts = (int) ($in['ts'] ?? 0) ?: now();
            $old = db()->prepare('SELECT updated FROM mail_drafts WHERE id = ?'); $old->execute([$id]); $ou = (int) $old->fetchColumn();
            if ($ou && $ou > $ts) json_out(['ok' => true, 'updated' => $ou, 'stale' => true]); // a newer copy is already saved
            db()->prepare('INSERT INTO mail_drafts (id, d, updated) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET d = excluded.d, updated = excluded.updated')->execute([$id, json_encode($d), $ts]);
            json_out(['ok' => true, 'updated' => $ts]);
        case 'mail_drafts':
            mail_drafts_table();
            $rows = [];
            foreach (db()->query('SELECT id, d, updated FROM mail_drafts ORDER BY updated DESC LIMIT 200') as $r) {
                $d = json_decode($r['d'], true) ?: [];
                $rows[] = ['id' => $r['id'], 'to' => $d['to'] ?? '', 'subject' => $d['subject'] ?? '', 'snippet' => mb_substr(trim(preg_replace('/\s+/', ' ', $d['text'] ?? '')), 0, 120),
                    'updated' => (int) $r['updated'], 'atts' => count(mail_draft_atts($r['id'])) + count($d['fwd'] ?? [])];
            }
            json_out(['rows' => $rows]);
        case 'mail_draft_get':
            mail_drafts_table();
            $st = db()->prepare('SELECT d, updated FROM mail_drafts WHERE id = ?'); $st->execute([(string) ($in['draft'] ?? '')]);
            $r = $st->fetch();
            if (!$r) json_out(['error' => 'That draft was deleted or already sent.'], 404);
            json_out(['draft' => (string) $in['draft'], 'updated' => (int) $r['updated'], 'atts' => mail_draft_atts((string) $in['draft'])] + (json_decode($r['d'], true) ?: []));
        case 'mail_draft_del':
            mail_att_dir((string) ($in['draft'] ?? ''));
            mail_draft_del((string) $in['draft']);
            json_out(['ok' => true]);
        case 'mail_att_del_all':
            rrmdir_any(mail_att_dir((string) ($in['draft'] ?? '')));
            json_out(['ok' => true]);
        case 'mail_send':
            $cfg = $need();
            $to = $addrs($in['to'] ?? ''); $cc = $addrs($in['cc'] ?? ''); $bcc = $addrs($in['bcc'] ?? '');
            if (!$to) json_out(['error' => 'Who is it to? Add an email address.'], 400);
            $subject = trim(str_replace(["\r", "\n"], ' ', (string) ($in['subject'] ?? '')));
            $body = (string) ($in['body'] ?? '');
            if (trim($body) === '' && $subject === '') json_out(['error' => 'Write something first.'], 400);
            $irt = preg_match('/^<[^<>\s]+>$/', (string) ($in['in_reply_to'] ?? '')) ? $in['in_reply_to'] : '';
            $refs = preg_replace('/[^\x21-\x7e ]/', '', (string) ($in['references'] ?? ''));
            $ownHtml = mail_clean_html((string) ($in['html'] ?? ''));
            // Attachments: files you added (uploaded to this email's folder) + any kept from a forwarded email.
            @set_time_limit(300);
            if ((int) ini_get('memory_limit') > 0 && (int) ini_get('memory_limit') < 512) @ini_set('memory_limit', '512M');
            $atts = []; $size = 0; $draftDir = null;
            if (!empty($in['draft']) && !empty($in['atts']) && is_array($in['atts'])) {
                $draftDir = mail_att_dir((string) $in['draft']);
                foreach ($in['atts'] as $i) {
                    $i = (int) $i; $meta = json_decode((string) @file_get_contents("$draftDir/$i.json"), true);
                    if (!$meta || !is_file("$draftDir/$i.bin")) json_out(['error' => 'An attachment is still uploading or went missing. Remove it and add it again.'], 400);
                    $atts[] = ['name' => $meta['name'], 'type' => $meta['type'], 'data' => (string) file_get_contents("$draftDir/$i.bin")];
                    $size += (int) $meta['size'];
                }
            }
            if (!empty($in['fwd']) && is_array($in['fwd'])) {
                $fm = new SmrImap($cfg); $raws = [];
                foreach (array_slice($in['fwd'], 0, 40) as $fw) {
                    $ff = ($fw['folder'] ?? '') === 'sent' ? 'sent' : 'inbox'; $fu = (int) ($fw['uid'] ?? 0); $fp = (string) ($fw['path'] ?? '');
                    if (!$fu || !preg_match('/^[0-9.]{1,40}$/', $fp)) continue;
                    if (!isset($raws["$ff:$fu"])) { $fm->select($box($fm, $ff)); $raws["$ff:$fu"] = $fm->raw($fu); }
                    $pt = mail_part($raws["$ff:$fu"], $fp);
                    if (!$pt) json_out(['error' => 'An attachment from the original email could not be found.'], 400);
                    $atts[] = ['name' => $pt['name'], 'type' => $pt['type'] ?: mail_att_mime($pt['name']), 'data' => $pt['data']];
                    $size += strlen($pt['data']);
                }
                unset($raws);
            }
            foreach ($atts as $x) if (mail_att_blocked($x['name'])) json_out(['error' => '"' . $x['name'] . '" can\'t be emailed: Gmail and Outlook block this type of file.'], 400);
            if ($size > MAIL_ATT_MAX) json_out(['error' => 'The attachments come to ' . round($size / 1048576, 1) . ' MB. The most Gmail and Outlook accept is 25 MB, so remove some or send them as a link.'], 400);
            [$msg] = mail_build($cfg, $to, $cc, $subject, $body, $irt, $irt ? $refs : '', $ownHtml, $atts);
            unset($atts);
            smtp_send($cfg, array_values(array_unique(array_merge($to, $cc, $bcc))), $msg);   // Bcc people get it but aren't in the headers
            try { mail_contacts_add(array_map(function ($e) { return ['email' => $e, 'name' => '']; }, array_merge($to, $cc, $bcc)), 3); } catch (Throwable $e) {}
            $saved = true;
            $copy = $bcc ? 'Bcc: ' . implode(', ', $bcc) . "\r\n" . $msg : $msg;   // your Sent copy remembers who was Bcc'd (like Gmail/Outlook)
            unset($msg);
            try { $m = new SmrImap($cfg); $s = $m->special('sent'); if ($s) $m->append($s, $copy); else $saved = false; } catch (Throwable $e) { $saved = false; }
            if (!empty($in['draft'])) { try { mail_draft_del((string) $in['draft']); } catch (Throwable $e) {} }
            if ($draftDir) rrmdir_any($draftDir);
            if ($irt && !empty($in['uid'])) { try { $m = $m ?? new SmrImap($cfg); $m->select('INBOX', false); $m->flag((int) $in['uid'], '\\Answered'); } catch (Throwable $e) {} }
            json_out(['ok' => true, 'saved' => $saved]);
        case 'mail_delete':
            $m = new SmrImap($need());
            $f = ($in['folder'] ?? '') === 'sent' ? 'sent' : 'inbox';
            $m->select($box($m, $f), false);
            $trash = $m->special('trash');
            $m->remove((int) ($in['uid'] ?? 0), $trash);
            json_out(['ok' => true]);
        case 'mail_unseen':
            $m = new SmrImap($need());
            $f = ($in['folder'] ?? '') === 'sent' ? 'sent' : 'inbox';
            $m->select($box($m, $f), false);
            $m->flag((int) ($in['uid'] ?? 0), '\\Seen', false);
            json_out(['ok' => true]);
        }
    } catch (RuntimeException $e) {
        json_out(['error' => $e->getMessage()], 400);
    }
}

/* ---------- actions ---------- */
switch ($a) {
case 'logout':
    db()->prepare('DELETE FROM admin_tokens WHERE id = ?')->execute([$tok['id']]);
    set_cookie(ADMIN_COOKIE, '', 1, '/', 'Strict');
    json_out(['ok' => true]);

case 'password':
    if (!password_verify(preg_replace('/\s/', '', (string) ($in['current'] ?? '')), admin_hash())) json_out(['error' => 'Your current PIN is not right.'], 403);
    $new = preg_replace('/\s/', '', (string) ($in['new'] ?? ''));
    if (!preg_match('/^\d{4}$/', $new)) json_out(['error' => 'Use 4 digits for the new PIN.'], 400);
    db()->prepare('INSERT OR REPLACE INTO admin (id, pass_hash, created_at) VALUES (1, ?, ?)')->execute([password_hash($new, PASSWORD_DEFAULT), now()]);
    db()->prepare('DELETE FROM admin_tokens WHERE id != ?')->execute([$tok['id']]);
    json_out(['ok' => true]);

case 'list':
    deck_inbox_import();
    $demos = [];
    foreach (db()->query('SELECT * FROM demos ORDER BY sort, name') as $d) {
        $demos[] = demo_public($d) + ['enabled' => (int) $d['enabled'], 'sort' => (int) $d['sort'], 'source' => $d['source'],
            'tips_text' => $d['tips'], 'files_ok' => demo_root($d) !== null, 'updated_at' => (int) $d['updated_at']];
    }
    $links = [];
    foreach (db()->query('SELECT * FROM links ORDER BY id DESC LIMIT 300') as $l) $links[] = link_row($l);
    $events = db()->query('SELECT e.type, e.text, e.at, e.link_id, l.label FROM events e LEFT JOIN links l ON l.id = e.link_id ORDER BY e.id DESC LIMIT 20')->fetchAll();
    $pushN = (int) db()->query('SELECT COUNT(*) FROM push_subs')->fetchColumn();
    $build = max((int) @filemtime(__DIR__ . '/index.php'), (int) @filemtime(__DIR__ . '/api.php'));
    json_out(['build' => $build, 'demos' => $demos, 'links' => $links, 'events' => $events, 'push_devices' => $pushN, 'now' => now(), 'storage' => strpos(private_dir(), SITE_ROOT) === 0 ? 'inside' : 'outside']);

case 'push_key':
    require_once dirname(__DIR__) . '/demo-lib/push.php';
    json_out(['key' => vapid_keys()['public']]);

case 'push_subscribe':
    $ep = (string) ($in['endpoint'] ?? '');
    $k = (array) ($in['keys'] ?? []);
    if (!preg_match('#^https://[^\s]+$#', $ep) || empty($k['p256dh']) || empty($k['auth'])) json_out(['error' => 'Notifications could not be set up on this device.'], 400);
    db()->prepare('INSERT OR REPLACE INTO push_subs (endpoint, p256dh, auth, created_at) VALUES (?,?,?,?)')->execute([$ep, (string) $k['p256dh'], (string) $k['auth'], now()]);
    require_once dirname(__DIR__) . '/demo-lib/push.php';
    json_out_then(['ok' => true], function () { push_all('SMR Admin', 'Notifications are on. You will hear when someone opens a demo.', '/demo-admin/#live', 'welcome'); });

case 'push_unsubscribe':
    db()->prepare('DELETE FROM push_subs WHERE endpoint = ?')->execute([(string) ($in['endpoint'] ?? '')]);
    json_out(['ok' => true]);

case 'push_test':
    require_once dirname(__DIR__) . '/demo-lib/push.php';
    json_out_then(['ok' => true], function () { push_all('SMR Admin', 'Test notification: it works.', '/demo-admin/#live', 'test'); });

case 'push_note':
    require_once dirname(__DIR__) . '/demo-lib/push.php';
    $t = trim(mb_substr((string) ($in['title'] ?? 'SMR Admin'), 0, 80)) ?: 'SMR Admin';
    $bd = trim(mb_substr((string) ($in['body'] ?? ''), 0, 300));
    if ($bd === '') json_out(['error' => 'Empty message.'], 400);
    json_out(['ok' => true, 'sent' => push_all($t, $bd, '/demo-admin/', 'note-' . time())]);

case 'link_create':
    $apps = array_values(array_unique(array_filter(array_map('strval', (array) ($in['apps'] ?? [])), function ($s) { return (bool) demo_by_slug($s); })));
    if (!$apps) json_out(['error' => 'Choose at least one demo.'], 400);
    $mode = in_array($in['mode'] ?? '', ['single', 'shared', 'limited'], true) ? $in['mode'] : 'single';
    $max = $mode === 'limited' ? max(2, min(500, (int) ($in['max_uses'] ?? 3))) : ($mode === 'single' ? 1 : 0);
    $dur = (int) ($in['duration'] ?? DEFAULT_MINUTES) === 0 ? 0 : max(5, min(30 * 24 * 60, (int) ($in['duration'] ?? DEFAULT_MINUTES)));
    $direct = !empty($in['direct']) ? 1 : 0;
    if ($dur === 0) { $mode = 'shared'; $max = 0; } // open link: anyone with it, any time
    if ($direct && count($apps) !== 1) json_out(['error' => 'A direct link opens one app or website. Choose just one.'], 400);
    $token = rand_token(18);
    db()->prepare('INSERT INTO links (token, pin, label, apps, mode, max_uses, uses, duration, tips, created_at, direct, deck) VALUES (?,?,?,?,?,?,0,?,?,?,?,?)')
        ->execute([$token, !empty($in['nopin']) ? '' : new_pin(), mb_substr(trim((string) ($in['label'] ?? '')), 0, 80), json_encode($apps), $mode, $max, $dur, !empty($in['tips']) ? 1 : 0, now(), $direct, array_key_exists('deck', $in) && empty($in['deck']) ? 0 : 1]);
    json_out(['ok' => true, 'link' => link_row(get_link(['id' => db()->lastInsertId()]))]);

case 'link_revoke':
    $l = get_link($in);
    db()->prepare('UPDATE links SET revoked = 1 WHERE id = ?')->execute([$l['id']]);
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_extend':
    $l = get_link($in);
    $mins = max(1, min(24 * 60, (int) ($in['minutes'] ?? 15)));
    $add = $mins * 60; $now = now();
    if ((int) $l['duration'] === 0) { db()->prepare('UPDATE links SET revoked = 0 WHERE id = ?')->execute([$l['id']]); json_out(['ok' => true, 'link' => link_row(get_link($in))]); }
    if ($l['mode'] === 'shared') {
        if ($l['activated_at']) db()->prepare('UPDATE links SET expires_at = MAX(expires_at, CAST(? AS INTEGER)) + ?, revoked = 0 WHERE id = ?')->execute([$now, $add, $l['id']]);
        else db()->prepare('UPDATE links SET duration = duration + ?, revoked = 0 WHERE id = ?')->execute([$mins, $l['id']]);
    } else {
        $n = db()->prepare('SELECT COUNT(*) FROM sessions WHERE link_id = ?');
        $n->execute([$l['id']]);
        if ((int) $n->fetchColumn()) db()->prepare('UPDATE sessions SET expires_at = MAX(expires_at, CAST(? AS INTEGER)) + ? WHERE link_id = ?')->execute([$now, $add, $l['id']]);
        else db()->prepare('UPDATE links SET duration = duration + ? WHERE id = ?')->execute([$mins, $l['id']]);
        db()->prepare('UPDATE links SET revoked = 0 WHERE id = ?')->execute([$l['id']]);
    }
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_newpin':
    $l = get_link($in);
    db()->prepare('DELETE FROM sessions WHERE link_id = ?')->execute([$l['id']]);
    db()->prepare('UPDATE links SET pin = ?, uses = 0, activated_at = NULL, expires_at = NULL, revoked = 0 WHERE id = ?')->execute([(string) $l['pin'] === '' ? '' : new_pin(), $l['id']]);
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_delete':
    $l = get_link($in);
    db()->prepare('INSERT OR REPLACE INTO gone_links (token, deleted_at) VALUES (?,?)')->execute([$l['token'], now()]);
    db()->prepare('DELETE FROM links WHERE id = ?')->execute([$l['id']]);
    json_out(['ok' => true]);

case 'demo_save':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $accent = preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($in['accent'] ?? '')) ? $in['accent'] : $d['accent'];
    if (isset($in['ver']) && preg_match('/^\d{1,3}(\.\d{1,3})?$/', trim((string) $in['ver']))) db()->prepare('UPDATE demos SET ver = ? WHERE id = ?')->execute([trim((string) $in['ver']), $d['id']]);
    db()->prepare('UPDATE demos SET name = ?, tagline = ?, description = ?, tips = ?, accent = ?, enabled = ?, sort = ?, updated_at = ? WHERE id = ?')->execute([
        mb_substr(trim((string) ($in['name'] ?? $d['name'])), 0, 60) ?: $d['name'],
        mb_substr(trim((string) ($in['tagline'] ?? $d['tagline'])), 0, 90),
        mb_substr(trim((string) ($in['description'] ?? $d['description'])), 0, 400),
        mb_substr(trim(str_replace("\r", '', (string) ($in['tips'] ?? $d['tips']))), 0, 1500),
        $accent, isset($in['enabled']) ? (int) (bool) $in['enabled'] : (int) $d['enabled'],
        isset($in['sort']) ? (int) $in['sort'] : (int) $d['sort'], now(), $d['id']]);
    json_out(['ok' => true]);

case 'demo_upload':
    $f = $_FILES['zip'] ?? [];
    if ($err = upload_error($f)) json_out(['error' => $err], 400);
    $existing = !empty($in['slug']) ? demo_by_slug((string) $in['slug']) : null;
    if (!empty($in['slug']) && !$existing) json_out(['error' => 'Demo not found.'], 404);
    if ($existing) { $slug = $existing['slug']; }
    else {
        $name = trim((string) ($in['name'] ?? ''));
        if ($name === '') json_out(['error' => 'Give the demo a name.'], 400);
        $slug = $base = slugify($name); $n = 2;
        while (demo_by_slug($slug)) $slug = $base . '-' . $n++;
    }
    $folder = $slug . '-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3));
    $dest = private_dir() . '/uploads/' . $folder;
    // A single .html app (e.g. downloaded from Claude) is accepted as well as a ZIP.
    $head = (string) @file_get_contents($f['tmp_name'], false, null, 0, 512);
    $isHtml = preg_match('/\.html?$/i', (string) ($f['name'] ?? '')) || preg_match('/^\s*(<!doctype html|<html)/i', $head);
    if ($isHtml) {
        if (!@mkdir($dest, 0750, true) && !is_dir($dest)) json_out(['error' => 'Could not create the demo folder.'], 500);
        if (!move_uploaded_file($f['tmp_name'], $dest . '/index.html')) { rrmdir($dest); json_out(['error' => 'Could not save the file.'], 500); }
        $res = ['files' => 1, 'skipped' => 0];
    } else
    try { $res = extract_build($f['tmp_name'], $dest); }
    catch (Throwable $e) { rrmdir($dest); json_out(['error' => $e->getMessage()], 400); }
    if ($existing) {
        db()->prepare("UPDATE demos SET dir = ?, source = 'upload', updated_at = ?, ver = ? WHERE id = ?")->execute(['up:' . $folder, now(), ver_bump((string) ($existing['ver'] ?? '1.0')), $existing['id']]);
        if (strpos($existing['dir'], 'up:') === 0) rrmdir(private_dir() . '/uploads/' . substr($existing['dir'], 3));
    } else {
        $sort = (int) db()->query('SELECT COALESCE(MAX(sort), 0) + 10 FROM demos')->fetchColumn();
        db()->prepare("INSERT INTO demos (slug, name, tagline, description, tips, source, dir, icon, accent, enabled, sort, created_at, updated_at)
            VALUES (?, ?, ?, ?, '', 'upload', ?, '', '#5b5bff', 1, ?, ?, ?)")
            ->execute([$slug, mb_substr($name, 0, 60), mb_substr(trim((string) ($in['tagline'] ?? '')), 0, 90), '', 'up:' . $folder, $sort, now(), now()]);
    }
    json_out(['ok' => true, 'slug' => $slug] + $res);

case 'demo_icon':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $f = $_FILES['icon'] ?? [];
    if ($err = upload_error($f)) json_out(['error' => $err], 400);
    if ($f['size'] > 3 * 1024 * 1024) json_out(['error' => 'Use an image under 3 MB.'], 400);
    $info = @getimagesize($f['tmp_name']);
    $ext = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
    if (!$ext) json_out(['error' => 'Use a PNG, JPG or WebP image.'], 400);
    $dir = private_dir() . '/media';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $name = $d['slug'] . '-' . time() . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) json_out(['error' => 'Could not save the icon.'], 500);
    if (strpos($d['icon'], 'up:') === 0) @unlink($dir . '/' . basename(substr($d['icon'], 3)));
    db()->prepare('UPDATE demos SET icon = ?, updated_at = ? WHERE id = ?')->execute(['up:' . $name, now(), $d['id']]);
    json_out(['ok' => true]);

/* Features presentation (deck) for a demo. The browser turns a PDF into slide images; they go to a staging
   folder first and replace the old deck only when every page has arrived. */
case 'deck_start':
case 'deck_page':
case 'deck_pdf':
case 'deck_finish':
case 'deck_remove':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $dir = deck_dir($d['slug']); $stage = $dir . '.new';
    if ($a === 'deck_remove') {
        rrmdir_any($dir); rrmdir_any($stage);
        db()->prepare('DELETE FROM decks WHERE slug = ?')->execute([$d['slug']]);
        json_out(['ok' => true]);
    }
    if ($a === 'deck_start') { rrmdir_any($stage); @mkdir($stage, 0750, true); json_out(['ok' => true]); }
    if (!is_dir($stage)) json_out(['error' => 'Start the upload again.'], 400);
    if ($a === 'deck_page') {
        $n = (int) ($in['n'] ?? 0);
        if ($n < 1 || $n > 200) json_out(['error' => 'Bad page.'], 400);
        $f = $_FILES['file'] ?? [];
        if ($err = upload_error($f)) json_out(['error' => $err], 400);
        if ($f['size'] > 10 * 1024 * 1024) json_out(['error' => 'A slide is over 10 MB.'], 400);
        $info = @getimagesize($f['tmp_name']);
        $ext = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
        if (!$ext) json_out(['error' => 'Slides must be PNG, JPG or WebP.'], 400);
        foreach (['webp', 'jpg', 'png'] as $e) @unlink("$stage/$n.$e");
        if (!move_uploaded_file($f['tmp_name'], "$stage/$n.$ext")) json_out(['error' => 'Could not save the slide.'], 500);
        json_out(['ok' => true]);
    }
    if ($a === 'deck_pdf') {
        $f = $_FILES['file'] ?? [];
        if ($err = upload_error($f)) json_out(['error' => $err], 400);
        if ($f['size'] > 60 * 1024 * 1024) json_out(['error' => 'The PDF is over 60 MB, so only the slides were kept.'], 400);
        if ((string) @file_get_contents($f['tmp_name'], false, null, 0, 5) !== '%PDF-') json_out(['error' => 'That is not a PDF.'], 400);
        if (!move_uploaded_file($f['tmp_name'], "$stage/deck.pdf")) json_out(['error' => 'Could not save the PDF.'], 500);
        json_out(['ok' => true]);
    }
    // deck_finish
    $pages = (int) ($in['pages'] ?? 0);
    if ($pages < 1 || $pages > 200) json_out(['error' => 'No slides.'], 400);
    for ($i = 1; $i <= $pages; $i++) if (!glob("$stage/$i.*")) json_out(['error' => 'Slide ' . $i . ' did not upload. Try again.'], 400);
    try { deck_install($d['slug'], $stage, $pages, (string) ($in['title'] ?? ''), (float) ($in['ratio'] ?? 1.7778)); }
    catch (Throwable $e) { json_out(['error' => $e->getMessage()], 500); }
    json_out(['ok' => true, 'deck' => deck_public($d['slug'])]);

case 'demo_delete':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    rrmdir_any(deck_dir($d['slug'])); db()->prepare('DELETE FROM decks WHERE slug = ?')->execute([$d['slug']]);
    $seed = is_file(SEED_DIR . '/' . $d['slug'] . '.pack.php');
    if ($seed) {
        // Demos that ship with the website can only be hidden (they would come back on the next update).
        db()->prepare("UPDATE demos SET enabled = 0, updated_at = ? WHERE id = ?")->execute([now(), $d['id']]);
        if (strpos($d['dir'], 'up:') === 0) {
            rrmdir(private_dir() . '/uploads/' . substr($d['dir'], 3));
            db()->prepare("UPDATE demos SET dir = ?, source = 'seed' WHERE id = ?")->execute(['seed:' . $d['slug'], $d['id']]);
        }
        json_out(['ok' => true, 'hidden' => true]);
    }
    if (strpos($d['dir'], 'up:') === 0) rrmdir(private_dir() . '/uploads/' . substr($d['dir'], 3));
    if (strpos($d['icon'], 'up:') === 0) @unlink(private_dir() . '/media/' . basename(substr($d['icon'], 3)));
    db()->prepare('DELETE FROM demos WHERE id = ?')->execute([$d['id']]);
    json_out(['ok' => true]);
}

/* ---------- designs (finished designs sent to clients) ---------- */
if (strpos($a, 'd_') === 0) {
    require_once dirname(__DIR__) . '/demo-lib/designs.php';
    designs_sweep();
    $dset = function () use ($in): array { $s = set_by_id((int) ($in['id'] ?? 0)); if (!$s) json_out(['error' => 'Not found.'], 404); return $s; };
    $drow = function (array $s): array {
        $files = set_files($s);
        $designs = []; $thumbs = [];
        foreach ($files as $f) { $designs[(int) $f['design']] = 1; if (count($thumbs) < 4 && $f['page'] == 1) $thumbs[] = '/designs/f.php?k=' . $s['token'] . '&f=' . $f['id'] . ($f['prev'] !== '' ? '&p=1' : ''); }
        return ['id' => (int) $s['id'], 'client' => $s['client'], 'title' => $s['title'], 'phone' => $s['phone'], 'url' => set_url($s),
            'created_at' => (int) $s['created_at'], 'expires_at' => (int) $s['expires_at'], 'archived_at' => (int) $s['archived_at'],
            'views' => (int) $s['views'], 'last_view' => (int) $s['last_view'], 'source' => $s['source'],
            'designs' => count($designs), 'files' => count($files), 'bytes' => array_sum(array_column($files, 'size')), 'thumbs' => $thumbs];
    };
    if ($a === 'd_list') {
        $rows = db()->query('SELECT * FROM design_sets WHERE ready = 1 ORDER BY archived_at > 0, created_at DESC')->fetchAll();
        $old = designs_old_archive();
        $snooze = (int) kv_get('design_purge_snooze', '0');
        json_out(['sets' => array_map($drow, $rows), 'now' => now(), 'days' => DESIGN_DAYS,
            'purge' => ['count' => count($old), 'bytes' => array_sum(array_map('set_bytes', $old)), 'ask' => count($old) > 0 && $snooze < now()]]);
    }
    if ($a === 'd_create') {
        $s = set_create((string) ($in['client'] ?? ''), (string) ($in['title'] ?? ''), (string) ($in['phone'] ?? ''), 'admin');
        json_out(['id' => (int) $s['id']]);
    }
    if ($a === 'd_upload') {
        $s = $dset();
        if ((int) $s['ready']) json_out(['error' => 'This delivery is already finished.'], 400);
        $f = $_FILES['file'] ?? [];
        if ($err = upload_error($f)) json_out(['error' => $err], 400);
        $pv = $_FILES['prev'] ?? null;
        try {
            $r = set_add_file($s, $f['tmp_name'], (string) ($f['name'] ?? ''), max(0, min(50, (int) ($in['design'] ?? 0))), (string) ($in['dname'] ?? ''),
                $pv && ($pv['error'] ?? 1) === UPLOAD_ERR_OK ? $pv['tmp_name'] : null, true);
        } catch (Throwable $e) { json_out(['error' => $e->getMessage()], 400); }
        json_out(['ok' => true] + $r);
    }
    if ($a === 'd_finish') {
        $s = $dset();
        $n = db()->prepare('SELECT COUNT(*) FROM design_files WHERE set_id = ?'); $n->execute([$s['id']]);
        if (!(int) $n->fetchColumn()) { set_delete($s); json_out(['error' => 'No files were uploaded.'], 400); }
        db()->prepare('UPDATE design_sets SET ready = 1 WHERE id = ?')->execute([$s['id']]);
        json_out(['ok' => true, 'set' => $drow(set_by_id((int) $s['id']))]);
    }
    if ($a === 'd_cancel') { $s = $dset(); if (!(int) $s['ready']) set_delete($s); json_out(['ok' => true]); }
    if ($a === 'd_edit') {
        $s = $dset();
        db()->prepare('UPDATE design_sets SET client = ?, title = ?, phone = ? WHERE id = ?')->execute([mb_substr(trim((string) ($in['client'] ?? '')), 0, 80), mb_substr(trim((string) ($in['title'] ?? '')), 0, 100), preg_replace('/[^0-9+ ]/', '', (string) ($in['phone'] ?? '')), $s['id']]);
        json_out(['ok' => true]);
    }
    if ($a === 'd_extend') { $s = $dset(); set_reopen($s, max(1, min(90, (int) ($in['days'] ?? DESIGN_DAYS)))); json_out(['ok' => true, 'set' => $drow(set_by_id((int) $s['id']))]); }
    if ($a === 'd_archive') { $s = $dset(); set_archive($s); json_out(['ok' => true]); }
    if ($a === 'd_delete') { $s = $dset(); set_delete($s); json_out(['ok' => true]); }
    if ($a === 'd_purge') {
        $list = !empty($in['all']) ? db()->query('SELECT * FROM design_sets WHERE archived_at > 0')->fetchAll() : designs_old_archive();
        foreach ($list as $s) set_delete($s);
        kv_set('design_purge_snooze', (string) (now() + DESIGN_PURGE_DAYS * 86400));
        json_out(['ok' => true, 'deleted' => count($list)]);
    }
    if ($a === 'd_snooze') { kv_set('design_purge_snooze', (string) (now() + DESIGN_PURGE_DAYS * 86400)); json_out(['ok' => true]); }
}

json_out(['error' => 'Unknown action'], 404);
