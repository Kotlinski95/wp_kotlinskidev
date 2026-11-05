<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/service-locations.php';

beforeEach(function () {
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_attr__')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('get_the_ID')->justReturn(7);
});

it('renders nothing when the post has no city meta', function () {
    Functions\when('get_post_meta')->justReturn('');

    expect(kotlinskidev_render_city_map_block())->toBe('');
});

it('renders the map iframe and an expand button carrying the same embed url', function () {
    Functions\when('get_post_meta')->justReturn('Katowice');

    $html = kotlinskidev_render_city_map_block();

    expect($html)->toContain('class="kt-city-map"');
    expect($html)->toContain('class="kt-city-map__frame"');
    expect($html)->toContain('https://www.google.com/maps?q=Katowice%2C%20Poland&output=embed');
    expect($html)->toContain('data-city-map-expand');
    expect($html)->toContain('data-city-map-src="https://www.google.com/maps?q=Katowice%2C%20Poland&output=embed"');
    expect($html)->toContain('title="Map of Katowice"');
});
