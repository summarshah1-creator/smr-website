<?php
/* SMR Admin planner: tasks ("waiting on me" / chasing / money owed), meetings + prep, reminders.
   Shared by demo-admin/api.php (pl_* actions), demo-admin/feed.php (widget JSON + calendar feed)
   and demo-admin/cron.php. Times are unix seconds, Europe/London. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/push.php';

const PL_WHAT = ['quote' => 'Quote', 'pricing' => 'Pricing', 'demo' => 'Demo', 'mockup' => 'Mock-up', 'deck' => 'Deck', 'info' => 'More info',
    'work' => 'The work', 'reply' => 'A reply', 'call' => 'A call', 'meeting' => 'A meeting', 'payment' => 'Payment', 'order' => 'Order / buy', 'other' => 'Something'];
const PL_AREAS = ['digital' => 'Digital', 'graphics' => 'Graphics', 'marketing' => 'Marketing', 'plates' => 'Plates', 'direct' => 'SMR Direct', 'personal' => 'Personal'];

function pl_db(): PDO {
    static $done = false;
    $pdo = db();
    if ($done) return $pdo;
    $done = true;
    $pdo->exec("CREATE TABLE IF NOT EXISTS pl_items (
        id INTEGER PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'task', title TEXT NOT NULL, person TEXT DEFAULT '', phone TEXT DEFAULT '',
        platform TEXT DEFAULT '', area TEXT DEFAULT 'digital', wait TEXT DEFAULT 'me', what TEXT DEFAULT 'other', pri INTEGER DEFAULT 2,
        due INTEGER DEFAULT 0, due_t INTEGER DEFAULT 0, start INTEGER DEFAULT 0, end INTEGER DEFAULT 0, all_day INTEGER DEFAULT 0,
        location TEXT DEFAULT '', notes TEXT DEFAULT '', owes INTEGER DEFAULT 0, owes_amt TEXT DEFAULT '', grp TEXT DEFAULT '',
        event_id INTEGER DEFAULT 0, prep_asked INTEGER DEFAULT 0, status TEXT DEFAULT 'open', done_at INTEGER DEFAULT 0, snooze INTEGER DEFAULT 0,
        n_due INTEGER DEFAULT 0, n_over INTEGER DEFAULT 0, n_overc INTEGER DEFAULT 0, n_day INTEGER DEFAULT 0, n_soon INTEGER DEFAULT 0,
        created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS pl_items_s ON pl_items(status, kind)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS pl_kv (k TEXT PRIMARY KEY, v TEXT)");
    pl_seed($pdo);
    return $pdo;
}
function pl_get(string $k, $def = null) { $st = pl_db()->prepare('SELECT v FROM pl_kv WHERE k = ?'); $st->execute([$k]); $v = $st->fetchColumn(); return $v === false ? $def : $v; }
function pl_set(string $k, $v): void { pl_db()->prepare('INSERT OR REPLACE INTO pl_kv (k, v) VALUES (?, ?)')->execute([$k, (string) $v]); }
function pl_cfg(): array {
    $c = json_decode((string) pl_get('cfg', ''), true) ?: [];
    return $c + ['brief' => '09:00', 'evening' => '18:30', 'quiet_from' => '22:00', 'quiet_to' => '08:00', 'push' => 1, 'sunday' => 1];
}
function pl_key(): string {
    $k = (string) pl_get('feed_key', '');
    if (!preg_match('/^[A-Za-z0-9_-]{24,}$/', $k)) { $k = rand_token(18); pl_set('feed_key', $k); }
    return $k;
}
function pl_mins(string $hm): int { return preg_match('/^(\d{1,2}):(\d{2})$/', $hm, $m) ? (int) $m[1] * 60 + (int) $m[2] : 0; }
function pl_day0(int $t): int { return (int) strtotime(date('Y-m-d 00:00:00', $t)); }

/* When something matters: tasks use due (or the snooze time), meetings use their start. */
function pl_when(array $r): int { if ($r['kind'] === 'event') return (int) $r['start']; return max((int) $r['due'], (int) $r['snooze']); }

