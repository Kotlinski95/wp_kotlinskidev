<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/tracking-scripts.php';

beforeEach(function () {
    Functions\when('esc_js')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('is_admin')->justReturn(false);
});

it('outputs nothing for facebook pixel in the admin', function () {
    Functions\when('is_admin')->justReturn(true);
    Functions\when('get_option')->justReturn('123456');

    ob_start();
    kotlinskidev_output_facebook_pixel();

    expect(ob_get_clean())->toBe('');
});

it('outputs the custom facebook pixel script verbatim when configured', function () {
    Functions\when('get_option')->alias(fn ($name) => match ($name) {
        'custom_fb_pixel_loader_custom_script' => '<script>custom-fb</script>',
        default => '',
    });

    ob_start();
    kotlinskidev_output_facebook_pixel();

    expect(ob_get_clean())->toBe('<script>custom-fb</script>');
});

it('outputs nothing for facebook pixel when there is no id and no custom script', function () {
    Functions\when('get_option')->justReturn('');

    ob_start();
    kotlinskidev_output_facebook_pixel();

    expect(ob_get_clean())->toBe('');
});

it('outputs the default facebook pixel snippet when only the pixel id is configured', function () {
    Functions\when('get_option')->alias(fn ($name) => match ($name) {
        'custom_fb_pixel_loader_pixel_id' => '123456',
        default => '',
    });

    ob_start();
    kotlinskidev_output_facebook_pixel();
    $output = ob_get_clean();

    expect($output)->toContain("fbq('init', '123456')");
    expect($output)->toContain('id=123456');
});

it('outputs the custom google analytics script verbatim when configured', function () {
    Functions\when('get_option')->alias(fn ($name) => match ($name) {
        'custom_ga_loader_custom_script' => '<script>custom-ga</script>',
        default => '',
    });

    ob_start();
    kotlinskidev_output_google_analytics();

    expect(ob_get_clean())->toBe('<script>custom-ga</script>');
});

it('outputs nothing for google analytics when there is no id and no custom script', function () {
    Functions\when('get_option')->justReturn('');

    ob_start();
    kotlinskidev_output_google_analytics();

    expect(ob_get_clean())->toBe('');
});

it('outputs the default gtag snippet when only the measurement id is configured', function () {
    Functions\when('get_option')->alias(fn ($name) => match ($name) {
        'custom_ga_loader_ga_id' => 'G-ABC123',
        default => '',
    });

    ob_start();
    kotlinskidev_output_google_analytics();
    $output = ob_get_clean();

    expect($output)->toContain("gtag('config', 'G-ABC123')");
    expect($output)->toContain('gtag/js?id=G-ABC123');
});
