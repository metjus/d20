<?php
declare(strict_types=1);

// Contact form endpoint for d20.sk. Accepts a POST from the page and sends one plain-text email.
// Answers with JSON: {"ok": true} or {"ok": false, "error": "email|message|consent|rate|send|method|origin"}.

$cfg = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $key, int $max): string
{
    $value = $_POST[$key] ?? '';
    return is_string($value) ? mb_substr(trim($value), 0, $max) : '';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'method']);
}

// Only accept submissions from this site.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) {
    reply(403, ['ok' => false, 'error' => 'origin']);
}

// Bots: the hidden field is filled in, or the form was sent too fast. Pretend it worked.
if (field('website', 200) !== '' || (int) ($_POST['elapsed'] ?? 0) < $cfg['min_seconds'] * 1000) {
    reply(200, ['ok' => true]);
}

$name    = preg_replace('/[\r\n\t]+/', ' ', field('name', 80));
$email   = field('email', 160);
$message = field('message', 4000);
$topics  = ['idea' => 'Nápad', 'bug' => 'Chyba na webe', 'collab' => 'Spolupráca', 'other' => 'Iné'];
$topic   = $topics[$_POST['topic'] ?? ''] ?? $topics['other'];
$lang    = ($_POST['lang'] ?? '') === 'en' ? 'EN' : 'SK';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    reply(422, ['ok' => false, 'error' => 'email']);
}
if (mb_strlen($message) < 10) {
    reply(422, ['ok' => false, 'error' => 'message']);
}
if (($_POST['consent'] ?? '') !== '1') {
    reply(422, ['ok' => false, 'error' => 'consent']);
}

// Rate limit per IP. Only a hash of the IP is stored, and files older than 2 hours are deleted.
$dir = sys_get_temp_dir() . '/d20-contact';
if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
}
foreach (glob($dir . '/*') ?: [] as $old) {
    if (filemtime($old) < time() - 7200) {
        @unlink($old);
    }
}
$slot  = $dir . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . date('Y-m-d H') . '|' . __DIR__);
$count = is_file($slot) ? (int) file_get_contents($slot) : 0;
if ($count >= $cfg['max_per_hour']) {
    reply(429, ['ok' => false, 'error' => 'rate']);
}
@file_put_contents($slot, (string) ($count + 1), LOCK_EX);

$subject = 'd20.sk: ' . $topic . ($name !== '' ? ' od ' . $name : '');
$body = "Meno: " . ($name !== '' ? $name : '—') . "\n"
      . "E-mail: $email\n"
      . "Téma: $topic\n"
      . "Jazyk webu: $lang\n"
      . "Súhlas so spracovaním: áno, " . date('Y-m-d H:i:s') . "\n"
      . "\n" . $message . "\n";

$headers = implode("\r\n", [
    'From: d20.sk <' . $cfg['from'] . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = mail($cfg['to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $cfg['from']);

reply($sent ? 200 : 500, $sent ? ['ok' => true] : ['ok' => false, 'error' => 'send']);
