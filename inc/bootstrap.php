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

// How many words a piece of HTML has (for an article's reading time and its search-engine data).
function words(string $html): int
{
    return count(preg_split('/\s+/u', trim(html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8')), -1, PREG_SPLIT_NO_EMPTY));
}

// One random entry of a list.
function pick(array $list)
{
    return $list[random_int(0, count($list) - 1)];
}

// The first roll of a board: one die per table, as big as the table (story, NPC and tavern generators).
function roll_tables(array $tables): array
{
    return array_map(fn (array $tb): int => random_int(1, count($tb['v'])), $tables);
}

// A sentence with a capital first letter, Slovak letters included.
function cap(string $s): string
{
    return mb_strtoupper(mb_substr($s, 0, 1)) . mb_substr($s, 1);
}

// One value from a content pair [Slovak, English].
function pair(array $pair): string
{
    global $LANG;
    return $pair[$LANG === 'en' ? 1 : 0];
}

// A site file's address with a short fingerprint of its content, so browsers can keep it for a year
// and still fetch the new version the moment the file changes.
function asset(string $path): string
{
    static $seen = [];
    return $seen[$path] ??= $path . '?v=' . substr(md5_file(__DIR__ . '/..' . $path), 0, 8);
}

// Text for the current language, as HTML. {url:page} placeholders become that page's address.
function t(string $key): string
{
    global $LANG;
    $pair = texts()[$key] ?? null;
    if ($pair === null) {
        return $key;
    }
    return links($pair[$LANG === 'en' ? 1 : 0]);
}

// {url:page} placeholders in a text become that page's address in the current language.
function links(string $s): string
{
    return (string) preg_replace_callback('/\{url:([a-z0-9]+)\}/', fn ($m) => url($m[1]), $s);
}

// The guide text and questions under a tool (data/articles.json), or null when the page has none.
function article(string $page): ?array
{
    static $all = null;
    $all ??= json_decode((string) file_get_contents(__DIR__ . '/../data/articles.json'), true);
    return $all[$page] ?? null;
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

// The articles (data/posts.json), newest first.
function posts(): array
{
    $all = content('posts');
    uasort($all, fn ($a, $b) => strcmp($b['date'], $a['date']));
    return $all;
}

function abs_url(string $page, ?string $lang = null): string
{
    return site()['url'] . url($page, $lang);
}

// The AdSense publisher ID from data/site.json ("ca-pub-" and 16 digits), or "" while the site shows no ads.
// One switch: it turns on the AdSense tag, /ads.txt, the advertising part of the privacy policy
// and the "Privacy settings" link in the footer.
function adsense(): string
{
    $id = trim((string) (site()['adsense'] ?? ''));
    return preg_match('/^ca-pub-\d{16}$/', $id) ? $id : '';
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
