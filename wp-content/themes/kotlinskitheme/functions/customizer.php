<?php
// Customize Register
function mytheme_customize_register($wp_customize)
{
    // Background Color Setting
    $wp_customize->add_setting('background_color', [
        'default' => '#ffffff',
        'transport' => 'refresh',
    ]);

    // Background Color Control
    $wp_customize->add_control(
        new WP_Customize_Color_Control(
            $wp_customize,
            'background_color_control',
            [
                'label' => __('Background Color', 'mytheme'),
                'section' => 'colors',
                'settings' => 'background_color',
            ]
        )
    );

    // Text Color Setting
    $wp_customize->add_setting('text_color', [
        'default' => '#000000',
        'transport' => 'refresh',
    ]);

    // Text Color Control
    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'text_color_control', [
            'label' => __('Text Color', 'mytheme'),
            'section' => 'colors',
            'settings' => 'text_color',
        ])
    );

    // Link Color Setting
    $wp_customize->add_setting('link_color', [
        'default' => '#0000FF', // Default link color (blue)
        'transport' => 'refresh',
    ]);

    // Link Color Control
    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'link_color_control', [
            'label' => __('Link Color', 'mytheme'),
            'section' => 'colors',
            'settings' => 'link_color',
        ])
    );

    // Link Color Hover Setting
    $wp_customize->add_setting('link_color_hover', [
        'default' => '#ff2020', // Default link color (blue)
        'transport' => 'refresh',
    ]);

    // Link Color Hover Control
    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'link_color_hover_control', [
            'label' => __('Link Color (Hover)', 'mytheme'),
            'section' => 'colors',
            'settings' => 'link_color_hover',
        ])
    );
}
add_action('customize_register', 'mytheme_customize_register');

// Output Customizer CSS
function mytheme_customize_css()
{
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

    // Get the link color setting
    $link_color = get_theme_mod('link_color', '#303030');
    if (strpos($link_color, '#') !== 0) {
        $link_color = '#' . $link_color;
    }

    // Get the link color hover setting
    $link_color_hover = get_theme_mod('link_color_hover', '#ff2020');
    if (strpos($link_color_hover, '#') !== 0) {
        $link_color_hover = '#' . $link_color_hover;
    }
?>
    <style type="text/css">
        body {
            background-color: <?php echo esc_attr($background_color); ?>;
            color: <?php echo esc_attr($text_color); ?>;

            a {
                color: <?php echo esc_attr($link_color); ?>;
                will-change: color;
                transition: color 0.3s ease-in-out;
            }
            a:hover{
                color: <?php echo esc_attr($link_color_hover); ?>;
            }
        }
    </style>
<?php
}
add_action('wp_head', 'mytheme_customize_css');

// add_action( 'wp_enqueue_scripts', 'theme_slug_enqueue_scripts' );

// function theme_slug_enqueue_scripts() {
// 	wp_enqueue_script(
// 		'custom',
// 		get_stylesheet_directory_uri().'/js/custom-script.js'
// 	);
// }

add_action('wp_enqueue_scripts', function (): void {
    $script_args = include get_template_directory() . '/build/main.asset.php';
    wp_enqueue_script(
        'wp-typescript',
        get_template_directory_uri() . '/build/main.js',
        $script_args['dependencies'],
        $script_args['version'],
        [
            'strategy' => 'defer',
            'in_footer' => false, // Note: This is the default value.
        ]
    );
    // When used in a WordPress plugin
    //$script_args = include( plugin_dir_path( __FILE__ ) . 'assets/public/scripts.asset.php');
    //wp_enqueue_script('wp-typescript', plugins_url('assets/public/scripts.js', __FILE__), $script_args['dependencies'], $script_args['version']);
});
?>