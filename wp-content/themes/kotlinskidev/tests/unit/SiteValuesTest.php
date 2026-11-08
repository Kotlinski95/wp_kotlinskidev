<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/site-values.php';

beforeEach(function () {
    kotlinskidev_get_site_values(true);
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    Functions\when('sanitize_text_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('esc_html')->alias(fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES));
});

function kt_site_values_today(string $today): void
{
    Functions\when('wp_date')->alias(fn ($format) => 'Y' === $format ? substr($today, 0, 4) : $today);
}

function kt_site_values_rows(array $rows): void
{
    Functions\when('get_option')->alias(fn ($name, $default = false) => 'kotlinskidev_enabled_features' === $name ? $default : $rows);
}

it('resolves years_since from a plain year as current year minus that year', function () {
    kt_site_values_today('2026-11-07');

    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => '2020']))->toBe('6');
});

it('resolves years_since from a full date using whole years only', function () {
    kt_site_values_today('2026-11-07');

    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => '2020-03-01']))->toBe('6');
    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => '2020-12-01']))->toBe('5');
});

it('returns null for an invalid years_since source and never goes negative', function () {
    kt_site_values_today('2026-11-07');

    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => 'abc']))->toBeNull();
    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => '2030']))->toBe('0');
    expect(kotlinskidev_site_value_resolve(['type' => 'years_since', 'value' => '2030-01-01']))->toBe('0');
});

it('resolves current_year to the current year', function () {
    kt_site_values_today('2026-11-07');

    expect(kotlinskidev_site_value_resolve(['type' => 'current_year']))->toBe('2026');
});

it('resolves static text per language when Polylang is absent via explicit lang or fallback', function () {
    $row = ['type' => 'static', 'value' => ['en' => 'Hello', 'pl' => 'Czesc']];

    expect(kotlinskidev_site_value_resolve($row, 'pl'))->toBe('Czesc');
    expect(kotlinskidev_site_value_resolve($row, 'de'))->toBe('Hello');
    expect(kotlinskidev_site_value_resolve(['type' => 'static', 'value' => ['en' => '', 'pl' => 'Czesc']], 'en'))->toBe('Czesc');
    expect(kotlinskidev_site_value_resolve(['type' => 'static', 'value' => 'Plain']))->toBe('Plain');
    expect(kotlinskidev_site_value_resolve(['type' => 'static', 'value' => '']))->toBeNull();
});

it('uses pll_current_language for static values when Polylang exists', function () {
    Functions\when('pll_current_language')->justReturn('pl');

    expect(kotlinskidev_site_value_resolve(['type' => 'static', 'value' => ['en' => 'Hello', 'pl' => 'Czesc']]))->toBe('Czesc');
});

it('replaces known tokens and leaves unknown keys untouched', function () {
    kt_site_values_today('2026-11-07');
    kt_site_values_rows([
        ['key' => 'years', 'type' => 'years_since', 'value' => '2020'],
        ['key' => 'tag', 'type' => 'static', 'value' => 'A <b> & B'],
    ]);

    expect(kotlinskidev_replace_site_value_tokens('<p>{token:years}+ years, {token:missing}, {token:tag}</p>'))
        ->toBe('<p>6+ years, {token:missing}, A &lt;b&gt; &amp; B</p>');
});

it('skips parsing entirely when the content has no token marker', function () {
    $reads = [];
    Functions\when('get_option')->alias(function ($name, $default = false) use (&$reads) {
        $reads[] = $name;
        return $default;
    });

    expect(kotlinskidev_replace_site_value_tokens('<p>plain</p>'))->toBe('<p>plain</p>');
    expect($reads)->not->toContain('kotlinskidev_site_values');
});

it('caches rows per request and resets on demand', function () {
    $calls = 0;
    Functions\when('get_option')->alias(function () use (&$calls) {
        $calls++;
        return [['key' => 'a', 'type' => 'current_year']];
    });

    kotlinskidev_get_site_values();
    kotlinskidev_get_site_values();
    expect($calls)->toBe(1);

    kotlinskidev_reset_site_values_cache();
    kotlinskidev_get_site_values();
    expect($calls)->toBe(2);
});

it('sanitizes rows dropping empty or duplicate keys and bad types', function () {
    $clean = kotlinskidev_sanitize_site_values([
        ['key' => 'Years', 'type' => 'years_since', 'source' => '2020-03-01'],
        ['key' => 'years', 'type' => 'current_year'],
        ['key' => '', 'type' => 'current_year'],
        ['key' => 'bad', 'type' => 'script'],
        ['key' => 'badyear', 'type' => 'years_since', 'source' => '2020-13-45'],
        ['key' => 'greet', 'type' => 'static', 'value' => ['en' => ' <i>Hi</i> ', 'PL' => 'Czesc']],
        'junk',
    ]);

    expect($clean)->toBe([
        ['key' => 'years', 'type' => 'years_since', 'value' => '2020-03-01'],
        ['key' => 'badyear', 'type' => 'years_since', 'value' => ''],
        ['key' => 'greet', 'type' => 'static', 'value' => ['en' => 'Hi', 'pl' => 'Czesc']],
    ]);
    expect(kotlinskidev_sanitize_site_values('nope'))->toBe([]);
});

function kt_site_values_with_features(array $enabled, array $rows): void
{
    Functions\when('get_option')->alias(fn ($name, $default = false) => 'kotlinskidev_enabled_features' === $name ? $enabled : $rows);
}

it('leaves tokens literal when the site_values feature is switched off', function () {
    require_once __DIR__ . '/../../functions/feature-toggles.php';
    Functions\when('__')->returnArg(1);
    kt_site_values_today('2026-11-07');
    kt_site_values_with_features(['offers'], [['key' => 'years', 'type' => 'years_since', 'value' => '2020']]);

    expect(kotlinskidev_replace_site_value_tokens('<p>{token:years}+ years</p>'))->toBe('<p>{token:years}+ years</p>');
});

it('replaces tokens when the site_values feature is switched on', function () {
    require_once __DIR__ . '/../../functions/feature-toggles.php';
    Functions\when('__')->returnArg(1);
    kt_site_values_today('2026-11-07');
    kt_site_values_with_features(['site_values'], [['key' => 'years', 'type' => 'years_since', 'value' => '2020']]);

    expect(kotlinskidev_replace_site_value_tokens('<p>{token:years}+ years</p>'))->toBe('<p>6+ years</p>');
});
