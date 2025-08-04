<?php
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

    // Add Dark Mode Background Color Setting
    $wp_customize->add_setting('dark_background_color', [
        'default' => '#121212', // Default dark background color
        'transport' => 'refresh',
    ]);

    $wp_customize->add_control(
        new WP_Customize_Color_Control(
            $wp_customize,
            'dark_background_color_control',
            [
                'label' => __('Dark Mode Background Color', 'mytheme'),
                'section' => 'colors',
                'settings' => 'dark_background_color',
            ]
        )
    );

    // Add Dark Mode Text Color Setting
    $wp_customize->add_setting('dark_text_color', [
        'default' => '#ffffff', // Default dark text color
        'transport' => 'refresh',
    ]);

    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'dark_text_color_control', [
            'label' => __('Dark Mode Text Color', 'mytheme'),
            'section' => 'colors',
            'settings' => 'dark_text_color',
        ])
    );

    // Add Dark Mode Link Color Setting
    $wp_customize->add_setting('dark_link_color', [
        'default' => '#1e90ff', // Default link color in dark mode
        'transport' => 'refresh',
    ]);

    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'dark_link_color_control', [
            'label' => __('Dark Mode Link Color', 'mytheme'),
            'section' => 'colors',
            'settings' => 'dark_link_color',
        ])
    );

    // Add Dark Mode Link Hover Color Setting
    $wp_customize->add_setting('dark_link_color_hover', [
        'default' => '#ff6347', // Default hover color in dark mode
        'transport' => 'refresh',
    ]);

    $wp_customize->add_control(
        new WP_Customize_Color_Control($wp_customize, 'dark_link_color_hover_control', [
            'label' => __('Dark Mode Link Hover Color', 'mytheme'),
            'section' => 'colors',
            'settings' => 'dark_link_color_hover',
        ])
    );
}
add_action('customize_register', 'mytheme_customize_register');

function mytheme_customize_css()
{
    // Get Light Mode Colors
    $background_color = get_theme_mod('background_color', '#ffffff');
    if (strpos($background_color, '#') !== 0) {
        $background_color = '#' . $background_color;
    }

    $text_color = get_theme_mod('text_color', '#000000');
    $link_color = get_theme_mod('link_color', '#0000FF');
    $link_color_hover = get_theme_mod('link_color_hover', '#ff2020');

    // Get Dark Mode Colors
    $dark_background_color = get_theme_mod('dark_background_color', '#121212');
    $dark_text_color = get_theme_mod('dark_text_color', '#ffffff');
    $dark_link_color = get_theme_mod('dark_link_color', '#1e90ff');
    $dark_link_color_hover = get_theme_mod('dark_link_color_hover', '#ff6347');
?>
    <style type="text/css">
        :root {
            /* Light mode colors */
            --light-bg-color: <?php echo esc_attr($background_color); ?>;
            --light-text-color: <?php echo esc_attr($text_color); ?>;
            --light-link-color: <?php echo esc_attr($link_color); ?>;
            --light-link-hover-color: <?php echo esc_attr($link_color_hover); ?>;

            /* Dark mode colors */
            --dark-bg-color: <?php echo esc_attr($dark_background_color); ?>;
            --dark-text-color: <?php echo esc_attr($dark_text_color); ?>;
            --dark-link-color: <?php echo esc_attr($dark_link_color); ?>;
            --dark-link-hover-color: <?php echo esc_attr($dark_link_color_hover); ?>;
        }

        .dark-mode {
            background-color: <?php echo esc_attr($dark_background_color); ?>;
            color: <?php echo esc_attr($dark_text_color); ?>;
        }

        .dark-mode a {
            color: <?php echo esc_attr($dark_link_color); ?>;
            transition: color 0.3s ease-in-out;
        }

        .dark-mode a:hover {
            color: <?php echo esc_attr($dark_link_color_hover); ?>;
        }

        /* Light Mode Styles */
        .light-mode {
            background-color: <?php echo esc_attr($background_color); ?>;
            color: <?php echo esc_attr($text_color); ?>;
        }

        .light-mode a {
            color: <?php echo esc_attr($link_color); ?>;
        }

        .light-mode a:hover {
            color: <?php echo esc_attr($link_color_hover); ?>;
        }
    </style>
<?php
}
add_action('wp_head', 'mytheme_customize_css');

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