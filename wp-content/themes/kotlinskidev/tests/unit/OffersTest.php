<?php

use Brain\Monkey\Functions;

if (!defined('WEEK_IN_SECONDS')) {
    define('WEEK_IN_SECONDS', 604800);
}

if (!function_exists('has_filter')) {
    function has_filter(...$args)
    {
        return false;
    }
}

require_once __DIR__ . '/../../functions/polylang-content-resolution.php';
require_once __DIR__ . '/../../functions/offers.php';

function kt_offers_fixture(string $currency = 'EUR', bool $placeholder = false): array
{
    return [
        'website' => [
            'name' => 'Website',
            'currency' => $currency,
            'is_placeholder' => $placeholder,
            'variants' => [
                'landing' => [
                    'key' => 'landing',
                    'label' => 'Landing page',
                    'price_from' => 250,
                    'price_to' => null,
                    'price_period' => 'once',
                    'duration_min' => 5,
                    'duration_max' => 10,
                    'duration_unit' => 'days',
                    'included' => 'Design',
                ],
                'range' => [
                    'key' => 'range',
                    'label' => 'Range',
                    'price_from' => 250,
                    'price_to' => 400,
                    'price_period' => 'once',
                    'duration_min' => 48,
                    'duration_max' => 48,
                    'duration_unit' => 'hours',
                ],
                'monthly' => [
                    'key' => 'monthly',
                    'label' => 'Monthly',
                    'price_from' => 290,
                    'price_to' => 290,
                    'price_period' => 'month',
                    'duration_min' => 1,
                    'duration_max' => 3,
                    'duration_unit' => 'weeks',
                ],
                'quote' => [
                    'key' => 'quote',
                    'label' => 'Quote',
                ],
            ],
        ],
    ];
}

beforeEach(function () {
    Functions\stubTranslationFunctions();
    Functions\stubEscapeFunctions();
    Functions\when('sanitize_key')->alias(fn($key) => preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key)));
    Functions\when('trailingslashit')->alias(fn($value) => rtrim($value, '/') . '/');
    kotlinskidev_offer_memo(null, null, true);
    Functions\when('number_format_i18n')->alias(fn($n, $d = 0) => number_format($n, $d, '.', ''));
    Functions\when('pll_current_language')->justReturn('en');
    Functions\when('pll_languages_list')->justReturn(['pl', 'en']);
    Functions\when('apply_filters')->alias(fn($tag, $value) => $value);
});

function kt_offers_use_map(array $map): void
{
    Functions\when('get_transient')->justReturn($map);
}

it('formats EUR prices with prefix symbol and from', function () {
    $offer = kt_offers_fixture()['website']['variants'];

    expect(kotlinskidev_offer_format($offer['landing'], 'price', 'EUR'))->toBe('from €250')
        ->and(kotlinskidev_offer_format($offer['range'], 'price', 'EUR'))->toBe('€250–€400');
});

it('formats PLN prices with suffix and month period', function () {
    $offer = kt_offers_fixture('PLN')['website']['variants'];

    expect(kotlinskidev_offer_format($offer['landing'], 'price', 'PLN'))->toBe('from 250 zł')
        ->and(kotlinskidev_offer_format($offer['range'], 'price', 'PLN'))->toBe('250–400 zł')
        ->and(kotlinskidev_offer_format($offer['monthly'], 'price', 'PLN'))->toBe('290 zł / month');
});

it('formats duration ranges and unit plurals', function () {
    $offer = kt_offers_fixture()['website']['variants'];

    expect(kotlinskidev_offer_format($offer['landing'], 'duration', 'EUR'))->toBe('5–10 days')
        ->and(kotlinskidev_offer_format($offer['range'], 'duration', 'EUR'))->toBe('48 hours')
        ->and(kotlinskidev_offer_format($offer['monthly'], 'duration', 'EUR'))->toBe('1–3 weeks')
        ->and(kotlinskidev_offer_format(['duration_min' => 1, 'duration_max' => 1, 'duration_unit' => 'weeks'], 'duration', 'EUR'))->toBe('1 week');
});

it('falls back when price or duration is missing and returns empty for text fields', function () {
    $quote = kt_offers_fixture()['website']['variants']['quote'];

    expect(kotlinskidev_offer_format($quote, 'price', 'EUR'))->toBe('Price on request')
        ->and(kotlinskidev_offer_format($quote, 'duration', 'EUR'))->toBe('Timeline agreed individually')
        ->and(kotlinskidev_offer_format($quote, 'included', 'EUR'))->toBe('')
        ->and(kotlinskidev_offer_format(['label' => 'X'], 'label', 'EUR'))->toBe('X');
});

it('resolves missing offer variant and field to fallback text', function () {
    kt_offers_use_map(kt_offers_fixture());

    expect(kotlinskidev_offer_resolve('nope', 'landing', 'price', 'en'))->toBe(['value' => 'Price on request', 'placeholder' => false, 'missing' => true])
        ->and(kotlinskidev_offer_resolve('website', 'nope', 'duration', 'en')['value'])->toBe('Timeline agreed individually')
        ->and(kotlinskidev_offer_resolve('website', 'landing', 'bogus', 'en')['missing'])->toBeTrue();
});

