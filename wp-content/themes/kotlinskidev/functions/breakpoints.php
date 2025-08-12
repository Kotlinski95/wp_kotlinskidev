<?php
/**
 * Responsive Breakpoints Helper Functions
 * Provides centralized access to configurable breakpoints and customizer settings
 */

/**
 * Add responsive breakpoints section to WordPress Customizer
 */
function kotlinskidev_breakpoints_customize_register($wp_customize) {
    // Add Responsive Settings Section
    $wp_customize->add_section('responsive_breakpoints', array(
        'title' => __('Responsive Breakpoints', 'kotlinskidev'),
        'description' => __('Configure breakpoints for responsive design. Mobile: 0 to mobile breakpoint, Tablet: mobile+1 to tablet breakpoint, Desktop: tablet+1 and above.', 'kotlinskidev'),
        'priority' => 160,
    ));

    // Mobile Breakpoint Setting
    $wp_customize->add_setting('mobile_breakpoint', array(
        'default' => 767,
        'transport' => 'refresh',
        'sanitize_callback' => 'absint',
    ));

    $wp_customize->add_control('mobile_breakpoint', array(
        'label' => __('Mobile Breakpoint (max-width)', 'kotlinskidev'),
        'description' => __('Screens up to this width will be mobile. Example: 767px means mobile = 0-767px', 'kotlinskidev'),
        'section' => 'responsive_breakpoints',
        'type' => 'number',
        'input_attrs' => array(
            'min' => 320,
            'max' => 1024,
            'step' => 1,
        ),
    ));

    // Tablet Breakpoint Setting
    $wp_customize->add_setting('tablet_breakpoint', array(
        'default' => 1023,
        'transport' => 'refresh',
        'sanitize_callback' => 'absint',
    ));

    $wp_customize->add_control('tablet_breakpoint', array(
        'label' => __('Tablet Breakpoint (max-width)', 'kotlinskidev'),
        'description' => __('Screens from mobile+1 to this width will be tablet. Example: 1023px means tablet = 768-1023px', 'kotlinskidev'),
        'section' => 'responsive_breakpoints',
        'type' => 'number',
        'input_attrs' => array(
            'min' => 768,
            'max' => 1400,
            'step' => 1,
        ),
    ));

    // Desktop Breakpoint Setting (automatically calculated)
    $wp_customize->add_setting('desktop_breakpoint_info', array(
        'default' => '',
        'transport' => 'refresh',
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'desktop_breakpoint_info', array(
        'label' => __('Desktop Breakpoint', 'kotlinskidev'),
        'description' => __('Desktop starts automatically at tablet+1px and goes up. No setting needed.', 'kotlinskidev'),
        'section' => 'responsive_breakpoints',
        'type' => 'hidden',
    )));
}
add_action('customize_register', 'kotlinskidev_breakpoints_customize_register');

/**
 * Get all responsive breakpoints with automatically calculated ranges
 * 
 * @return array Associative array with breakpoint values and ranges
 */
function kotlinskidev_get_breakpoints() {
    $mobile_max = get_theme_mod('mobile_breakpoint', 767);
    $tablet_max = get_theme_mod('tablet_breakpoint', 1023);
    
    return array(
        // Raw breakpoint values
        'mobile_max' => $mobile_max,
        'tablet_max' => $tablet_max,
        
        // Calculated ranges for convenience
        'tablet_min' => $mobile_max + 1,
        'desktop_min' => $tablet_max + 1,
        
        // Ranges as arrays for easy understanding
        'mobile_range' => array(0, $mobile_max),
        'tablet_range' => array($mobile_max + 1, $tablet_max),
        'desktop_range' => array($tablet_max + 1, 9999), // 9999 = infinity
    );
}

/**
 * Get breakpoints formatted for CSS media queries
 * 
 * @return array Associative array with CSS media query strings
 */
function kotlinskidev_get_css_breakpoints() {
    $breakpoints = kotlinskidev_get_breakpoints();
    
    return array(
        'mobile' => "@media (max-width: {$breakpoints['mobile_max']}px)",
        'tablet' => "@media (min-width: {$breakpoints['tablet_min']}px) and (max-width: {$breakpoints['tablet_max']}px)",
        'desktop' => "@media (min-width: {$breakpoints['desktop_min']}px)",
    );
}

/**
 * Get breakpoints formatted for JavaScript
 * 
 * @return array Associative array ready for JSON encoding
 */
function kotlinskidev_get_js_breakpoints() {
    return kotlinskidev_get_breakpoints();
}

/**
 * Enqueue breakpoints data for JavaScript use
 */
function kotlinskidev_localize_breakpoints() {
    // Only needed for the editor (since responsive order controls are editor-only)
    if (is_admin()) {
        wp_localize_script('kotlinskidev-editor-only', 'kotlinskidevBreakpoints', kotlinskidev_get_js_breakpoints());
    }
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_localize_breakpoints');