/* Priority score: overdue weighs most, then due today, high priority, money owed and how long it has sat there. */
function pl_score(array $r, int $now): float {
    if ($r['kind'] === 'event' || $r['status'] !== 'open') return -1;
    if ((int) $r['snooze'] > $now) return -1;
    $s = 0.0;
    $due = (int) $r['due'];
    $today1 = pl_day0($now) + 86400;
    if ($due) {
        if ($due < $now) $s += 40 + min(30, ($now - $due) / 86400 * 6);
        elseif ($due < $today1) $s += 30 + ($today1 - $due) / 3600 * 0.4;
        elseif ($due < $today1 + 86400) $s += 18;
        elseif ($due < $today1 + 6 * 86400) $s += 8;
    } else $s += 4;
    $s += [1 => 22, 2 => 8, 3 => 0][(int) $r['pri']] ?? 8;
    if ((int) $r['owes']) $s += 10;
    if ($r['wait'] === 'me') $s += 6;
    if ((int) $r['event_id']) $s += 6; // prep for a meeting
    $s += min(8, ($now - (int) $r['created']) / 86400);
    return round($s, 1);
}
function pl_why(array $r, int $now): string {
    $due = (int) $r['due'];
    if ($due && $due < $now) { $d = (int) floor((pl_day0($now) - pl_day0($due)) / 86400); return $d >= 1 ? 'Overdue ' . $d . ' day' . ($d > 1 ? 's' : '') : 'Overdue'; }
    if ($due && $due < pl_day0($now) + 86400) return 'Due today' . ((int) $r['due_t'] ? ' ' . date('H:i', $due) : '');
    if ($due && $due < pl_day0($now) + 2 * 86400) return 'Due tomorrow';
    if ($due) return 'Due ' . date('D j M', $due);
    return (int) $r['pri'] === 1 ? 'High priority' : 'No date';
}
function pl_row(array $r, int $now): array {
    $o = $r;
    foreach (['id', 'pri', 'due', 'due_t', 'start', 'end', 'all_day', 'owes', 'event_id', 'prep_asked', 'done_at', 'snooze', 'created', 'updated'] as $k) $o[$k] = (int) $r[$k];
    unset($o['n_due'], $o['n_over'], $o['n_overc'], $o['n_day'], $o['n_soon']);
    $o['score'] = pl_score($r, $now);
    $o['why'] = $r['kind'] === 'event' ? '' : pl_why($r, $now);
    return $o;
}
function pl_all(bool $withDone = false): array {
    $sql = 'SELECT * FROM pl_items' . ($withDone ? ' WHERE status = \'open\' OR done_at > ' . (now() - 14 * 86400) : " WHERE status = 'open'") . ' ORDER BY id';
    return pl_db()->query($sql)->fetchAll();
}
/* People who owe money: name => amount, so every view can mark them red. */
function pl_owing(array $rows): array {
    $o = [];
    foreach ($rows as $r) if ($r['status'] === 'open' && (int) $r['owes'] && $r['person'] !== '') $o[$r['person']] = $r['owes_amt'];
    return $o;
}

/* What the dashboard, the widget and the briefing all show. */
function pl_summary(int $now): array {
    $rows = pl_all();
    $tasks = []; $events = [];
    foreach ($rows as $r) { if ($r['kind'] === 'event') $events[] = $r; else $tasks[] = $r; }
    usort($tasks, function ($a, $b) use ($now) { return pl_score($b, $now) <=> pl_score($a, $now); });
    $d0 = pl_day0($now);
    $today = array_values(array_filter($events, function ($e) use ($d0) { $s = (int) $e['start']; return $s >= $d0 && $s < $d0 + 86400; }));
    $tomorrow = array_values(array_filter($events, function ($e) use ($d0) { $s = (int) $e['start']; return $s >= $d0 + 86400 && $s < $d0 + 2 * 86400; }));
    $soon = array_values(array_filter($events, function ($e) use ($now, $d0) { $s = (int) $e['start']; return $s >= $now - 3600 && $s < $d0 + 8 * 86400; }));
    usort($today, function ($a, $b) { return $a['start'] <=> $b['start']; });
    usort($soon, function ($a, $b) { return $a['start'] <=> $b['start']; });
    $open = array_values(array_filter($tasks, function ($t) use ($now) { return (int) $t['snooze'] <= $now; }));
    $over = count(array_filter($open, function ($t) use ($now) { return (int) $t['due'] && (int) $t['due'] < $now; }));
    $dueToday = count(array_filter($open, function ($t) use ($now, $d0) { return (int) $t['due'] >= $now && (int) $t['due'] < $d0 + 86400; }));
    $prepOpen = function ($eid) use ($tasks) { $n = 0; foreach ($tasks as $t) if ((int) $t['event_id'] === (int) $eid) $n++; return $n; };
    $ev = function ($e) use ($prepOpen) { return ['id' => (int) $e['id'], 'title' => $e['title'], 'person' => $e['person'], 'start' => (int) $e['start'], 'end' => (int) $e['end'], 'all_day' => (int) $e['all_day'], 'location' => $e['location'], 'prep' => $prepOpen($e['id'])]; };
    $done = (int) pl_db()->query('SELECT COUNT(*) FROM pl_items WHERE status = \'done\' AND done_at >= ' . $d0)->fetchColumn();
    return [
        'now' => $now,
        'next' => $open ? pl_row($open[0], $now) : null,
        'top' => array_map(function ($t) use ($now) { return pl_row($t, $now); }, array_slice($open, 0, 6)),
        'today' => array_map($ev, $today), 'tomorrow' => array_map($ev, $tomorrow), 'soon' => array_map($ev, $soon),
        'overdue' => $over, 'due_today' => $dueToday, 'open' => count($open), 'done_today' => $done,
        'owing' => pl_owing($rows),
    ];
}

