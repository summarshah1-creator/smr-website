<?php
/* Short-link redirect handler for the Community Hub (built 24 Nov 2026, switched off until the short domain is ready).
   On the short domain, point every path at this file, e.g. in that domain's .htaccess:
     RewriteEngine On
     RewriteRule ^([a-z0-9][a-z0-9-]{1,39})/?$ /hub/s.php?c=$1 [L,QSA]
   It looks the slug up in hub_links, counts the tap per day and source (?s= tag, else the referring site, else direct)
   and sends a 302 to the destination. Unknown slugs go to the hub. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
$c = strtolower((string) ($_GET['c'] ?? ''));
$home = 'https://smrgraphics.co.uk/hub/';
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,39}$/', $c)) { header('Location: ' . $home, true, 302); exit; }
$p = db();
$p->exec("CREATE TABLE IF NOT EXISTS hub_links (slug TEXT PRIMARY KEY, url TEXT NOT NULL, owner TEXT NOT NULL, title TEXT DEFAULT '', taps INTEGER DEFAULT 0, at INTEGER NOT NULL)");
$p->exec("CREATE TABLE IF NOT EXISTS hub_taps (slug TEXT, day TEXT, src TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (slug, day, src))");
$st = $p->prepare('SELECT url FROM hub_links WHERE slug = ?'); $st->execute([$c]); $url = $st->fetchColumn();
if ($url === false || !preg_match('#^https?://#i', (string) $url)) { header('Location: ' . $home, true, 302); exit; }
$ua = strtolower((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
$bot = $ua === '' || preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|slack|discord|telegram|skype|curl|wget/', $ua);
if (!$bot) {
    $src = preg_replace('/[^a-z0-9_-]/', '', strtolower((string) ($_GET['s'] ?? '')));
    if ($src === '') { $r = (string) ($_SERVER['HTTP_REFERER'] ?? ''); $h = $r ? strtolower((string) parse_url($r, PHP_URL_HOST)) : ''; $src = $h ? preg_replace('/^www\./', '', $h) : (strpos($ua, 'instagram') !== false ? 'instagram' : (strpos($ua, 'fban') !== false || strpos($ua, 'fbav') !== false ? 'facebook' : 'direct')); }
    $src = substr($src, 0, 40); date_default_timezone_set('Europe/London'); $day = date('Y-m-d');
    try {
        $p->prepare('UPDATE hub_links SET taps = taps + 1 WHERE slug = ?')->execute([$c]);
        $p->prepare('INSERT INTO hub_taps (slug, day, src, n) VALUES (?, ?, ?, 1) ON CONFLICT(slug, day, src) DO UPDATE SET n = n + 1')->execute([$c, $day, $src]);
    } catch (Throwable $e) {}
}
header('Cache-Control: no-store');
header('Location: ' . $url, true, 302);
