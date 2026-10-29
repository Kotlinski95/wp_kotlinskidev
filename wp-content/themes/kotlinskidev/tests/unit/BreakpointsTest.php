<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/breakpoints.php';

it('converts pixels to a trimmed rem value', function () {
    expect(kotlinskidev_breakpoint_px_to_rem(781))->toBe('48.8125rem');
    expect(kotlinskidev_breakpoint_px_to_rem(1024))->toBe('64rem');
    expect(kotlinskidev_breakpoint_px_to_rem(8))->toBe('0.5rem');
    expect(kotlinskidev_breakpoint_px_to_rem(0))->toBe('0rem');
});

it('detects a known breakpoint token in css', function () {
    expect(kotlinskidev_css_has_breakpoint_tokens('@media (max-width: 48.875rem) { .a {} }'))->toBeTrue();
});

it('returns false when no breakpoint token is present', function () {
    expect(kotlinskidev_css_has_breakpoint_tokens('.a { color: red; }'))->toBeFalse();
});

it('builds the upload-based cache dir path and url', function () {
    Functions\when('wp_get_upload_dir')->justReturn([
        'basedir' => '/var/www/uploads',
        'baseurl' => 'https://site.test/uploads',
    ]);
    Functions\when('trailingslashit')->alias(fn ($s) => rtrim($s, '/\\') . '/');

    $cache = kotlinskidev_breakpoint_css_cache_dir();

    expect($cache)->toBe([
        'path' => '/var/www/uploads/kotlinskidev-css',
        'url'  => 'https://site.test/uploads/kotlinskidev-css',
    ]);
});

function kotlinskidev_run_breakpoints_subprocess(array $optionOverrides): array
{
    $file = __DIR__ . '/../../functions/breakpoints.php';
    $overridesExport = var_export($optionOverrides, true);

    $script = <<<PHP
<?php
function add_filter(...\$args) { return true; }
function add_action(...\$args) { return true; }
function get_option(\$name, \$default = null) {
    \$overrides = {$overridesExport};
    return \$overrides[\$name] ?? \$default;
}
require '{$file}';
echo json_encode([
    'breakpoints' => kotlinskidev_get_breakpoints(),
    'is_default' => kotlinskidev_breakpoints_are_default(),
    'hash' => kotlinskidev_breakpoints_hash(),
    'css_breakpoints' => kotlinskidev_get_css_breakpoints(),
    'unchanged_css' => kotlinskidev_transform_breakpoint_css('@media (max-width: 48.8125rem) { .a { color: red; } }'),
    'token_css' => kotlinskidev_transform_breakpoint_css('@media (max-width: 48.8125rem) { .a { color: red; } } .b::before { content: "48.8125rem"; }'),
    'scoped_css' => kotlinskidev_build_scoped_responsive_css('.my-block', [
        'width' => ['desktop' => '100%', 'mobile' => '50%'],
        'color' => ['desktop' => 'red'],
    ]),
]);
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_bp_');
    file_put_contents($tmpFile, $script);
    $output = shell_exec('php ' . escapeshellarg($tmpFile));
    unlink($tmpFile);

    return json_decode($output, true);
}

it('returns the default breakpoints, derived values, hash, css queries, and leaves default-scoped css unchanged', function () {
    $result = kotlinskidev_run_breakpoints_subprocess([]);

    expect($result['breakpoints'])->toBe([
        'mobile_max'  => 781,
        'tablet_max'  => 1023,
        'tablet_min'  => 782,
        'desktop_min' => 1024,
        'large'       => 1200,
    ]);
    expect($result['is_default'])->toBeTrue();
    expect($result['hash'])->toBe(substr(md5('781-1023-1200'), 0, 8));
    expect($result['css_breakpoints'])->toBe([
        'mobile'  => '@media (max-width: 781px)',
        'tablet'  => '@media (min-width: 782px) and (max-width: 1023px)',
        'desktop' => '@media (min-width: 1024px)',
        'large'   => '@media (min-width: 1200px)',
    ]);
    expect($result['unchanged_css'])->toBe('@media (max-width: 48.8125rem) { .a { color: red; } }');
    expect($result['scoped_css'])->toBe(
        '@media (min-width: 1024px){.my-block{width:100%;color:red;}}'
        . '@media (max-width: 781px){.my-block{width:50%;}}'
    );
});

it('clamps tablet_max and large upward when misconfigured, and flags as non-default', function () {
    $result = kotlinskidev_run_breakpoints_subprocess([
        'kotlinskidev_breakpoint_mobile_max' => 800,
        'kotlinskidev_breakpoint_tablet_max' => 500,
        'kotlinskidev_breakpoint_large' => 700,
    ]);

    expect($result['breakpoints'])->toBe([
        'mobile_max'  => 800,
        'tablet_max'  => 801,
        'tablet_min'  => 801,
        'desktop_min' => 802,
        'large'       => 802,
    ]);
    expect($result['is_default'])->toBeFalse();
});

it('rewrites known breakpoint tokens only inside @media preludes, leaving other occurrences untouched', function () {
    $result = kotlinskidev_run_breakpoints_subprocess([
        'kotlinskidev_breakpoint_mobile_max' => 900,
    ]);

    expect($result['token_css'])->toContain('@media (max-width: 56.25rem)');
    expect($result['token_css'])->toContain('content: "48.8125rem"');
});
