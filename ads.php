<?php
// ads.txt (see .htaccess): names Google as the only seller of ads on d20.sk.
// Built from "adsense" in data/site.json; while it is empty the site shows no ads and /ads.txt does not exist.
require __DIR__ . '/inc/bootstrap.php';

$id = adsense();
if ($id === '') {
    render_page('404', 'sk', 404);
    exit;
}
header('Content-Type: text/plain; charset=utf-8');
// f08c47fec0942fa0 is Google's own ID in the IAB list of ad sellers; the same for every AdSense account.
echo 'google.com, ', substr($id, 3), ", DIRECT, f08c47fec0942fa0\n";
