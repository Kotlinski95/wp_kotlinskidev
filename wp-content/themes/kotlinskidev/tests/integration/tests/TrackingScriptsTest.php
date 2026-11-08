<?php

uses(Tests\Integration\TestCase::class);

afterEach(function () {
    delete_option('custom_fb_pixel_loader_custom_script');
    delete_option('custom_fb_pixel_loader_pixel_id');
    delete_option('custom_ga_loader_custom_script');
    delete_option('custom_ga_loader_ga_id');
});

it('outputs nothing for the facebook pixel when no id or custom script is configured', function () {
    ob_start();
    kotlinskidev_output_facebook_pixel();
    $html = ob_get_clean();

    expect($html)->toBe('');
});

it('outputs the facebook pixel init script for a configured pixel id', function () {
    update_option('custom_fb_pixel_loader_pixel_id', '123456789');

    ob_start();
    kotlinskidev_output_facebook_pixel();
    $html = ob_get_clean();

    expect($html)->toContain("fbq('init', '123456789')");
});

it('gates the default facebook pixel script behind the marketing consent category', function () {
    update_option('custom_fb_pixel_loader_pixel_id', '123456789');

    ob_start();
    kotlinskidev_output_facebook_pixel();
    $html = ob_get_clean();

    expect($html)->toContain('type="text/plain" data-category="marketing"');
    expect($html)->not->toContain('<script>');
});

it('escapes a facebook pixel id containing a quote in the js context', function () {
    update_option('custom_fb_pixel_loader_pixel_id', "123');alert(1);('");

    ob_start();
    kotlinskidev_output_facebook_pixel();
    $html = ob_get_clean();

    expect($html)->not->toContain("');alert(1);('");
});

it('outputs a custom facebook pixel script verbatim instead of the default snippet', function () {
    update_option('custom_fb_pixel_loader_pixel_id', '123456789');
    update_option('custom_fb_pixel_loader_custom_script', '<script>console.log("custom fb")</script>');

    ob_start();
    kotlinskidev_output_facebook_pixel();
    $html = ob_get_clean();

    expect($html)->toBe('<script>console.log("custom fb")</script>');
});

it('outputs nothing for google analytics when no id or custom script is configured', function () {
    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toBe('');
});

it('outputs the gtag script for a configured GA id', function () {
    update_option('custom_ga_loader_ga_id', 'G-ABC123');

    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toContain('gtag/js?id=G-ABC123');
    expect($html)->toContain("gtag('config', 'G-ABC123')");
});

it('loads gtag.js unconditionally with Consent Mode v2 default-denied signals', function () {
    update_option('custom_ga_loader_ga_id', 'G-ABC123');

    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toContain('<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>');
    expect($html)->not->toContain('type="text/plain"');
    expect($html)->not->toContain('data-category="statistics"');
    expect($html)->toContain("gtag('consent', 'default', {");
    expect($html)->toContain("'analytics_storage': 'denied'");
});

it('updates gtag consent live from cmplz_fire_categories, mapping statistics/marketing independently', function () {
    update_option('custom_ga_loader_ga_id', 'G-ABC123');

    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toContain("document.addEventListener('cmplz_fire_categories'");
    expect($html)->toContain("categories.indexOf('statistics') !== -1");
    expect($html)->toContain("categories.indexOf('marketing') !== -1");
    expect($html)->toContain("document.addEventListener('cmplz_revoke'");
});

it('outputs a custom GA script verbatim instead of the default snippet', function () {
    update_option('custom_ga_loader_ga_id', 'G-ABC123');
    update_option('custom_ga_loader_custom_script', '<script>console.log("custom ga")</script>');

    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toBe('<script>console.log("custom ga")</script>');
});

it('outputs nothing on the admin screen even with an id configured', function () {
    update_option('custom_ga_loader_ga_id', 'G-ABC123');
    set_current_screen('edit-post');

    ob_start();
    kotlinskidev_output_google_analytics();
    $html = ob_get_clean();

    expect($html)->toBe('');

    set_current_screen('front');
});
