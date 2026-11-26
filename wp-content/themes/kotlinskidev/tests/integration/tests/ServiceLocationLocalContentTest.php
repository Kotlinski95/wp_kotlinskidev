<?php

uses(Tests\Integration\TestCase::class);

it('keeps at most two complete FAQ pairs and sanitizes them', function () {
    $pairs = kotlinskidev_sanitize_local_faq([
        ['question' => '<b>One?</b>', 'answer' => 'Yes'],
        ['question' => '', 'answer' => 'orphan answer'],
        'not-an-array',
        ['question' => 'Two?', 'answer' => 'No'],
        ['question' => 'Three?', 'answer' => 'Maybe'],
    ]);

    expect($pairs)->toBe([
        ['question' => 'One?', 'answer' => 'Yes'],
        ['question' => 'Two?', 'answer' => 'No'],
    ]);
    expect(kotlinskidev_sanitize_local_faq('text'))->toBe([]);
});

it('keeps at most three unique positive featured project ids', function () {
    expect(kotlinskidev_sanitize_featured_projects(['5', 5, 0, -7, 9, 11, 13]))->toBe([5, 7, 9]);
    expect(kotlinskidev_sanitize_featured_projects('5'))->toBe([]);
});

it('falls back to the intro section for unknown section names', function () {
    expect(kotlinskidev_sanitize_city_local_section('faq'))->toBe('faq');
    expect(kotlinskidev_sanitize_city_local_section('nearby'))->toBe('nearby');
    expect(kotlinskidev_sanitize_city_local_section('other'))->toBe('intro');
});

it('hooks the local meta and city block registration into init', function () {
    expect(has_action('init', 'kotlinskidev_register_service_location_local_meta'))->toBe(10);
    expect(has_action('init', 'kotlinskidev_register_city_local_content_block'))->toBe(10);
});

it('reads trimmed local fields for a post', function () {
    $id = self::factory()->post->create(['post_type' => 'service_location']);
    update_post_meta($id, 'local_intro', '  Intro  ');
    update_post_meta($id, 'local_audience', 'Shops');

    $fields = kotlinskidev_get_service_location_local_fields($id);

    expect($fields['local_intro'])->toBe('Intro');
    expect($fields['local_audience'])->toBe('Shops');
    expect($fields['local_distance'])->toBe('');
    expect($fields['local_faq'])->toBe([]);
    expect($fields['featured_projects'])->toBe([]);
});

it('renders intro and facts markup with escaping', function () {
    $html = kotlinskidev_render_city_local_intro_markup([
        'local_intro'    => 'Hello <b>x</b>',
        'local_audience' => 'Shops',
        'local_distance' => '',
    ]);

    expect($html)->toBe(
        '<p class="kt-city-local__intro">Hello &lt;b&gt;x&lt;/b&gt;</p>'
        . '<dl class="kt-city-local__facts"><div class="kt-city-local__fact"><dt class="kt-city-local__fact-label">Who I help</dt><dd class="kt-city-local__fact-value">Shops</dd></div></dl>'
    );
    expect(kotlinskidev_render_city_local_intro_markup([]))->toBe('');
});

it('renders FAQ pairs as details blocks and nothing for an empty list', function () {
    $html = kotlinskidev_render_city_local_faq_markup(['local_faq' => [['question' => 'Q?', 'answer' => 'A.']]]);

    expect($html)->toContain('<details class="wp-block-details');
    expect($html)->toContain('<summary>Q?</summary>');
    expect($html)->toContain('A.');
    expect(kotlinskidev_render_city_local_faq_markup(['local_faq' => []]))->toBe('');
});

it('dispatches local content by section and returns nothing for an invalid post id', function () {
    $id = self::factory()->post->create(['post_type' => 'service_location']);
    update_post_meta($id, 'local_intro', 'Intro');

    expect(kotlinskidev_render_city_local_content(0, 'intro'))->toBe('');
    expect(kotlinskidev_render_city_local_content($id, 'intro'))->toContain('kt-city-local__intro');
    expect(kotlinskidev_render_city_local_content($id, 'faq'))->toBe('');
    expect(kotlinskidev_render_city_local_content($id, 'nearby'))->toBe('');
});

it('hides project cards that are not featured on a service location page', function () {
    $featured = self::factory()->post->create(['post_type' => 'post']);
    $other    = self::factory()->post->create(['post_type' => 'post']);
    $id       = self::factory()->post->create(['post_type' => 'service_location', 'post_status' => 'publish']);
    update_post_meta($id, 'featured_projects', [$featured]);
    test()->go_to(get_permalink($id));

    $block = ['blockName' => 'kotlinskidev/project-card', 'attrs' => ['cardId' => $other]];

    expect(kotlinskidev_filter_service_location_project_cards('<div>card</div>', $block))->toBe('');
    $block['attrs']['cardId'] = $featured;
    expect(kotlinskidev_filter_service_location_project_cards('<div>card</div>', $block))->toBe('<div>card</div>');
    $block['attrs']['cardId'] = 0;
    expect(kotlinskidev_filter_service_location_project_cards('<div>card</div>', $block))->toBe('<div>card</div>');
});
