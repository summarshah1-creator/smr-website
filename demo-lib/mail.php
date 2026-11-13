<?php
/* Email for SMR Admin: the owner's own mailbox over IMAP (read) and SMTP (send).
   Settings live in the private database; the password is encrypted with a key kept in private storage. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }

/* ---------- settings ---------- */
function mail_table(): void {
    db()->exec("CREATE TABLE IF NOT EXISTS mail_cfg (id INTEGER PRIMARY KEY CHECK (id = 1), email TEXT, name TEXT, host TEXT, pass TEXT, updated_at INTEGER)");
}
function mail_key(): string {
    $f = private_dir() . '/mail.key';
    if (!is_file($f)) { file_put_contents($f, random_bytes(32)); @chmod($f, 0600); }
    return (string) file_get_contents($f);
}
function mail_encrypt(string $s): string {
    $iv = random_bytes(12);
    $ct = openssl_encrypt($s, 'aes-256-gcm', mail_key(), OPENSSL_RAW_DATA, $iv, $tag);
    return base64_encode($iv . $tag . $ct);
}
function mail_decrypt(string $s): string {
    $b = base64_decode($s, true);
    if ($b === false || strlen($b) < 29) return '';
    $out = openssl_decrypt(substr($b, 28), 'aes-256-gcm', mail_key(), OPENSSL_RAW_DATA, substr($b, 0, 12), substr($b, 12, 16));
    return $out === false ? '' : $out;
}
function mail_cfg(): ?array {
    mail_table();
    $r = db()->query('SELECT * FROM mail_cfg WHERE id = 1')->fetch();
    if (!$r || !$r['email'] || !$r['pass']) return null;
    $r['password'] = mail_decrypt($r['pass']);
    $r['email'] = strtolower($r['email']);
    return $r['password'] === '' ? null : $r;
}
function mail_cfg_public(): array {
    mail_table();
    $r = db()->query('SELECT email, name, host FROM mail_cfg WHERE id = 1')->fetch() ?: [];
    return ['set' => (bool) mail_cfg(), 'email' => strtolower($r['email'] ?? 'summar@smrgraphics.co.uk'), 'name' => $r['name'] ?? 'Summar | SMR Digital',
        'host' => $r['host'] ?? 'mail.smrgraphics.co.uk', 'sig' => ($g = mail_sig()), 'sig_html' => $g['on'] ? mail_sig_html($g, '/assets/email/sig-brand.gif') : ''];
}
function mail_cfg_save(string $email, string $name, string $host, string $pass): void {
    mail_table();
    $old = db()->query('SELECT pass FROM mail_cfg WHERE id = 1')->fetchColumn();
    $enc = $pass !== '' ? mail_encrypt($pass) : (string) $old;
    db()->prepare('INSERT OR REPLACE INTO mail_cfg (id, email, name, host, pass, updated_at) VALUES (1,?,?,?,?,?)')->execute([$email, $name, $host, $enc, time()]);
}
function mail_cfg_clear(): void { mail_table(); db()->exec('DELETE FROM mail_cfg'); }

/* ---------- signature ---------- */
function mail_sig_cols(): void {
    mail_table();
    add_col(db(), 'mail_cfg', 'sig_on', 'INTEGER DEFAULT 1');
    add_col(db(), 'mail_cfg', 'sig_name', "TEXT DEFAULT 'Summar Shah'");
    add_col(db(), 'mail_cfg', 'sig_title', "TEXT DEFAULT 'Director'");
    add_col(db(), 'mail_cfg', 'sig_phone', "TEXT DEFAULT '07931 814538'");
}
function mail_sig(): array {
    mail_sig_cols();
    $r = db()->query('SELECT sig_on, sig_name, sig_title, sig_phone, email FROM mail_cfg WHERE id = 1')->fetch() ?: [];
    return ['on' => (int) ($r['sig_on'] ?? 1) === 1, 'name' => $r['sig_name'] ?? 'Summar Shah', 'title' => $r['sig_title'] ?? 'Director',
        'phone' => $r['sig_phone'] ?? '07931 814538', 'email' => strtolower($r['email'] ?? 'summar@smrgraphics.co.uk')];
}
function mail_sig_save(bool $on, string $name, string $title, string $phone): void {
    mail_sig_cols();
    db()->prepare('UPDATE mail_cfg SET sig_on = ?, sig_name = ?, sig_title = ?, sig_phone = ? WHERE id = 1')->execute([$on ? 1 : 0, $name, $title, $phone]);
}
function mail_sig_text(array $g): string {
    $l = ['-- ', $g['name'] . ($g['title'] !== '' ? ', ' . $g['title'] : ''), 'SMR · Digital · Graphics · Marketing'];
    $c = array_filter([$g['phone'], $g['email'], 'smrgraphics.co.uk']);
    $l[] = implode(' · ', $c);
    return implode("\r\n", $l);
}
/* The signature is one picture (assets/email/sig-brand.gif: dark card, animated logo, name, title, phone, email, web)
   so it looks the same in every email app, light or dark mode, phone or laptop. $img = cid:… in emails, a URL in previews. */
