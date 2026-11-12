<?php
const KOTLINSKIDEV_MAIL_ALERT_THROTTLE_SECONDS = 1800;
const KOTLINSKIDEV_MAIL_ALERT_MAX_MESSAGE_LENGTH = 200;
const KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK = 'kotlinskidev_mail_health_check';

function kotlinskidev_sanitize_ntfy_alert_url($value): string
{
    $url = esc_url_raw((string) $value);

    if ('' === $url) {
        return '';
    }

    $parts = wp_parse_url($url);

    if (!is_array($parts) || 'https' !== strtolower((string) ($parts['scheme'] ?? '')) || empty($parts['host'])) {
        return '';
    }

    $allowed_hosts = array_map('strtolower', (array) apply_filters('kotlinskidev_ntfy_allowed_hosts', ['ntfy.sh']));

    if (!in_array(strtolower((string) $parts['host']), $allowed_hosts, true)) {
        return '';
    }

    return $url;
}

function kotlinskidev_get_ntfy_alert_url(): string
{
    return kotlinskidev_sanitize_ntfy_alert_url(get_option('kotlinskidev_ntfy_alert_url', ''));
}

function kotlinskidev_mail_alert_clean_message(string $message): string
{
    $message = wp_strip_all_tags($message);
    $message = preg_replace('/[^\s<>"\']+@[^\s<>"\']+/', '[redacted]', $message) ?? '';
    $message = trim((string) preg_replace('/\s+/', ' ', $message));

    return mb_substr($message, 0, KOTLINSKIDEV_MAIL_ALERT_MAX_MESSAGE_LENGTH);
}

function kotlinskidev_mail_alert_site_host(): string
{
    return (string) wp_parse_url(home_url(), PHP_URL_HOST);
}

function kotlinskidev_mail_alert_claim_slot(string $signature): int
{
    $lock_key  = KOTLINSKIDEV_CACHE_PREFIX . 'mail_alert_lock_' . $signature;
    $count_key = KOTLINSKIDEV_CACHE_PREFIX . 'mail_alert_suppressed_' . $signature;

    if (false !== get_transient($lock_key)) {
        set_transient($count_key, (int) get_transient($count_key) + 1, DAY_IN_SECONDS);

        return -1;
    }

    set_transient($lock_key, 1, KOTLINSKIDEV_MAIL_ALERT_THROTTLE_SECONDS);
    $suppressed = (int) get_transient($count_key);
    delete_transient($count_key);

    return $suppressed;
}

function kotlinskidev_send_mail_failure_alert(string $error_message): bool
{
    $url = kotlinskidev_get_ntfy_alert_url();

    if ('' === $url) {
        return false;
    }

    $message    = kotlinskidev_mail_alert_clean_message($error_message);
    $suppressed = kotlinskidev_mail_alert_claim_slot(md5($message));

    if ($suppressed < 0) {
        return false;
    }

    $host = kotlinskidev_mail_alert_site_host();
    $body = $host . ' - ' . gmdate('Y-m-d H:i:s') . ' UTC' . "\n" . $message;

    if ($suppressed > 0) {
        $body .= "\n" . sprintf('%d similar alerts suppressed since the last one.', $suppressed);
    }

    wp_remote_post(
        $url,
        [
            'timeout'  => 3,
            'blocking' => false,
            'headers'  => [
                'Title'    => 'Mail failure on ' . $host,
                'Priority' => '4',
                'Tags'     => 'warning,email',
            ],
            'body'     => $body,
        ]
    );

    return true;
}

function kotlinskidev_handle_wp_mail_failed($error): void
{
    $message = $error instanceof WP_Error ? $error->get_error_message() : '';

    kotlinskidev_send_mail_failure_alert('' !== $message ? $message : 'Unknown mail error');
}
add_action('wp_mail_failed', 'kotlinskidev_handle_wp_mail_failed');

function kotlinskidev_alert_contact_mail_failure(): void
{
    if (did_action('wp_mail_failed') > 0) {
        return;
    }

    kotlinskidev_send_mail_failure_alert('wp_mail returned false while sending a contact form notification');
}

function kotlinskidev_sync_mail_health_check_schedule(): void
{
    $next = wp_next_scheduled(KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK);

    if ('' === kotlinskidev_get_ntfy_alert_url()) {
        if (false !== $next) {
            wp_clear_scheduled_hook(KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK);
        }

        return;
    }

    if (false === $next) {
        wp_schedule_event(time(), 'weekly', KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK);
    }
}
add_action('init', 'kotlinskidev_sync_mail_health_check_schedule');

function kotlinskidev_run_mail_health_check(): void
{
    if ('' === kotlinskidev_get_ntfy_alert_url()) {
        return;
    }

    wp_mail(
        get_option('admin_email'),
        '[kotlinskidev] Weekly mail check',
        'Automatic weekly check that outgoing mail still works. No action needed.'
    );
}
add_action(KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK, 'kotlinskidev_run_mail_health_check');
