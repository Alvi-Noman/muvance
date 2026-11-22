<?php
// Muvance settings for Roundcube (webmail at mail.muvance.com). Loaded after the image's defaults.
// The secret des_key is in a separate file that deploy.sh creates on the server.

$config['product_name'] = 'Muvance Mail';
$config['skin'] = 'elastic';
$config['skin_logo'] = 'https://muvance.com/favicon.svg';
$config['support_url'] = 'https://muvance.com';

// The mail server, by its public name (a Docker network alias), so TLS certificates verify.
$config['imap_host'] = 'ssl://mail.muvance.com:993';
$config['smtp_host'] = 'ssl://mail.muvance.com:465';
$config['smtp_user'] = '%u';
$config['smtp_pass'] = '%p';

// People may sign in as "nadia" or "nadia@muvance.com".
$config['username_domain'] = 'muvance.com';
$config['mail_domain'] = 'muvance.com';
$config['login_lc'] = 2;

// Behind Caddy, which has this fixed address on the "webmail" network (compose.production.yml).
// Trusting it gives Roundcube the visitor's real IP (for the login rate limit) and HTTPS status.
$config['proxy_whitelist'] = ['10.250.250.2'];
$config['use_https'] = true;
$config['login_rate_limit'] = 5;
$config['session_lifetime'] = 720;
$config['ip_check'] = false;
$config['x_frame_options'] = 'sameorigin';

$config['timezone'] = 'Asia/Dhaka';
$config['htmleditor'] = 4;
$config['draft_autosave'] = 60;
$config['max_message_size'] = '25M';
$config['show_images'] = 1;
$config['refresh_interval'] = 30;
$config['message_show_email'] = true;
$config['reply_mode'] = 1;
$config['layout'] = 'widescreen';

$config['plugins'] = [
    'archive',
    'zipdownload',
    'markasjunk',
    'newmail_notifier',
    'managesieve',
    'password',
];

// Filters and out-of-office replies (Sieve on the mail server).
$config['managesieve_host'] = 'tls://mail.muvance.com';
$config['managesieve_port'] = 4190;
$config['managesieve_vacation'] = 1;

// Settings > Password: checked and saved by Muvance's API, which writes the mail server's accounts.
$config['password_driver'] = 'httpapi';
$config['password_httpapi_url'] = 'http://api:4000/api/mail/password';
$config['password_httpapi_method'] = 'POST';
$config['password_httpapi_var_user'] = 'user';
$config['password_httpapi_var_curpass'] = 'curpass';
$config['password_httpapi_var_newpass'] = 'newpass';
$config['password_httpapi_expect'] = '/^ok$/i';
$config['password_confirm_current'] = true;
$config['password_minimum_length'] = 10;

// Desktop notifications for new mail, on by default.
$config['newmail_notifier_basic'] = true;
$config['newmail_notifier_desktop'] = true;
