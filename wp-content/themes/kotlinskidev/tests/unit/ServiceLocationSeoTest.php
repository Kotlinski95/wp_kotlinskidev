<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/polylang-content-resolution.php';
require_once __DIR__ . '/../../functions/service-location-local-content.php';
require_once __DIR__ . '/../../functions/service-location-seo.php';
require_once __DIR__ . '/../../functions/service-location-add-city.php';

function kt_city_meta(array $meta): void
{
    Functions\when('get_post_meta')->alias(fn ($id, $key = '', $single = false) => $meta[$id][$key] ?? '');
}

beforeEach(function () {
    Functions\when('pll_get_post_language')->justReturn('');
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    Functions\when('sanitize_text_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('sanitize_textarea_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('sanitize_title')->alias(fn ($v) => trim(strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', (string) $v)), '-'));
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('esc_html')->alias(fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES));
    Functions\when('__')->returnArg(1);
    Functions\when('wp_slash')->returnArg(1);
});

it('is ready only with an intro plus two distinct supporting fields', function () {
    expect(kotlinskidev_service_location_is_ready([]))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro']))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_audience' => 'SMEs', 'local_distance' => '30 min']))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => '  ', 'local_audience' => 'SMEs', 'local_distance' => '30 min']))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'local_audience' => 'SMEs']))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'featured_projects' => [5]]))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'local_faq' => [], 'featured_projects' => []]))->toBeFalse();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'local_audience' => 'SMEs', 'local_distance' => '30 min']))->toBeTrue();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'local_distance' => '30 min', 'featured_projects' => [5]]))->toBeTrue();
    expect(kotlinskidev_service_location_is_ready(['local_intro' => 'Intro', 'local_faq' => [['question' => 'Q', 'answer' => 'A']], 'featured_projects' => [5]]))->toBeTrue();
});

it('sanitizes the local faq to at most two complete pairs', function () {
    $result = kotlinskidev_sanitize_local_faq([
        ['question' => 'Q1 <b>x</b>', 'answer' => 'A1'],
        ['question' => 'Half', 'answer' => ''],
        'junk',
        ['question' => 'Q2', 'answer' => 'A2'],
        ['question' => 'Q3', 'answer' => 'A3'],
    ]);

    expect($result)->toBe([
        ['question' => 'Q1 x', 'answer' => 'A1'],
        ['question' => 'Q2', 'answer' => 'A2'],
    ]);
    expect(kotlinskidev_sanitize_local_faq('nope'))->toBe([]);
});

it('sanitizes featured projects to three unique positive ids', function () {
    expect(kotlinskidev_sanitize_featured_projects([4, '4', 0, -7, 9, 11, 12]))->toBe([4, 7, 9]);
    expect(kotlinskidev_sanitize_featured_projects('x'))->toBe([]);
});

it('falls back to intro for an unknown local section', function () {
    expect(kotlinskidev_sanitize_city_local_section('faq'))->toBe('faq');
    expect(kotlinskidev_sanitize_city_local_section('nearby'))->toBe('nearby');
    expect(kotlinskidev_sanitize_city_local_section('<x>'))->toBe('intro');
});

it('adds noindex follow to a published city that is not ready', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(10);
    Functions\when('get_post_status')->justReturn('publish');
    kt_city_meta([10 => ['local_intro' => 'Only intro']]);

    $robots = kotlinskidev_service_location_filter_robots(['index' => true, 'max-image-preview' => 'large']);

    expect($robots)->toHaveKey('noindex', true);
    expect($robots)->toHaveKey('follow', true);
    expect($robots)->not->toHaveKey('index');
    expect($robots['max-image-preview'])->toBe('large');
});

it('leaves robots untouched for a ready city, a draft, or other post types', function () {
    $robots = ['index' => true];
    Functions\when('get_queried_object_id')->justReturn(10);

    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_post_status')->justReturn('publish');
    kt_city_meta([10 => ['local_intro' => 'Intro', 'local_distance' => '30 min', 'local_audience' => 'SMEs']]);
    expect(kotlinskidev_service_location_filter_robots($robots))->toBe($robots);

    Functions\when('get_post_status')->justReturn('draft');
    kt_city_meta([10 => []]);
    expect(kotlinskidev_service_location_filter_robots($robots))->toBe($robots);

    Functions\when('is_singular')->justReturn(false);
    expect(kotlinskidev_service_location_filter_robots($robots))->toBe($robots);
});

