<?php
/* Shared analytics helpers for the SMR games (Flappy Kabootar = prefix 'fk', Jummah Dash = 'jd').
   Each game logs events into <pre>_events (day, at, vid, ev, src, dev, app, val, extra).
   The owner's own devices live in <pre>_owner and are left out of every number: the temp view <pre>_ev
   is <pre>_events without them, and all stats read from that view. */
if (!defined('SMR_DEMO')) { http_response_code(403); exit; }

function gs_pre(string $pre): string { if (!in_array($pre, ['fk', 'jd'], true)) throw new RuntimeException('bad game'); return $pre; }

/* Make the owner table and the filtered view on this connection (call once per request, after the events table exists). */
function gs_init(PDO $p, string $pre): void {
    $pre = gs_pre($pre);
    $p->exec("CREATE TABLE IF NOT EXISTS {$pre}_owner (vid TEXT PRIMARY KEY, at INTEGER NOT NULL, how TEXT DEFAULT '')");
    $p->exec("CREATE TEMP VIEW IF NOT EXISTS {$pre}_ev AS SELECT * FROM {$pre}_events WHERE vid = '' OR vid NOT IN (SELECT vid FROM {$pre}_owner)");
    $p->exec("CREATE INDEX IF NOT EXISTS {$pre}_events_vid ON {$pre}_events(vid, at)");
}

/* A device the owner uses: any event sent while logged in to SMR Admin marks it, or "This is me" in the admin. */
function gs_mark_owner(PDO $p, string $pre, string $vid, string $how): void {
    if ($vid === '') return; $pre = gs_pre($pre);
    $p->prepare("INSERT INTO {$pre}_owner (vid, at, how) VALUES (?, ?, ?) ON CONFLICT(vid) DO NOTHING")->execute([$vid, time(), $how]);
}

/* Everything that happened since time $t (the last time the owner looked), own devices left out. */
function gs_since(PDO $p, string $pre, int $t, string $recTable = ''): array {
    $pre = gs_pre($pre);
    $one = function (string $sql, array $a) use ($p) { $st = $p->prepare($sql); $st->execute($a); return $st->fetchColumn(); };
    $games   = (int) $one("SELECT COUNT(*) FROM {$pre}_ev WHERE ev = 'play' AND at > ?", [$t]);
    $players = (int) $one("SELECT COUNT(DISTINCT vid) FROM {$pre}_ev WHERE ev = 'play' AND at > ? AND vid != ''", [$t]);
    $people  = (int) $one("SELECT COUNT(DISTINCT vid) FROM {$pre}_ev WHERE at > ? AND vid != ''", [$t]);
    $visits  = (int) $one("SELECT COUNT(*) FROM {$pre}_ev WHERE ev = 'visit' AND at > ?", [$t]);
    // brand-new = the very first thing we ever saw from that device came after $t
    $newPeople = (int) $one("SELECT COUNT(*) FROM (SELECT vid, MIN(at) f FROM {$pre}_ev WHERE vid != '' GROUP BY vid) WHERE f > CAST(? AS INTEGER)", [$t]);
    $newPlayers = (int) $one("SELECT COUNT(*) FROM (SELECT vid, MIN(at) f FROM {$pre}_ev WHERE ev = 'play' AND vid != '' GROUP BY vid) WHERE f > CAST(? AS INTEGER)", [$t]);
    $back    = (int) $one("SELECT COUNT(DISTINCT vid) FROM {$pre}_ev WHERE at > ? AND vid != '' AND vid IN (SELECT vid FROM {$pre}_ev WHERE at <= ?)", [$t, $t]);
    $sc = $p->prepare("SELECT MAX(val) m, AVG(val) a FROM {$pre}_ev WHERE ev = 'over' AND at > ?"); $sc->execute([$t]); $sc = $sc->fetch();
    $shares  = (int) $one("SELECT COUNT(*) FROM {$pre}_ev WHERE ev = 'share' AND at > ?", [$t]);
    $home    = (int) $one("SELECT COUNT(DISTINCT vid) FROM {$pre}_ev WHERE ev = 'visit' AND app = 1 AND at > ?", [$t]);
    $installs = (int) $one("SELECT COUNT(*) FROM {$pre}_ev WHERE ev = 'install' AND at > ?", [$t]);
    $smr     = (int) $one("SELECT COUNT(*) FROM {$pre}_ev WHERE ev = 'smr' AND at > ?", [$t]);
    $recs = $recTable !== '' ? (int) $one("SELECT COUNT(*) FROM $recTable WHERE at > ?", [$t]) : 0;
    return ['t' => $t, 'now' => time(), 'games' => $games, 'players' => $players, 'people' => $people, 'visits' => $visits,
        'new_people' => $newPeople, 'new_players' => $newPlayers, 'returning' => $back, 'best' => (int) ($sc['m'] ?? 0), 'avg' => round((float) ($sc['a'] ?? 0), 1),
        'shares' => $shares, 'home' => $home, 'installs' => $installs, 'smr' => $smr, 'recs' => $recs];
}

/* Devices seen lately, so the owner can tick the ones that are his. */
function gs_devices(PDO $p, string $pre): array {
    $pre = gs_pre($pre);
    $rows = $p->query("SELECT e.vid, MIN(e.at) first, MAX(e.at) last, SUM(e.ev = 'play') games, MAX(CASE WHEN e.ev = 'over' THEN e.val ELSE 0 END) best,
        (SELECT dev FROM {$pre}_events d WHERE d.vid = e.vid AND d.dev != '' ORDER BY d.at DESC LIMIT 1) dev,
        MAX(e.app) app, (SELECT 1 FROM {$pre}_owner o WHERE o.vid = e.vid) mine
        FROM {$pre}_events e WHERE e.vid != '' GROUP BY e.vid ORDER BY last DESC LIMIT 30")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) { foreach (['first', 'last', 'games', 'best', 'app'] as $k) $r[$k] = (int) $r[$k]; $r['mine'] = (bool) $r['mine']; $r['id'] = substr($r['vid'], 0, 6); }
    return $rows;
}
function gs_set_owner(PDO $p, string $pre, string $vid, bool $on): void {
    $pre = gs_pre($pre); $vid = preg_replace('/[^a-z0-9]/i', '', substr($vid, 0, 20)); if ($vid === '') return;
    if ($on) gs_mark_owner($p, $pre, $vid, 'admin'); else $p->prepare("DELETE FROM {$pre}_owner WHERE vid = ?")->execute([$vid]);
}
