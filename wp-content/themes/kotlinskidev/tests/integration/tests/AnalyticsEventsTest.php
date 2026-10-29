<?php

uses(Tests\Integration\TestCase::class);

afterEach(function () {
    delete_option('kotlinskidev_enabled_analytics_events');
});

it('lists every tracked event name', function () {
    $names = array_keys(kotlinskidev_tracked_event_names());

    expect($names)->toBe([
        'cta_click',
        'select_content',
        'language_switch',
        'form_start',
        'generate_lead',
        'form_error',
        'lightbox_open',
        'lightbox_navigate',
        'page_not_found',
        'read_more_click',
        'faq_expand',
        'scroll_to_top_click',
        'cookie_consent_click',
        'accessibility_toggle_click',
        'search_panel_open',
        'modal_open',
        'load_more_click',
        'theme_mode_toggle',
        'protected_content_reveal',
    ]);
});

it('defaults to every event enabled when no option is saved', function () {
    expect(kotlinskidev_get_enabled_analytics_events())->toBe(array_keys(kotlinskidev_tracked_event_names()));
    expect(kotlinskidev_get_disabled_analytics_events())->toBe([]);
});

it('computes disabled events as the known list minus the saved enabled list', function () {
    update_option('kotlinskidev_enabled_analytics_events', ['cta_click', 'generate_lead']);

    $disabled = kotlinskidev_get_disabled_analytics_events();

    expect($disabled)->not->toContain('cta_click');
    expect($disabled)->not->toContain('generate_lead');
    expect($disabled)->toContain('form_start');
    expect($disabled)->toContain('page_not_found');
});

it('sanitizes unknown event names out of a submitted value', function () {
    $sanitized = kotlinskidev_sanitize_enabled_analytics_events(['cta_click', 'not_a_real_event', '<script>']);

    expect($sanitized)->toBe(['cta_click']);
});

it('sanitizes a non-array value to an empty array, disabling everything', function () {
    expect(kotlinskidev_sanitize_enabled_analytics_events(null))->toBe([]);
});

it('drops the empty-string placeholder used to keep the field present when nothing is checked', function () {
    $sanitized = kotlinskidev_sanitize_enabled_analytics_events(['', 'form_start']);

    expect($sanitized)->toBe(['form_start']);
});

it('localizes the disabled events list onto the main script', function () {
    do_action('wp_enqueue_scripts');

    global $wp_scripts;
    $data = $wp_scripts->get_data('wp-typescript', 'data');

    expect($data)->toContain('kotlinskiAnalyticsConfig');
    expect($data)->toContain('"disabledEvents":[]');
});

it('reflects a saved disabled event in the localized config', function () {
    update_option('kotlinskidev_enabled_analytics_events', ['cta_click']);

    do_action('wp_enqueue_scripts');

    global $wp_scripts;
    $data = $wp_scripts->get_data('wp-typescript', 'data');

    expect($data)->toContain('"generate_lead"');
});