it('overrides the yoast robots string only for a published city that is not ready', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(10);
    Functions\when('get_post_status')->justReturn('publish');
    kt_city_meta([10 => []]);

    expect(kotlinskidev_service_location_filter_yoast_robots('index, follow'))->toBe('noindex, follow');

    kt_city_meta([10 => ['local_intro' => 'I', 'local_audience' => 'A', 'local_distance' => 'D']]);
    expect(kotlinskidev_service_location_filter_yoast_robots('index, follow'))->toBe('index, follow');
});

it('excludes only published cities that are not ready from the sitemap', function () {
    kotlinskidev_service_location_thin_published_ids(true);
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_posts')->justReturn([1, 2, 3]);
    Functions\when('get_post_status')->justReturn('publish');
    kt_city_meta([
        1 => ['local_intro' => 'I', 'local_audience' => 'A', 'local_distance' => 'D'],
        2 => [],
        3 => ['local_intro' => 'only'],
    ]);

    expect(kotlinskidev_service_location_exclude_from_sitemap([99]))->toBe([99, 2, 3]);
    expect(kotlinskidev_service_location_exclude_from_sitemap(null))->toBe([2, 3]);
});

it('renders nothing when the local fields are empty', function () {
    kt_city_meta([10 => []]);

    expect(kotlinskidev_render_city_local_content(10, 'intro'))->toBe('');
    expect(kotlinskidev_render_city_local_content(10, 'faq'))->toBe('');
    expect(kotlinskidev_render_city_local_content(0, 'intro'))->toBe('');
});

it('renders and escapes the local intro, audience and distance', function () {
    kt_city_meta([10 => [
        'local_intro' => 'Hello <script>alert(1)</script> & co',
        'local_audience' => 'Agencies',
        'local_distance' => '30 min "away"',
    ]]);

    $html = kotlinskidev_render_city_local_content(10, 'intro');

    expect($html)->toContain('<p class="kt-city-local__intro">Hello &lt;script&gt;alert(1)&lt;/script&gt; &amp; co</p>');
    expect($html)->toContain('<dd class="kt-city-local__fact-value">Agencies</dd>');
    expect($html)->toContain('30 min &quot;away&quot;');
    expect($html)->not->toContain('<script>');
});

it('renders only the filled facts', function () {
    kt_city_meta([10 => ['local_audience' => 'Agencies']]);

    $html = kotlinskidev_render_city_local_content(10, 'intro');

    expect($html)->toContain('Agencies');
    expect($html)->not->toContain('Distance and meetings');
    expect($html)->not->toContain('kt-city-local__intro');
});

it('renders the local faq as escaped core details blocks matching the shared faq', function () {
    Functions\when('do_blocks')->returnArg();
    kt_city_meta([10 => ['local_faq' => [['question' => 'Do you meet in <b>Katowice</b>?', 'answer' => 'Yes & remote']]]]);

    $html = kotlinskidev_render_city_local_content(10, 'faq');

    expect($html)->toContain('<!-- wp:details {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}}} -->');
    expect($html)->toContain('<details class="wp-block-details" style="font-size:1.125rem;font-weight:600"><summary>Do you meet in Katowice?</summary>');
    expect($html)->toContain('<p class="has-foreground-color has-text-color">Yes &amp; remote</p>');
});

it('renders nothing for an empty local faq', function () {
    Functions\when('do_blocks')->returnArg();
    kt_city_meta([10 => ['local_faq' => []]]);

    expect(kotlinskidev_render_city_local_content(10, 'faq'))->toBe('');
});

