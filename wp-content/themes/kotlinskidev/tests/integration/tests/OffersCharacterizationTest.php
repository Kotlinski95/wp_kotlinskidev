<?php

uses(Tests\Integration\TestCase::class);

it('registers every offer hook with its priority and accepted args', function () {
    expect(has_action('init', 'kotlinskidev_register_offer_post_type'))->toBe(10);
    expect(has_action('init', 'kotlinskidev_register_offer_meta'))->toBe(10);
    expect(has_action('save_post_kt_offer', 'kotlinskidev_offer_flush_on_save'))->toBe(10);
    expect(has_action('pll_save_post', 'kotlinskidev_offer_flush_on_save'))->toBe(10);
    expect(has_action('trashed_post', 'kotlinskidev_offer_flush_on_post_removal'))->toBe(10);
    expect(has_action('deleted_post', 'kotlinskidev_offer_flush_on_post_removal'))->toBe(10);
    expect(has_action('added_post_meta', 'kotlinskidev_offer_flush_on_meta_change'))->toBe(10);
    expect(has_action('updated_post_meta', 'kotlinskidev_offer_flush_on_meta_change'))->toBe(10);
    expect(has_action('deleted_post_meta', 'kotlinskidev_offer_flush_on_meta_change'))->toBe(10);
    expect(has_filter('render_block', 'kotlinskidev_offer_render_block'))->toBe(20);
    expect(has_action('rest_api_init', 'kotlinskidev_register_offer_routes'))->toBe(10);
    expect(has_action('admin_notices', 'kotlinskidev_offer_placeholder_notice'))->toBe(10);
    expect(has_action('admin_bar_menu', 'kotlinskidev_offer_admin_bar_node'))->toBe(100);
    expect(has_filter('wpseo_schema_graph', 'kotlinskidev_offer_schema_graph'))->toBe(20);
    expect(has_filter('pll_copy_post_metas', 'kotlinskidev_offer_copy_post_metas'))->toBe(10);
});

it('registers the offer post type and its meta', function () {
    $post_type = get_post_type_object('kt_offer');

    expect($post_type->public)->toBeFalse();
    expect($post_type->show_in_rest)->toBeTrue();
    expect($post_type->menu_icon)->toBe('dashicons-tag');
    expect($post_type->menu_position)->toBe(24);
    foreach (['title', 'custom-fields', 'page-attributes'] as $feature) {
        expect(post_type_supports('kt_offer', $feature))->toBeTrue();
    }

    kotlinskidev_register_offer_meta();
    $registered = get_registered_meta_keys('post', 'kt_offer');
    expect($registered)->toHaveKeys(['offer_key', 'currency', 'is_placeholder', 'variants']);
    expect($registered['currency']['default'])->toBe('EUR');
    expect($registered['variants']['show_in_rest']['schema'])->toBe(kotlinskidev_offer_variants_schema());
});

it('registers both offer REST routes behind edit_posts', function () {
    $routes = rest_get_server()->get_routes();

    expect($routes)->toHaveKeys(['/kotlinskidev/v1/offer-value', '/kotlinskidev/v1/offers']);
    foreach (['/kotlinskidev/v1/offer-value', '/kotlinskidev/v1/offers'] as $route) {
        expect($routes[$route][0]['permission_callback'])->toBe('kotlinskidev_offer_rest_permission');
        expect($routes[$route][0]['methods'])->toBe(['GET' => true]);
    }
    expect($routes['/kotlinskidev/v1/offer-value'][0]['callback'])->toBe('kotlinskidev_offer_rest_value');
    expect($routes['/kotlinskidev/v1/offers'][0]['callback'])->toBe('kotlinskidev_offer_rest_list');
});

it('sanitizes variants and exposes the offer keys', function () {
    expect(kotlinskidev_offer_keys())->toBe(['website', 'ecommerce', 'web-app', 'performance-audit', 'website-optimization', 'local-seo', 'maintenance']);
    expect(kotlinskidev_offer_sanitize_variants('x'))->toBe([]);
    expect(kotlinskidev_offer_sanitize_variants([
        ['key' => ' ', 'label' => 'dropped'],
        'not-an-array',
        ['key' => 'Pro Plan', 'label' => '<b>Pro</b>', 'price_from' => '10.5', 'price_to' => 'x', 'price_period' => 'month', 'duration_min' => '3', 'duration_unit' => 'years', 'included' => 'a'],
    ]))->toBe([[
        'key' => 'proplan',
        'label' => 'Pro',
        'price_from' => 10.5,
        'price_to' => null,
        'price_period' => 'month',
        'price_note' => '',
        'duration_min' => 3,
        'duration_max' => null,
        'duration_unit' => 'days',
        'included' => 'a',
    ]]);
    expect(kotlinskidev_offer_sanitize_currency('PLN'))->toBe('PLN');
    expect(kotlinskidev_offer_sanitize_currency('USD'))->toBe('EUR');
});

