<?php
/* SMR Admin AI helper (Claude via the Anthropic API). One key for everything (proof checks now, email sorting later).
   Key pasted in SMR Admin, stored encrypted (mail_encrypt). Spend is counted from each answer's token usage and
   capped per month (default $5) so it can never run away. Model: Claude Haiku 5.5 ($0.10 / $0.50 per million tokens). */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/mail.php';

const AI_MODEL = 'claude-haiku-5-5';
const AI_PRICE_IN = 0.10;    // $ per million input tokens
const AI_PRICE_OUT = 0.50;   // $ per million output tokens

function ai_kv(string $k, string $def = ''): string {
    db()->exec('CREATE TABLE IF NOT EXISTS ai_kv (k TEXT PRIMARY KEY, v TEXT)');
    $st = db()->prepare('SELECT v FROM ai_kv WHERE k = ?'); $st->execute([$k]); $v = $st->fetchColumn(); return $v === false ? $def : (string) $v;
}
function ai_kv_set(string $k, string $v): void { db()->exec('CREATE TABLE IF NOT EXISTS ai_kv (k TEXT PRIMARY KEY, v TEXT)'); db()->prepare('INSERT OR REPLACE INTO ai_kv (k, v) VALUES (?, ?)')->execute([$k, $v]); }
function ai_key(): string { $e = ai_kv('key'); return $e !== '' ? mail_decrypt($e) : ''; }
function ai_cap(): float { return (float) (ai_kv('cap', '5') ?: 5); }
function ai_spent(): float { return (float) ai_kv('spent-' . date('Y-m'), '0'); }
function ai_public(): array { $k = ai_key(); return ['on' => $k !== '', 'hint' => $k !== '' ? substr($k, 0, 10) . '…' . substr($k, -4) : '', 'cap' => ai_cap(), 'spent' => round(ai_spent(), 3)]; }

/* One Messages API call. $content = list of content blocks. Returns the text answer. */
function ai_call(array $content, int $maxOut = 900, string $system = ''): string {
    $key = ai_key();
    if ($key === '') throw new RuntimeException('The AI isn\'t set up yet: add your Anthropic API key in Proofs ⚙.');
    if (ai_spent() >= ai_cap()) throw new RuntimeException('This month\'s AI spending limit ($' . ai_cap() . ') is used up.');
    $body = ['model' => AI_MODEL, 'max_tokens' => $maxOut, 'messages' => [['role' => 'user', 'content' => $content]]];
    if ($system !== '') $body['system'] = $system;
    $c = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_HTTPHEADER => ['x-api-key: ' . $key, 'anthropic-version: 2023-06-01', 'content-type: application/json']]);
    $res = curl_exec($c); $code = (int) curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    $j = json_decode((string) $res, true) ?: [];
    if ($code !== 200) throw new RuntimeException('AI: ' . ($j['error']['message'] ?? 'no answer (' . $code . ')'));
    $u = $j['usage'] ?? [];
    $cost = ((int) ($u['input_tokens'] ?? 0) * AI_PRICE_IN + (int) ($u['output_tokens'] ?? 0) * AI_PRICE_OUT) / 1e6;
    ai_kv_set('spent-' . date('Y-m'), (string) (ai_spent() + $cost));
    $t = '';
    foreach ($j['content'] ?? [] as $b) if (($b['type'] ?? '') === 'text') $t .= $b['text'];
    return $t;
}
/* A JPEG made small enough for the AI (long side ≤ 1568 px), base64. */
function ai_img(string $path): array {
    $data = (string) file_get_contents($path); $mime = 'image/jpeg';
    if (function_exists('imagecreatefromstring') && ($im = @imagecreatefromstring($data))) {
        $w = imagesx($im); $h = imagesy($im); $k = min(1, 1568 / max($w, $h));
        if ($k < 1) { $n = imagecreatetruecolor((int) round($w * $k), (int) round($h * $k)); imagecopyresampled($n, $im, 0, 0, 0, 0, imagesx($n), imagesy($n), $w, $h); imagedestroy($im); $im = $n; }
        ob_start(); imagejpeg($im, null, 85); $data = (string) ob_get_clean(); imagedestroy($im);
    }
    return ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => base64_encode($data)]];
}
/* Proof check: reads the design and lists real problems only (spelling, wrong/odd details, missing info). */
function ai_check_design(array $paths, array $ctx): array {
    $content = [];
    foreach (array_slice($paths, 0, 6) as $p) $content[] = ai_img($p);
    $facts = [];
    foreach (['client' => 'Client', 'item' => 'Item', 'kind' => 'Type', 'phone' => 'Client phone on file', 'email' => 'Client email on file', 'changes' => 'Changes the client asked for last time'] as $k => $l)
        if (!empty($ctx[$k])) $facts[] = $l . ': ' . $ctx[$k];
    $content[] = ['type' => 'text', 'text' => "You are checking a design proof before it goes to a client to sign off for print.\n" . implode("\n", $facts)
        . "\n\nRead every word in the design(s). Report ONLY real problems a careful proof-reader would flag: spelling or grammar mistakes, words that look like typos, phone numbers with the wrong number of digits (UK mobiles are 07 + 9 digits), email/web addresses that look broken, prices or dates that look inconsistent, text cut off at the edge, and anything from 'Changes the client asked for' that does NOT appear to be done. Brand names, slang, transliterated Urdu/Arabic/Punjabi words and stylised wording are fine: don't flag them. Don't comment on design taste.\n"
        . "Answer with JSON only: {\"text\": \"all the text you can read, in order\", \"issues\": [{\"level\": \"check\"|\"warn\", \"what\": \"short plain-English note, quoting the exact word\"}]}. Empty issues list if it all looks right."];
    $raw = ai_call($content, 1500);
    if (preg_match('/\{.*\}/s', $raw, $m)) { $j = json_decode($m[0], true); if (is_array($j)) return ['text' => (string) ($j['text'] ?? ''), 'issues' => array_slice((array) ($j['issues'] ?? []), 0, 12)]; }
    return ['text' => '', 'issues' => []];
}
