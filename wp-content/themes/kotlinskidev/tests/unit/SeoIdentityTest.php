<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/seo-identity.php';

beforeEach(function () {
    kotlinskidev_get_seo_identity(true);
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    Functions\when('sanitize_title')->alias(fn ($v) => trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $v)), '-'));
    Functions\when('sanitize_text_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('sanitize_textarea_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('esc_url_raw')->alias(fn ($v) => preg_match('#^(https?|javascript|ftp):#i', (string) $v) ? (string) $v : '');
    Functions\when('pll_current_language')->justReturn('');
    Functions\when('wp_parse_url')->alias(fn ($url, $component = -1) => parse_url((string) $url, $component));
});

function kt_identity_options(array $options): void
{
    Functions\when('get_option')->alias(fn ($name, $default = false) => $options[$name] ?? $default);
}

it('keeps defaults equal to the previously hardcoded schema values', function () {
    $d = kotlinskidev_seo_identity_defaults();

    expect($d['org_name'])->toBe('Kotlinskidev');
    expect($d['org_alternate_names'])->toBe(['Kotlinskidev Web Development']);
    expect($d['website_name'])->toBe('Kotlinskidev');
    expect($d['website_alternate_names'])->toBe(['Kotlinskidev Web Development']);
    expect($d['person_name'])->toBe('Adrian Kotliński');
    expect($d['job_title'])->toBe(['pl' => 'Programista frontend (Senior)', 'en' => 'Senior Frontend Developer']);
    expect($d['address_locality'])->toBe('Katowice');
    expect($d['address_region'])->toBe('');
    expect($d['address_country'])->toBe('PL');
    expect($d['area_served'])->toBe('Poland');
    expect($d['contact_type'])->toBe('customer service');
    expect($d['contact_languages'])->toBe(['pl', 'en']);
    expect($d['contact_page_slug'])->toBe('kontakt');
    expect($d['about_page_slug'])->toBe('o-mnie');
    expect($d['expose_contact'])->toBeFalse();
    expect($d['logo_id'])->toBe(0);
    expect($d['person_image_id'])->toBe(0);
    expect($d['knows_about'])->toHaveCount(7);
    expect($d['knows_about'][0])->toBe('Web development');
    expect($d['social_profiles'])->toHaveCount(6);
    expect($d['social_profiles'][0])->toBe('https://www.linkedin.com/in/adriankotlinski/');
    expect($d['social_profiles'][5])->toBe('https://www.facebook.com/adrian.kotlinski.9/');
    expect(kotlinskidev_seo_identity_translatable_keys())->toBe(['description', 'job_title']);
});

it('accepts newline strings for lists and drops empties and duplicates', function () {
    $clean = kotlinskidev_sanitize_seo_identity(['knows_about' => "A\n\n B \nA\r\nC"]);

    expect($clean['knows_about'])->toBe(['A', 'B', 'C']);
});

it('drops non-http social urls and duplicates', function () {
    $clean = kotlinskidev_sanitize_seo_identity([
        'social_profiles' => "javascript:alert(1)\nhttps://github.com/x\nftp://example.com\nhttps://github.com/x\nhttp://a.test/",
    ]);

    expect($clean['social_profiles'])->toBe(['https://github.com/x', 'http://a.test/']);
});

it('normalises the country code', function () {
    expect(kotlinskidev_sanitize_seo_identity(['address_country' => 'de'])['address_country'])->toBe('DE');
    expect(kotlinskidev_sanitize_seo_identity(['address_country' => 'Poland'])['address_country'])->toBe('PL');
    expect(kotlinskidev_sanitize_seo_identity([])['address_country'])->toBe('PL');
});

it('sanitizes language map keys and values', function () {
    $clean = kotlinskidev_sanitize_seo_identity(['description' => ['PL!' => '<b>Opis</b>', '' => 'x', 'en' => 'Desc']]);

    expect($clean['description'])->toBe(['pl' => 'Opis', 'en' => 'Desc']);
});

it('falls back to defaults for empty required names and drops unknown keys', function () {
    $clean = kotlinskidev_sanitize_seo_identity(['org_name' => '  ', 'person_name' => '', 'website_name' => '', 'evil' => 'x']);

    expect($clean['org_name'])->toBe('Kotlinskidev');
    expect($clean['person_name'])->toBe('Adrian Kotliński');
    expect($clean['website_name'])->toBe('Kotlinskidev');
    expect($clean)->not->toHaveKey('evil');
    expect(array_keys($clean))->toBe(array_keys(kotlinskidev_seo_identity_defaults()));
});

it('treats a missing expose_contact as false and casts ids with absint', function () {
    $clean = kotlinskidev_sanitize_seo_identity(['logo_id' => '-7', 'person_image_id' => '12']);

    expect($clean['expose_contact'])->toBeFalse();
    expect($clean['logo_id'])->toBe(7);
    expect($clean['person_image_id'])->toBe(12);
    expect(kotlinskidev_sanitize_seo_identity(['expose_contact' => '1'])['expose_contact'])->toBeTrue();
    expect(kotlinskidev_sanitize_seo_identity(['expose_contact' => '0'])['expose_contact'])->toBeFalse();
});

