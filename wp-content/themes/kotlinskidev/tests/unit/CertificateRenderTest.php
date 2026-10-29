<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/certificate.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('esc_html__')->returnArg(1);
    Functions\when('esc_html')->alias('htmlspecialchars');
    Functions\when('esc_url')->returnArg(1);
    Functions\when('esc_attr')->returnArg(1);
});

function kotlinskidevTestCertificate(array $overrides = []): array
{
    return array_merge([
        'name' => 'Test Certificate',
        'issuer' => 'Test Issuer',
        'issued_label' => 'Issued Jan 2025',
        'description' => 'A description.',
        'credential_id' => '',
        'link_url' => 'https://www.credly.com/badges/test',
        'image_url' => 'https://example.com/badge.png',
    ], $overrides);
}

it('never nests an anchor inside another anchor in the badge grid layout', function () {
    $html = kotlinskidev_render_certificate_badge_grid([kotlinskidevTestCertificate()]);

    expect(substr_count($html, '<a '))->toBe(1);
    expect($html)->not->toContain('<a class="wp-block-group kt-link-card');
});

it('renders the badge grid card as a plain div when a verify link is present', function () {
    $html = kotlinskidev_render_certificate_badge_grid([kotlinskidevTestCertificate()]);

    expect($html)->toContain('<div class="wp-block-group kt-link-card');
    expect($html)->toContain('>Verify</a>');
});

it('omits the verify link in the badge grid when no link url is set', function () {
    $html = kotlinskidev_render_certificate_badge_grid([kotlinskidevTestCertificate(['link_url' => ''])]);

    expect($html)->not->toContain('Verify');
});

it('omits the leading separator in the badge grid when there is no issued label', function () {
    $html = kotlinskidev_render_certificate_badge_grid([kotlinskidevTestCertificate(['issued_label' => ''])]);

    expect($html)->not->toContain(' · ');
    expect($html)->toContain('>Verify</a>');
});

it('opens the badge grid verify link in a new tab', function () {
    $html = kotlinskidev_render_certificate_badge_grid([kotlinskidevTestCertificate()]);

    expect($html)->toContain('target="_blank" rel="noopener"');
});

it('renders a single credential ID line in the feature-cards layout only when set', function () {
    $withId = kotlinskidev_render_certificate_feature_cards([kotlinskidevTestCertificate(['credential_id' => 'ABC-123'])]);
    $withoutId = kotlinskidev_render_certificate_feature_cards([kotlinskidevTestCertificate()]);

    expect($withId)->toContain('ABC-123');
    expect($withoutId)->not->toContain('Credential ID');
});

it('hides the compact-strip "all credentials" link when no view-all url is set', function () {
    $html = kotlinskidev_render_certificate_compact_strip([kotlinskidevTestCertificate()], '');

    expect($html)->not->toContain('All credentials');
});

it('shows the compact-strip "all credentials" link when a view-all url is set', function () {
    $html = kotlinskidev_render_certificate_compact_strip([kotlinskidevTestCertificate()], 'https://example.com/certificates');

    expect($html)->toContain('All credentials');
    expect($html)->toContain('https://example.com/certificates');
});

it('does not add a color style when secondaryTextColor/accentColor are empty (badge-grid layout)', function () {
    $html = kotlinskidev_render_certificate_badge_card(kotlinskidevTestCertificate());

    expect($html)->not->toContain('!important');
});

it('applies secondaryTextColor and accentColor via inline !important styles (badge-grid layout)', function () {
    $html = kotlinskidev_render_certificate_badge_card(
        kotlinskidevTestCertificate(),
        '',
        '#112233',
        '#445566'
    );

    expect(substr_count($html, 'style="color:#112233 !important;--kt-underline-color:#112233;"'))->toBe(2);
    expect($html)->toContain('style="color:#445566 !important;--kt-underline-color:#445566;"');
});

it('sets --kt-underline-color on the verify link so its sliding-underline bar follows the forced accentColor (badge-grid layout)', function () {
    $html = kotlinskidev_render_certificate_badge_card(
        kotlinskidevTestCertificate(),
        '',
        '',
        '#445566'
    );

    expect($html)->toContain('<a class="kt-certificate__verify-link has-primary-color has-text-color" style="color:#445566 !important;--kt-underline-color:#445566;"');
});

it('does not add a color override when secondaryTextColor/accentColor are empty (feature-cards layout)', function () {
    $html = kotlinskidev_render_certificate_feature_card(kotlinskidevTestCertificate(['credential_id' => 'ABC-123']));

    expect($html)->not->toContain('!important');
});

it('applies secondaryTextColor and accentColor via inline !important styles (feature-cards layout)', function () {
    $html = kotlinskidev_render_certificate_feature_card(
        kotlinskidevTestCertificate(['credential_id' => 'ABC-123']),
        '',
        '#112233',
        '#445566'
    );

    expect(substr_count($html, 'color:#112233 !important;'))->toBe(3);
    expect(substr_count($html, 'color:#445566 !important;'))->toBe(3);
    expect($html)->toContain('style="color:#445566 !important;--kt-underline-color:#445566;"');
});

it('sets --kt-underline-color on the verify link so its sliding-underline bar follows the forced accentColor (feature-cards layout)', function () {
    $html = kotlinskidev_render_certificate_feature_card(
        kotlinskidevTestCertificate(),
        '',
        '',
        '#445566'
    );

    expect($html)->toContain('<a class="kt-certificate__verify-link has-primary-color has-text-color" style="color:#445566 !important;--kt-underline-color:#445566;"');
});
