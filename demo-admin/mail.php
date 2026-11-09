<?php
/* SMR Admin email: shows one email's body (inside a sandboxed frame) and downloads attachments. Owner only. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
require dirname(__DIR__) . '/demo-lib/mail.php';
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: private, no-store');

function stop(int $code, string $msg): void { http_response_code($code); header('Content-Type: text/plain; charset=utf-8'); echo $msg; exit; }

if (!admin_token()) stop(403, 'Please log in to SMR Admin.');
$cfg = mail_cfg();
if (!$cfg) stop(400, 'Email is not set up.');
$a = $_GET['a'] ?? '';
$f = ($_GET['f'] ?? '') === 'sent' ? 'sent' : 'inbox';
$uid = (int) ($_GET['uid'] ?? 0);

try {
    $m = new SmrImap($cfg);
    $box = $f === 'sent' ? ($m->special('sent') ?: 'INBOX') : 'INBOX';
    $m->select($box);
    $raw = $m->raw($uid);
} catch (Throwable $e) { stop(502, $e->getMessage()); }
if ($raw === '') stop(404, 'Email not found.');

if ($a === 'part') {
    $p = mail_part($raw, (string) ($_GET['p'] ?? ''));
    if (!$p) stop(404, 'Attachment not found.');
    $inline = !empty($_GET['inline']) && preg_match('#^image/(png|jpe?g|gif|webp)$#', $p['type']);
    header('Content-Type: ' . ($inline ? $p['type'] : 'application/octet-stream'));
    header("Content-Security-Policy: default-src 'none'; sandbox");
    header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment') . "; filename*=UTF-8''" . rawurlencode($p['name']));
    header('Content-Length: ' . strlen($p['data']));
    echo $p['data'];
    exit;
}

// The email itself. Scripts can never run here (CSP sandbox); links open in a new tab.
header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; font-src https: data:; frame-ancestors 'self'; form-action 'none'; sandbox allow-popups allow-popups-to-escape-sandbox");
$p = mail_parse($raw);
$base = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank">'
    . '<style>html{background:#fff}body{margin:0;padding:16px;color:#16161d;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;word-wrap:break-word;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}pre.t{white-space:pre-wrap;font:inherit;margin:0}a{color:#5b2bd6}blockquote.q{margin:8px 0;padding-left:10px;border-left:3px solid #ddd;color:#555}</style>';
if (trim($p['html']) !== '') {
    $html = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $p['html']);
    // Pictures sent inside the email (cid:) are put in place as data: URLs (the frame has no login cookie).
    $html = preg_replace_callback('#(["\'])cid:([^"\']+)\1#i', function ($mm) use ($p, $raw) {
        $path = $p['cids'][$mm[2]] ?? null;
        $part = $path ? mail_part($raw, $path) : null;
        if (!$part || !preg_match('#^image/(png|jpe?g|gif|webp)$#', $part['type']) || strlen($part['data']) > 3000000) return $mm[0];
        return $mm[1] . 'data:' . $part['type'] . ';base64,' . base64_encode($part['data']) . $mm[1];
    }, $html);
    echo $base . $html;
} else {
    $t = htmlspecialchars($p['text'], ENT_QUOTES, 'UTF-8');
    $t = preg_replace('#\bhttps?://[^\s<>"\']+#', '<a href="$0">$0</a>', $t);
    echo $base . '<pre class="t">' . $t . '</pre>';
}