function mail_sig_html(array $g, string $img): string {
    $e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
    $alt = $g['name'] . ', ' . $g['title'] . ' · SMR Digital · Graphics · Marketing · ' . $g['phone'] . ' · ' . $g['email'];
    return '<div style="margin-top:22px;line-height:0;font-size:0"><a href="https://smrgraphics.co.uk" style="text-decoration:none;display:inline-block;max-width:100%">'
        . '<img src="' . $e($img) . '" width="380" alt="' . $e($alt) . '" style="display:block;width:380px;max-width:100%;height:auto;border:0;outline:none"></a></div>';
}
function mail_sig_png(): string { return (string) @file_get_contents(SITE_ROOT . '/assets/email/sig-brand.gif'); }

function mail_stream(string $host, int $port, int $timeout = 20) {
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true, 'peer_name' => $host]]);
    $s = @stream_socket_client('ssl://' . $host . ':' . $port, $no, $str, $timeout, STREAM_CLIENT_CONNECT, $ctx);
    if (!$s) {
        $msg = (string) $str;
        if (stripos($msg, 'certificate') !== false || stripos($msg, 'SSL') !== false || $msg === '')
            throw new RuntimeException("Couldn't make a secure connection to $host. Use the server name from SiteGround (Site Tools → Email → Accounts → Mail Configuration).");
        throw new RuntimeException("Couldn't reach $host ($msg).");
    }
    stream_set_timeout($s, 30);
    return $s;
}

/* ---------- IMAP ---------- */
class SmrImap {
    private $s; private $n = 0; public $caps = '';
    function __construct(array $cfg) {
        $this->s = mail_stream($cfg['host'], 993);
        $this->line();
        $r = $this->cmd('LOGIN ' . $this->q($cfg['email']) . ' ' . $this->q($cfg['password']), false);
        if ($r[0] !== 'OK') throw new RuntimeException('The email address or password was not accepted.');
        $c = $this->cmd('CAPABILITY');
        foreach ($c[1] as $u) if (stripos($u['t'], 'CAPABILITY') === 0) $this->caps = strtoupper($u['t']);
    }
    function __destruct() { if ($this->s) { @fwrite($this->s, "Z LOGOUT\r\n"); @fclose($this->s); } }
    function q(string $s): string { return '"' . addcslashes($s, "\"\\") . '"'; }
    private function line(): string {
        $l = fgets($this->s);
        if ($l === false) throw new RuntimeException('The mail server stopped responding.');
        return $l;
    }
    private function read(int $n): string {
        $b = '';
        while (strlen($b) < $n) { $c = fread($this->s, $n - strlen($b)); if ($c === false || $c === '') throw new RuntimeException('The mail server stopped responding.'); $b .= $c; }
        return $b;
    }
    /* Returns [status, untagged[]] where each untagged item is ['t' => text with {#i} placeholders, 'l' => literals]. */
    function cmd(string $c, bool $strict = true): array {
        $tag = 'A' . (++$this->n);
        fwrite($this->s, $tag . ' ' . $c . "\r\n");
        $out = []; $cur = null;
        while (true) {
            $l = $this->line();
            if ($cur === null) {
                if (strpos($l, $tag . ' ') === 0) {
                    $st = strtoupper(substr($l, strlen($tag) + 1, 2));
                    $st = $st === 'OK' ? 'OK' : (strtoupper(substr($l, strlen($tag) + 1, 3)) === 'BAD' ? 'BAD' : 'NO');
                    if ($strict && $st !== 'OK') throw new RuntimeException('Mail server: ' . trim(substr($l, strlen($tag) + 1)));
                    return [$st, $out, trim($l)];
                }
                $cur = ['t' => '', 'l' => []];
                if (strpos($l, '* ') === 0) $l = substr($l, 2);
            }
            if (preg_match('/\{(\d+)\}\r\n$/', $l, $m)) {
                $cur['t'] .= substr($l, 0, -strlen($m[0])) . '{#' . count($cur['l']) . '}';
                $cur['l'][] = $this->read((int) $m[1]);
                continue;
            }
            $cur['t'] .= rtrim($l, "\r\n");
            $out[] = $cur; $cur = null;
        }
    }
    function folders(): array {
        $r = $this->cmd('LIST "" "*"');
        $f = [];
        foreach ($r[1] as $u) {
            if (!preg_match('/^LIST \(([^)]*)\) (?:NIL|"(?:[^"\\\\]|\\\\.)*") (.+)$/i', $u['t'], $m)) continue;
            $name = $m[2];
            if (preg_match('/^\{#(\d+)\}$/', $name, $x)) $name = $u['l'][(int) $x[1]];
            elseif ($name[0] === '"') $name = stripcslashes(substr($name, 1, -1));
            $f[] = ['name' => $name, 'attr' => strtolower($m[1])];
        }
        return $f;
    }
    function special(string $kind): ?string {
        $re = ['sent' => '/(^|[.\/])sent( items| messages| mail)?$/i', 'trash' => '/(^|[.\/])(trash|deleted( items| messages)?|bin)$/i'][$kind];
        $all = $this->folders();
        foreach ($all as $f) if (strpos($f['attr'], '\\' . $kind) !== false) return $f['name'];
        foreach ($all as $f) if (preg_match($re, $f['name'])) return $f['name'];
        return null;
    }
    function select(string $box, bool $ro = true): int {
        $r = $this->cmd(($ro ? 'EXAMINE ' : 'SELECT ') . $this->q($box));
        foreach ($r[1] as $u) if (preg_match('/^(\d+) EXISTS/i', $u['t'], $m)) return (int) $m[1];
        return 0;
    }
    function uids(): array {
        $r = $this->cmd('UID SEARCH ALL');
        foreach ($r[1] as $u) if (stripos($u['t'], 'SEARCH') === 0) return array_map('intval', array_filter(explode(' ', trim(substr($u['t'], 6)))));
        return [];
    }
    function headers(array $uids): array {
        if (!$uids) return [];
        $r = $this->cmd('UID FETCH ' . implode(',', $uids) . ' (UID FLAGS INTERNALDATE RFC822.SIZE BODYSTRUCTURE BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)])');
        $rows = [];
        foreach ($r[1] as $u) {
            if (!preg_match('/^\d+ FETCH/i', $u['t'])) continue;
            if (!preg_match('/UID (\d+)/', $u['t'], $m)) continue;
            $h = mail_headers(end($u['l']) ?: '');
            preg_match('/FLAGS \(([^)]*)\)/i', $u['t'], $fl);
            preg_match('/INTERNALDATE "([^"]+)"/i', $u['t'], $dt);
            $from = mail_addr_list($h['from'] ?? '');
            $to = mail_addr_list($h['to'] ?? '');
            $rows[] = ['uid' => (int) $m[1], 'seen' => stripos($fl[1] ?? '', '\\Seen') !== false,
                'from' => $from[0] ?? ['name' => '', 'email' => ''], 'to' => $to,
                'subject' => mail_hdr_decode($h['subject'] ?? ''),
                'date' => strtotime($dt[1] ?? ($h['date'] ?? '')) ?: 0,
                'att' => (bool) preg_match('/"(attachment)"/i', $u['t'])];
        }
        usort($rows, function ($a, $b) { return $b['uid'] - $a['uid']; });
        return $rows;
    }
    function raw(int $uid): string {
        $r = $this->cmd('UID FETCH ' . $uid . ' (BODY.PEEK[])');
        foreach ($r[1] as $u) if (preg_match('/UID ' . $uid . '\b/', $u['t']) || $u['l']) return $u['l'] ? end($u['l']) : '';
        return '';
    }
    function flag(int $uid, string $flag, bool $on = true): void { $this->cmd('UID STORE ' . $uid . ' ' . ($on ? '+' : '-') . 'FLAGS.SILENT (' . $flag . ')'); }
    function remove(int $uid, ?string $trash): void {
        if ($trash) {
            if (strpos($this->caps, 'MOVE') !== false) { $this->cmd('UID MOVE ' . $uid . ' ' . $this->q($trash)); return; }
            $this->cmd('UID COPY ' . $uid . ' ' . $this->q($trash));
        }
        $this->flag($uid, '\\Deleted');
        $this->cmd(strpos($this->caps, 'UIDPLUS') !== false ? 'UID EXPUNGE ' . $uid : 'EXPUNGE');
    }
    function append(string $box, string $msg): void {
        $tag = 'A' . (++$this->n);
        fwrite($this->s, $tag . ' APPEND ' . $this->q($box) . ' (\\Seen) {' . strlen($msg) . "}\r\n");
        $l = $this->line();
        if ($l[0] !== '+') return;
        mail_write_all($this->s, $msg . "\r\n");
        stream_set_timeout($this->s, 180);
        while (strpos($l = $this->line(), $tag . ' ') !== 0) {}
    }
    function unseen(string $box = 'INBOX'): int {
        $r = $this->cmd('STATUS ' . $this->q($box) . ' (UNSEEN)', false);
        foreach ($r[1] as $u) if (preg_match('/UNSEEN (\d+)/i', $u['t'], $m)) return (int) $m[1];
        return 0;
    }
}

