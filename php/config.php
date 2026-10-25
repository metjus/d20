<?php
// Contact form settings. Change the addresses here, not in contact.php.
return [
    'to'           => 'hello@d20.sk',    // where messages arrive
    'from'         => 'noreply@d20.sk',  // sender address; must be a mailbox or alias on this hosting
    'min_seconds'  => 3,                 // faster submissions are treated as bots
    'max_per_hour' => 5,                 // messages allowed per IP address per hour
];
