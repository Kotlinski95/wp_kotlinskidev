<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_transient_row_exists(string $transient): bool
{
    global $wpdb;

    return (bool) $wpdb->get_var($wpdb->prepare(
        "SELECT option_id FROM {$wpdb->options} WHERE option_name = %s",
        '_transient_' . $transient
    ));
}

it('deletes every theme-prefixed and img_size transient via kotlinskidev_flush_all_transients', function () {
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'flush_test', 'x', HOUR_IN_SECONDS);
    set_transient('img_size_abc123', 'x', HOUR_IN_SECONDS);
    set_transient('unrelated_transient', 'x', HOUR_IN_SECONDS);

    kotlinskidev_flush_all_transients();

    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'flush_test'))->toBeFalse();
    expect(get_transient('img_size_abc123'))->toBeFalse();
    expect(get_transient('unrelated_transient'))->toBe('x');
});

it('only deletes critical_ prefixed transients via kotlinskidev_flush_build_transients', function () {
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_123', 'x', HOUR_IN_SECONDS);
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'svg_456', 'keep-me', HOUR_IN_SECONDS);

    kotlinskidev_flush_build_transients();

    expect(kotlinskidev_transient_row_exists(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_123'))->toBeFalse();
    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'svg_456'))->toBe('keep-me');
});

it('purges stale build transients and stores a fresh fingerprint on the first run', function () {
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_stale', 'stale', HOUR_IN_SECONDS);

    kotlinskidev_maybe_purge_on_new_build();

    expect(kotlinskidev_transient_row_exists(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_stale'))->toBeFalse();
    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'build_fingerprint'))->toBe(kotlinskidev_build_fingerprint());
});

it('does nothing on a second run once the fingerprint is already current', function () {
    kotlinskidev_maybe_purge_on_new_build();
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_fresh', 'fresh', HOUR_IN_SECONDS);

    kotlinskidev_maybe_purge_on_new_build();

    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'critical_css_fresh'))->toBe('fresh');
});

it('renders the cache stats table without clearing anything when there is no POST', function () {
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'stats_entry', 'value', HOUR_IN_SECONDS);

    ob_start();
    kotlinskidev_cache_admin_page();
    $html = ob_get_clean();

    expect($html)->not->toContain('cleared successfully');
    expect($html)->toContain('Cached entries currently stored in the database');
    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'stats_entry'))->toBe('value');
});

it('clears all theme transients from the admin page once the nonce is verified', function () {
    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'admin_flush_entry', 'value', HOUR_IN_SECONDS);

    $nonce = wp_create_nonce('kotlinskidev_clear_cache_action');
    $_POST['kotlinskidev_clear_cache'] = '1';
    $_POST['_wpnonce'] = $nonce;
    $_REQUEST['kotlinskidev_clear_cache'] = '1';
    $_REQUEST['_wpnonce'] = $nonce;

    ob_start();
    kotlinskidev_cache_admin_page();
    $html = ob_get_clean();

    expect($html)->toContain('Theme cache cleared successfully.');
    expect(get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'admin_flush_entry'))->toBeFalse();

    unset($_POST['kotlinskidev_clear_cache'], $_POST['_wpnonce'], $_REQUEST['kotlinskidev_clear_cache'], $_REQUEST['_wpnonce']);
});
