<?php
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') { http_response_code(404); exit; }
/* Shared mock-up links: images live in private storage for 30 days. */
if (!defined('SMR_DEMO')) define('SMR_DEMO', 1);
require_once dirname(__DIR__) . '/demo-lib/bootstrap.php';
const SHARE_DAYS = 30;
function share_dir(): string { $d = private_dir() . '/shares'; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function share_id_ok($id): bool { return is_string($id) && preg_match('/^[A-Za-z0-9]{10}$/', $id) === 1; }
function share_meta(string $id): ?array {
    if (!share_id_ok($id)) return null;
    $f = share_dir() . "/$id.json"; if (!is_file($f) || !is_file(share_dir() . "/$id.jpg")) return null;
    $m = json_decode((string) file_get_contents($f), true); if (!is_array($m)) return null;
    if (($m['t'] ?? 0) < time() - SHARE_DAYS * 86400) return null;
    return $m;
}
function share_cleanup(): void {
    $old = time() - SHARE_DAYS * 86400;
    foreach (glob(share_dir() . '/*.json') ?: [] as $f) {
        $m = json_decode((string) @file_get_contents($f), true);
        if (!is_array($m) || ($m['t'] ?? 0) < $old) { @unlink($f); @unlink(substr($f, 0, -5) . '.jpg'); }
    }
}
function share_host(): string {
    $h = preg_replace('/[^a-z0-9.\-:]/i', '', $_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk');
    return 'https://' . ($h ?: 'smrgraphics.co.uk');
}
