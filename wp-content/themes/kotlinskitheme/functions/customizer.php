<?php
// Customize Register
function mytheme_customize_register($wp_customize) {
    // Background Color Setting
    $wp_customize->add_setting('background_color', array(
        'default' => '#ffffff',
        'transport' => 'refresh',
    ));

    // Background Color Control
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'background_color_control', array(
        'label' => __('Background Color', 'mytheme'),
        'section' => 'colors',
        'settings' => 'background_color',
    )));

    // Text Color Setting
    $wp_customize->add_setting('text_color', array(
        'default' => '#000000',
        'transport' => 'refresh',
    ));

    // Text Color Control
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'text_color_control', array(
        'label' => __('Text Color', 'mytheme'),
        'section' => 'colors',
        'settings' => 'text_color',
    )));
}
add_action('customize_register', 'mytheme_customize_register');

// Output Customizer CSS
function mytheme_customize_css() {
    // Get the background color setting
    $background_color = get_theme_mod('background_color', '#ffffff');
    if (strpos($background_color, '#') !== 0) {
        $background_color = '#' . $background_color;
    }

    // Get the text color setting
    $text_color = get_theme_mod('text_color', '#303030');
    if (strpos($text_color, '#') !== 0) {
        $text_color = '#' . $text_color;
    }

    // Output the styles
    ?>
    <style type="text/css">
        body {
            background-color: <?php echo esc_attr($background_color); ?>;
            color: <?php echo esc_attr($text_color); ?>;
        }
    </style>
    <?php
}
add_action('wp_head', 'mytheme_customize_css');

// Enqueue live preview script for Customizer
function mytheme_customize_preview_js() {
    wp_enqueue_script('mytheme-customizer', get_template_directory_uri() . '/js/customizer.js', array('customize-preview'), null, true);
}
add_action('customize_preview_init', 'mytheme_customize_preview_js');