it('hides project cards not chosen for the city and keeps them when none are chosen', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(10);
    Functions\when('pll_get_post')->alias(fn ($id) => $id);
    $block = ['blockName' => 'kotlinskidev/project-card', 'attrs' => ['cardId' => 6430]];

    kt_city_meta([10 => ['featured_projects' => [6429, 6431]]]);
    expect(kotlinskidev_filter_service_location_project_cards('<card/>', $block))->toBe('');
    expect(kotlinskidev_filter_service_location_project_cards('<card/>', ['blockName' => 'kotlinskidev/project-card', 'attrs' => ['cardId' => 6431]]))->toBe('<card/>');

    kt_city_meta([10 => []]);
    expect(kotlinskidev_filter_service_location_project_cards('<card/>', $block))->toBe('<card/>');
});

it('adds area served, description and language to the schema only when ready', function () {
    kt_city_meta([10 => ['local_intro' => 'Intro text', 'local_audience' => 'SMEs', 'local_distance' => '30 min', 'city' => 'Katowice']]);
    Functions\when('get_locale')->justReturn('en_US');

    $schema = kotlinskidev_service_location_filter_schema(['@type' => 'ProfessionalService'], 10);

    expect($schema['description'])->toBe('Intro text');
    expect($schema['inLanguage'])->toBe('en');
    expect($schema['areaServed'])->toBe([
        '@type' => 'City',
        'name' => 'Katowice',
        'address' => ['@type' => 'PostalAddress', 'addressCountry' => 'PL'],
    ]);

    kt_city_meta([11 => ['city' => 'Rybnik']]);
    expect(kotlinskidev_service_location_filter_schema(['@type' => 'ProfessionalService'], 11))->toBe([]);
});

it('labels readiness in the list table column', function () {
    expect(kotlinskidev_service_location_column_label(true))->toBe('Ready');
    expect(kotlinskidev_service_location_column_label(false))->toBe('Needs content');
});

it('refuses an empty city name', function () {
    expect(kotlinskidev_add_city_pages('   ')['error'])->toBe('empty_city');
});

it('refuses a duplicate city in every language', function () {
    Functions\when('pll_set_post_language')->justReturn(true);
    Functions\when('get_posts')->justReturn([77]);
    Functions\expect('wp_insert_post')->never();

    $result = kotlinskidev_add_city_pages('Katowice');

    expect($result['error'])->toBe('duplicate');
    expect($result['created'])->toBe([]);
    expect($result['existing'])->toBe(['en' => 77, 'pl' => 77]);
});

it('creates linked en and pl drafts with titles slug and city meta', function () {
    Functions\when('get_posts')->justReturn([]);
    $inserted = [];
    $ids = ['en' => 101, 'pl' => 102];
    Functions\when('wp_insert_post')->alias(function ($args) use (&$inserted, $ids) {
        $inserted[] = $args;
        return $ids[count($inserted) === 1 ? 'en' : 'pl'];
    });
    Functions\when('is_wp_error')->justReturn(false);
    $languages = [];
    Functions\when('pll_set_post_language')->alias(function ($id, $lang) use (&$languages) {
        $languages[$id] = $lang;
    });
    $linked = null;
    Functions\when('pll_save_post_translations')->alias(function ($t) use (&$linked) {
        $linked = $t;
    });

    $result = kotlinskidev_add_city_pages('Ruda Śląska');

    expect($result['error'])->toBe('');
    expect($result['created'])->toBe(['en' => 101, 'pl' => 102]);
    expect($inserted[0]['post_title'])->toBe('Website Development – Ruda Śląska');
    expect($inserted[1]['post_title'])->toBe('Tworzenie stron internetowych – Ruda Śląska');
    expect($inserted[0]['post_status'])->toBe('draft');
    expect($inserted[0]['post_type'])->toBe('service_location');
    expect($inserted[0]['meta_input'])->toBe(['city' => 'Ruda Śląska']);
    expect($languages)->toBe([101 => 'en', 102 => 'pl']);
    expect($linked)->toBe(['en' => 101, 'pl' => 102]);
});

