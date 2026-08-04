<?php
function mytheme_customize_register($wp_customize)
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
add_action('customize_register', 'mytheme_customize_register');



function kotlinskidev_customize_register($wp_customize)
{
    $wp_customize->add_section('kotlinskidev_custom_settings_section', array(
        'title'    => __('Custom Settings', 'kotlinskidev'),
        'priority' => 30,
    ));

    $wp_customize->add_setting('kotlinskidev_enable_lightbox', array(
        'default'   => true,
        'transport' => 'refresh',
    ));

    $wp_customize->add_control('kotlinskidev_enable_lightbox', array(
        'label'    => __('Enable Image Lightbox', 'kotlinskidev'),
        'section'  => 'kotlinskidev_custom_settings_section',
        'settings' => 'kotlinskidev_enable_lightbox',
        'type'     => 'checkbox',
    ));
}
add_action('customize_register', 'kotlinskidev_customize_register');
add_action('wp_head', function () {
?>
    <script>
        window.kotlinskidevEnableLightbox = <?php echo get_theme_mod('kotlinskidev_enable_lightbox', true) ? 'true' : 'false'; ?>;
    </script>
<?php
});