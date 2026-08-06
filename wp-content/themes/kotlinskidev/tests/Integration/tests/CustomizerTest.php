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

it('registers the lightbox enable setting and checkbox control', function () {
    $wp_customize = kotlinskidev_customize_manager();
    do_action('customize_register', $wp_customize);

    $setting = $wp_customize->get_setting('kotlinskidev_enable_lightbox');
    expect($setting)->not->toBeNull();
    expect($setting->default)->toBeTrue();

    $control = $wp_customize->get_control('kotlinskidev_enable_lightbox');
    expect($control)->not->toBeNull();
    expect($control->type)->toBe('checkbox');
});

it('inlines the lightbox flag as window.kotlinskidevEnableLightbox on wp_head', function () {
    remove_theme_mod('kotlinskidev_enable_lightbox');

    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('window.kotlinskidevEnableLightbox = true;');
});

it('reflects a disabled lightbox theme mod in the inline flag', function () {
    set_theme_mod('kotlinskidev_enable_lightbox', false);

    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('window.kotlinskidevEnableLightbox = false;');

    remove_theme_mod('kotlinskidev_enable_lightbox');
});