it('caches thin ids in memory and the transient until flushed', function () {
    kotlinskidev_service_location_thin_published_ids(true);
    $stored = null;
    $calls = 0;
    Functions\when('get_transient')->alias(fn () => false);
    Functions\when('set_transient')->alias(function ($key, $value) use (&$stored) {
        $stored = $value;
        return true;
    });
    Functions\when('get_posts')->alias(function () use (&$calls) {
        $calls++;
        return [2];
    });
    Functions\when('get_post_status')->justReturn('publish');
    kt_city_meta([2 => []]);

    expect(kotlinskidev_service_location_thin_published_ids())->toBe([2]);
    expect(kotlinskidev_service_location_thin_published_ids())->toBe([2]);
    expect($calls)->toBe(1);
    expect($stored)->toBe([2]);

    $deleted = [];
    Functions\when('delete_transient')->alias(function ($key) use (&$deleted) {
        $deleted[] = $key;
        return true;
    });
    kotlinskidev_service_location_flush_thin_ids_cache();
    expect($deleted)->toBe(['kotlinskidev_service_location_thin_ids']);

    kotlinskidev_service_location_thin_published_ids();
    expect($calls)->toBe(2);
});

it('reads thin ids from the transient when present', function () {
    kotlinskidev_service_location_thin_published_ids(true);
    Functions\when('get_transient')->justReturn(['5', 6]);
    Functions\expect('get_posts')->never();

    expect(kotlinskidev_service_location_thin_published_ids())->toBe([5, 6]);
    kotlinskidev_service_location_thin_published_ids(true);
});

it('flushes the thin ids cache for city posts and status changes only', function () {
    $deleted = 0;
    Functions\when('delete_transient')->alias(function () use (&$deleted) {
        $deleted++;
        return true;
    });
    Functions\when('get_post_type')->alias(fn ($id) => $id === 1 ? 'service_location' : 'post');

    kotlinskidev_service_location_flush_on_post(2);
    expect($deleted)->toBe(0);
    kotlinskidev_service_location_flush_on_post(1);
    expect($deleted)->toBe(1);
    kotlinskidev_service_location_flush_on_meta(9, 1);
    expect($deleted)->toBe(2);

    kotlinskidev_service_location_flush_on_transition('publish', 'publish', (object) ['post_type' => 'service_location']);
    expect($deleted)->toBe(2);
    kotlinskidev_service_location_flush_on_transition('publish', 'draft', (object) ['post_type' => 'post']);
    expect($deleted)->toBe(2);
    kotlinskidev_service_location_flush_on_transition('publish', 'draft', (object) ['post_type' => 'service_location']);
    expect($deleted)->toBe(3);
});

it('builds a meta description from the local intro at a word boundary', function () {
    Functions\when('wp_strip_all_tags')->alias(fn ($v) => strip_tags((string) $v));
    $long = str_repeat('word ', 60);
    kt_city_meta([10 => ['local_intro' => '<b>Short</b>  intro'], 11 => ['local_intro' => $long], 12 => []]);

    expect(kotlinskidev_service_location_meta_description(10))->toBe('Short intro');
    expect(kotlinskidev_service_location_meta_description(12))->toBe('');

    $description = kotlinskidev_service_location_meta_description(11);
    expect(mb_strlen($description))->toBeLessThanOrEqual(156);
    expect($description)->toEndWith('word…');
});

it('fills the description only for a city page when yoast has none', function () {
    Functions\when('wp_strip_all_tags')->alias(fn ($v) => strip_tags((string) $v));
    Functions\when('get_queried_object_id')->justReturn(10);
    kt_city_meta([10 => ['local_intro' => 'Local intro']]);

    Functions\when('is_singular')->justReturn(true);
    expect(kotlinskidev_service_location_filter_description(''))->toBe('Local intro');
    expect(kotlinskidev_service_location_filter_description('Yoast text'))->toBe('Yoast text');

    Functions\when('is_singular')->justReturn(false);
    expect(kotlinskidev_service_location_filter_description(''))->toBe('');
});

it('requires edit_others_posts for the add city page', function () {
    expect(file_get_contents(__DIR__ . '/../../functions/service-location-add-city.php'))
        ->not->toContain("'edit_posts'")
        ->toContain("'edit_others_posts'");
});
