<?php

uses(Tests\Integration\TestCase::class);

it('adds Referrer-Policy, Permissions-Policy, and a CSP-Report-Only header on a normal frontend request', function () {
    $headers = apply_filters('wp_headers', []);

    expect($headers['Referrer-Policy'])->toBe('strict-origin-when-cross-origin');
    expect($headers['Permissions-Policy'])->toContain('camera=()');
    expect($headers['Content-Security-Policy-Report-Only'])->toContain("default-src 'self'");
});

it('scopes the CSP to this site\'s real third-party inventory, not a generic policy', function () {
    $headers = apply_filters('wp_headers', []);
    $csp = $headers['Content-Security-Policy-Report-Only'];

    expect($csp)->toContain('maps.googleapis.com');
    expect($csp)->toContain('connect.facebook.net');
    expect($csp)->toContain('www.googletagmanager.com');
    expect($csp)->toContain("frame-ancestors 'none'");
});

it('does not overwrite headers already present in the array', function () {
    $headers = apply_filters('wp_headers', ['X-Existing' => 'kept']);

    expect($headers['X-Existing'])->toBe('kept');
    expect($headers)->toHaveKey('Referrer-Policy');
});

it('sends a per-site configured Referrer-Policy, falling back to a known-safe value for an invalid stored option', function () {
    update_option('kotlinskidev_referrer_policy', 'no-referrer');
    expect(apply_filters('wp_headers', [])['Referrer-Policy'])->toBe('no-referrer');

    update_option('kotlinskidev_referrer_policy', 'not-a-real-policy');
    expect(apply_filters('wp_headers', [])['Referrer-Policy'])->toBe('strict-origin-when-cross-origin');

    delete_option('kotlinskidev_referrer_policy');
});

it('sends a per-site configured Permissions-Policy, and omits the header entirely once explicitly cleared', function () {
    update_option('kotlinskidev_permissions_policy', 'geolocation=(self)');
    expect(apply_filters('wp_headers', [])['Permissions-Policy'])->toBe('geolocation=(self)');

    update_option('kotlinskidev_permissions_policy', '');
    expect(apply_filters('wp_headers', []))->not->toHaveKey('Permissions-Policy');

    delete_option('kotlinskidev_permissions_policy');
    expect(apply_filters('wp_headers', [])['Permissions-Policy'])->toContain('camera=()');
});