it('builds, caches and resolves an offer end to end', function () {
    $post_id = self::factory()->post->create(['post_type' => 'kt_offer', 'post_title' => 'Website', 'post_status' => 'publish']);
    update_post_meta($post_id, 'offer_key', 'website');
    update_post_meta($post_id, 'currency', 'PLN');
    update_post_meta($post_id, 'variants', [
        ['key' => 'landing', 'label' => 'Landing', 'price_from' => 250, 'price_to' => 400, 'duration_min' => 5, 'duration_max' => 10, 'duration_unit' => 'days'],
    ]);
    $lang = kotlinskidev_offer_current_lang();

    $offer = kotlinskidev_offer_get('website', $lang);

    expect($offer['name'])->toBe('Website');
    expect($offer['currency'])->toBe('PLN');
    expect(array_keys($offer['variants']))->toBe(['landing']);
    expect(get_transient(kotlinskidev_offer_transient_name($lang)))->toBeArray();
    expect(kotlinskidev_offer_resolve('website', 'landing', 'duration', $lang)['value'])->toBe('5–10 days');
    expect(kotlinskidev_offer_resolve('website', 'landing', 'label', $lang))->toBe(['value' => 'Landing', 'placeholder' => false, 'missing' => false]);
    expect(kotlinskidev_offer_resolve('website', 'nope', 'label', $lang)['missing'])->toBeTrue();
    expect(kotlinskidev_offer_placeholder_count())->toBe(0);

    kotlinskidev_offer_flush_cache();
    expect(get_transient(kotlinskidev_offer_transient_name($lang)))->toBeFalse();
});

it('replaces offer spans in rendered leaf blocks only', function () {
    $span = '<span class="kt-offer" data-kt-offer="ghost" data-kt-variant="v" data-kt-field="price">old</span>';

    $html = kotlinskidev_offer_render_block('<p>' . $span . '</p>', ['blockName' => 'core/paragraph']);
    $untouched = kotlinskidev_offer_render_block('<div>' . $span . '</div>', ['blockName' => 'core/group']);

    expect($html)->toContain('>Price on request</span>');
    expect($untouched)->toContain('>old</span>');
});

it('lists offers through the REST callbacks', function () {
    $post_id = self::factory()->post->create(['post_type' => 'kt_offer', 'post_title' => 'Maint', 'post_status' => 'publish']);
    update_post_meta($post_id, 'offer_key', 'maintenance');
    update_post_meta($post_id, 'variants', [['key' => 'basic', 'label' => 'Basic']]);
    kotlinskidev_offer_flush_cache();

    $request = new WP_REST_Request('GET', '/kotlinskidev/v1/offers');
    $request->set_param('lang', kotlinskidev_offer_current_lang());

    expect(kotlinskidev_offer_rest_list($request))->toBe([[
        'key' => 'maintenance',
        'name' => 'Maint',
        'currency' => 'EUR',
        'is_placeholder' => false,
        'variants' => [['key' => 'basic', 'label' => 'Basic']],
    ]]);

    $value_request = new WP_REST_Request('GET', '/kotlinskidev/v1/offer-value');
    $value_request->set_param('offer', 'maintenance');
    $value_request->set_param('variant', 'basic');
    $value_request->set_param('field', 'price');
    $value_request->set_param('lang', kotlinskidev_offer_current_lang());
    expect(kotlinskidev_offer_rest_value($value_request))->toBe(['value' => 'Price on request', 'placeholder' => false]);
});

it('emits schema pieces only for priced, non placeholder offers', function () {
    $post_id = self::factory()->post->create(['post_type' => 'kt_offer', 'post_title' => 'Site', 'post_status' => 'publish']);
    update_post_meta($post_id, 'offer_key', 'website');
    update_post_meta($post_id, 'variants', [['key' => 'a', 'price_from' => 100, 'price_to' => 300]]);
    kotlinskidev_offer_flush_cache();
    $content = '<span class="kt-offer" data-kt-offer="website" data-kt-variant="a" data-kt-field="price">x</span>';

    $pieces = kotlinskidev_offer_schema_pieces($content, kotlinskidev_offer_current_lang(), 'https://example.test');

    expect($pieces)->toBe([[
        '@type' => 'Service',
        '@id' => 'https://example.test/#/schema/offer/website',
        'name' => 'Site',
        'offers' => ['@type' => 'AggregateOffer', 'priceCurrency' => 'EUR', 'lowPrice' => 100, 'highPrice' => 300],
    ]]);
    expect(kotlinskidev_offer_copy_post_metas(['variants', 'x']))->toBe(['x', 'offer_key']);
});
