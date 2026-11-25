<?php
/* Grill House menu editor: SMR's view. Every save the owner makes, his notes and voice notes, and "Bring this version back". */
define('SMR_DEMO', 1);
require dirname(__DIR__, 2) . '/demo-lib/bootstrap.php';
header('X-Robots-Tag: noindex, nofollow'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
if (!admin_token()) { header('Location: /demo-admin/'); exit; }
date_default_timezone_set('Europe/London');
$dir = private_dir() . '/grillhouse-menu';
$cur = is_file("$dir/current.json") ? json_decode(file_get_contents("$dir/current.json"), true) : null;
$vs = [];
foreach (glob("$dir/v/*.json") ?: [] as $f) { $v = json_decode((string)file_get_contents($f), true); if ($v) $vs[] = $v; }
usort($vs, fn($a, $b) => strcmp($b['ver'], $a['ver']));
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
function when(int $t): string { $d = date('Y-m-d', $t); return ($d === date('Y-m-d') ? 'Today' : ($d === date('Y-m-d', time() - 86400) ? 'Yesterday' : date('D j M', $t))) . ' · ' . date('g:ia', $t); }
?><!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#111509"><title>Grill House · Menu saves</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#111509;color:#efe9db;font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;padding:0 0 50px}
header{position:sticky;top:0;background:rgba(17,21,9,.95);backdrop-filter:blur(8px);border-bottom:1px solid rgba(214,183,135,.25);padding:14px 16px;display:flex;align-items:center;gap:10px;z-index:2}
header h1{flex:1;font:800 18px/1.2 system-ui;color:#efdcb8}header h1 small{display:block;font-weight:600;font-size:12px;color:#b9a27c}
header a{color:#1c1709;background:linear-gradient(120deg,#f3e3c2,#d6b787 45%,#c29d6f);text-decoration:none;font:700 13px/1 system-ui;padding:10px 12px;border-radius:10px;white-space:nowrap}
main{max-width:720px;margin:0 auto;padding:14px}
.empty{padding:40px 10px;text-align:center;color:#a59c86}
.card{background:#1d2410;border:1px solid rgba(214,183,135,.22);border-radius:16px;padding:14px;margin-bottom:12px}
.card.cur{border-color:#d6b787;box-shadow:0 0 0 1px #d6b787 inset}
.top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.top b{font-size:15.5px;color:#fff}
.pill{font:700 10.5px/1 system-ui;letter-spacing:.04em;text-transform:uppercase;padding:5px 7px;border-radius:6px;background:#d6b787;color:#1c1709}.pill.smr{background:#3a4a1c;color:#efdcb8}
.sum{color:#b9a27c;font-size:13px;margin-top:3px}
ul{list-style:none;margin:10px 0 0;border-top:1px solid rgba(214,183,135,.15)}li{padding:7px 0;border-bottom:1px solid rgba(214,183,135,.1);font-size:14px}
.nt{margin-top:10px;padding:10px 12px;background:#f5f0e4;color:#1b2110;border-radius:12px;font-size:14px;white-space:pre-wrap}.nt small{display:block;color:#6b6852;font-size:11.5px;margin-top:3px}
audio{width:100%;height:38px;margin-top:4px}
.row{display:flex;gap:8px;margin-top:12px}.row button,.row a{flex:1;text-align:center;border:1px solid rgba(214,183,135,.35);background:transparent;color:#efdcb8;border-radius:11px;padding:11px 8px;font:700 13.5px/1 system-ui;text-decoration:none}
.row .gold{background:linear-gradient(120deg,#f3e3c2,#d6b787 45%,#c29d6f);color:#1c1709;border:0}
details{margin-top:10px}summary{cursor:pointer;color:#d6b787;font-weight:700;font-size:13.5px}
.menu h4{margin:12px 0 4px;color:#d6b787;font-size:13px;text-transform:uppercase;letter-spacing:.06em}.menu div{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;padding:3px 0;border-bottom:1px dashed rgba(214,183,135,.12)}.menu div span:last-child{white-space:nowrap;color:#efdcb8}
#toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#f2ead8;color:#1a1d0e;padding:12px 16px;border-radius:12px;font-weight:700;display:none}
</style></head><body>
<header><h1>Grill House menu<small>Every time they press Save · newest first</small></h1><a href="/grillhouse/edit/" target="_blank">Open editor</a></header>
<main>
<?php if (!$vs): ?><div class="empty">Nothing saved yet. You'll get a notification when Grill House saves the menu.</div><?php endif; ?>
<?php foreach ($vs as $v): $isCur = $cur && $cur['ver'] === $v['ver']; $notes = $v['st']['notes'] ?? []; ?>
<div class="card<?= $isCur ? ' cur' : '' ?>">
  <div class="top"><b><?= $h(when((int)$v['at'])) ?></b><?php if ($isCur): ?><span class="pill">On the menu now</span><?php endif; ?><?php if (($v['by'] ?? '') === 'smr'): ?><span class="pill smr">Brought back by you</span><?php endif; ?></div>
  <div class="sum"><?= count($v['lines'] ?? []) ?> change<?= count($v['lines'] ?? []) === 1 ? '' : 's' ?> from the original menu<?= $v['notes'] ? ' · ' . (int)$v['notes'] . ' note' . ($v['notes'] > 1 ? 's' : '') : '' ?><?= $v['voice'] ? ' · ' . (int)$v['voice'] . ' voice note' . ($v['voice'] > 1 ? 's' : '') : '' ?></div>
  <?php if (!empty($v['lines'])): ?><ul><?php foreach ($v['lines'] as $l): ?><li><?= $h($l) ?></li><?php endforeach; ?></ul><?php endif; ?>
  <?php foreach (array_reverse($notes) as $n): ?><div class="nt"><?php if (!empty($n['audio'])): ?>🎤 Voice note<?= !empty($n['len']) ? ' · ' . gmdate('i:s', (int)round($n['len'])) : '' ?><audio controls preload="none" src="<?= $h($n['audio']) ?>"></audio><?php else: ?><?= $h($n['text'] ?? '') ?><?php endif; ?><small><?= !empty($n['t']) ? $h(when((int)($n['t'] / 1000))) : '' ?></small></div><?php endforeach; ?>
  <details><summary>See the whole menu in this version</summary><div class="menu"><?php foreach ($v['st']['sections'] ?? [] as $s): ?><h4><?= $h($s['title'] ?? '') ?></h4><?php foreach ($s['items'] ?? [] as $it): ?><div><span><?= $h($it['name'] ?? '') ?></span><span><?= $h($it['price'] ?? '') ?></span></div><?php endforeach; endforeach; ?></div></details>
  <?php if (!$isCur): ?><div class="row"><button class="gold" data-v="<?= $h($v['ver']) ?>">Bring this version back</button></div><?php endif; ?>
</div>
<?php endforeach; ?>
</main><div id="toast"></div>
<script>
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-v]'); if (!b) return;
  if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to bring it back'; setTimeout(function () { b.textContent = 'Bring this version back'; delete b.dataset.sure; }, 3500); return; }
  b.textContent = 'Bringing it back…';
  var f = new FormData(); f.append('v', b.dataset.v);
  fetch('api.php?a=restore', { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) {
    var t = document.getElementById('toast'); t.textContent = d.ok ? 'Done. Their editor shows this version next time it opens.' : 'Could not do that, try again.'; t.style.display = 'block';
    if (d.ok) setTimeout(function () { location.reload(); }, 1400);
  });
});
</script></body></html>