/* ---------- message parsing ---------- */
function mail_headers(string $raw): array {
    $raw = preg_replace("/\r\n?/", "\n", $raw);
    $raw = preg_replace("/\n[ \t]+/", ' ', $raw);
    $h = [];
    foreach (explode("\n", $raw) as $l) {
        if (!preg_match('/^([!-9;-~]+):\s*(.*)$/', $l, $m)) continue;
        $k = strtolower($m[1]);
        if (!isset($h[$k])) $h[$k] = $m[2];
    }
    return $h;
}
function mail_hdr_decode(string $s): string {
    if ($s === '') return '';
    if (strpos($s, '=?') !== false) {
        $d = function_exists('iconv_mime_decode') ? @iconv_mime_decode($s, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8') : false;
        if ($d === false || $d === '') $d = mb_decode_mimeheader($s);
        $s = $d;
    }
    return mail_utf8($s, '');
}
function mail_utf8(string $s, string $cs): string {
    $cs = strtoupper(trim($cs, " \"'"));
    if ($cs !== '' && $cs !== 'UTF-8' && $cs !== 'US-ASCII') {
        try { $c = @mb_convert_encoding($s, 'UTF-8', $cs === 'ISO-8859-1' ? 'Windows-1252' : $cs); if ($c !== false) $s = $c; }
        catch (Throwable $e) { $c = @iconv($cs, 'UTF-8//IGNORE', $s); if ($c !== false) $s = $c; }
    }
    if (!mb_check_encoding($s, 'UTF-8')) $s = mb_convert_encoding($s, 'UTF-8', 'Windows-1252');
    return $s;
}
function mail_addr_list(string $s): array {
    $s = mail_hdr_decode($s);
    $out = [];
    foreach (preg_split('/,(?=(?:[^"]*"[^"]*")*[^"]*$)/', $s) as $p) {
        $p = trim($p);
        if ($p === '') continue;
        if (preg_match('/^(.*)<([^>]+)>\s*$/', $p, $m)) $out[] = ['name' => trim($m[1], " \"'"), 'email' => trim($m[2])];
        else $out[] = ['name' => '', 'email' => trim($p, ' <>')];
    }
    return $out;
}
function mail_params(string $v): array {
    $parts = preg_split('/;(?=(?:[^"]*"[^"]*")*[^"]*$)/', $v);
    $p = ['_' => strtolower(trim(array_shift($parts)))];
    $cont = [];
    foreach ($parts as $x) {
        if (!preg_match('/^\s*([^=\s]+)\s*=\s*(.*)$/s', $x, $m)) continue;
        $k = strtolower($m[1]); $val = trim($m[2]);
        if ($val !== '' && $val[0] === '"') $val = stripcslashes(substr($val, 1, -1));
        if (preg_match('/^(\w+)\*(\d+)?\*?$/', $k, $c)) { // RFC 2231
            $enc = substr($k, -1) === '*';
            if ($enc && preg_match("/^([^']*)'[^']*'(.*)$/", $val, $e)) $val = mail_utf8(rawurldecode($e[2]), $e[1]);
            elseif ($enc) $val = rawurldecode($val);
            $cont[$c[1]][(int) ($c[2] ?? 0)] = $val;
            continue;
        }
        $p[$k] = $val;
    }
    foreach ($cont as $k => $vals) { ksort($vals); $p[$k] = implode('', $vals); }
    return $p;
}
function mail_decode_body(string $body, string $cte): string {
    $cte = strtolower(trim($cte));
    if ($cte === 'base64') return (string) base64_decode(preg_replace('/[^A-Za-z0-9+\/=]/', '', $body));
    if ($cte === 'quoted-printable') return quoted_printable_decode(preg_replace("/\r?\n/", "\r\n", $body));
    return $body;
}
/* Walks a MIME message. Collects text/html bodies and attachments (with a path to fetch them again). */
function mail_parse(string $raw): array {
    $out = ['text' => '', 'html' => '', 'atts' => [], 'cids' => []];
    $raw = preg_replace("/\r\n?/", "\n", $raw);
    mail_walk($raw, $out, '1', true);
    return $out;
}
function mail_split(string $raw): array {
    $pos = strpos($raw, "\n\n");
    if ($pos === false) return [mail_headers($raw), ''];
    return [mail_headers(substr($raw, 0, $pos)), substr($raw, $pos + 2)];
}
function mail_walk(string $raw, array &$out, string $path, bool $top = false, ?string $want = null) {
    [$h, $body] = mail_split($raw);
    $ct = mail_params($h['content-type'] ?? 'text/plain');
    $type = $ct['_'] ?: 'text/plain';
    $disp = mail_params($h['content-disposition'] ?? '');
    $name = mail_hdr_decode($disp['filename'] ?? ($ct['name'] ?? ''));
    if (strpos($type, 'multipart/') === 0 && !empty($ct['boundary'])) {
        $b = '--' . $ct['boundary'];
        $chunks = explode("\n" . $b, "\n" . $body);
        array_shift($chunks);
        $i = 0;
        foreach ($chunks as $c) {
            if (strpos($c, '--') === 0) break;
            $c = preg_replace('/^[ \t]*\n/', '', $c);
            $i++;
            $r = mail_walk($c, $out, $path . '.' . $i, false, $want);
            if ($want !== null && $r !== null) return $r;
        }
        return null;
    }
    $data = mail_decode_body($body, $h['content-transfer-encoding'] ?? '');
    if ($want !== null) return $want === $path ? ['data' => $data, 'type' => $type, 'name' => $name ?: 'file'] : null;
    $isText = ($type === 'text/plain' || $type === 'text/html') && ($disp['_'] ?? '') !== 'attachment';
    if ($isText && $type === 'text/plain') { $out['text'] .= ($out['text'] !== '' ? "\n\n" : '') . mail_utf8($data, $ct['charset'] ?? ''); return null; }
    if ($isText) { $out['html'] .= mail_utf8($data, $ct['charset'] ?? ''); return null; }
    $cid = trim($h['content-id'] ?? '', ' <>');
    if ($cid !== '') $out['cids'][$cid] = $path;
    if (($disp['_'] ?? '') !== 'inline' || $cid === '' || $name !== '')
        $out['atts'][] = ['path' => $path, 'name' => $name !== '' ? $name : ($type === 'message/rfc822' ? 'message.eml' : 'attachment'), 'type' => $type, 'size' => strlen($data), 'inline' => $cid !== '' && ($disp['_'] ?? '') === 'inline'];
    return null;
}
function mail_part(string $raw, string $path): ?array {
    $out = [];
    $raw = preg_replace("/\r\n?/", "\n", $raw);
    return mail_walk($raw, $out, '1', true, $path);
}

/* ---------- SMTP ---------- */
function mail_enc_hdr(string $s): string {
    return preg_match('/[^\x20-\x7e]/', $s) ? mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n") : $s;
}
function mail_fmt_addr(string $name, string $email): string {
    if ($name === '') return $email;
    $n = preg_match('/[^\x20-\x7e]/', $name) ? mb_encode_mimeheader($name, 'UTF-8', 'B', "\r\n") : '"' . addcslashes($name, "\"\\") . '"';
    return $n . ' <' . $email . '>';
}
function mail_build(array $cfg, array $to, array $cc, string $subject, string $text, string $inReplyTo = '', string $refs = '', string $ownHtml = '', array $atts = []): array {
    $domain = substr(strrchr($cfg['email'], '@'), 1) ?: 'smrgraphics.co.uk';
    $mid = '<' . bin2hex(random_bytes(12)) . '@' . $domain . '>';
    $h = ['Date: ' . date('r'), 'From: ' . mail_fmt_addr($cfg['name'] ?? '', $cfg['email']),
        'To: ' . implode(', ', $to)];
    if ($cc) $h[] = 'Cc: ' . implode(', ', $cc);
    $h[] = 'Subject: ' . mail_enc_hdr($subject);
    $h[] = 'Message-ID: ' . $mid;
    if ($inReplyTo !== '') { $h[] = 'In-Reply-To: ' . $inReplyTo; $h[] = 'References: ' . trim($refs . ' ' . $inReplyTo); }
    $h[] = 'MIME-Version: 1.0';
    $text = preg_replace("/\r\n?|\n/", "\n", $text);
    $g = mail_sig();
    $png = $g['on'] ? mail_sig_png() : '';
    if ($png === '' && $ownHtml === '') {
        $h[] = 'Content-Type: text/plain; charset=UTF-8';
        $h[] = 'Content-Transfer-Encoding: quoted-printable';
        return [mail_wrap_atts($h, quoted_printable_encode(str_replace("\n", "\r\n", $text)) . "\r\n", $atts), $mid];
    }
    // Your words, then the signature, then any quoted email (reply / forward).
    $own = $text; $quote = '';
    if (preg_match('/^(On .{3,200} wrote:|-{5,} Forwarded email -{5,})$/m', $text, $qm, PREG_OFFSET_CAPTURE)) { $own = substr($text, 0, $qm[0][1]); $quote = substr($text, $qm[0][1]); }
    $own = rtrim($own);
    $plain = $own . "\n\n" . str_replace("\r\n", "\n", mail_sig_text($g)) . ($quote !== '' ? "\n\n" . $quote : '');
    $esc = function ($s) { return nl2br(htmlspecialchars($s, ENT_QUOTES, 'UTF-8'), false); };
    $font = 'font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#16161d';
    $qhtml = '';
    if ($quote !== '') {
        $ql = explode("\n", $quote); $first = array_shift($ql);
        $ql = array_map(function ($l) { return preg_replace('/^> ?/', '', $l); }, $ql);
        $qhtml = '<div style="' . $font . ';margin-top:24px;color:#555">' . $esc($first) . '</div><blockquote style="margin:6px 0 0;padding:0 0 0 12px;border-left:3px solid #d9d4f2;' . $font . ';color:#555">' . $esc(implode("\n", $ql)) . '</blockquote>';
    }
    $cid = 'sig-' . bin2hex(random_bytes(6)) . '@smrgraphics.co.uk';
    $ownPart = $ownHtml !== '' ? $ownHtml : $esc($own);
    $html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0">'
        . '<div style="' . $font . '">' . $ownPart . '</div>' . ($png !== '' ? mail_sig_html($g, 'cid:' . $cid) : '') . $qhtml . '</body></html>';
    if ($png === '') { // formatted email, signature off: plain + HTML only
        $plain = $own . ($quote !== '' ? "\n\n" . $quote : '');
        $b2 = 'a' . bin2hex(random_bytes(10));
        $h[] = 'Content-Type: multipart/alternative; boundary="' . $b2 . '"';
        $crlf = function ($s) { return preg_replace("/\r?\n/", "\r\n", $s); };
        $body = '--' . $b2 . "\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($crlf($plain)) . "\r\n"
            . '--' . $b2 . "\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($crlf($html)) . "\r\n"
            . '--' . $b2 . "--\r\n";
        return [mail_wrap_atts($h, $body, $atts), $mid];
    }
    $b1 = 'r' . bin2hex(random_bytes(10)); $b2 = 'a' . bin2hex(random_bytes(10));
    $h[] = 'Content-Type: multipart/related; boundary="' . $b1 . '"; type="multipart/alternative"';
    $crlf = function ($s) { return preg_replace("/\r?\n/", "\r\n", $s); };
    $body = '--' . $b1 . "\r\nContent-Type: multipart/alternative; boundary=\"" . $b2 . "\"\r\n\r\n"
        . '--' . $b2 . "\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($crlf($plain)) . "\r\n"
        . '--' . $b2 . "\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($crlf($html)) . "\r\n"
        . '--' . $b2 . "--\r\n"
        . '--' . $b1 . "\r\nContent-Type: image/gif; name=\"smr.gif\"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <" . $cid . ">\r\nContent-Disposition: inline; filename=\"smr.gif\"\r\n\r\n"
        . chunk_split(base64_encode($png), 76, "\r\n")
        . '--' . $b1 . "--\r\n";
    return [mail_wrap_atts($h, $body, $atts), $mid];
}
/* Write everything (big attachments): SSL streams can take only part of a large write at a time. */
function mail_write_all($s, string $data): void {
    $len = strlen($data); $done = 0; $stall = 0;
    while ($done < $len) {
        $n = @fwrite($s, substr($data, $done, 65536));
        if ($n === false) throw new RuntimeException('The connection to the mail server dropped while sending. Try again.');
        if ($n === 0) { if (++$stall > 200) throw new RuntimeException('The mail server stopped taking data. Try again.'); usleep(50000); continue; }
        $stall = 0; $done += $n;
    }
}
function smtp_send(array $cfg, array $rcpts, string $msg): void {
    $s = mail_stream($cfg['host'], 465);
    $read = function () use ($s) {
        $all = '';
        while (($l = fgets($s)) !== false) { $all .= $l; if (strlen($l) < 4 || $l[3] !== '-') break; }
        return [(int) substr($all, 0, 3), trim($all)];
    };
    $say = function (string $c, array $ok) use ($s, $read) {
        fwrite($s, $c . "\r\n");
        [$code, $txt] = $read();
        if (!in_array($code, $ok, true)) throw new RuntimeException($code === 535 ? 'The email address or password was not accepted.' : 'Sending failed: ' . $txt);
        return $txt;
    };
    [$code] = $read();
    if ($code !== 220) throw new RuntimeException('The mail server did not answer.');
    $say('EHLO smrgraphics.co.uk', [250]);
    $say('AUTH LOGIN', [334]);
    $say(base64_encode($cfg['email']), [334]);
    $say(base64_encode($cfg['password']), [235]);
    $say('MAIL FROM:<' . $cfg['email'] . '>', [250]);
    foreach ($rcpts as $r) $say('RCPT TO:<' . $r . '>', [250, 251]);
    $say('DATA', [354]);
    $body = preg_replace('/^\./m', '..', $msg);
    mail_write_all($s, rtrim($body, "\r\n") . "\r\n.\r\n");
    unset($body);
    stream_set_timeout($s, 180); // big emails: give the server time to check and accept it
    [$code, $txt] = $read();
    if ($code !== 250) throw new RuntimeException($code === 552 ? 'The mail server says this email is too big. Remove some attachments.' : 'Sending failed: ' . $txt);
    @fwrite($s, "QUIT\r\n");
    @fclose($s);
}

/* Formatted email from the compose box: keep simple formatting only (bold, italic, lists, colours, sizes, links). */
function mail_clean_html(string $html): string {
    $html = trim($html);
    if ($html === '' || !class_exists('DOMDocument')) return '';
    $tags = ['b','strong','i','em','u','s','strike','br','p','div','span','ul','ol','li','a','blockquote','h1','h2','h3','font','sub','sup'];
    $props = ['color','background-color','font-size','font-weight','font-style','text-decoration','text-decoration-line','text-align','font-family','margin-left','padding-left'];
    $sizes = ['1'=>'11px','2'=>'13px','3'=>'15px','4'=>'18px','5'=>'22px','6'=>'28px','7'=>'34px'];
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8"?><div id="x">' . $html . '</div>', LIBXML_NONET);
    libxml_clear_errors();
    $root = $doc->getElementById('x');
    if (!$root) return '';
    $walk = function (DOMNode $n) use (&$walk, $tags, $props, $sizes, $doc) {
        for ($c = $n->firstChild; $c; $c = $next) {
            $next = $c->nextSibling;
            if ($c instanceof DOMText) continue;
            if (!($c instanceof DOMElement)) { $n->removeChild($c); continue; }
            $t = strtolower($c->tagName);
            if (in_array($t, ['script','style','iframe','object','embed','img','svg','form','input','button','textarea','select','link','meta'], true)) { $n->removeChild($c); continue; }
            $walk($c);
            if (!in_array($t, $tags, true)) { while ($c->firstChild) $n->insertBefore($c->firstChild, $c); $n->removeChild($c); continue; }
            $style = [];
            foreach (explode(';', (string) $c->getAttribute('style')) as $d) {
                if (strpos($d, ':') === false) continue;
                [$k, $v] = array_map('trim', explode(':', $d, 2)); $k = strtolower($k);
                if (in_array($k, $props, true) && preg_match('/^[#a-zA-Z0-9 ,.%()\'"-]{1,80}$/', $v) && stripos($v, 'expression') === false && stripos($v, 'url') === false) $style[] = $k . ':' . $v;
            }
            if ($t === 'font') { // old execCommand output: turn into a span
                if (preg_match('/^#?[0-9a-fA-F]{3,6}$|^[a-z]+$/', (string) $c->getAttribute('color'))) $style[] = 'color:' . $c->getAttribute('color');
                if (isset($sizes[$c->getAttribute('size')])) $style[] = 'font-size:' . $sizes[$c->getAttribute('size')];
                if (preg_match('/^[a-zA-Z0-9 ,\'"-]{1,80}$/', (string) $c->getAttribute('face'))) $style[] = 'font-family:' . $c->getAttribute('face');
                $sp = $doc->createElement('span'); while ($c->firstChild) $sp->appendChild($c->firstChild); $n->replaceChild($sp, $c); $c = $sp; $t = 'span';
            }
            $href = $t === 'a' ? (string) $c->getAttribute('href') : '';
            $align = (string) $c->getAttribute('align');
            while ($c->attributes->length) $c->removeAttribute($c->attributes->item(0)->name);
            if ($t === 'blockquote') $style[] = 'margin:0 0 0 10px;padding-left:12px;border-left:3px solid #d9d4f2';
            if (preg_match('/^(left|right|center|justify)$/i', $align)) $style[] = 'text-align:' . strtolower($align);
            if ($t === 'p') $style[] = 'margin:0 0 12px';
            if ($style) $c->setAttribute('style', implode(';', $style));
            if ($t === 'a') {
                if (preg_match('#^(https?://|mailto:)#i', $href)) { $c->setAttribute('href', $href); $c->setAttribute('style', 'color:#5b4bff;' . ($style ? implode(';', $style) : '')); }
                else { while ($c->firstChild) $n->insertBefore($c->firstChild, $c); $n->removeChild($c); }
            }
        }
    };
    $walk($root);
    $out = '';
    foreach ($root->childNodes as $c) $out .= $doc->saveHTML($c);
    return mb_substr($out, 0, 200000);
}

/* Address book for the To / Cc suggestions: everyone you've emailed or had email from. */
function mail_contacts_table(): void {
    static $done = false; if ($done) return; $done = true;
    db()->exec('CREATE TABLE IF NOT EXISTS mail_contacts (email TEXT PRIMARY KEY, name TEXT, n INTEGER DEFAULT 0, last INTEGER DEFAULT 0)');
}
function mail_contacts_add(array $list, int $weight = 1, int $when = 0): void {
    mail_contacts_table();
    $me = strtolower((string) (mail_cfg()['email'] ?? ''));
    $st = db()->prepare('INSERT INTO mail_contacts (email, name, n, last) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET n = n + excluded.n, last = MAX(last, excluded.last), name = CASE WHEN excluded.name <> \'\' THEN excluded.name ELSE name END');
    foreach ($list as $a) {
        $e = strtolower(trim((string) ($a['email'] ?? '')));
        if ($e === '' || $e === $me || !filter_var($e, FILTER_VALIDATE_EMAIL) || preg_match('/^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce)/', $e)) continue;
        $st->execute([$e, mb_substr(trim((string) ($a['name'] ?? '')), 0, 80), $weight, $when ?: now()]);
    }
}

/* ---------- attachments ---------- */
const MAIL_ATT_MAX = 25 * 1024 * 1024; // total per email: Gmail / Yahoo / Outlook.com limit (SiteGround allows 50 MB)
const MAIL_ATT_WARN = 14 * 1024 * 1024; // above this, Outlook.com / iCloud (20 MB after encoding) may bounce it
// The file types Gmail and Outlook block (programs and scripts), refused before sending.
const MAIL_ATT_BLOCKED = ['ade','adp','apk','app','appx','appxbundle','bat','cab','chm','cmd','com','cpl','dex','diagcab','diagcfg','diagpack','dll','dmg','ex','ex_','exe','hta','img','ins','iso','isp','jar','jnlp','js','jse','lib','lnk','mde','msc','msi','msix','msixbundle','msp','mst','nsh','pif','ps1','psm1','py','pyc','pyo','scr','sct','shb','sys','vb','vbe','vbs','vhd','vhdx','vxd','wsc','wsf','wsh','xll'];
function mail_att_mime(string $name): string {
    $map = ['pdf'=>'application/pdf','doc'=>'application/msword','docx'=>'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls'=>'application/vnd.ms-excel','xlsx'=>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','xlsm'=>'application/vnd.ms-excel.sheet.macroEnabled.12',
        'csv'=>'text/csv','ppt'=>'application/vnd.ms-powerpoint','pptx'=>'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'odt'=>'application/vnd.oasis.opendocument.text','ods'=>'application/vnd.oasis.opendocument.spreadsheet','odp'=>'application/vnd.oasis.opendocument.presentation',
        'pages'=>'application/x-iwork-pages-sffpages','numbers'=>'application/x-iwork-numbers-sffnumbers','key'=>'application/x-iwork-keynote-sffkey',
        'rtf'=>'application/rtf','txt'=>'text/plain','md'=>'text/markdown','html'=>'text/html','htm'=>'text/html','json'=>'application/json','xml'=>'application/xml',
        'jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','gif'=>'image/gif','webp'=>'image/webp','heic'=>'image/heic','heif'=>'image/heif','svg'=>'image/svg+xml','tif'=>'image/tiff','tiff'=>'image/tiff','bmp'=>'image/bmp',
        'ai'=>'application/postscript','eps'=>'application/postscript','psd'=>'image/vnd.adobe.photoshop','indd'=>'application/x-indesign',
        'mp4'=>'video/mp4','mov'=>'video/quicktime','m4v'=>'video/x-m4v','webm'=>'video/webm','mp3'=>'audio/mpeg','m4a'=>'audio/mp4','wav'=>'audio/wav','aac'=>'audio/aac',
        'zip'=>'application/zip','rar'=>'application/vnd.rar','7z'=>'application/x-7z-compressed','gz'=>'application/gzip',
        'ics'=>'text/calendar','vcf'=>'text/vcard','eml'=>'message/rfc822','ttf'=>'font/ttf','otf'=>'font/otf','woff'=>'font/woff','woff2'=>'font/woff2'];
    return $map[strtolower(pathinfo($name, PATHINFO_EXTENSION))] ?? 'application/octet-stream';
}
function mail_att_blocked(string $name): bool {
    return in_array(strtolower(pathinfo($name, PATHINFO_EXTENSION)), MAIL_ATT_BLOCKED, true);
}
function mail_att_name(string $name): string {
    $name = trim(preg_replace('/[\x00-\x1f\x7f\/\\\\:*?"<>|]+/u', '_', $name), " ._");
    if ($name === '') $name = 'attachment';
    if (mb_strlen($name) > 120) { $ext = pathinfo($name, PATHINFO_EXTENSION); $name = mb_substr(pathinfo($name, PATHINFO_FILENAME), 0, 110) . ($ext !== '' ? '.' . $ext : ''); }
    return $name;
}
/* Wrap the body in multipart/mixed with the files after it (filename both RFC 2231 and RFC 2047 so every mail app shows it right). */
function mail_wrap_atts(array $h, string $body, array $atts): string {
    if (!$atts) return implode("\r\n", $h) . "\r\n\r\n" . $body;
    $i = array_search('MIME-Version: 1.0', $h, true);
    $top = array_slice($h, 0, $i + 1); $inner = array_slice($h, $i + 1);
    $b = 'm' . bin2hex(random_bytes(10));
    $top[] = 'Content-Type: multipart/mixed; boundary="' . $b . '"';
    $out = '--' . $b . "\r\n" . implode("\r\n", $inner) . "\r\n\r\n" . $body . (substr($body, -2) === "\r\n" ? '' : "\r\n");
    foreach ($atts as $a) {
        $name = mail_att_name((string) $a['name']);
        $ascii = !preg_match('/[^\x20-\x7e]/', $name);
        $q = addcslashes($name, "\"\\");
        $nameParam = $ascii ? 'name="' . $q . '"' : 'name="' . mb_encode_mimeheader($name, 'UTF-8', 'B', '') . '"';
        $fileParam = $ascii ? 'filename="' . $q . '"' : 'filename="' . mb_encode_mimeheader($name, 'UTF-8', 'B', '') . '"; filename*=UTF-8\'\'' . rawurlencode($name);
        $out .= '--' . $b . "\r\nContent-Type: " . ($a['type'] ?: mail_att_mime($name)) . '; ' . $nameParam
            . "\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; " . $fileParam . "\r\n\r\n"
            . chunk_split(base64_encode($a['data']), 76, "\r\n");
    }
    return implode("\r\n", $top) . "\r\n\r\n" . $out . '--' . $b . "--\r\n";
}
/* Files waiting to be sent live in private storage, one folder per email being written; cleared after sending or after a day. */
function mail_att_dir(string $draft): string {
    if (!preg_match('/^[a-f0-9]{16,40}$/', $draft)) throw new RuntimeException('Bad upload.');
    $base = private_dir() . '/mail-att';
    if (!is_dir($base)) @mkdir($base, 0750, true);
    $keep = []; try { mail_drafts_table(); foreach (db()->query('SELECT id FROM mail_drafts') as $r) $keep[$r['id']] = 1; } catch (Throwable $e) {}
    foreach ((array) @glob($base . '/*', GLOB_ONLYDIR) as $d) if (!isset($keep[basename($d)]) && @filemtime($d) < now() - 86400) rrmdir_any($d); // saved drafts keep their files
    return $base . '/' . $draft;
}

/* ---------- drafts (saved by the Save draft button and automatically while writing) ---------- */
function mail_drafts_table(): void {
    static $done = false; if ($done) return; $done = true;
    db()->exec('CREATE TABLE IF NOT EXISTS mail_drafts (id TEXT PRIMARY KEY, d TEXT NOT NULL, updated INTEGER NOT NULL)');
}
function mail_draft_atts(string $id): array {
    $out = [];
    try { $dir = mail_att_dir($id); } catch (Throwable $e) { return []; }
    foreach ((array) glob($dir . '/*.json') as $j) {
        $i = (int) basename($j, '.json'); $m = json_decode((string) file_get_contents($j), true);
        if ($m && is_file("$dir/$i.bin")) $out[] = ['i' => $i, 'name' => $m['name'], 'size' => (int) $m['size']];
    }
    usort($out, function ($a, $b) { return $a['i'] - $b['i']; });
    return $out;
}
function mail_draft_del(string $id): void {
    mail_drafts_table();
    db()->prepare('DELETE FROM mail_drafts WHERE id = ?')->execute([$id]);
    try { rrmdir_any(mail_att_dir($id)); } catch (Throwable $e) {}
}
