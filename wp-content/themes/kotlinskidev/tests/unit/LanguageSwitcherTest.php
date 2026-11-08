<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/language-switcher.php';

beforeEach(function () {
    Functions\when('get_template_directory_uri')->justReturn('https://example.test/wp-content/themes/kotlinskidev');
    Functions\when('home_url')->alias(fn ($path = '/') => 'https://example.test' . $path);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
});

it('marks the english option active and links to /pl/ for polish when the locale is english', function () {
    Functions\when('get_locale')->justReturn('en_US');

    $output = render_language_switcher_shortcode();

    expect($output)->toContain('<img src="https://example.test/wp-content/themes/kotlinskidev/assets/images/flags/Flag_of_the_United_States.webp"');
    expect($output)->toMatch('/<li><a href="https:\/\/example\.test\/" class="active">/');
    expect($output)->toContain('<li><a href="https://example.test/pl/" class="">');
});

it('marks the polish option active when the locale is polish', function () {
    Functions\when('get_locale')->justReturn('pl_PL');

    $output = render_language_switcher_shortcode();

    expect($output)->toContain('<li><a href="https://example.test/pl/" class="active">');
    expect($output)->toContain('<li><a href="https://example.test/" class="">');
});

it('renders both language names and flag alt text', function () {
    Functions\when('get_locale')->justReturn('en_US');

    $output = render_language_switcher_shortcode();

    expect($output)->toContain('alt="English"');
    expect($output)->toContain('alt="Polish"');
    expect($output)->toContain('>English<');
    expect($output)->toContain('>Polish<');
});
