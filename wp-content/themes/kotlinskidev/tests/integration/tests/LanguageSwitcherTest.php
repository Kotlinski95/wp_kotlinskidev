<?php

uses(Tests\Integration\TestCase::class);

it('is registered as the language_switcher shortcode', function () {
    expect(shortcode_exists('language_switcher'))->toBeTrue();
});

it('renders a link to each of the two supported locales', function () {
    $html = do_shortcode('[language_switcher]');

    expect($html)->toContain('href="' . home_url('/') . '"');
    expect($html)->toContain('href="' . home_url('/pl/') . '"');
});

it('marks the link matching the current locale as active (en_US in this environment)', function () {
    $html = do_shortcode('[language_switcher]');

    expect($html)->toMatch('/<a href="' . preg_quote(home_url('/'), '/') . '" class="active">/');
    expect($html)->not->toMatch('/<a href="' . preg_quote(home_url('/pl/'), '/') . '" class="active">/');
});

it('renders a flag image and label for each language', function () {
    $html = do_shortcode('[language_switcher]');

    expect($html)->toContain('class="language-flag"');
    expect($html)->toContain('English');
    expect($html)->toContain('Polish');
});
