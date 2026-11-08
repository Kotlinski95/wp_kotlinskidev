<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/service-locations.php';

if (!class_exists('WP_Query')) {
    class WP_Query
    {
    }
}

function kt_query_double(array $vars, bool $main = true): object
{
    return new class($vars, $main) extends WP_Query {
        public array $set = [];

        public function __construct(private array $vars, private bool $main)
        {
        }

        public function is_main_query(): bool
        {
            return $this->main;
        }

        public function get($key, $default = '')
        {
            return $this->vars[$key] ?? $default;
        }

        public function set($key, $value)
        {
            $this->set[$key] = $value;
        }
    };
}

beforeEach(function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    $GLOBALS['wpdb'] = new class {
        public string $posts = 'wp_posts';
        public string $term_relationships = 'wp_term_relationships';
        public string $term_taxonomy = 'wp_term_taxonomy';
        public string $terms = 'wp_terms';
        public array $lookups = [];

        public function prepare(string $sql, ...$args): string
        {
            $this->lookups[] = $args;

            return $sql;
        }

        public function get_var(string $sql)
        {
            $slug = end($this->lookups)[0] ?? '';
            $lang = end($this->lookups)[1] ?? '';

            return ['gliwice' => ['pl' => '6356', 'en' => '6380']][$slug][$lang] ?? null;
        }
    };
});

it('resolves a shared city slug to the post of the requested language', function () {
    $query = kt_query_double(['service_location' => 'gliwice', 'lang' => 'pl']);

    kotlinskidev_scope_service_location_query_to_language($query);

    expect($query->set)->toBe(['p' => 6356, 'service_location' => '', 'name' => '']);
});

it('resolves the english post for the english language', function () {
    $query = kt_query_double(['service_location' => 'gliwice', 'lang' => 'en']);

    kotlinskidev_scope_service_location_query_to_language($query);

    expect($query->set['p'])->toBe(6380);
});

it('leaves the query untouched without a language, slug, main query or match', function () {
    foreach ([
        kt_query_double(['service_location' => 'gliwice']),
        kt_query_double(['lang' => 'pl']),
        kt_query_double(['service_location' => 'gliwice', 'lang' => 'pl'], false),
        kt_query_double(['service_location' => 'unknown', 'lang' => 'pl']),
    ] as $query) {
        kotlinskidev_scope_service_location_query_to_language($query);
        expect($query->set)->toBe([]);
    }
});

it('leaves the query untouched in the admin', function () {
    Functions\when('is_admin')->justReturn(true);
    $query = kt_query_double(['service_location' => 'gliwice', 'lang' => 'pl']);

    kotlinskidev_scope_service_location_query_to_language($query);

    expect($query->set)->toBe([]);
});

it('keeps the original city slug when only another language uses it', function () {
    Functions\when('pll_get_post_language')->justReturn('en');

    expect(kotlinskidev_keep_service_location_slug_unique_per_language('unknown-2', 1, 'publish', 'service_location', 0, 'unknown'))->toBe('unknown');
});

it('keeps the suffixed slug when the same language already uses the original', function () {
    Functions\when('pll_get_post_language')->justReturn('pl');

    expect(kotlinskidev_keep_service_location_slug_unique_per_language('gliwice-2', 1, 'publish', 'service_location', 0, 'gliwice'))->toBe('gliwice-2');
});

it('keeps the original slug when the post is the one that owns it', function () {
    Functions\when('pll_get_post_language')->justReturn('pl');

    expect(kotlinskidev_keep_service_location_slug_unique_per_language('gliwice-2', 6356, 'publish', 'service_location', 0, 'gliwice'))->toBe('gliwice');
});

it('ignores other post types and unchanged slugs', function () {
    expect(kotlinskidev_keep_service_location_slug_unique_per_language('a-2', 1, 'publish', 'post', 0, 'a'))->toBe('a-2');
    expect(kotlinskidev_keep_service_location_slug_unique_per_language('a', 1, 'publish', 'service_location', 0, 'a'))->toBe('a');
});