/* ---------- reminders (run from cron.php, the widget feed and admin requests; at most every 4 minutes) ---------- */
function pl_quiet(int $now): bool {
    $c = pl_cfg(); $m = (int) date('G', $now) * 60 + (int) date('i', $now);
    $f = pl_mins($c['quiet_from']); $t = pl_mins($c['quiet_to']);
    return $f > $t ? ($m >= $f || $m < $t) : ($m >= $f && $m < $t);
}
function pl_push(string $title, string $body, string $tag, string $url = '/demo-admin/#today'): void {
    if (!(int) pl_cfg()['push']) return;
    push_all($title, $body, $url, $tag);
}
function pl_tick(bool $force = false): array {
    $now = now();
    $last = (int) pl_get('tick', 0);
    if (!$force && $now - $last < 240) return ['skipped' => true];
    pl_set('tick', $now);
    $log = [];
    if (pl_quiet($now)) return ['quiet' => true];
    $c = pl_cfg(); $db = pl_db();
    $mins = (int) date('G', $now) * 60 + (int) date('i', $now);
    $day = date('Y-m-d', $now);
    $S = pl_summary($now);
    $first = function ($t) { return $t['title'] . ($t['person'] !== '' ? ' (' . $t['person'] . ')' : ''); };

    // Morning briefing
    if ($mins >= pl_mins($c['brief']) && pl_get('brief_day') !== $day) {
        pl_set('brief_day', $day);
        $bits = [];
        if ($S['today']) $bits[] = count($S['today']) . ' meeting' . (count($S['today']) > 1 ? 's' : '') . ' (first ' . ((int) $S['today'][0]['all_day'] ? 'today' : date('H:i', $S['today'][0]['start'])) . ': ' . $S['today'][0]['title'] . ')';
        $n = $S['overdue'] + $S['due_today'];
        if ($n) $bits[] = $n . ' to do today' . ($S['overdue'] ? ', ' . $S['overdue'] . ' overdue' : '');
        if ($S['owing']) $bits[] = count($S['owing']) . ' owe you money';
        if (is_file(__DIR__ . '/jobs.php')) { try { require_once __DIR__ . '/jobs.php'; $JS = jobs_summary(array_map(function ($j) use ($now) { return job_row($j, $now); }, jobs_db()->query("SELECT * FROM jobs WHERE status IN ('sent','agreed','delivered')")->fetchAll()));
            if ($JS['overdue']) $bits[] = money($JS['overdue']) . ' overdue from jobs (' . implode(', ', array_keys($JS['debtors'])) . ')';
            if ($JS['agree']) $bits[] = $JS['agree'] . ' quote' . ($JS['agree'] > 1 ? 's' : '') . ' not agreed yet'; } catch (Throwable $e) {} }
        $body = ($S['next'] ? 'Start with: ' . $first($S['next']) . '. ' : '') . ($bits ? implode(' · ', $bits) : 'Nothing urgent. Good time to chase leads.');
        pl_push('Good morning, here is your day', $body, 'pl-brief');
        $log[] = 'brief';
    }
    // Sunday review
    if ((int) $c['sunday'] && date('w', $now) === '0' && $mins >= pl_mins($c['brief']) + 60 && pl_get('sunday_day') !== $day) {
        pl_set('sunday_day', $day);
        pl_push('Sunday review', $S['open'] . ' things open, ' . $S['overdue'] . ' overdue. Ten minutes now saves the week: tap to go through them.', 'pl-sunday');
        $log[] = 'sunday';
    }
    // Evening check
    if ($mins >= pl_mins($c['evening']) && pl_get('eve_day') !== $day) {
        pl_set('eve_day', $day);
        $tm = $S['tomorrow'];
        $body = 'Did you promise anyone anything today? Tap + to add it so it doesn\'t slip.';
        if ($tm) {
            $prep = array_sum(array_column($tm, 'prep'));
            $body = 'Tomorrow: ' . implode(', ', array_map(function ($e) { return ((int) $e['all_day'] ? '' : date('H:i', $e['start']) . ' ') . $e['title']; }, array_slice($tm, 0, 3)))
                . ($prep ? '. ' . $prep . ' prep thing' . ($prep > 1 ? 's' : '') . ' still to do.' : '.') . ' Promised anyone anything today? Add it.';
        }
        pl_push('End of day check', $body, 'pl-eve');
        $log[] = 'evening';
    }
    foreach (pl_all() as $r) {
        $id = (int) $r['id'];
        if ($r['kind'] === 'event') {
            $s = (int) $r['start'];
            // The day before (sent with the evening check time or later)
            if (!(int) $r['n_day'] && $s >= pl_day0($now) + 86400 && $s < pl_day0($now) + 2 * 86400 && $mins >= pl_mins($c['evening'])) {
                $db->prepare('UPDATE pl_items SET n_day = ? WHERE id = ?')->execute([$now, $id]);
                $pn = (int) $db->query('SELECT COUNT(*) FROM pl_items WHERE status = \'open\' AND event_id = ' . $id)->fetchColumn();
                pl_push('Tomorrow: ' . $r['title'], ((int) $r['all_day'] ? 'All day' : date('H:i', $s)) . ($r['location'] !== '' ? ' · ' . $r['location'] : '') . ($pn ? ' · ' . $pn . ' prep thing' . ($pn > 1 ? 's' : '') . ' not done yet' : ''), 'pl-day-' . $id);
                $log[] = 'day ' . $id;
            }
            // An hour before (timed meetings only)
            if (!(int) $r['all_day'] && !(int) $r['n_soon'] && $s > $now && $s - $now <= 3600) {
                $db->prepare('UPDATE pl_items SET n_soon = ? WHERE id = ?')->execute([$now, $id]);
                pl_push('In ' . max(1, (int) round(($s - $now) / 60)) . ' min: ' . $r['title'], ($r['location'] !== '' ? $r['location'] . ' · ' : '') . 'Tap for your notes and prep.', 'pl-soon-' . $id);
                $log[] = 'soon ' . $id;
            }
            continue;
        }
        $due = max((int) $r['due'], (int) $r['snooze']);
        if (!$due || $due > $now) continue;
        // Untimed tasks are due "today": only remind about them in the morning briefing, then once at lunchtime
        if (!(int) $r['due_t'] && (int) $r['snooze'] <= $now && $mins < 12 * 60 && pl_day0((int) $r['due']) === pl_day0($now)) continue;
        if (!(int) $r['n_due']) {
            $db->prepare('UPDATE pl_items SET n_due = ?, n_over = ? WHERE id = ?')->execute([$now, $now, $id]);
            $lead = $r['wait'] === 'them' ? 'Time to chase: ' : ((int) $r['owes'] ? 'Money owed: ' : 'Due now: ');
            pl_push($lead . $first($r), pl_why($r, $now) . ($r['notes'] !== '' ? ' · ' . mb_substr(preg_replace('/\s+/', ' ', $r['notes']), 0, 90) : ''), 'pl-t-' . $id);
            $log[] = 'due ' . $id;
        } elseif ($now - (int) $r['n_over'] >= 3 * 3600 && (int) $r['n_overc'] < 2 && $r['wait'] === 'me') {
            // Nag up to twice more (3 hours apart), then wait for tomorrow's briefing
            $db->prepare('UPDATE pl_items SET n_over = ?, n_overc = n_overc + 1 WHERE id = ?')->execute([$now, $id]);
            pl_push('Still waiting: ' . $first($r), pl_why($r, $now) . '. Two minutes now? Tap to do it or snooze it.', 'pl-t-' . $id);
            $log[] = 'nag ' . $id;
        }
    }
    // New day: overdue items get one fresh round of nags
    if (pl_get('nag_day') !== $day) { pl_set('nag_day', $day); $db->exec('UPDATE pl_items SET n_overc = 0'); }
    // Jobs & payments: client reminders, card payments that went through, unagreed quotes
    if (is_file(__DIR__ . '/jobs.php')) { try { require_once __DIR__ . '/jobs.php'; $log = array_merge($log, jobs_tick()); } catch (Throwable $e) { $log[] = 'jobs: ' . $e->getMessage(); } }
    return $log;
}

