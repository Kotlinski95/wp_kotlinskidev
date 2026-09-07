<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_customize_manager(): WP_Customize_Manager
{
    require_once ABSPATH . WPINC . '/class-wp-customize-manager.php';

    return new WP_Customize_Manager();
}

it('registers the lazy loading section, setting, and control', function () {
    $wp_customize = kotlinskidev_customize_manager();
    do_action('customize_register', $wp_customize);

    expect($wp_customize->get_section('kotlinskidev_lazy_loading'))->not->toBeNull();

    $setting = $wp_customize->get_setting('kotlinskidev_lazy_loading_class');
    expect($setting)->not->toBeNull();
    expect($setting->default)->toBe('skip-lazy');
    expect($setting->sanitize_callback)->toBe('sanitize_html_class');

    $control = $wp_customize->get_control('kotlinskidev_lazy_loading_class');
    expect($control)->not->toBeNull();
    expect($control->section)->toBe('kotlinskidev_lazy_loading');
});

