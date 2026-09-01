<?php

uses(Tests\Integration\TestCase::class);

if (!function_exists('pll_current_language')) {
    function pll_current_language()
    {
        return $GLOBALS['kt_test_pll_language'] ?? '';
    }
}

beforeEach(function () {
    unset($GLOBALS['kt_test_pll_language']);
});

it('registers editor and custom-fields support on service_location, so the block editor and the REST meta field both load', function () {
    expect(post_type_supports('service_location', 'editor'))->toBeTrue();
    expect(post_type_supports('service_location', 'custom-fields'))->toBeTrue();
    expect(use_block_editor_for_post_type('service_location'))->toBeTrue();
});

it('sanitizes the city post meta on write, stripping tags', function () {
    $id = self::factory()->post->create(['post_type' => 'service_location']);
    update_post_meta($id, 'city', '<b>Katowice</b>');

    expect(get_post_meta($id, 'city', true))->toBe('Katowice');
});

it('exposes meta in the service_location REST schema', function () {
    $controller = new WP_REST_Posts_Controller('service_location');
    $schema = $controller->get_item_schema();

    expect($schema['properties'])->toHaveKey('meta');
});

it('leaves the single template hierarchy unchanged when polylang is not english', function () {
    $GLOBALS['kt_test_pll_language'] = 'pl';

    $result = apply_filters('single_template_hierarchy', ['single-service_location.php', 'single.php']);

    expect($result)->toBe(['single-service_location.php', 'single.php']);
});

it('leaves the single template hierarchy unchanged when polylang is inactive', function () {
    $result = apply_filters('single_template_hierarchy', ['single-service_location.php', 'single.php']);

    expect($result)->toBe(['single-service_location.php', 'single.php']);
});

it('prepends the english template ahead of the default when polylang language is english', function () {
    $GLOBALS['kt_test_pll_language'] = 'en';

    $result = apply_filters('single_template_hierarchy', ['single-service_location.php', 'single.php']);

    expect($result)->toBe(['single-service_location-en.php', 'single-service_location.php', 'single.php']);
});

it('resolves both the pl and en service_location templates as real, loadable block templates', function () {
    $pl = get_block_template(get_stylesheet() . '//single-service_location', 'wp_template');
    $en = get_block_template(get_stylesheet() . '//single-service_location-en', 'wp_template');

    expect($pl)->not->toBeNull();
    expect($pl->content)->not->toBe('');
    expect($en)->not->toBeNull();
    expect($en->content)->not->toBe('');
});

it('parses both service_location templates as structurally valid blocks with all eleven city bindings intact', function () {
    foreach (['single-service_location.html', 'single-service_location-en.html'] as $file) {
        $content = file_get_contents(get_template_directory() . '/templates/' . $file);
        $blocks = parse_blocks($content);

        expect($blocks)->not->toBeEmpty();
        expect(substr_count($content, '"key":"city"'))->toBe(11);
    }
});

it('gives exactly the three contrast-safe city bindings the gradient-text treatment, not the pill badge or the primary-background CTA', function () {
    foreach (['single-service_location.html', 'single-service_location-en.html'] as $file) {
        $content = file_get_contents(get_template_directory() . '/templates/' . $file);

        expect(substr_count($content, 'className":"kt-gradient-text"'))->toBe(3);
    }
});

it('renders the city-map block through the real block pipeline for the current post\'s city', function () {
    $id = self::factory()->post->create(['post_type' => 'service_location', 'post_status' => 'publish']);
    update_post_meta($id, 'city', 'Katowice');
    test()->go_to(get_permalink($id));

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/city-map /-->')[0]);

    expect($html)->toContain('class="kt-city-map"');
    expect($html)->toContain('data-city-map-expand');
    expect($html)->toContain(rawurlencode('Katowice, Poland'));
});

it('renders the contact-card block through the real block pipeline, protecting sensitive fields', function () {
    update_option('kotlinskidev_contact_address', '40-143 Katowice, ul. Dekerta');
    update_option('kotlinskidev_contact_phone', '+48 608 418 911');
    update_option('kotlinskidev_contact_email', 'kotlinskidev@gmail.com');
    update_option('kotlinskidev_contact_hours', 'Pon.-Pt. 8:00-17:00');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/contact-card /-->')[0]);

    expect($html)->toContain('kt-contact-card');
    expect($html)->toContain('Pon.-Pt. 8:00-17:00');
    expect($html)->toContain('protected-content--address');
    expect($html)->toContain('protected-content--phone');
    expect($html)->toContain('protected-content--email');
    expect($html)->not->toContain('+48 608 418 911');
    expect($html)->not->toContain('kotlinskidev@gmail.com');
});

it('reflects a custom gridGap attribute set through the block editor as the CSS custom property', function () {
    update_option('kotlinskidev_contact_email', 'kotlinskidev@gmail.com');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/contact-card {"gridGap":0.75} /-->')[0]);

    expect($html)->toContain('--kt-contact-card-gap: 0.75rem');
});