/* ---------- calendar feed (iPhone Calendar subscription) ---------- */
function pl_ics(): string {
    $esc = function ($s) { return str_replace(["\\", ';', ',', "\r\n", "\n"], ["\\\\", '\;', '\,', '\n', '\n'], (string) $s); };
    $fold = function ($l) { $o = ''; while (strlen($l) > 74) { $cut = 74; while ($cut > 0 && (ord($l[$cut]) & 0xC0) === 0x80) $cut--; $o .= substr($l, 0, $cut) . "\r\n "; $l = substr($l, $cut); } return $o . $l; };
    $utc = function ($t) { return gmdate('Ymd\THis\Z', $t); };
    $L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SMR Admin//Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:SMR Admin', 'X-WR-TIMEZONE:Europe/London', 'REFRESH-INTERVAL;VALUE=DURATION:PT15M', 'X-PUBLISHED-TTL:PT15M'];
    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
    foreach (pl_all() as $r) {
        $uid = 'smr-pl-' . $r['id'] . '@' . $host;
        if ($r['kind'] === 'event') {
            $s = (int) $r['start']; if (!$s) continue;
            $e = max((int) $r['end'], $s + 3600);
            $L[] = 'BEGIN:VEVENT'; $L[] = 'UID:' . $uid; $L[] = 'DTSTAMP:' . $utc((int) $r['updated'] ?: now());
            if ((int) $r['all_day']) { $L[] = 'DTSTART;VALUE=DATE:' . date('Ymd', $s); $L[] = 'DTEND;VALUE=DATE:' . date('Ymd', max(pl_day0((int) $r['end']), pl_day0($s)) + 86400 + 3600); }
            else { $L[] = 'DTSTART:' . $utc($s); $L[] = 'DTEND:' . $utc($e); }
            $L[] = $fold('SUMMARY:' . $esc($r['title']));
            if ($r['location'] !== '') $L[] = $fold('LOCATION:' . $esc($r['location']));
            $prep = pl_db()->query('SELECT title FROM pl_items WHERE status = \'open\' AND event_id = ' . (int) $r['id'])->fetchAll(PDO::FETCH_COLUMN);
            $desc = trim(($r['person'] !== '' ? 'With: ' . $r['person'] . "\n" : '') . ($prep ? 'Prep: ' . implode(', ', $prep) . "\n" : '') . $r['notes']);
            if ($desc !== '') $L[] = $fold('DESCRIPTION:' . $esc($desc));
            if (!(int) $r['all_day']) { $L[] = 'BEGIN:VALARM'; $L[] = 'ACTION:DISPLAY'; $L[] = 'DESCRIPTION:' . $esc($r['title']); $L[] = 'TRIGGER:-PT60M'; $L[] = 'END:VALARM'; }
            $L[] = 'END:VEVENT';
        } elseif ((int) $r['due'] && ((int) $r['pri'] === 1 || (int) $r['event_id'] || (int) $r['owes'])) {
            // Only hard deadlines show in the calendar (high priority, meeting prep, money): small all-day lines
            $L[] = 'BEGIN:VEVENT'; $L[] = 'UID:' . $uid; $L[] = 'DTSTAMP:' . $utc((int) $r['updated'] ?: now());
            $d = max((int) $r['due'], pl_day0(now()));
            $L[] = 'DTSTART;VALUE=DATE:' . date('Ymd', $d); $L[] = 'DTEND;VALUE=DATE:' . date('Ymd', pl_day0($d) + 86400);
            $L[] = $fold('SUMMARY:' . $esc('☐ ' . $r['title'] . ($r['person'] !== '' ? ' – ' . $r['person'] : '')));
            $L[] = 'TRANSP:TRANSPARENT';
            $L[] = 'END:VEVENT';
        }
    }
    $L[] = 'END:VCALENDAR';
    return implode("\r\n", $L) . "\r\n";
}

