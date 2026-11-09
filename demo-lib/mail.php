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
/* $img = src for the brand picture (cid:… in emails, a URL in the preview). */
function mail_sig_html(array $g, string $img): string {
    $e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
    $font = "font-family:Helvetica,Arial,sans-serif;";
    $row = function ($label, $value, $href) use ($e, $font) {
        return '<tr><td style="' . $font . 'font-size:10px;line-height:18px;font-weight:bold;letter-spacing:1px;color:#8b7bff;padding:0 10px 0 0;white-space:nowrap;vertical-align:top">' . $label . '</td>'
            . '<td style="' . $font . 'font-size:13px;line-height:18px;white-space:nowrap"><a href="' . $e($href) . '" style="color:#ece9ff;text-decoration:none">' . $e($value) . '</a></td></tr>';
    };
    $rows = '';
    if ($g['phone'] !== '') $rows .= $row('CALL', $g['phone'], 'tel:+44' . ltrim(preg_replace('/\D/', '', $g['phone']), '0'));
    if ($g['email'] !== '') $rows .= $row('EMAIL', $g['email'], 'mailto:' . $g['email']);
    $rows .= $row('WEB', 'smrgraphics.co.uk', 'https://smrgraphics.co.uk');
    // Side by side on wide screens, stacked on phones (two inline blocks; Outlook gets a table).
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0c0c18" style="width:100%;max-width:524px;background:#0c0c18;border-radius:16px;border-collapse:separate;margin-top:22px">'
        . '<tr><td style="padding:14px 18px 16px 20px;font-size:0;line-height:0">'
        . '<!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="226" valign="middle"><![endif]-->'
        . '<div style="display:inline-block;vertical-align:middle;width:226px;max-width:100%;padding:4px 0">'
        . '<a href="https://smrgraphics.co.uk" style="text-decoration:none"><img src="' . $e($img) . '" width="200" height="104" alt="SMR · Digital · Graphics · Marketing" style="display:block;width:200px;height:104px;border:0"></a></div>'
        . '<!--[if mso]></td><td width="258" valign="middle"><![endif]-->'
        . '<div style="display:inline-block;vertical-align:middle;width:258px;max-width:100%;padding:6px 0 4px 18px;border-left:1px solid #2c2a4a;box-sizing:border-box">'
        . '<div style="' . $font . 'font-size:18px;line-height:22px;font-weight:bold;color:#ffffff;white-space:nowrap">' . $e($g['name']) . '</div>'
        . ($g['title'] !== '' ? '<div style="' . $font . 'font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#d07bff;padding:2px 0 10px">' . $e($g['title']) . '</div>' : '<div style="height:10px;font-size:0;line-height:0">&nbsp;</div>')
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0">' . $rows . '</table></div>'
        . '<!--[if mso]></td></tr></table><![endif]-->'
        . '</td></tr></table>';
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
        fwrite($this->s, $msg . "\r\n");
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
function mail_build(array $cfg, array $to, array $cc, string $subject, string $text, string $inReplyTo = '', string $refs = ''): array {
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
    if ($png === '') {
        $h[] = 'Content-Type: text/plain; charset=UTF-8';
        $h[] = 'Content-Transfer-Encoding: quoted-printable';
        return [implode("\r\n", $h) . "\r\n\r\n" . quoted_printable_encode(str_replace("\n", "\r\n", $text)) . "\r\n", $mid];
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
    $html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0">'
        . '<div style="' . $font . '">' . $esc($own) . '</div>' . mail_sig_html($g, 'cid:' . $cid) . $qhtml . '</body></html>';
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
    return [implode("\r\n", $h) . "\r\n\r\n" . $body, $mid];
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
    $say(rtrim($body, "\r\n") . "\r\n.", [250]);
    @fwrite($s, "QUIT\r\n");
    @fclose($s);
}
