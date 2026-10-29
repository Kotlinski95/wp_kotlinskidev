<?php

uses(Tests\Integration\TestCase::class);

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

it('resolves the service_location template as a real, loadable block template', function () {
    $template = get_block_template(get_stylesheet() . '//single-service_location', 'wp_template');

    expect($template)->not->toBeNull();
    expect($template->content)->not->toBe('');
});

it('parses the service_location template as structurally valid blocks with all ten city bindings intact', function () {
    $content = file_get_contents(get_template_directory() . '/templates/single-service_location.html');
    $blocks = parse_blocks($content);

    expect($blocks)->not->toBeEmpty();
    expect(substr_count($content, '"key":"city"'))->toBe(10);
});

it('gives exactly the two contrast-safe city bindings the gradient-text treatment, not the pill badge or the primary-background CTA', function () {
    $content = file_get_contents(get_template_directory() . '/templates/single-service_location.html');

    expect(substr_count($content, 'className":"kt-gradient-text"'))->toBe(2);
});

it('registers every kotlinskidev/translated-text string used in the service_location template with Polylang', function () {
    $content = file_get_contents(get_template_directory() . '/templates/single-service_location.html');

    $strings = [];
    kotlinskidev_translated_text_collect_strings(parse_blocks($content), $strings);

    expect($strings)->not->toBeEmpty();
    expect($strings)->toHaveKey('service-location-hero-cta-secondary-href');
    expect($strings['service-location-hero-cta-secondary-href'])->toBe('/projekty/');
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

it('interpolates the current post\'s city into a core/details summary containing the %CITY% marker', function () {
    $id = self::factory()->post->create(['post_type' => 'service_location', 'post_status' => 'publish']);
    update_post_meta($id, 'city', 'Wrocław');
    test()->go_to(get_permalink($id));

    $html = render_block(parse_blocks(
        '<!-- wp:details --><details class="wp-block-details"><summary>Czy spotkamy się w %CITY%?</summary></details><!-- /wp:details -->'
    )[0]);

    expect($html)->toContain('Czy spotkamy się w Wrocław?');
    expect($html)->not->toContain('%CITY%');
});

it('leaves a core/details summary untouched when the current post has no city meta', function () {
    $id = self::factory()->post->create(['post_type' => 'post', 'post_status' => 'publish']);
    test()->go_to(get_permalink($id));

    $html = render_block(parse_blocks(
        '<!-- wp:details --><details class="wp-block-details"><summary>Czy spotkamy się w %CITY%?</summary></details><!-- /wp:details -->'
    )[0]);

    expect($html)->toContain('%CITY%');
});

it('does not touch a non-core/details block even if it contains a known FAQ summary string', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:paragraph --><p>Kto tworzy treści na stronę?</p><!-- /wp:paragraph -->'
    )[0]);

    expect($html)->toBe('<p class="wp-block-paragraph">Kto tworzy treści na stronę?</p>');
});

it('reflects a custom gridGap attribute set through the block editor as the CSS custom property', function () {
    update_option('kotlinskidev_contact_email', 'kotlinskidev@gmail.com');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/contact-card {"gridGap":0.75} /-->')[0]);

    expect($html)->toContain('--kt-contact-card-gap: 0.75rem');
});