/* ---------- first load: the owner's brain dump of 24 Nov 2026 ---------- */
function pl_seed(PDO $pdo): void {
    pl_seed2($pdo);
    $have = $pdo->query("SELECT v FROM pl_kv WHERE k = 'seed1'")->fetchColumn();
    if ($have) return;
    $pdo->prepare('INSERT OR REPLACE INTO pl_kv (k, v) VALUES (?, ?)')->execute(['seed1', (string) time()]);
    $t = function ($s) { return (int) strtotime($s); };
    $items = [
        // [title, person, platform, area, wait, what, pri, due, due_t, notes, owes, grp]
        ['Reply today: website demo + what we can offer', 'Mobeen (EAE Centre)', 'WhatsApp', 'digital', 'me', 'demo', 1, '2026-11-24 17:00', 1, 'Asked Foodbank who made their website, so he is keen. Make a demo + a breakdown of what we offer and how it can boost his income.', 0, 'Foodbank'],
        ['Uniform quote: get the full quote from Joe today', 'Nasa (Amped Up)', 'WhatsApp', 'graphics', 'me', 'quote', 1, '2026-11-24 12:00', 1, 'Waiting ages. Offer some free social media support to make up for the wait.', 0, ''],
        ['Send the business cards (already designed) + quotes, ask about leaflets', 'Adil (M1 Tyres / AK Auto Detailing)', 'WhatsApp', 'graphics', 'me', 'work', 1, '2026-11-24 12:00', 1, 'Waiting ages. Consider a free extra.', 0, ''],
        ['Quote for 15-20 A2 prints', 'Hassan Ali (Amiji)', 'WhatsApp', 'graphics', 'me', 'quote', 1, '2026-11-24 13:00', 1, 'Overdue. Keep the relationship sweet: add some free bits.', 0, ''],
        ['Technical details (security, bandwidth/hosting) + pricing', 'Mohammed Tariq (Inspire FM)', 'WhatsApp', 'digital', 'me', 'info', 1, '2026-11-24', 0, 'Needs to be done ASAP.', 0, ''],
        ['Order the plastic signboards + images', 'Ayaz (Crispy Shefford)', 'WhatsApp', 'graphics', 'me', 'order', 1, '2026-11-24', 0, 'ASAP. Price told, roughly happy.', 0, 'Crispy Shefford'],
        ['Finish the app + add photos, set up Instagram + TikTok', 'Ayaz (Crispy Shefford)', 'WhatsApp', 'digital', 'me', 'work', 1, '2026-11-27', 0, '', 0, 'Crispy Shefford'],
        ['Message him (gave his number days ago)', 'Phillyz Smash', 'Personal Instagram', 'digital', 'me', 'reply', 1, '2026-11-24', 0, 'App nearly built. Multiple franchises. A mutual contact also wants to link you up.', 0, ''],
        ['Website demo, a few marketing examples, how we help + meeting plan', 'Cam (Pulse AV)', 'WhatsApp', 'digital', 'me', 'demo', 1, '2026-11-26 12:00', 1, 'Recommended by Sikandar + Salma (Foodbank): look after him. Does lots of Foodbank/charity events, can bring business. He sent his website wish list + needs marketing support.', 0, 'Foodbank'],
        ['Confirm the meeting time for the 27th', 'Cam (Pulse AV)', 'WhatsApp', 'digital', 'them', 'reply', 1, '2026-11-25 12:00', 1, 'Asked him on 24 Nov.', 0, 'Foodbank'],
        ['Pricing (app almost ready, needs their photos)', "Forky's Desserts", 'Personal WhatsApp + Instagram', 'digital', 'me', 'pricing', 2, '2026-11-25', 0, '', 0, ''],
        ['Pricing + extra features that can bring them more money', 'Empowering Education', '', 'digital', 'me', 'pricing', 2, '2026-11-25', 0, 'Site basically ready.', 0, ''],
        ['Reply with what it costs them', 'Choccos', 'WhatsApp', 'digital', 'me', 'pricing', 2, '2026-11-25', 0, 'Demo already given.', 0, ''],
        ['Print quotes', 'Mission Salaam', 'WhatsApp (him + a worker)', 'graphics', 'me', 'quote', 2, '2026-11-25', 0, '', 0, ''],
        ['Short deck: app features + how it benefits him', 'Kabul (Kahwa Cafe)', 'WhatsApp', 'digital', 'me', 'deck', 2, '2026-11-26', 0, '', 0, ''],
        ['Lock in the app before the new branch opens', 'Musa (Chaiikhana)', 'WhatsApp', 'digital', 'me', 'meeting', 1, '2026-11-26', 0, 'Likely to pay.', 0, ''],
        ['Demo graphics + maybe a demo website', 'Golden Arrow Archery', 'WhatsApp', 'graphics', 'me', 'demo', 2, '2026-11-27', 0, 'He phoned asking what we do.', 0, ''],
        ['Loyalty app: lighter package at a better price', 'Kashif (Brew & Nibble)', 'WhatsApp', 'digital', 'me', 'pricing', 2, '2026-11-27', 0, 'CAREFUL: his cousin builds things with Claude. Don\'t hand over the full feature list.', 0, ''],
        ['Touch base: branding, marketing, social, menus', 'Haji Rizwan (Mr Chicken)', '', 'marketing', 'me', 'call', 2, '2026-11-25', 0, 'Takeaway opening soon.', 0, ''],
        ['Talk printing, marketing, apps', 'Imran (Chai Garden)', '', 'digital', 'me', 'call', 3, '2026-11-28', 0, '', 0, ''],
        ['Email her the app + franchise deck', 'Anisa (Bombay Pizza)', 'Email', 'digital', 'me', 'deck', 2, '2026-11-26', 0, 'Instagram DMs not opened. Salma (Foodbank) knows her: ask Salma to push it if no reply.', 0, 'Foodbank'],
        ['Email Hamza the website + deck', 'Hamza (Sunna Supplements)', 'Email', 'digital', 'me', 'deck', 2, '2026-11-26', 0, 'Owner first. Backup: staff member Hamid on personal Instagram (unreplied chat).', 0, 'Sunna'],
        ['Follow up on the booking app', 'Sahib (Valor Barbers)', 'Personal Instagram', 'digital', 'them', 'reply', 2, '2026-11-26', 0, 'Last message not opened. Pitch: they likely pay ~£50/month elsewhere; ours = full booking back end, reminders, branded app.', 0, ''],
        ['Get paid: A5 menu/leaflet designs + posters (work out the amount)', "Tim (Tim & Ed's)", '', 'graphics', 'them', 'payment', 1, '2026-11-25', 0, 'Then sit down to launch the website with the booking system.', 1, ''],
        ['Sit down to launch the booking website', "Tim (Tim & Ed's)", '', 'digital', 'me', 'meeting', 2, '2026-11-28', 0, '', 0, ''],
        ['Chase the money if no reply', 'Mohib (Smash N Wings Luton)', 'WhatsApp', 'personal', 'them', 'payment', 1, '2026-11-27 10:00', 1, 'Promised to pay on 8 Nov, didn\'t. Messaged 24 Nov: 2 weeks, nothing, no part payment.', 1, ''],
        ['Follow up + try to meet', 'Flava Box', 'WhatsApp', 'digital', 'them', 'meeting', 2, '2026-11-26', 0, 'Pricing, demo + deck sent. Blue ticked, seemed interested.', 0, ''],
        ['Call him: signs, branding, website, social', 'Zeddy (Gold Wash / Mirpur Jewellers)', 'WhatsApp', 'graphics', 'them', 'call', 1, '2026-11-25', 0, 'Ill last week, blue ticked. Upsell Mirpur Jewellers too. Worth doing great work.', 0, ''],
        ['Follow up the commission trial', 'Chunk Cookies', 'WhatsApp', 'direct', 'them', 'reply', 2, '2026-11-27', 0, 'Website done; offered to run it on commission (SMR Direct-style trial).', 0, ''],
        ['Chase the demo another way (call / WhatsApp / pop in)', 'Crave Corner', 'SMR Digital Instagram', 'digital', 'them', 'demo', 2, '2026-11-27', 0, 'Demo not opened yet.', 0, 'Instagram demos'],
        ['Chase the demo another way', 'Fade District Luton', 'SMR Digital Instagram', 'digital', 'them', 'demo', 2, '2026-11-27', 0, 'Demo not opened yet.', 0, 'Instagram demos'],
        ['Chase the ordering app demo (multi-branch)', 'Junglees', 'SMR Digital Instagram', 'digital', 'them', 'demo', 2, '2026-11-27', 0, 'Not opened yet.', 0, 'Instagram demos'],
        ['Chase the menus + demo', 'Flamez Luton', 'SMR Digital Instagram', 'digital', 'them', 'demo', 2, '2026-11-27', 0, 'Free menu designs + demo sent, not opened.', 0, 'Instagram demos'],
        ['Loyalty app at a new-business rate: message her or get her number from Myra', 'Mikael Cafe', 'Instagram', 'digital', 'me', 'pricing', 3, '2026-11-28', 0, '', 0, ''],
        ['Chase Greg: go-live + payment link (launch this week)', 'Greg (Foodbank)', 'Email', 'digital', 'them', 'reply', 1, '2026-11-26', 0, "Let's Eat Together system ready; emailed him 24 Nov.", 0, 'Foodbank'],
        ['Talk to the owner about the app + whole system', 'Habib (Cafe Grill)', 'Via Adam', 'digital', 'me', 'meeting', 2, '2026-11-28', 0, 'Managers liked it but didn\'t get it. Habib also owns Jackman\'s Peri-Peri.', 0, 'Adam'],
        ['Unique app + website + social automation pitch', "Habib (Jackman's Peri-Peri)", 'Via Adam', 'digital', 'me', 'demo', 2, '2026-12-01', 0, 'On FoodHub now. Same owner as Cafe Grill.', 0, 'Adam'],
        ['Add photos + make a deck, send via Adam', 'Active Luton (Habib\'s friend)', 'Via Adam / sister', 'digital', 'me', 'deck', 2, '2026-11-30', 0, 'Website done.', 0, 'Adam'],
        ['Lock in a day to go to Milton Keynes', 'Faizan (FR Packaging)', 'WhatsApp', 'digital', 'me', 'meeting', 2, '2026-11-26', 0, 'Website done, keen. B2B, likely referrals (commission).', 0, ''],
        ['Send the deck, meet when he is back from holiday', 'Saf Rathor (Gatsby Law)', 'WhatsApp', 'marketing', 'me', 'deck', 2, '2026-11-26', 0, 'Sent post examples + the song promo. No website, Instagram, TikTok or Google presence yet.', 0, ''],
        ['Push the website through Sharukh', 'Luton Sixth Form College', 'Personal Instagram', 'digital', 'me', 'reply', 2, '2026-11-27', 0, 'Website done.', 0, 'Schools'],
        ['Email the admin team: website + branding help', 'Norton Road School', 'Email', 'digital', 'me', 'info', 2, '2026-11-27', 0, 'Your old school: ex-pupil starting a business who wants to help. Website + benefits + branding refresh / materials / support.', 0, 'Schools'],
        ['Proper talk about selling our sites/apps to his network', 'Visam Graphics', '', 'digital', 'me', 'call', 3, '2026-11-30', 0, 'Commission for him.', 0, ''],
        ['Talk about him buying in (e.g. 25%)', 'Wade (Smash N Wings Bedford)', '', 'personal', 'me', 'meeting', 2, '2026-11-30', 0, 'How much, has he got the money, Companies House / brand ownership, what your side looks like.', 0, ''],
        ['Order 2 front parking sensors + a front splitter', 'Car', '', 'personal', 'me', 'order', 2, '2026-11-26', 0, 'Before booking Hyder Autos so it is all fitted the same day.', 0, 'Car'],
        ['Send photos of the bonnet + book a day', 'Hyder Autos', '', 'personal', 'me', 'call', 2, '2026-11-27', 0, 'Paint redo he messed up, months ago.', 0, 'Car'],
        ['Book a service (squeaky brakes)', 'Car', '', 'personal', 'me', 'call', 3, '2026-12-01', 0, '', 0, 'Car'],
    ];
    $ins = $pdo->prepare('INSERT INTO pl_items (kind, title, person, platform, area, wait, what, pri, due, due_t, notes, owes, grp, created, updated) VALUES (\'task\',?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $now = time();
    foreach ($items as $i) $ins->execute([$i[0], $i[1], $i[2], $i[3], $i[4], $i[5], $i[6], $t($i[7] . ($i[8] ? '' : ' 17:00')), $i[8], $i[9], $i[10], $i[11], $now, $now]);
    $ev = $pdo->prepare('INSERT INTO pl_items (kind, title, person, area, start, end, all_day, location, notes, prep_asked, grp, created, updated, n_day, n_soon) VALUES (\'event\',?,?,?,?,?,?,?,?,1,?,?,?,?,?)');
    $events = [
        ['Video shoot with Ihsan (ROUH)', 'Ihsan (ROUH)', 'marketing', '2026-11-25 18:00', '2026-11-25 20:00', 0, 'Near his house', ''],
        ['Meeting with Cam (Pulse AV) in Luton, time TBC', 'Cam (Pulse AV)', 'digital', '2026-11-27', '2026-11-27', 1, 'Luton', 'Bring the website demo, marketing examples and meeting plan.'],
        ['Boys night in London (Gazim), maybe', 'Gazim', 'personal', '2026-11-28 19:00', '2026-11-28 23:00', 0, 'London', 'Said you\'ll try and come.'],
        ['Photo/video session: Mamun & Mushtaba', 'Mamun & Mushtaba', 'personal', '2026-12-05 18:00', '2026-12-05 22:00', 0, 'Church venue, Ash Road', ''],
        ['Cinema with family: Doomsday', 'Family', 'personal', '2026-12-16 18:00', '2026-12-16 21:30', 0, '', 'Evening, time to confirm.'],
    ];
    foreach ($events as $e) {
        $ev->execute([$e[0], $e[1], $e[2], $t($e[3]), $t($e[4]), $e[5], $e[6], $e[7], $e[1] === 'Cam (Pulse AV)' ? 'Foodbank' : '', $now, $now, 0, 0]);
        if ($e[1] === 'Cam (Pulse AV)') $pdo->prepare("UPDATE pl_items SET event_id = ? WHERE kind = 'task' AND person = 'Cam (Pulse AV)' AND what = 'demo'")->execute([(int) $pdo->lastInsertId()]);
    }
}

/* One-off tasks added from chat (24 Nov afternoon): setup jobs for the jobs/payments + email AI build. */
function pl_seed2(PDO $pdo): void {
    if ($pdo->query("SELECT v FROM pl_kv WHERE k = 'seed2'")->fetchColumn()) return;
    $pdo->prepare('INSERT OR REPLACE INTO pl_kv (k, v) VALUES (?, ?)')->execute(['seed2', (string) time()]);
    $now = time();
    $ins = $pdo->prepare('INSERT INTO pl_items (kind, title, person, platform, area, wait, what, pri, due, due_t, notes, owes, grp, created, updated) VALUES (\'task\',?,?,?,?,?,?,?,?,?,?,0,?,?,?)');
    foreach ([
        ['Set up the Anthropic API key for the email AI', 'SMR Admin', 'platform.claude.com (web only, not the Claude app)', 'direct', 'me', 'work', 2, '2026-11-27 12:00', 1, "Safari or laptop: platform.claude.com, sign in, organisation SMR Digital. Billing: add card, buy \$5-10 credit, auto-reload OFF. Limits: monthly limit ~\$10. API Keys: Create Key 'SMR Admin', copy it (sk-ant-..., shown once). Paste it into SMR Admin > Email settings > AI assistant. Never send it in a chat. Cost ~£1/month.", 'SMR Admin setup'],
        ['Set up Stripe for job payment links', 'SMR Admin', 'stripe.com', 'direct', 'me', 'work', 2, '2026-11-28 12:00', 1, 'Make a Stripe account (SMR Digital), add bank details for payouts, then paste the secret key into SMR Admin > Settings > Payments. Fees 1.5% + 20p per UK card, no monthly fee.', 'SMR Admin setup'],
    ] as $i) $ins->execute([$i[0], $i[1], $i[2], $i[3], $i[4], $i[5], $i[6], (int) strtotime($i[7]), $i[8], $i[9], $i[10], $now, $now]);
}
