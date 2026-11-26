<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/consent-banner-critical.php';
require_once __DIR__ . '/../../functions/onetap-inline-style.php';

it('minifies inline css', function () {
    $css = "/* c */ .a { color : red; }\n.b { margin: 0 ; }";

    expect(kotlinskidev_minify_inline_css($css))->toBe('.a{color : red}.b{margin: 0}');
});

it('leaves other style links untouched', function () {
    expect(kotlinskidev_drop_cmplz_banner_style_link('<link>', 'other'))->toBe('<link>');
});

it('drops the banner link when the css is inlined', function () {
    $dir = sys_get_temp_dir() . '/kt-cmplz-' . uniqid();
    mkdir($dir);
    file_put_contents($dir . '/banner-1-optin.css', '.cmplz-cookiebanner{display:grid}');

    $styles = new stdClass();
    $styles->registered = [
        'cmplz-banner-1-optin' => (object) ['src' => 'http://x.test/uploads/banner-1-optin.css?ver=1'],
    ];
    Functions\when('wp_styles')->justReturn($styles);
    Functions\when('wp_get_upload_dir')->justReturn(['baseurl' => 'http://x.test/uploads', 'basedir' => $dir]);
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('is_singular')->justReturn(false);
    Functions\when('get_post')->justReturn(null);

    expect(kotlinskidev_cmplz_banner_inline_css())->toBe('.cmplz-cookiebanner{display:grid}');
    expect(kotlinskidev_drop_cmplz_banner_style_link('<link>', 'cmplz-banner-1-optin'))->toBe('');

    unlink($dir . '/banner-1-optin.css');
    rmdir($dir);
});

it('keeps the banner link when the css file is missing', function () {
    $styles = new stdClass();
    $styles->registered = [];
    Functions\when('wp_styles')->justReturn($styles);
    Functions\when('is_singular')->justReturn(false);

    expect(kotlinskidev_drop_cmplz_banner_style_link('<link>', 'cmplz-banner-1-optin'))->toBe('<link>');
});

it('flags pages holding a complianz document shortcode as skip pages', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_post')->justReturn((object) ['post_content' => '[cmplz-document type="cookie-statement"]']);
    Functions\when('has_shortcode')->alias(fn ($content, $tag) => str_contains($content, '[' . $tag));

    expect(kotlinskidev_cmplz_banner_skip_page())->toBeTrue();
});

it('does not flag ordinary pages as skip pages', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_post')->justReturn((object) ['post_content' => '<!-- wp:paragraph --><p>x</p><!-- /wp:paragraph -->']);
    Functions\when('has_shortcode')->justReturn(false);

    expect(kotlinskidev_cmplz_banner_skip_page())->toBeFalse();
});

it('detaches the onetap inline style and prints it in the footer', function () {
    Functions\when('esc_attr')->returnArg();
    $registered = (object) ['extra' => ['after' => ['.onetap{color:red}']]];
    $styles = new stdClass();
    $styles->registered = ['accessibility-onetap' => $registered];
    Functions\when('wp_styles')->justReturn($styles);
    Functions\when('is_admin')->justReturn(false);
    Functions\when('wp_strip_all_tags')->alias(fn ($v) => strip_tags($v));
    Functions\when('wp_get_upload_dir')->justReturn(['error' => 'no uploads']);

    kotlinskidev_detach_onetap_inline_style();

    expect($registered->extra)->not->toHaveKey('after');

    ob_start();
    kotlinskidev_print_onetap_inline_style();
    $out = ob_get_clean();

    expect($out)->toContain('<style id="accessibility-onetap-inline-css">.onetap{color:red}</style>');
    expect($out)->toContain("<script>document.documentElement.classList.add('kt-css-accessibility-onetap-inline')</script>");
});

it('marks the onetap inline stylesheet ready only after the deferred link loads', function () {
    $base = sys_get_temp_dir() . '/kt-onetap-' . uniqid();
    mkdir($base);
    $GLOBALS['kotlinskidev_onetap_inline_css'] = '.onetap{color:red}';
    Functions\when('wp_strip_all_tags')->alias(fn ($v) => strip_tags($v));
    Functions\when('wp_get_upload_dir')->justReturn(['error' => false, 'basedir' => $base, 'baseurl' => 'https://x.test/uploads']);
    Functions\when('trailingslashit')->alias(fn ($v) => rtrim($v, '/') . '/');
    Functions\when('wp_mkdir_p')->alias(fn ($d) => is_dir($d) || mkdir($d, 0777, true));
    Functions\when('set_url_scheme')->returnArg();
    Functions\when('esc_url')->returnArg();
    Functions\when('esc_attr')->returnArg();

    ob_start();
    kotlinskidev_print_onetap_inline_style();
    $out = ob_get_clean();

    expect($out)->toContain("onload=\"this.media='all';document.documentElement.classList.add('kt-css-accessibility-onetap-inline')\"");
    expect($out)->not->toContain('<script>');
});

it('still reveals the onetap widget when there is no inline css to load', function () {
    Functions\when('esc_attr')->returnArg();
    $GLOBALS['kotlinskidev_onetap_inline_css'] = '';

    ob_start();
    kotlinskidev_print_onetap_inline_style();
    $out = ob_get_clean();

    expect($out)->toBe("<script>document.documentElement.classList.add('kt-css-accessibility-onetap-inline')</script>");
});

it('loads the onetap style from a cached uploads file when writable', function () {
    $base = sys_get_temp_dir() . '/kt-onetap-' . uniqid();
    mkdir($base);
    $GLOBALS['kotlinskidev_onetap_inline_css'] = '.onetap{color:red}';
    Functions\when('wp_strip_all_tags')->alias(fn ($v) => strip_tags($v));
    Functions\when('wp_get_upload_dir')->justReturn(['error' => false, 'basedir' => $base, 'baseurl' => 'https://x.test/uploads']);
    Functions\when('trailingslashit')->alias(fn ($v) => rtrim($v, '/') . '/');
    Functions\when('wp_mkdir_p')->alias(fn ($d) => is_dir($d) || mkdir($d, 0777, true));
    Functions\when('set_url_scheme')->returnArg();
    Functions\when('esc_url')->returnArg();
    Functions\when('esc_attr')->returnArg();

    ob_start();
    kotlinskidev_print_onetap_inline_style();
    $out = ob_get_clean();

    expect($out)->toContain('<link rel="stylesheet" id="accessibility-onetap-inline-css" href="https://x.test/uploads/kotlinskidev-cache/onetap-');
    expect($out)->not->toContain('<style');
    expect(glob($base . '/kotlinskidev-cache/onetap-*.css'))->toHaveCount(1);
});

it('prints the parsed marker script on ordinary pages', function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('is_singular')->justReturn(false);

    ob_start();
    kotlinskidev_print_cmplz_banner_parsed_marker();
    $out = ob_get_clean();

    expect($out)->toContain('kt-cmplz-parsed');
});
