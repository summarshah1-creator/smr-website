<?php
/* Web Push (RFC 8291 aes128gcm + VAPID) with PHP's own openssl and curl. No outside services
   apart from the browser's push service (Apple / Google / Mozilla), which is free. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }

function b64u(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64u_dec(string $s): string { return (string) base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4)); }

/* P-256 raw public key (65 bytes, 0x04|X|Y) from an openssl key. */
function ec_raw_public($key): string {
    $d = openssl_pkey_get_details($key);
    return "\x04" . str_pad($d['ec']['x'], 32, "\0", STR_PAD_LEFT) . str_pad($d['ec']['y'], 32, "\0", STR_PAD_LEFT);
}
function ec_public_from_raw(string $raw) {
    $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $raw;
    $pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
    return openssl_pkey_get_public($pem);
}
function ec_new_key() {
    return openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1']);
}

/* VAPID keys, made once and kept in private storage. */
function vapid_keys(): array {
    $file = private_dir() . '/vapid.pem';
    if (!is_file($file)) {
        $k = ec_new_key();
        openssl_pkey_export($k, $pem);
        file_put_contents($file, $pem);
        @chmod($file, 0600);
    }
    $key = openssl_pkey_get_private((string) file_get_contents($file));
    return ['key' => $key, 'public' => b64u(ec_raw_public($key))];
}

/* DER ECDSA signature -> raw r||s (64 bytes) for JWT ES256. */
function der_to_raw(string $der): string {
    $pos = 2; if (ord($der[1]) & 0x80) $pos += ord($der[1]) & 0x7f;
    $out = '';
    for ($i = 0; $i < 2; $i++) {
        $len = ord($der[$pos + 1]);
        $int = substr($der, $pos + 2, $len);
        $out .= str_pad(ltrim($int, "\0"), 32, "\0", STR_PAD_LEFT);
        $pos += 2 + $len;
    }
    return $out;
}

function vapid_header(string $endpoint): string {
    $v = vapid_keys();
    $u = parse_url($endpoint);
    $aud = $u['scheme'] . '://' . $u['host'] . (isset($u['port']) ? ':' . $u['port'] : '');
    $jwt = b64u(json_encode(['typ' => 'JWT', 'alg' => 'ES256'])) . '.' . b64u(json_encode(['aud' => $aud, 'exp' => time() + 12 * 3600, 'sub' => 'mailto:Summar@smrgraphics.co.uk']));
    openssl_sign($jwt, $sig, $v['key'], OPENSSL_ALGO_SHA256);
    return 'vapid t=' . $jwt . '.' . b64u(der_to_raw($sig)) . ', k=' . $v['public'];
}

/* Encrypt one message for one subscription (RFC 8291). */
function push_encrypt(string $payload, string $p256dh, string $auth): string {
    $uaPublic = b64u_dec($p256dh);
    $authSecret = b64u_dec($auth);
    $as = ec_new_key();
    $asPublic = ec_raw_public($as);
    $shared = openssl_pkey_derive(ec_public_from_raw($uaPublic), $as, 32);
    if ($shared === false) throw new RuntimeException('ECDH failed');
    $prkKey = hash_hmac('sha256', $shared, $authSecret, true);
    $ikm = hash_hmac('sha256', "WebPush: info\0" . $uaPublic . $asPublic . "\x01", $prkKey, true);
    $salt = random_bytes(16);
    $prk = hash_hmac('sha256', $ikm, $salt, true);
    $cek = substr(hash_hmac('sha256', "Content-Encoding: aes128gcm\0\x01", $prk, true), 0, 16);
    $nonce = substr(hash_hmac('sha256', "Content-Encoding: nonce\0\x01", $prk, true), 0, 12);
    $cipher = openssl_encrypt($payload . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    return $salt . pack('N', 4096) . chr(65) . $asPublic . $cipher . $tag;
}

/* Send to every saved device. Never throws: notifications are best effort. */
function push_all(string $title, string $body, string $url = '/demo-admin/#live', string $tag = ''): void {
    try {
        if (!function_exists('curl_init')) return;
        $subs = db()->query('SELECT * FROM push_subs')->fetchAll();
        if (!$subs) return;
        $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url, 'tag' => $tag], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        foreach ($subs as $s) {
            $ch = curl_init($s['endpoint']);
            curl_setopt_array($ch, [
                CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_POSTFIELDS => push_encrypt($payload, $s['p256dh'], $s['auth']),
                CURLOPT_HTTPHEADER => ['Content-Type: application/octet-stream', 'Content-Encoding: aes128gcm', 'TTL: 3600', 'Urgency: high',
                    'Authorization: ' . vapid_header($s['endpoint'])],
            ]);
            curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code === 404 || $code === 410) db()->prepare('DELETE FROM push_subs WHERE endpoint = ?')->execute([$s['endpoint']]);
        }
    } catch (Throwable $e) { /* ignore */ }
}

/* Activity log + notification. */
function link_event(array $l, string $type, string $text): void {
    try {
        db()->prepare('INSERT INTO events (link_id, type, text, at) VALUES (?,?,?,?)')->execute([$l['id'], $type, $text, now()]);
        db()->prepare('DELETE FROM events WHERE at < ?')->execute([now() - 60 * 86400]);
    } catch (Throwable $e) {}
    $who = trim((string) $l['label']) !== '' ? $l['label'] : 'Someone';
    $titles = ['opened' => 'Demo opened', 'low' => 'Demo time running out', 'ended' => 'Demo ended'];
    push_all($titles[$type] ?? 'SMR Admin', $who . ($text !== '' && $text[0] === "'" ? '' : ' ') . $text, '/demo-admin/#live', 'link-' . $l['id'] . '-' . $type);
}
