<?php
function kotlinskidev_contact_attachment_rate_limit_key(): string
{
    $address = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';

    return 'kotlinskidev_attach_rl_' . hash('sha256', $address . wp_salt('nonce'));
}

function kotlinskidev_contact_attachment_register_attempt(): bool
{
    $key   = kotlinskidev_contact_attachment_rate_limit_key();
    $state = get_transient($key);
    $now   = time();

    if (!is_array($state) || !isset($state['count'], $state['started']) || $now - (int) $state['started'] >= KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_WINDOW) {
        $state = ['count' => 0, 'started' => $now];
    }

    if ((int) $state['count'] >= KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_MAX) {
        return false;
    }

    $state['count'] = (int) $state['count'] + 1;
    $remaining      = max(1, KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_WINDOW - ($now - (int) $state['started']));
    set_transient($key, $state, $remaining);

    return true;
}