it('sanitizes page slugs and contact languages', function () {
    $clean = kotlinskidev_sanitize_seo_identity(['contact_page_slug' => 'Contact Us', 'about_page_slug' => '', 'contact_languages' => "PL\nen\npl"]);

    expect($clean['contact_page_slug'])->toBe('contact-us');
    expect($clean['about_page_slug'])->toBe('o-mnie');
    expect($clean['contact_languages'])->toBe(['pl', 'en']);
});

it('merges stored values over defaults', function () {
    kt_identity_options(['kotlinskidev_seo_identity' => ['org_name' => 'Acme', 'logo_id' => 5]]);

    $identity = kotlinskidev_get_seo_identity();

    expect($identity['org_name'])->toBe('Acme');
    expect($identity['person_name'])->toBe('Adrian Kotliński');
    expect($identity['logo_id'])->toBe(5);
});

it('falls back to the legacy logo option when no logo_id is stored', function () {
    kt_identity_options(['kotlinskidev_schema_logo_id' => '42']);

    expect(kotlinskidev_get_seo_identity()['logo_id'])->toBe(42);
});

it('lets a stored logo_id of zero beat the legacy option', function () {
    kt_identity_options(['kotlinskidev_seo_identity' => ['logo_id' => 0], 'kotlinskidev_schema_logo_id' => 42]);

    expect(kotlinskidev_get_seo_identity()['logo_id'])->toBe(0);
});

it('clears the per-request cache on reset', function () {
    kt_identity_options(['kotlinskidev_seo_identity' => ['org_name' => 'First']]);
    expect(kotlinskidev_get_seo_identity()['org_name'])->toBe('First');

    kt_identity_options(['kotlinskidev_seo_identity' => ['org_name' => 'Second']]);
    expect(kotlinskidev_get_seo_identity()['org_name'])->toBe('First');

    kotlinskidev_get_seo_identity(true);
    expect(kotlinskidev_get_seo_identity()['org_name'])->toBe('Second');
});

it('resolves language maps by exact language, then en, then first non-empty', function () {
    $identity = ['description' => ['de' => 'Beschreibung', 'en' => 'Desc'], 'job_title' => ['pl' => '', 'fr' => 'Dev']];

    expect(kotlinskidev_seo_identity_resolve($identity, 'de')['description'])->toBe('Beschreibung');
    expect(kotlinskidev_seo_identity_resolve($identity, 'pl')['description'])->toBe('Desc');
    expect(kotlinskidev_seo_identity_resolve($identity, 'pl')['job_title'])->toBe('Dev');
    expect(kotlinskidev_seo_identity_resolve(['description' => [], 'job_title' => []], 'en')['description'])->toBe('');
});

it('exposes values through the accessor with an explicit language', function () {
    kt_identity_options([]);
    Functions\when('get_locale')->justReturn('en_US');

    expect(kotlinskidev_seo_identity('job_title', 'pl'))->toBe('Programista frontend (Senior)');
    expect(kotlinskidev_seo_identity('job_title', 'en'))->toBe('Senior Frontend Developer');
    expect(kotlinskidev_seo_identity('org_name'))->toBe('Kotlinskidev');
    expect(kotlinskidev_seo_identity('missing'))->toBeNull();
});

it('uses the Polylang language, else the locale, when no language is given', function () {
    kt_identity_options([]);
    Functions\when('get_locale')->justReturn('pl_PL');

    expect(kotlinskidev_seo_identity_language())->toBe('pl');
    expect(kotlinskidev_seo_identity('job_title'))->toBe('Programista frontend (Senior)');

    Functions\when('pll_current_language')->justReturn('en');
    expect(kotlinskidev_seo_identity_language())->toBe('en');
    expect(kotlinskidev_seo_identity('job_title'))->toBe('Senior Frontend Developer');
});

function kt_yoast_options(array $titles, array $social = [], array $own = []): void
{
    kotlinskidev_get_seo_identity(true);
    kt_identity_options(array_filter([
        'wpseo_titles' => $titles,
        'wpseo_social' => $social,
        'kotlinskidev_seo_identity' => $own,
    ], fn ($v) => [] !== $v));
    Functions\when('apply_filters')->alias(fn ($tag, $value) => $value);
    Functions\when('get_locale')->justReturn('en_US');
}

