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
                'to' => mail_addr_list($hh['to'] ?? ''), 'cc' => mail_addr_list($hh['cc'] ?? ''),
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
        case 'mail_att_del_all':
            rrmdir_any(mail_att_dir((string) ($in['draft'] ?? '')));
            json_out(['ok' => true]);
        case 'mail_send':
            $cfg = $need();
            $to = $addrs($in['to'] ?? ''); $cc = $addrs($in['cc'] ?? '');
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
            smtp_send($cfg, array_merge($to, $cc), $msg);
            try { mail_contacts_add(array_map(function ($e) { return ['email' => $e, 'name' => '']; }, array_merge($to, $cc)), 3); } catch (Throwable $e) {}
            $saved = true;
            try { $m = new SmrImap($cfg); $s = $m->special('sent'); if ($s) $m->append($s, $msg); else $saved = false; } catch (Throwable $e) { $saved = false; }
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
