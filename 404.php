<?php
require __DIR__ . '/inc/bootstrap.php';
$lang = str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/en/') ? 'en' : 'sk';
render_page('404', $lang, 404);
