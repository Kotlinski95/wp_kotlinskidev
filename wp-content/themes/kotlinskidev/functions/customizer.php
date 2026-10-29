<?php
function kotlinskidev_lazy_loading_customize_register($wp_customize)
{
    // Add Lazy Loading Section
    $wp_customize->add_section('kotlinskidev_lazy_loading', array(
        'title' => __('Lazy Loading Settings', 'kotlinskidev'),
        'priority' => 200,
        'description' => __('Configure lazy loading settings for cover block images.', 'kotlinskidev'),
    ));

    // CSS Class Setting for Lazy Loading Exclusion
    $wp_customize->add_setting('kotlinskidev_lazy_loading_class', array(
        'default' => 'skip-lazy',
        'transport' => 'refresh',
        'sanitize_callback' => 'sanitize_html_class',
    ));

    $wp_customize->add_control('kotlinskidev_lazy_loading_class', array(
        'label' => __('Lazy Loading Exclusion Class', 'kotlinskidev'),
        'section' => 'kotlinskidev_lazy_loading',
        'settings' => 'kotlinskidev_lazy_loading_class',
        'type' => 'text',
        'description' => __('CSS class name to add to cover images that should skip lazy loading. Common options: skip-lazy, no-lazy, exclude-lazy', 'kotlinskidev'),
    ));
}
add_action('customize_register', 'kotlinskidev_lazy_loading_customize_register');