<?php

use Brain\Monkey\Functions;

const KT_CF_TEST_TOKEN = 'aaaaaaaabbbbbbbbccccccccdddddddd';

require_once __DIR__ . '/../../functions/cloudflare-beacon.php';

function kt_cf_beacon_context(string $stored_token = KT_CF_TEST_TOKEN, bool $admin = false): void
{
    Functions\when('get_option')->justReturn($stored_token);
    Functions\when('is_admin')->justReturn($admin);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('is_customize_preview')->justReturn(false);
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    Functions\when('wp_json_encode')->alias(fn ($v) => json_encode($v));
}

it('reads the token from the settings option', function () {
    kt_cf_beacon_context();

    expect(kotlinskidev_cf_beacon_token())->toBe(KT_CF_TEST_TOKEN);
});

it('sanitizes the stored token to 32 lowercase hex characters', function () {
    expect(kotlinskidev_sanitize_cf_beacon_token('  ' . strtoupper(KT_CF_TEST_TOKEN) . ' '))->toBe(KT_CF_TEST_TOKEN);
    expect(kotlinskidev_sanitize_cf_beacon_token('not-a-token'))->toBe('');
    expect(kotlinskidev_sanitize_cf_beacon_token('<script>'))->toBe('');
    expect(kotlinskidev_sanitize_cf_beacon_token(null))->toBe('');
});

it('has no token when the option is empty or malformed', function () {
    kt_cf_beacon_context('');
    expect(kotlinskidev_cf_beacon_token())->toBe('');

    kt_cf_beacon_context('not-a-token');
    expect(kotlinskidev_cf_beacon_token())->toBe('');
});

it('lets the kotlinskidev_cf_beacon_token filter override the build value', function () {
    kt_cf_beacon_context('');
    Functions\when('apply_filters')->alias(
        fn ($hook, $value) => 'kotlinskidev_cf_beacon_token' === $hook ? 'abcdefabcdefabcdefabcdefabcdefab' : $value
    );

    expect(kotlinskidev_cf_beacon_token())->toBe('abcdefabcdefabcdefabcdefabcdefab');
});

it('loads the beacon only after interaction or a post-load delay', function () {
    kt_cf_beacon_context();

    $script = kotlinskidev_cf_beacon_script();

    expect($script)->toContain('static.cloudflareinsights.com/beacon.min.js');
    expect($script)->toContain('s.type="module"');
    expect($script)->not->toContain('spa');
    expect($script)->toContain(KT_CF_TEST_TOKEN);
    expect($script)->toContain('setTimeout(load,6000)');
    expect($script)->toContain('pointerdown');
    expect($script)->toContain('script[data-cf-beacon]');
});

it('prints the loader in the footer on the front end', function () {
    kt_cf_beacon_context();

    ob_start();
    kotlinskidev_print_cf_beacon_loader();
    $out = ob_get_clean();

    expect($out)->toStartWith('<script id="kt-cf-beacon-loader">');
});

it('prints nothing without a token, e.g. local builds', function () {
    kt_cf_beacon_context('');

    ob_start();
    kotlinskidev_print_cf_beacon_loader();

    expect(ob_get_clean())->toBe('');
});

it('prints nothing in admin', function () {
    kt_cf_beacon_context(KT_CF_TEST_TOKEN, true);

    ob_start();
    kotlinskidev_print_cf_beacon_loader();

    expect(ob_get_clean())->toBe('');
});