it('overrides organization name, alternate names and logo from Yoast company settings', function () {
    kt_yoast_options([
        'company_or_person' => 'company',
        'company_name' => 'Yoast Co',
        'company_alternate_name' => 'Yoast Alt',
        'company_logo_id' => '77',
        'person_logo_id' => '88',
    ]);

    $overrides = kotlinskidev_seo_identity_external_overrides();

    expect($overrides['org_name'])->toBe(['value' => 'Yoast Co', 'source' => 'Yoast SEO']);
    expect($overrides['org_alternate_names']['value'])->toBe(['Yoast Alt']);
    expect($overrides['logo_id']['value'])->toBe(77);
    expect($overrides)->not->toHaveKey('person_image_id');
    expect(kotlinskidev_seo_identity('org_name'))->toBe('Yoast Co');
    expect(kotlinskidev_get_effective_seo_identity()['logo_id'])->toBe(77);
});

it('uses person fields and ignores company fields in person mode', function () {
    Functions\when('get_userdata')->alias(fn ($id) => 5 === $id ? (object) ['display_name' => 'Jane Yoast'] : false);
    kt_yoast_options([
        'company_or_person' => 'person',
        'company_or_person_user_id' => '5',
        'company_name' => 'Ignored Co',
        'company_logo_id' => '77',
        'person_logo_id' => '88',
    ]);

    $overrides = kotlinskidev_seo_identity_external_overrides();

    expect($overrides['person_name']['value'])->toBe('Jane Yoast');
    expect($overrides['person_image_id']['value'])->toBe(88);
    expect($overrides)->not->toHaveKey('org_name');
    expect($overrides)->not->toHaveKey('logo_id');
});

it('falls back to our values when the Yoast value is empty', function () {
    kt_yoast_options(['company_or_person' => 'company', 'company_name' => '', 'company_logo_id' => '0', 'website_name' => ''], [], ['org_name' => 'Ours']);

    expect(kotlinskidev_seo_identity_external_overrides())->toBe([]);
    expect(kotlinskidev_seo_identity('org_name'))->toBe('Ours');
});

it('overrides website name and alternate names from Yoast', function () {
    kt_yoast_options(['website_name' => 'Yoast Site', 'alternate_website_name' => 'Yoast Web']);

    $overrides = kotlinskidev_seo_identity_external_overrides();

    expect($overrides['website_name']['value'])->toBe('Yoast Site');
    expect($overrides['website_alternate_names']['value'])->toBe(['Yoast Web']);
});

it('merges social profiles Yoast first, converts handles, and dedupes', function () {
    kt_yoast_options([], [
        'facebook_site' => 'https://www.facebook.com/yoast',
        'twitter_site' => '@yoasthandle',
        'instagram_url' => 'https://github.com/Kotlinski95',
        'other_social_urls' => ['https://other.test/a', 'javascript:alert(1)'],
    ], ['social_profiles' => ['https://github.com/Kotlinski95', 'https://own.test/']]);

    $profiles = kotlinskidev_seo_identity_external_overrides()['social_profiles']['value'];

    expect($profiles)->toBe([
        'https://www.facebook.com/yoast',
        'https://x.com/yoasthandle',
        'https://github.com/Kotlinski95',
        'https://other.test/a',
        'https://own.test/',
    ]);
});

it('keeps a twitter value that is already a url', function () {
    $urls = kotlinskidev_seo_identity_yoast_social_urls(['twitter_site' => 'https://x.com/already']);

    expect($urls)->toBe(['https://x.com/already']);
});

it('returns no overrides when Yoast is inactive', function () {
    kotlinskidev_get_seo_identity(true);
    kt_identity_options([]);
    Functions\when('get_locale')->justReturn('en_US');
    Functions\when('apply_filters')->alias(fn ($tag, $value) => $value);

    expect(kotlinskidev_seo_identity_external_overrides())->toBe([]);
    expect(kotlinskidev_seo_identity('org_name'))->toBe('Kotlinskidev');
});

it('lets other plugins add overrides through the filter', function () {
    kotlinskidev_get_seo_identity(true);
    kt_identity_options([]);
    Functions\when('get_locale')->justReturn('en_US');
    Functions\when('apply_filters')->alias(
        fn ($tag, $value) => 'kotlinskidev_seo_identity_external_overrides' === $tag
            ? $value + ['org_name' => ['value' => 'Rank Math Co', 'source' => 'Rank Math']]
            : $value
    );

    expect(kotlinskidev_seo_identity_external_overrides()['org_name']['source'])->toBe('Rank Math');
    expect(kotlinskidev_seo_identity('org_name'))->toBe('Rank Math Co');
});

it('never lets overrides leak into the stored identity or the sanitizer', function () {
    kt_yoast_options(['company_or_person' => 'company', 'company_name' => 'Yoast Co'], ['twitter_site' => 'yoast'], ['org_name' => 'Ours']);

    expect(kotlinskidev_get_seo_identity()['org_name'])->toBe('Ours');
    expect(kotlinskidev_get_seo_identity()['social_profiles'])->not->toContain('https://x.com/yoast');
    expect(kotlinskidev_sanitize_seo_identity(['org_name' => ''])['org_name'])->toBe('Kotlinskidev');
});
