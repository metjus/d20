<?php
// Contact form settings. Change the addresses here, not in contact.php.
return [
    'to'           => 'hello@d20.sk',    // where messages arrive
    'from'         => 'hello@d20.sk',    // sender address; the same mailbox, so replies go to the visitor via Reply-To
    'min_seconds'  => 3,                 // faster submissions are treated as bots
    'max_per_hour' => 5,                 // messages allowed per IP address per hour
];
