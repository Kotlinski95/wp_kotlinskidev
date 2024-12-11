<?php
// Customize Register
function mytheme_seo_customize_register($wp_customize) {
    // Meta Description Setting for Front Page
    $wp_customize->add_setting('meta_description', array(
        'default' => '',
        'transport' => 'refresh',
    ));

    // Meta Description Control
    $wp_customize->add_control('meta_description_control', array(
        'label' => __('Meta Description for Front Page', 'mytheme'),
        'section' => 'title_tagline',
        'settings' => 'meta_description',
        'type' => 'textarea',
    ));
}
add_action('customize_register', 'mytheme_seo_customize_register');

?>