it('replaces offer span text and is idempotent', function () {
    kt_offers_use_map(kt_offers_fixture());
    $html = '<p>Cost <span class="kt-offer" data-kt-offer="website" data-kt-variant="landing" data-kt-field="price">old</span> end</p>';

    $once = kotlinskidev_offer_replace_spans($html, 'en', false);
    $twice = kotlinskidev_offer_replace_spans($once, 'en', false);

    expect($once)->toContain('>from €250</span>')->and($twice)->toBe($once);
});

it('ignores spans that are not offer spans', function () {
    kt_offers_use_map(kt_offers_fixture());
    $html = '<p><span class="other" data-kt-offer="website" data-kt-variant="landing" data-kt-field="price">keep</span><span class="x">plain</span></p>';

    expect(kotlinskidev_offer_replace_spans($html, 'en', false))->toBe($html);
});

it('hides placeholder values from logged-out visitors', function () {
    kt_offers_use_map(kt_offers_fixture('EUR', true));
    $html = '<span class="kt-offer" data-kt-offer="website" data-kt-variant="landing" data-kt-field="price">x</span>';

    expect(kotlinskidev_offer_replace_spans($html, 'en', false))->toContain('>Price on request</span>')
        ->and(kotlinskidev_offer_replace_spans($html, 'en', false))->not->toContain('kt-offer--placeholder');
});

it('shows placeholder values with a marker class to editors', function () {
    kt_offers_use_map(kt_offers_fixture('EUR', true));
    $html = '<span class="kt-offer" data-kt-offer="website" data-kt-variant="landing" data-kt-field="price">x</span>';

    $out = kotlinskidev_offer_replace_spans($html, 'en', true);

    expect($out)->toContain('kt-offer--placeholder')->toContain('>from €250</span>');
});

it('marks unresolved spans for editors only', function () {
    kt_offers_use_map(kt_offers_fixture());
    $html = '<span class="kt-offer" data-kt-offer="gone" data-kt-variant="a" data-kt-field="price">x</span>';

    expect(kotlinskidev_offer_replace_spans($html, 'en', true))->toContain('kt-offer--missing')
        ->and(kotlinskidev_offer_replace_spans($html, 'en', false))->not->toContain('kt-offer--missing')
        ->and(kotlinskidev_offer_replace_spans($html, 'en', false))->toContain('>Price on request</span>');
});

it('skips render_block work for content without offer markup', function () {
    expect(kotlinskidev_offer_render_block('<p>hi</p>', ['blockName' => 'core/paragraph']))->toBe('<p>hi</p>');
});

it('returns null from the resolver when the language has no offer', function () {
    kt_offers_use_map([]);

    expect(kotlinskidev_offer_get('website', 'pl'))->toBeNull();
});

it('flushes the transient of every language on save', function () {
    $deleted = [];
    Functions\when('delete_transient')->alias(function ($name) use (&$deleted) {
        $deleted[] = $name;
        return true;
    });

    kotlinskidev_offer_flush_on_save();

    expect($deleted)->toBe(['kotlinskidev_offers_pl', 'kotlinskidev_offers_en']);
});

it('flushes on deletion only for kt_offer posts', function () {
    $deleted = [];
    Functions\when('delete_transient')->alias(function ($name) use (&$deleted) {
        $deleted[] = $name;
        return true;
    });
    Functions\when('get_post_type')->alias(fn($id) => 5 === $id ? 'kt_offer' : 'post');

    kotlinskidev_offer_flush_on_post_removal(9);
    expect($deleted)->toBe([]);

    kotlinskidev_offer_flush_on_post_removal(5);
    expect($deleted)->toHaveCount(2);
});

it('builds schema for non-priced-placeholder offers only', function () {
    $html = '<span class="kt-offer" data-kt-offer="website" data-kt-variant="range" data-kt-field="price">x</span>';

    kt_offers_use_map(kt_offers_fixture('EUR', false));
    $pieces = kotlinskidev_offer_schema_pieces($html, 'en', 'https://example.test');
    expect($pieces)->toHaveCount(1)
        ->and($pieces[0]['offers'])->toMatchArray(['priceCurrency' => 'EUR', 'lowPrice' => 250, 'highPrice' => 400]);

    kotlinskidev_offer_memo(null, null, true);
    kt_offers_use_map(kt_offers_fixture('EUR', true));
    expect(kotlinskidev_offer_schema_pieces($html, 'en', 'https://example.test'))->toBe([]);
});

it('copies only offer_key between translations', function () {
    expect(kotlinskidev_offer_copy_post_metas(['variants', 'currency', 'is_placeholder', 'foo']))->toBe(['foo', 'offer_key']);
});

it('registers kt_offer as a translatable post type', function () {
    expect(kotlinskidev_pll_register_offers(['post' => 'post'], false))->toBe(['post' => 'post', 'kt_offer' => 'kt_offer']);
});
