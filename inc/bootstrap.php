<?php
declare(strict_types=1);

// Shared helpers for every page: texts, page addresses and the page layout.
// Texts live in data/texts.json as "key": ["Slovak", "English"]; pages and their addresses in data/site.json.

$LANG = 'sk';
$PAGE = 'domov';

function site(): array
{
    static $site = null;
    return $site ??= json_decode((string) file_get_contents(__DIR__ . '/../data/site.json'), true);
}

function texts(): array
{
    static $texts = null;
    return $texts ??= json_decode((string) file_get_contents(__DIR__ . '/../data/texts.json'), true);
}

// Content lists for the library pages: data/classes.json, species.json, glossary.json.
function content(string $name): array
{
    static $cache = [];
    return $cache[$name] ??= json_decode((string) file_get_contents(__DIR__ . "/../data/$name.json"), true);
}

// One value from a content pair [Slovak, English].
function pair(array $pair): string
{
    global $LANG;
    return $pair[$LANG === 'en' ? 1 : 0];
}

// Text for the current language, as HTML. {url:page} placeholders become that page's address.
function t(string $key): string
{
    global $LANG;
    $pair = texts()[$key] ?? null;
    if ($pair === null) {
        return $key;
    }
    return (string) preg_replace_callback('/\{url:([a-z0-9]+)\}/', fn ($m) => url($m[1]), $pair[$LANG === 'en' ? 1 : 0]);
}

// The same text as plain words, safe inside an attribute.
function attr(string $key): string
{
    return e(html_entity_decode(strip_tags(t($key)), ENT_QUOTES, 'UTF-8'));
}

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function url(string $page, ?string $lang = null): string
{
    global $LANG;
    return site()['pages'][$page]['url'][$lang ?? $LANG];
}

function abs_url(string $page, ?string $lang = null): string
{
    return site()['url'] . url($page, $lang);
}

function render_page(string $page, string $lang, int $status = 200): void
{
    global $LANG, $PAGE;
    $LANG = $lang;
    $PAGE = $page;
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    require __DIR__ . '/../partials/layout.php';
}
