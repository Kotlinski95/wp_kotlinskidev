<?php

uses(Tests\Integration\TestCase::class);

it('clamps city grid columns between one and six', function () {
    expect(kotlinskidev_clamp_city_grid_columns(0))->toBe(1);
    expect(kotlinskidev_clamp_city_grid_columns('4'))->toBe(4);
    expect(kotlinskidev_clamp_city_grid_columns(99))->toBe(6);
});

it('accepts only px, rem or em dimensions for the city grid', function () {
    expect(kotlinskidev_sanitize_city_grid_dimension(' 2rem ', '1px'))->toBe('2rem');
    expect(kotlinskidev_sanitize_city_grid_dimension('-0.5em', '1px'))->toBe('-0.5em');
    expect(kotlinskidev_sanitize_city_grid_dimension('10%', '1px'))->toBe('1px');
    expect(kotlinskidev_sanitize_city_grid_dimension('', '1px'))->toBe('1px');
});

it('builds the default city grid style variables', function () {
    expect(kotlinskidev_build_city_grid_style_vars())->toBe(
        '--kt-city-grid-columns-desktop:3;--kt-city-grid-columns-tablet:2;--kt-city-grid-columns-mobile:1;'
        . '--kt-city-grid-gap:0.9375rem;--kt-city-grid-card-border-width:0.125rem;--kt-city-grid-card-radius:1.125rem;--kt-city-grid-card-padding:1.25rem'
    );
});

it('adds optional color variables to the city grid style when set', function () {
    $style = kotlinskidev_build_city_grid_style_vars([
        'columnsDesktop'      => 9,
        'linkTextColor'       => ' red ',
        'cardBackgroundColor' => 'blue',
        'cardBorderColor'     => 'green',
    ]);

    expect($style)->toContain('--kt-city-grid-columns-desktop:6;');
    expect($style)->toEndWith(';--kt-city-grid-link-color:red;--kt-city-grid-card-bg:blue;--kt-city-grid-card-border-color:green');
});

it('renders the empty city grid message only when asked to show it', function () {
    expect(kotlinskidev_render_city_grid_cards(['show_empty' => false]))->toBe('');
    expect(kotlinskidev_render_city_grid_cards())->toContain('City pages will appear here soon.');
});

it('maps the English slug to the translated base and leaves other languages alone', function () {
    expect(kotlinskidev_service_location_slug_translations())->toBe(['en' => 'creating-websites']);
});

it('lists the faq summary strings and the editor preview blocks', function () {
    expect(kotlinskidev_service_location_faq_summary_strings())->toHaveCount(5);
    $names = array_column(kotlinskidev_service_location_editor_preview_blocks(), 'name');
    expect($names)->toBe(['kotlinskidev/city-map', 'kotlinskidev/contact-card']);
});

it('finds no service location for an unknown slug and language', function () {
    expect(kotlinskidev_find_service_location_id_by_slug_and_language('no-such-city', 'xx'))->toBe(0);
});
