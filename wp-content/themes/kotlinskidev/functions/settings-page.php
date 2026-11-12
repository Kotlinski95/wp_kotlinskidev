<?php
add_action('admin_menu', 'kotlinskidev_register_settings_page');

function kotlinskidev_register_settings_page(): void
{
    add_options_page(
        esc_html__('Kotlinski.dev Settings', 'kotlinskidev'),
        esc_html__('Kotlinski.dev', 'kotlinskidev'),
        'manage_options',
        'kotlinskidev-settings',
        'kotlinskidev_render_settings_page'
    );
}

function kotlinskidev_settings_tabs(): array
{
    return [
        'general'     => [
            'label' => esc_html__('General', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_general',
            'page'  => 'kotlinskidev-settings-general',
        ],
        'theme-mode'  => [
            'label' => esc_html__('Theme Mode', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_theme_mode',
            'page'  => 'kotlinskidev-settings-theme-mode',
        ],
        'breakpoints' => [
            'label' => esc_html__('Breakpoints', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_breakpoints',
            'page'  => 'kotlinskidev-settings-breakpoints',
        ],
        'login'       => [
            'label' => esc_html__('Login Page', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_login',
            'page'  => 'kotlinskidev-settings-login',
        ],
        'tracking'    => [
            'label' => esc_html__('Tracking', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_tracking',
            'page'  => 'kotlinskidev-settings-tracking',
        ],
        'security'    => [
            'label' => esc_html__('Security', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_security',
            'page'  => 'kotlinskidev-settings-security',
        ],
        'contact'     => [
            'label' => esc_html__('Contact Info', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_contact',
            'page'  => 'kotlinskidev-settings-contact',
        ],
        'advanced' => [
            'label' => esc_html__('Advanced', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_advanced',
            'page'  => 'kotlinskidev-settings-advanced',
        ],
        'monitoring' => [
            'label' => esc_html__('Error Monitoring', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_monitoring',
            'page'  => 'kotlinskidev-settings-monitoring',
        ],
        'customization' => [
            'label' => esc_html__('Customization', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_customization',
            'page'  => 'kotlinskidev-settings-customization',
        ],
        'site-values' => [
            'label' => esc_html__('Site values', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_site_values',
            'page'  => 'kotlinskidev-settings-site-values',
        ],
    ] + (kotlinskidev_feature_enabled('custom_seo') ? [
        'seo' => [
            'label' => esc_html__('SEO', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_seo',
            'page'  => 'kotlinskidev-settings-seo',
        ],
    ] : []);
}

function kotlinskidev_active_settings_tab(): string
{
    $tabs = kotlinskidev_settings_tabs();
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only admin tab navigation, no state change
    $tab  = isset($_GET['tab']) ? sanitize_key(wp_unslash($_GET['tab'])) : 'general';
    return array_key_exists($tab, $tabs) ? $tab : 'general';
}

add_action('admin_init', 'kotlinskidev_register_settings');

function kotlinskidev_register_settings(): void
{
    register_setting(
        'kotlinskidev_settings_general',
        'kotlinskidev_disable_comments',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    add_settings_section(
        'kotlinskidev_section_spam',
        esc_html__('Comment Spam Protection', 'kotlinskidev'),
        'kotlinskidev_render_spam_section',
        'kotlinskidev-settings-general'
    );

    add_settings_field(
        'kotlinskidev_disable_comments',
        esc_html__('Disable comments', 'kotlinskidev'),
        'kotlinskidev_render_disable_comments_field',
        'kotlinskidev-settings-general',
        'kotlinskidev_section_spam'
    );

    register_setting(
        'kotlinskidev_settings_theme_mode',
        'kotlinskidev_theme_switching_enabled',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    register_setting(
        'kotlinskidev_settings_theme_mode',
        'kotlinskidev_theme_default_mode',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_theme_default_mode',
            'default'           => 'auto',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_theme_mode',
        esc_html__('Theme Mode', 'kotlinskidev'),
        'kotlinskidev_render_theme_mode_section',
        'kotlinskidev-settings-theme-mode'
    );

    add_settings_field(
        'kotlinskidev_theme_switching_enabled',
        esc_html__('Light/dark switching', 'kotlinskidev'),
        'kotlinskidev_render_theme_switching_field',
        'kotlinskidev-settings-theme-mode',
        'kotlinskidev_section_theme_mode'
    );

    add_settings_field(
        'kotlinskidev_theme_default_mode',
        esc_html__('Default mode', 'kotlinskidev'),
        'kotlinskidev_render_theme_default_mode_field',
        'kotlinskidev-settings-theme-mode',
        'kotlinskidev_section_theme_mode',
        ['label_for' => 'kotlinskidev_theme_default_mode']
    );

    register_setting(
        'kotlinskidev_settings_breakpoints',
        'kotlinskidev_breakpoint_mobile_max',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_breakpoint_px',
            'default'           => 781,
        ]
    );

    register_setting(
        'kotlinskidev_settings_breakpoints',
        'kotlinskidev_breakpoint_tablet_max',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_breakpoint_px',
            'default'           => 1023,
        ]
    );

    register_setting(
        'kotlinskidev_settings_breakpoints',
        'kotlinskidev_breakpoint_large',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_breakpoint_px',
            'default'           => 1200,
        ]
    );

    add_settings_section(
        'kotlinskidev_section_breakpoints',
        esc_html__('Responsive Breakpoints', 'kotlinskidev'),
        'kotlinskidev_render_breakpoints_section',
        'kotlinskidev-settings-breakpoints'
    );

    add_settings_field(
        'kotlinskidev_breakpoint_mobile_max',
        esc_html__('Mobile max width (px)', 'kotlinskidev'),
        'kotlinskidev_render_breakpoint_mobile_field',
        'kotlinskidev-settings-breakpoints',
        'kotlinskidev_section_breakpoints',
        ['label_for' => 'kotlinskidev_breakpoint_mobile_max']
    );

    add_settings_field(
        'kotlinskidev_breakpoint_tablet_max',
        esc_html__('Tablet max width (px)', 'kotlinskidev'),
        'kotlinskidev_render_breakpoint_tablet_field',
        'kotlinskidev-settings-breakpoints',
        'kotlinskidev_section_breakpoints',
        ['label_for' => 'kotlinskidev_breakpoint_tablet_max']
    );

    add_settings_field(
        'kotlinskidev_breakpoint_large',
        esc_html__('Large desktop min width (px)', 'kotlinskidev'),
        'kotlinskidev_render_breakpoint_large_field',
        'kotlinskidev-settings-breakpoints',
        'kotlinskidev_section_breakpoints',
        ['label_for' => 'kotlinskidev_breakpoint_large']
    );

    register_setting(
        'kotlinskidev_settings_advanced',
        'kotlinskidev_scroll_offset_desktop',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_scroll_offset_px',
            'default'           => KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['desktop'],
        ]
    );

    register_setting(
        'kotlinskidev_settings_advanced',
        'kotlinskidev_scroll_offset_mobile',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_scroll_offset_px',
            'default'           => KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['mobile'],
        ]
    );

    add_settings_section(
        'kotlinskidev_section_scroll_offset',
        esc_html__('Anchor Scroll Offset', 'kotlinskidev'),
        'kotlinskidev_render_scroll_offset_section',
        'kotlinskidev-settings-advanced'
    );

    add_settings_field(
        'kotlinskidev_scroll_offset_desktop',
        esc_html__('Desktop offset (px)', 'kotlinskidev'),
        'kotlinskidev_render_scroll_offset_desktop_field',
        'kotlinskidev-settings-advanced',
        'kotlinskidev_section_scroll_offset',
        ['label_for' => 'kotlinskidev_scroll_offset_desktop']
    );

    add_settings_field(
        'kotlinskidev_scroll_offset_mobile',
        esc_html__('Mobile offset (px)', 'kotlinskidev'),
        'kotlinskidev_render_scroll_offset_mobile_field',
        'kotlinskidev-settings-advanced',
        'kotlinskidev_section_scroll_offset',
        ['label_for' => 'kotlinskidev_scroll_offset_mobile']
    );

    register_setting(
        'kotlinskidev_settings_advanced',
        'kotlinskidev_active_link_state_enabled',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    register_setting(
        'kotlinskidev_settings_advanced',
        'kotlinskidev_active_link_state_block_clicks',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    add_settings_section(
        'kotlinskidev_section_active_link_state',
        esc_html__('Active Page Links', 'kotlinskidev'),
        'kotlinskidev_render_active_link_state_section',
        'kotlinskidev-settings-advanced'
    );

    add_settings_field(
        'kotlinskidev_active_link_state_enabled',
        esc_html__('Highlight active-page links', 'kotlinskidev'),
        'kotlinskidev_render_active_link_state_enabled_field',
        'kotlinskidev-settings-advanced',
        'kotlinskidev_section_active_link_state'
    );

    add_settings_field(
        'kotlinskidev_active_link_state_block_clicks',
        esc_html__('Disable current-page link clicks', 'kotlinskidev'),
        'kotlinskidev_render_active_link_state_block_clicks_field',
        'kotlinskidev-settings-advanced',
        'kotlinskidev_section_active_link_state'
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_enable_custom',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_bg_image',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_logo_image',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_bg_color',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default'           => '#191919',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_accent_color',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default'           => '#8209d3',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_login',
        esc_html__('Login Page Branding', 'kotlinskidev'),
        'kotlinskidev_render_login_section',
        'kotlinskidev-settings-login'
    );

    add_settings_field(
        'kotlinskidev_login_enable_custom',
        esc_html__('Enable custom login', 'kotlinskidev'),
        'kotlinskidev_render_login_enable_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login'
    );

    add_settings_field(
        'kotlinskidev_login_bg_image',
        esc_html__('Background image', 'kotlinskidev'),
        'kotlinskidev_render_login_bg_image_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login',
        ['label_for' => 'kotlinskidev_login_bg_image']
    );

    add_settings_field(
        'kotlinskidev_login_logo_image',
        esc_html__('Logo image', 'kotlinskidev'),
        'kotlinskidev_render_login_logo_image_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login',
        ['label_for' => 'kotlinskidev_login_logo_image']
    );

    add_settings_field(
        'kotlinskidev_login_bg_color',
        esc_html__('Background color', 'kotlinskidev'),
        'kotlinskidev_render_login_bg_color_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login',
        ['label_for' => 'kotlinskidev_login_bg_color']
    );

    add_settings_field(
        'kotlinskidev_login_accent_color',
        esc_html__('Accent color', 'kotlinskidev'),
        'kotlinskidev_render_login_accent_color_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login',
        ['label_for' => 'kotlinskidev_login_accent_color']
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_fb_pixel_loader_pixel_id',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_fb_pixel_loader_custom_script',
        [
            'type'    => 'string',
            'default' => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_ga_loader_ga_id',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_ga_loader_custom_script',
        [
            'type'    => 'string',
            'default' => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_tracking_fb',
        esc_html__('Facebook Pixel', 'kotlinskidev'),
        'kotlinskidev_render_tracking_fb_section',
        'kotlinskidev-settings-tracking'
    );

    add_settings_field(
        'custom_fb_pixel_loader_pixel_id',
        esc_html__('Pixel ID', 'kotlinskidev'),
        'kotlinskidev_render_fb_pixel_id_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_fb',
        ['label_for' => 'custom_fb_pixel_loader_pixel_id']
    );

    add_settings_field(
        'custom_fb_pixel_loader_custom_script',
        esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
        'kotlinskidev_render_fb_pixel_script_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_fb',
        ['label_for' => 'custom_fb_pixel_loader_custom_script']
    );

    add_settings_section(
        'kotlinskidev_section_tracking_ga',
        esc_html__('Google Analytics', 'kotlinskidev'),
        'kotlinskidev_render_tracking_ga_section',
        'kotlinskidev-settings-tracking'
    );

    add_settings_field(
        'custom_ga_loader_ga_id',
        esc_html__('Measurement ID', 'kotlinskidev'),
        'kotlinskidev_render_ga_id_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_ga',
        ['label_for' => 'custom_ga_loader_ga_id']
    );

    add_settings_field(
        'custom_ga_loader_custom_script',
        esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
        'kotlinskidev_render_ga_script_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_ga',
        ['label_for' => 'custom_ga_loader_custom_script']
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'kotlinskidev_enabled_analytics_events',
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_enabled_analytics_events',
            'default'           => array_keys(kotlinskidev_tracked_event_names()),
        ]
    );

    add_settings_section(
        'kotlinskidev_section_tracking_events',
        esc_html__('Custom Event Tracking', 'kotlinskidev'),
        'kotlinskidev_render_tracking_events_section',
        'kotlinskidev-settings-tracking'
    );

    add_settings_field(
        'kotlinskidev_enabled_analytics_events',
        esc_html__('Enabled events', 'kotlinskidev'),
        'kotlinskidev_render_tracking_events_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_events'
    );

    register_setting(
        'kotlinskidev_settings_customization',
        'kotlinskidev_enabled_features',
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_enabled_features',
            'default'           => array_keys(kotlinskidev_toggleable_features()),
        ]
    );

    add_settings_section(
        'kotlinskidev_section_feature_toggles',
        esc_html__('Theme Features', 'kotlinskidev'),
        'kotlinskidev_render_feature_toggles_section',
        'kotlinskidev-settings-customization'
    );

    add_settings_field(
        'kotlinskidev_enabled_features',
        esc_html__('Enabled features', 'kotlinskidev'),
        'kotlinskidev_render_feature_toggles_field',
        'kotlinskidev-settings-customization',
        'kotlinskidev_section_feature_toggles'
    );

    register_setting(
        'kotlinskidev_settings_site_values',
        'kotlinskidev_site_values',
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_site_values',
            'default'           => [],
        ]
    );

    add_settings_section(
        'kotlinskidev_section_site_values',
        esc_html__('Site values', 'kotlinskidev'),
        'kotlinskidev_render_site_values_section',
        'kotlinskidev-settings-site-values'
    );

    add_settings_field(
        'kotlinskidev_site_values',
        esc_html__('Values', 'kotlinskidev'),
        'kotlinskidev_render_site_values_field',
        'kotlinskidev-settings-site-values',
        'kotlinskidev_section_site_values'
    );

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_csp_enabled',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_csp_enforce',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => false,
        ]
    );

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_csp_upgrade_insecure_requests',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    $csp_defaults = kotlinskidev_csp_directive_defaults();
    foreach (array_values(kotlinskidev_csp_directive_option_map()) as $csp_option_key) {
        register_setting(
            'kotlinskidev_settings_security',
            $csp_option_key,
            [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => $csp_defaults[$csp_option_key],
            ]
        );
    }

    add_settings_section(
        'kotlinskidev_section_csp_general',
        esc_html__('Content Security Policy', 'kotlinskidev'),
        'kotlinskidev_render_csp_general_section',
        'kotlinskidev-settings-security'
    );

    add_settings_field(
        'kotlinskidev_csp_enabled',
        esc_html__('Enable CSP', 'kotlinskidev'),
        'kotlinskidev_render_csp_enabled_field',
        'kotlinskidev-settings-security',
        'kotlinskidev_section_csp_general'
    );

    add_settings_field(
        'kotlinskidev_csp_enforce',
        esc_html__('Mode', 'kotlinskidev'),
        'kotlinskidev_render_csp_enforce_field',
        'kotlinskidev-settings-security',
        'kotlinskidev_section_csp_general'
    );

    add_settings_field(
        'kotlinskidev_csp_upgrade_insecure_requests',
        esc_html__('Upgrade insecure requests', 'kotlinskidev'),
        'kotlinskidev_render_csp_upgrade_insecure_requests_field',
        'kotlinskidev-settings-security',
        'kotlinskidev_section_csp_general'
    );

    add_settings_section(
        'kotlinskidev_section_csp_directives',
        esc_html__('CSP Directives', 'kotlinskidev'),
        'kotlinskidev_render_csp_directives_section',
        'kotlinskidev-settings-security'
    );

    foreach (kotlinskidev_csp_directive_labels() as $csp_option_key => $csp_label) {
        add_settings_field(
            $csp_option_key,
            $csp_label,
            'kotlinskidev_render_csp_directive_field',
            'kotlinskidev-settings-security',
            'kotlinskidev_section_csp_directives',
            ['option' => $csp_option_key, 'label_for' => $csp_option_key]
        );
    }

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_referrer_policy',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_referrer_policy',
            'default'           => 'strict-origin-when-cross-origin',
        ]
    );

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_permissions_policy',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => kotlinskidev_permissions_policy_default(),
        ]
    );

    add_settings_section(
        'kotlinskidev_section_other_headers',
        esc_html__('Other Security Headers', 'kotlinskidev'),
        'kotlinskidev_render_other_headers_section',
        'kotlinskidev-settings-security'
    );

    add_settings_field(
        'kotlinskidev_referrer_policy',
        esc_html__('Referrer-Policy', 'kotlinskidev'),
        'kotlinskidev_render_referrer_policy_field',
        'kotlinskidev-settings-security',
        'kotlinskidev_section_other_headers',
        ['label_for' => 'kotlinskidev_referrer_policy']
    );

    add_settings_field(
        'kotlinskidev_permissions_policy',
        esc_html__('Permissions-Policy', 'kotlinskidev'),
        'kotlinskidev_render_permissions_policy_field',
        'kotlinskidev-settings-security',
        'kotlinskidev_section_other_headers',
        ['label_for' => 'kotlinskidev_permissions_policy']
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_address',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_phone',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_email',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_email',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_hours',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_contact',
        esc_html__('Business Contact Details', 'kotlinskidev'),
        'kotlinskidev_render_contact_section',
        'kotlinskidev-settings-contact'
    );

    add_settings_field(
        'kotlinskidev_contact_address',
        esc_html__('Address', 'kotlinskidev'),
        'kotlinskidev_render_contact_address_field',
        'kotlinskidev-settings-contact',
        'kotlinskidev_section_contact'
    );

    add_settings_field(
        'kotlinskidev_contact_phone',
        esc_html__('Phone', 'kotlinskidev'),
        'kotlinskidev_render_contact_phone_field',
        'kotlinskidev-settings-contact',
        'kotlinskidev_section_contact',
        ['label_for' => 'kotlinskidev_contact_phone']
    );

    add_settings_field(
        'kotlinskidev_contact_email',
        esc_html__('Email', 'kotlinskidev'),
        'kotlinskidev_render_contact_email_field',
        'kotlinskidev-settings-contact',
        'kotlinskidev_section_contact',
        ['label_for' => 'kotlinskidev_contact_email']
    );

    add_settings_field(
        'kotlinskidev_contact_hours',
        esc_html__('Business hours', 'kotlinskidev'),
        'kotlinskidev_render_contact_hours_field',
        'kotlinskidev-settings-contact',
        'kotlinskidev_section_contact'
    );

    register_setting(
        'kotlinskidev_settings_monitoring',
        'kotlinskidev_sentry_dsn',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_monitoring',
        esc_html__('Sentry', 'kotlinskidev'),
        'kotlinskidev_render_monitoring_section',
        'kotlinskidev-settings-monitoring'
    );

    add_settings_field(
        'kotlinskidev_sentry_dsn',
        esc_html__('DSN', 'kotlinskidev'),
        'kotlinskidev_render_sentry_dsn_field',
        'kotlinskidev-settings-monitoring',
        'kotlinskidev_section_monitoring',
        ['label_for' => 'kotlinskidev_sentry_dsn']
    );

    register_setting(
        'kotlinskidev_settings_monitoring',
        'kotlinskidev_ntfy_alert_url',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_ntfy_alert_url',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_alerts',
        esc_html__('Alerts', 'kotlinskidev'),
        'kotlinskidev_render_alerts_section',
        'kotlinskidev-settings-monitoring'
    );

    add_settings_field(
        'kotlinskidev_ntfy_alert_url',
        esc_html__('ntfy topic URL', 'kotlinskidev'),
        'kotlinskidev_render_ntfy_alert_url_field',
        'kotlinskidev-settings-monitoring',
        'kotlinskidev_section_alerts',
        ['label_for' => 'kotlinskidev_ntfy_alert_url']
    );
}

function kotlinskidev_render_monitoring_section(): void
{
    echo '<p>' . esc_html__('Reports uncaught PHP exceptions and fatal errors (the class of bug that shows visitors a broken page) to Sentry. Regular warnings/notices/deprecations are not sent — this is scoped to failures that actually break a page, to stay well inside a free-tier event quota. Only active when WP_DEBUG is off, so local development never sends events.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_sentry_dsn_field(): void
{
    $value = get_option('kotlinskidev_sentry_dsn', '');
    ?>
    <input type="url" id="kotlinskidev_sentry_dsn" name="kotlinskidev_sentry_dsn" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="https://examplePublicKey@o0.ingest.sentry.io/0" />
    <p class="description">
        <?php esc_html_e('From your Sentry project (Settings → Client Keys). Leave empty to disable reporting.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_alerts_section(): void
{
    echo '<p>' . esc_html__('Sends a push notification when the site fails to send an email, independently of the mailer that failed. Install the ntfy app on your phone, choose a long random topic name, subscribe to it in the app, then paste https://ntfy.sh/<topic> below. Only the site host, the time and a short error message are sent; no visitor data is ever sent.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_ntfy_alert_url_field(): void
{
    $value = get_option('kotlinskidev_ntfy_alert_url', '');
    ?>
    <input type="url" id="kotlinskidev_ntfy_alert_url" name="kotlinskidev_ntfy_alert_url" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="https://ntfy.sh/your-long-random-topic" />
    <p class="description">
        <?php esc_html_e('Treat this URL like a password: anyone who knows the topic can read the alerts. Leave empty to disable alerts and the weekly mail check.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_contact_section(): void
{
    echo '<p>' . esc_html__('Used on the contact card shown across the site (e.g. city landing pages). Address, phone, and email are shown obfuscated on the frontend and only revealed after a click, via the same protection used by the Protected Content block.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_contact_translations_url(): string
{
    return admin_url('admin.php?page=mlang_strings&group=' . rawurlencode('kotlinskidev'));
}

function kotlinskidev_render_translatable_contact_field(string $name, string $value, string $placeholder): void
{
    $field_id = 'kotlinskidev-field-' . $name;
    ?>
    <input
        type="text"
        id="<?php echo esc_attr($field_id); ?>"
        name="<?php echo esc_attr($name); ?>"
        value="<?php echo esc_attr($value); ?>"
        class="regular-text"
        placeholder="<?php echo esc_attr($placeholder); ?>"
        readonly
    />
    <button
        type="button"
        class="button button-small"
        onclick="document.getElementById('<?php echo esc_js($field_id); ?>').readOnly = false; this.remove();"
    ><?php esc_html_e('Edit source text', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('This is the source text shown until a per-language translation exists.', 'kotlinskidev'); ?>
        <a href="<?php echo esc_url(kotlinskidev_contact_translations_url()); ?>"><?php esc_html_e('Translate per language →', 'kotlinskidev'); ?></a>
    </p>
    <?php
}

function kotlinskidev_render_contact_address_field(): void
{
    kotlinskidev_render_translatable_contact_field(
        'kotlinskidev_contact_address',
        get_option('kotlinskidev_contact_address', ''),
        '40-143 Katowice, ul. Dekerta'
    );
}

function kotlinskidev_render_contact_phone_field(): void
{
    $value = get_option('kotlinskidev_contact_phone', '');
    ?>
    <input type="text" id="kotlinskidev_contact_phone" name="kotlinskidev_contact_phone" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="+48 608 418 911" />
    <?php
}

function kotlinskidev_render_contact_email_field(): void
{
    $value = get_option('kotlinskidev_contact_email', '');
    ?>
    <input type="email" id="kotlinskidev_contact_email" name="kotlinskidev_contact_email" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="contact@example.com" />
    <?php
}

function kotlinskidev_render_contact_hours_field(): void
{
    kotlinskidev_render_translatable_contact_field(
        'kotlinskidev_contact_hours',
        get_option('kotlinskidev_contact_hours', ''),
        'Mon-Fri 8:00-17:00'
    );
    echo '<p class="description">' . esc_html__('Shown as plain text — not sensitive, so not obfuscated.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_sanitize_theme_default_mode(string $value): string
{
    return in_array($value, ['auto', 'light', 'dark'], true) ? $value : 'auto';
}

function kotlinskidev_sanitize_breakpoint_px($value): int
{
    return max(320, min(1920, absint($value)));
}

function kotlinskidev_sanitize_scroll_offset_px($value): int
{
    return max(0, min(400, absint($value)));
}

function kotlinskidev_sanitize_referrer_policy(string $value): string
{
    return in_array($value, kotlinskidev_referrer_policy_choices(), true) ? $value : 'strict-origin-when-cross-origin';
}

function kotlinskidev_render_spam_section(): void
{
    echo '<p>' . esc_html__('This site does not use comments. Enabling this protection closes comments at the server level — spam bots that POST directly to wp-comments-post.php or call XML-RPC comment methods are rejected with a 403 before any database write or email notification occurs. WordPress Discussion settings alone do not stop this traffic.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_disable_comments_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_disable_comments', true);
    ?>
    <label>
        <input
            type="checkbox"
            name="kotlinskidev_disable_comments"
            value="1"
            <?php checked($enabled); ?>
        />
        <?php esc_html_e('Block all comment submissions site-wide (recommended)', 'kotlinskidev'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Hooks into preprocess_comment and xmlrpc_methods. Removes comment UI from the block editor and admin menu.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_theme_mode_section(): void
{
    echo '<p>' . esc_html__('Controls the light/dark color mode. When switching is disabled, the theme switcher button is hidden and the site stays locked to the default mode.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_theme_switching_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_theme_switching_enabled', true);
    ?>
    <label>
        <input
            type="checkbox"
            name="kotlinskidev_theme_switching_enabled"
            value="1"
            <?php checked($enabled); ?>
        />
        <?php esc_html_e('Show the theme switcher and let visitors toggle light/dark mode', 'kotlinskidev'); ?>
    </label>
    <?php
}

function kotlinskidev_render_theme_default_mode_field(): void
{
    $mode = kotlinskidev_sanitize_theme_default_mode((string) get_option('kotlinskidev_theme_default_mode', 'auto'));
    $options = [
        'auto'  => esc_html__('Auto (visitor system preference)', 'kotlinskidev'),
        'light' => esc_html__('Light', 'kotlinskidev'),
        'dark'  => esc_html__('Dark', 'kotlinskidev'),
    ];
    ?>
    <select id="kotlinskidev_theme_default_mode" name="kotlinskidev_theme_default_mode">
        <?php foreach ($options as $value => $label) : ?>
            <option value="<?php echo esc_attr($value); ?>" <?php selected($mode, $value); ?>>
                <?php echo esc_html($label); ?>
            </option>
        <?php endforeach; ?>
    </select>
    <p class="description">
        <?php esc_html_e('Initial mode for visitors without a saved preference. With switching disabled, this is the only mode used.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_breakpoints_section(): void
{
    $breakpoints = kotlinskidev_get_breakpoints();
    echo '<p>' . esc_html__('One source of truth for responsive ranges. These values drive the compiled theme CSS (media queries are rewritten at runtime and cached), the editor responsive controls, frontend scripts, and any plugin reading the mobile_breakpoint / tablet_breakpoint theme mods.', 'kotlinskidev') . '</p>';
    echo '<table class="widefat striped" style="max-width:34rem;margin-bottom:1rem;"><thead><tr><th>'
        . esc_html__('Range', 'kotlinskidev') . '</th><th>'
        . esc_html__('Effective values', 'kotlinskidev') . '</th></tr></thead><tbody>';
    echo '<tr><td>' . esc_html__('Mobile', 'kotlinskidev') . '</td><td>0 – ' . esc_html((string) $breakpoints['mobile_max']) . 'px</td></tr>';
    echo '<tr><td>' . esc_html__('Tablet', 'kotlinskidev') . '</td><td>' . esc_html((string) $breakpoints['tablet_min']) . ' – ' . esc_html((string) $breakpoints['tablet_max']) . 'px</td></tr>';
    echo '<tr><td>' . esc_html__('Desktop', 'kotlinskidev') . '</td><td>≥ ' . esc_html((string) $breakpoints['desktop_min']) . 'px</td></tr>';
    echo '<tr><td>' . esc_html__('Large desktop', 'kotlinskidev') . '</td><td>≥ ' . esc_html((string) $breakpoints['large']) . 'px</td></tr>';
    echo '</tbody></table>';
}

function kotlinskidev_render_breakpoint_mobile_field(): void
{
    $value = (int) get_option('kotlinskidev_breakpoint_mobile_max', 781);
    ?>
    <input type="number" id="kotlinskidev_breakpoint_mobile_max" name="kotlinskidev_breakpoint_mobile_max" value="<?php echo esc_attr((string) $value); ?>" min="320" max="1023" step="1" />
    <p class="description">
        <?php esc_html_e('Screens up to this width are mobile. Tablet starts at this value + 1px. Theme default: 781.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_breakpoint_tablet_field(): void
{
    $value = (int) get_option('kotlinskidev_breakpoint_tablet_max', 1023);
    ?>
    <input type="number" id="kotlinskidev_breakpoint_tablet_max" name="kotlinskidev_breakpoint_tablet_max" value="<?php echo esc_attr((string) $value); ?>" min="768" max="1399" step="1" />
    <p class="description">
        <?php esc_html_e('Screens up to this width are tablet. Desktop starts at this value + 1px. Theme default: 1023.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_breakpoint_large_field(): void
{
    $value = (int) get_option('kotlinskidev_breakpoint_large', 1200);
    ?>
    <input type="number" id="kotlinskidev_breakpoint_large" name="kotlinskidev_breakpoint_large" value="<?php echo esc_attr((string) $value); ?>" min="1024" max="1920" step="1" />
    <p class="description">
        <?php esc_html_e('Wide-desktop refinements (e.g. wider content container) start here. Theme default: 1200.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_scroll_offset_section(): void
{
    echo '<p>' . esc_html__('Distance kept between the sticky header and the target when clicking an in-page anchor link (e.g. "#services"). Desktop keeps its floating header visible at all times, so it needs the full header height as clearance. Mobile hides the header while scrolling and only re-shows it near the top of the page, so it typically needs little or no offset.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_scroll_offset_desktop_field(): void
{
    $default = KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['desktop'];
    $value   = (int) get_option('kotlinskidev_scroll_offset_desktop', $default);
    ?>
    <input type="number" id="kotlinskidev_scroll_offset_desktop" name="kotlinskidev_scroll_offset_desktop" value="<?php echo esc_attr((string) $value); ?>" min="0" max="400" step="1" />
    <p class="description">
        <?php
        printf(
            /* translators: %d: default desktop scroll offset in pixels */
            esc_html__('Applies above the desktop breakpoint, where the header stays visible while scrolling. Theme default: %d (matches the header height).', 'kotlinskidev'),
            (int) $default
        );
        ?>
    </p>
    <?php
}

function kotlinskidev_render_scroll_offset_mobile_field(): void
{
    $default = KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['mobile'];
    $value   = (int) get_option('kotlinskidev_scroll_offset_mobile', $default);
    ?>
    <input type="number" id="kotlinskidev_scroll_offset_mobile" name="kotlinskidev_scroll_offset_mobile" value="<?php echo esc_attr((string) $value); ?>" min="0" max="400" step="1" />
    <p class="description">
        <?php
        printf(
            /* translators: %d: default mobile scroll offset in pixels */
            esc_html__('Applies below the desktop breakpoint, where the header hides on scroll. Theme default: %d, since the header is typically hidden by the time the scroll finishes.', 'kotlinskidev'),
            (int) $default
        );
        ?>
    </p>
    <?php
}

function kotlinskidev_render_active_link_state_section(): void
{
    echo '<p>' . esc_html__('When a link (navigation, button, in-content) points at the page currently being viewed, it can be marked as active — the same gradient-text/underline style normally reserved for hover — and/or prevented from being clicked, since navigating to the page a visitor is already on does nothing useful. Individual blocks can still opt out from their own Advanced panel regardless of these settings.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_active_link_state_enabled_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_active_link_state_enabled', true);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_active_link_state_enabled" value="1" <?php checked($enabled); ?> />
        <?php esc_html_e('Mark links pointing at the current page with the active hover-style highlight', 'kotlinskidev'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Adds a kt-link-current class and aria-current="page" to matching links sitewide (navigation, footer, hamburger, mega menu, popular pages).', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_active_link_state_block_clicks_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_active_link_state_block_clicks', true);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_active_link_state_block_clicks" value="1" <?php checked($enabled); ?> />
        <?php esc_html_e('Prevent clicking a link/button that points at the page currently being viewed', 'kotlinskidev'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Adds aria-disabled and removes the link from tab order. Menu items that also open a mega-menu panel stay fully interactive. Has no effect if highlighting above is disabled.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_login_default_bg_image(): string
{
    return get_template_directory_uri() . '/assets/images/kotlinskidev-background.webp';
}

function kotlinskidev_login_default_logo_image(): string
{
    return get_template_directory_uri() . '/assets/images/kotlinskidev-logo.webp';
}

function kotlinskidev_render_login_section(): void
{
    echo '<p>' . esc_html__('Customize the wp-login.php background, logo, and accent color.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_login_enable_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_login_enable_custom', true);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_login_enable_custom" value="1" <?php checked($enabled); ?> />
        <?php esc_html_e('Enable custom login page styling', 'kotlinskidev'); ?>
    </label>
    <?php
}

function kotlinskidev_render_login_bg_image_field(): void
{
    $value = get_option('kotlinskidev_login_bg_image', '');
    ?>
    <input type="url" id="kotlinskidev_login_bg_image" name="kotlinskidev_login_bg_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
    <button type="button" class="button kotlinskidev-login-media-button" data-target="kotlinskidev_login_bg_image"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('Defaults to the theme background image when left empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_login_logo_image_field(): void
{
    $value = get_option('kotlinskidev_login_logo_image', '');
    ?>
    <input type="url" id="kotlinskidev_login_logo_image" name="kotlinskidev_login_logo_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
    <button type="button" class="button kotlinskidev-login-media-button" data-target="kotlinskidev_login_logo_image"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('Defaults to the theme logo when left empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_login_bg_color_field(): void
{
    $value = get_option('kotlinskidev_login_bg_color', '#191919');
    ?>
    <input type="color" id="kotlinskidev_login_bg_color" name="kotlinskidev_login_bg_color" value="<?php echo esc_attr($value); ?>" />
    <p class="description"><?php esc_html_e('Fallback background color when no image loads.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_login_accent_color_field(): void
{
    $value = get_option('kotlinskidev_login_accent_color', '#8209d3');
    ?>
    <input type="color" id="kotlinskidev_login_accent_color" name="kotlinskidev_login_accent_color" value="<?php echo esc_attr($value); ?>" />
    <p class="description"><?php esc_html_e('Color for links and hover effects.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_enqueue_login_settings_media(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'login' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', '
        document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll(".kotlinskidev-login-media-button").forEach(function (button) {
                button.addEventListener("click", function () {
                    var targetInput = document.getElementsByName(button.dataset.target)[0];
                    var uploader = wp.media({
                        title: "Choose Image",
                        button: { text: "Use Image" },
                        multiple: false,
                    });
                    uploader.on("select", function () {
                        var attachment = uploader.state().get("selection").first().toJSON();
                        targetInput.value = attachment.url;
                    });
                    uploader.open();
                });
            });
        });
    ');
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_login_settings_media');

function kotlinskidev_render_tracking_fb_section(): void
{
    echo '<p>' . esc_html__('Loads the Facebook Pixel on the frontend only (not in wp-admin or REST responses), gated behind Complianz\'s "marketing" consent category — it only executes once a visitor accepts marketing cookies. A pasted custom script is output as-is and is not consent-gated automatically.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_fb_pixel_id_field(): void
{
    $value = get_option('custom_fb_pixel_loader_pixel_id', '');
    ?>
    <input type="text" id="custom_fb_pixel_loader_pixel_id" name="custom_fb_pixel_loader_pixel_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="123456789012345" />
    <?php
}

function kotlinskidev_render_fb_pixel_script_field(): void
{
    $value = get_option('custom_fb_pixel_loader_custom_script', '');
    ?>
    <textarea id="custom_fb_pixel_loader_custom_script" name="custom_fb_pixel_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_ga_section(): void
{
    echo '<p>' . esc_html__('Loads Google Analytics (gtag.js) on the frontend only (not in wp-admin or REST responses), gated behind Complianz\'s "statistics" consent category — it only executes once a visitor accepts statistics cookies. A pasted custom script is output as-is and is not consent-gated automatically.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_ga_id_field(): void
{
    $value = get_option('custom_ga_loader_ga_id', '');
    ?>
    <input type="text" id="custom_ga_loader_ga_id" name="custom_ga_loader_ga_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="G-XXXXXXXXXX" />
    <?php
}

function kotlinskidev_render_ga_script_field(): void
{
    $value = get_option('custom_ga_loader_custom_script', '');
    ?>
    <textarea id="custom_ga_loader_custom_script" name="custom_ga_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_events_section(): void
{
    echo '<p>' . esc_html__('Custom GA4/Meta events this theme sends beyond a plain pageview (CTA clicks, form completions, lightbox opens, etc.). Unchecking one stops it going to every connected platform at once — for per-platform routing (e.g. an event reaching GA4 but not Meta), that stays a code-level decision in routing.ts. See docs/tracking-spec.md for what each event tracks.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_tracking_events_field(): void
{
    $enabled = kotlinskidev_get_enabled_analytics_events();
    ?>
    <input type="hidden" name="kotlinskidev_enabled_analytics_events[]" value="" />
    <?php foreach (kotlinskidev_tracked_event_names() as $event_name => $label) : ?>
        <label style="display:block;margin-bottom:0.25rem;">
            <input
                type="checkbox"
                name="kotlinskidev_enabled_analytics_events[]"
                value="<?php echo esc_attr($event_name); ?>"
                <?php checked(in_array($event_name, $enabled, true)); ?>
            />
            <?php echo esc_html($label); ?>
            <code><?php echo esc_html($event_name); ?></code>
        </label>
    <?php endforeach; ?>
    <?php
}

function kotlinskidev_render_feature_toggles_section(): void
{
    echo '<p>' . esc_html__('Each of these registers its own custom post type, blocks, and admin screens. If this theme is reused for a project that doesn\'t need one, switching it off here skips that registration entirely instead of just hiding it — fewer blocks for the editor to discover, no unused admin menu items.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_feature_toggles_field(): void
{
    $enabled = kotlinskidev_get_enabled_features();
    ?>
    <input type="hidden" name="kotlinskidev_enabled_features[]" value="" />
    <?php foreach (kotlinskidev_toggleable_features() as $feature_key => $label) : ?>
        <label style="display:block;margin-bottom:0.25rem;">
            <input
                type="checkbox"
                name="kotlinskidev_enabled_features[]"
                value="<?php echo esc_attr($feature_key); ?>"
                <?php checked(in_array($feature_key, $enabled, true)); ?>
            />
            <?php echo esc_html($label); ?>
            <code><?php echo esc_html($feature_key); ?></code>
        </label>
    <?php endforeach; ?>
    <p class="description"><?php esc_html_e('Changes take effect on the next page load — WordPress re-registers post types and blocks on every request, nothing to rebuild.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_csp_general_section(): void
{
    echo '<p>' . esc_html__('Controls the Content-Security-Policy header sent on frontend responses (never on wp-admin or REST requests). Each directive below is a space-separated list of sources, exactly as it appears in a real CSP header — clear a field to omit that directive entirely. Defaults match this theme\'s own third-party inventory (Google Fonts/Maps, Facebook Pixel, Google Analytics, Cloudflare Turnstile); edit them to match whatever a given site actually loads.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_csp_enabled_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_csp_enabled', true);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_csp_enabled" value="1" <?php checked($enabled); ?> />
        <?php esc_html_e('Send a Content-Security-Policy header', 'kotlinskidev'); ?>
    </label>
    <?php
}

function kotlinskidev_render_csp_enforce_field(): void
{
    $enforce = (bool) get_option('kotlinskidev_csp_enforce', false);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_csp_enforce" value="1" <?php checked($enforce); ?> />
        <?php esc_html_e('Enforce the policy (blocks violations)', 'kotlinskidev'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Leave unchecked to send Content-Security-Policy-Report-Only instead — the browser reports violations to the console without blocking anything. Recommended for at least a few days on a new site before enforcing.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_csp_upgrade_insecure_requests_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_csp_upgrade_insecure_requests', true);
    ?>
    <label>
        <input type="checkbox" name="kotlinskidev_csp_upgrade_insecure_requests" value="1" <?php checked($enabled); ?> />
        <?php esc_html_e('Add the upgrade-insecure-requests directive', 'kotlinskidev'); ?>
    </label>
    <?php
}

function kotlinskidev_render_csp_directives_section(): void
{
    echo '<p>' . esc_html__('One field per CSP directive. Values are sanitized as plain text (no HTML, no line breaks) before being sent in the header.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_csp_directive_field(array $args): void
{
    $option  = $args['option'];
    $default = kotlinskidev_csp_directive_defaults()[$option];
    $value   = (string) get_option($option, $default);
    ?>
    <input type="text" id="<?php echo esc_attr($option); ?>" name="<?php echo esc_attr($option); ?>" value="<?php echo esc_attr($value); ?>" class="large-text code" placeholder="<?php echo esc_attr($default); ?>" />
    <?php
}

function kotlinskidev_render_other_headers_section(): void
{
    echo '<p>' . esc_html__('Referrer-Policy and Permissions-Policy are sent on every frontend response (never on wp-admin or REST requests). Set independently per site — no need to touch code to give a different customer a different policy.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_referrer_policy_field(): void
{
    $value = kotlinskidev_sanitize_referrer_policy((string) get_option('kotlinskidev_referrer_policy', 'strict-origin-when-cross-origin'));
    ?>
    <select id="kotlinskidev_referrer_policy" name="kotlinskidev_referrer_policy">
        <?php foreach (kotlinskidev_referrer_policy_choices() as $choice) : ?>
            <option value="<?php echo esc_attr($choice); ?>" <?php selected($value, $choice); ?>>
                <?php echo esc_html($choice); ?>
            </option>
        <?php endforeach; ?>
    </select>
    <p class="description">
        <?php esc_html_e('Controls how much of the current page URL is sent to other sites when a visitor follows a link away from this one. strict-origin-when-cross-origin is a balanced default.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_permissions_policy_field(): void
{
    $value = get_option('kotlinskidev_permissions_policy', kotlinskidev_permissions_policy_default());
    ?>
    <textarea id="kotlinskidev_permissions_policy" name="kotlinskidev_permissions_policy" rows="4" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description">
        <?php esc_html_e('Full Permissions-Policy header value. Clear this field to stop sending the header entirely — it will not fall back to a default once saved empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_site_values_languages(): array
{
    if (!function_exists('pll_languages_list')) {
        return [];
    }
    $slugs = pll_languages_list(['fields' => 'slug']);
    $names = pll_languages_list(['fields' => 'name']);
    if (!is_array($slugs) || [] === $slugs) {
        return [];
    }
    $names = is_array($names) ? array_values($names) : [];
    $out   = [];
    foreach (array_values($slugs) as $i => $slug) {
        $out[(string) $slug] = (string) ($names[$i] ?? $slug);
    }
    return $out;
}

function kotlinskidev_render_site_values_section(): void
{
    echo '<p>' . esc_html__('Named values that can be reused anywhere in content. Write {token:key} in a paragraph, heading, button or menu item and it is replaced with the current value when the page is rendered. Unknown keys are left as plain text.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_site_value_row(string $index, array $row, array $languages): void
{
    $key    = (string) ($row['key'] ?? '');
    $type   = (string) ($row['type'] ?? 'static');
    $value  = $row['value'] ?? '';
    $name   = 'kotlinskidev_site_values[' . $index . ']';
    $labels = [
        'years_since'  => esc_html__('Years since', 'kotlinskidev'),
        'current_year' => esc_html__('Current year', 'kotlinskidev'),
        'static'       => esc_html__('Static text', 'kotlinskidev'),
    ];
    ?>
    <tr class="kotlinskidev-site-value-row" data-type="<?php echo esc_attr($type); ?>">
        <td>
            <input type="text" name="<?php echo esc_attr($name); ?>[key]" value="<?php echo esc_attr($key); ?>" class="regular-text kotlinskidev-site-value-key" pattern="[a-z0-9_\-]+" required />
            <p class="description"><code class="kotlinskidev-site-value-token">{token:<?php echo esc_html($key); ?>}</code></p>
        </td>
        <td>
            <select name="<?php echo esc_attr($name); ?>[type]" class="kotlinskidev-site-value-type">
                <?php foreach (kotlinskidev_site_value_types() as $option) : ?>
                    <option value="<?php echo esc_attr($option); ?>" <?php selected($type, $option); ?>><?php echo esc_html($labels[$option]); ?></option>
                <?php endforeach; ?>
            </select>
        </td>
        <td>
            <div class="kotlinskidev-site-value-field" data-for="years_since">
                <input type="text" name="<?php echo esc_attr($name); ?>[source]" value="<?php echo esc_attr('years_since' === $type ? (string) $value : ''); ?>" placeholder="2020 / 2020-03-01" <?php disabled('years_since' !== $type); ?> />
                <p class="description"><?php esc_html_e('Start year (2020) or full date (2020-03-01). Resolves to the whole years elapsed.', 'kotlinskidev'); ?></p>
            </div>
            <div class="kotlinskidev-site-value-field" data-for="current_year">
                <p class="description"><?php esc_html_e('Resolves to the current year automatically.', 'kotlinskidev'); ?></p>
            </div>
            <div class="kotlinskidev-site-value-field" data-for="static">
                <?php if ([] === $languages) : ?>
                    <input type="text" class="regular-text" name="<?php echo esc_attr($name); ?>[value]" value="<?php echo esc_attr(is_array($value) ? (string) reset($value) : (string) $value); ?>" <?php disabled('static' !== $type); ?> />
                <?php else : ?>
                    <?php foreach ($languages as $slug => $language_name) : ?>
                        <label style="display:block;margin-bottom:0.25rem;">
                            <span><?php echo esc_html($language_name); ?></span>
                            <input type="text" class="regular-text" name="<?php echo esc_attr($name); ?>[value][<?php echo esc_attr($slug); ?>]" value="<?php echo esc_attr(is_array($value) ? (string) ($value[$slug] ?? '') : (string) $value); ?>" <?php disabled('static' !== $type); ?> />
                        </label>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </td>
        <td>
            <button type="button" class="button kotlinskidev-site-value-remove"><?php esc_html_e('Remove', 'kotlinskidev'); ?></button>
        </td>
    </tr>
    <?php
}

function kotlinskidev_render_site_values_field(): void
{
    $rows      = array_values(kotlinskidev_get_site_values());
    $languages = kotlinskidev_site_values_languages();
    ?>
    <table class="widefat striped kotlinskidev-site-values" id="kotlinskidev-site-values">
        <thead>
            <tr>
                <th><?php esc_html_e('Key', 'kotlinskidev'); ?></th>
                <th><?php esc_html_e('Type', 'kotlinskidev'); ?></th>
                <th><?php esc_html_e('Value', 'kotlinskidev'); ?></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($rows as $i => $row) : ?>
                <?php kotlinskidev_render_site_value_row((string) $i, $row, $languages); ?>
            <?php endforeach; ?>
        </tbody>
    </table>
    <p><button type="button" class="button" id="kotlinskidev-site-value-add"><?php esc_html_e('Add value', 'kotlinskidev'); ?></button></p>
    <p class="description"><?php esc_html_e('Keys use lowercase letters, numbers, dashes and underscores, and must be unique. Rows with an empty or duplicate key are dropped on save.', 'kotlinskidev'); ?></p>
    <template id="kotlinskidev-site-value-template">
        <?php kotlinskidev_render_site_value_row('__INDEX__', ['type' => 'years_since'], $languages); ?>
    </template>
    <?php
}

function kotlinskidev_enqueue_site_values_script(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'site-values' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_register_script('kotlinskidev-site-values-admin', '', [], null, true);
    wp_enqueue_script('kotlinskidev-site-values-admin');
    wp_add_inline_script('kotlinskidev-site-values-admin', <<<'JS'
document.addEventListener("DOMContentLoaded", function () {
    var table = document.getElementById("kotlinskidev-site-values");
    var template = document.getElementById("kotlinskidev-site-value-template");
    var addButton = document.getElementById("kotlinskidev-site-value-add");
    if (!table || !template || !addButton) {
        return;
    }
    var body = table.querySelector("tbody");
    var counter = body.querySelectorAll("tr").length;

    function syncRow(row) {
        var type = row.querySelector(".kotlinskidev-site-value-type").value;
        row.dataset.type = type;
        row.querySelectorAll(".kotlinskidev-site-value-field").forEach(function (field) {
            var active = field.dataset.for === type;
            field.hidden = !active;
            field.querySelectorAll("input").forEach(function (input) {
                input.disabled = !active;
            });
        });
        row.querySelector(".kotlinskidev-site-value-token").textContent =
            "{token:" + row.querySelector(".kotlinskidev-site-value-key").value + "}";
    }

    body.querySelectorAll("tr").forEach(syncRow);

    body.addEventListener("input", function (event) {
        var row = event.target.closest("tr");
        if (row) {
            syncRow(row);
        }
    });
    body.addEventListener("change", function (event) {
        var row = event.target.closest("tr");
        if (row) {
            syncRow(row);
        }
    });
    body.addEventListener("click", function (event) {
        var remove = event.target.closest(".kotlinskidev-site-value-remove");
        if (remove) {
            remove.closest("tr").remove();
        }
    });
    addButton.addEventListener("click", function () {
        var html = template.innerHTML.split("__INDEX__").join(String(counter));
        counter += 1;
        body.insertAdjacentHTML("beforeend", html);
        syncRow(body.lastElementChild);
    });
});
JS);
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_site_values_script');

function kotlinskidev_register_seo_settings(): void
{
    if (! kotlinskidev_feature_enabled('custom_seo')) {
        return;
    }

    register_setting(
        'kotlinskidev_settings_seo',
        KOTLINSKIDEV_SEO_IDENTITY_OPTION,
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_seo_identity',
            'default'           => [],
        ]
    );

    foreach (kotlinskidev_seo_identity_sections() as $section_id => $section) {
        add_settings_section(
            $section_id,
            $section['title'],
            'kotlinskidev_render_seo_identity_section',
            'kotlinskidev-settings-seo'
        );
        foreach ($section['fields'] as $key => $field) {
            add_settings_field(
                'kotlinskidev_seo_' . $key,
                $field['label'],
                'kotlinskidev_render_seo_identity_field',
                'kotlinskidev-settings-seo',
                $section_id,
                [
                    'key'         => $key,
                    'type'        => $field['type'],
                    'label_for'   => 'kotlinskidev_seo_' . $key,
                    'description' => $field['description'] ?? '',
                ]
            );
        }
    }
}
add_action('admin_init', 'kotlinskidev_register_seo_settings');

function kotlinskidev_seo_identity_sections(): array
{
    return [
        'kotlinskidev_section_seo_organization' => [
            'title'       => esc_html__('Organization', 'kotlinskidev'),
            'description' => esc_html__('Business entity published in the structured data (JSON-LD) on every page.', 'kotlinskidev'),
            'fields'      => [
                'org_name'            => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'org_alternate_names' => ['label' => esc_html__('Alternate names', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One per line.', 'kotlinskidev')],
                'description'         => ['label' => esc_html__('Description', 'kotlinskidev'), 'type' => 'lang_textarea', 'description' => esc_html__('Per language. When empty, the site tagline is used for the website only.', 'kotlinskidev')],
                'logo_id'             => ['label' => esc_html__('Logo', 'kotlinskidev'), 'type' => 'image', 'description' => esc_html__('PNG or WebP, at least 112 x 112 px. SVG is ignored. Falls back to the site icon.', 'kotlinskidev')],
                'social_profiles'     => ['label' => esc_html__('Social profiles', 'kotlinskidev'), 'type' => 'url_list', 'description' => esc_html__('One http(s) URL per line.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_person' => [
            'title'       => esc_html__('Person', 'kotlinskidev'),
            'description' => esc_html__('The founder shown as author of articles and owner of the organization.', 'kotlinskidev'),
            'fields'      => [
                'person_name'     => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'job_title'       => ['label' => esc_html__('Job title', 'kotlinskidev'), 'type' => 'lang_text', 'description' => esc_html__('Per language.', 'kotlinskidev')],
                'person_image_id' => ['label' => esc_html__('Image', 'kotlinskidev'), 'type' => 'image', 'description' => esc_html__('When empty, the organization logo is referenced instead.', 'kotlinskidev')],
                'about_page_slug' => ['label' => esc_html__('About page slug', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Default-language slug of the page used as the person URL.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_location' => [
            'title'       => esc_html__('Location & expertise', 'kotlinskidev'),
            'description' => esc_html__('Only city, region and country are published. The street address is never exposed.', 'kotlinskidev'),
            'fields'      => [
                'address_locality' => ['label' => esc_html__('City', 'kotlinskidev'), 'type' => 'text'],
                'address_region'   => ['label' => esc_html__('Region', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Optional.', 'kotlinskidev')],
                'address_country'  => ['label' => esc_html__('Country code', 'kotlinskidev'), 'type' => 'country', 'description' => esc_html__('Two-letter ISO code, for example PL.', 'kotlinskidev')],
                'area_served'      => ['label' => esc_html__('Area served', 'kotlinskidev'), 'type' => 'text'],
                'knows_about'      => ['label' => esc_html__('Knows about', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One topic per line.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_contact' => [
            'title'       => esc_html__('Contact point', 'kotlinskidev'),
            'description' => esc_html__('Contact point published with the organization.', 'kotlinskidev'),
            'fields'      => [
                'contact_type'      => ['label' => esc_html__('Contact type', 'kotlinskidev'), 'type' => 'text'],
                'contact_languages' => ['label' => esc_html__('Available languages', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('Language codes, one per line.', 'kotlinskidev')],
                'contact_page_slug' => ['label' => esc_html__('Contact page slug', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Default-language slug of the contact page.', 'kotlinskidev')],
                'expose_contact'    => ['label' => esc_html__('Publish email and phone', 'kotlinskidev'), 'type' => 'checkbox', 'description' => esc_html__('Publishes the Contact Info email and phone in the JSON-LD.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_website' => [
            'title'       => esc_html__('Website', 'kotlinskidev'),
            'description' => esc_html__('Website entity published in the structured data.', 'kotlinskidev'),
            'fields'      => [
                'website_name'            => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'website_alternate_names' => ['label' => esc_html__('Alternate names', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One per line.', 'kotlinskidev')],
            ],
        ],
    ];
}

function kotlinskidev_render_seo_identity_section(array $section): void
{
    $sections = kotlinskidev_seo_identity_sections();
    $text     = $sections[$section['id']]['description'] ?? '';
    if ('' !== $text) {
        echo '<p>' . esc_html($text) . '</p>';
    }
}

function kotlinskidev_seo_identity_language_slugs(array $map): array
{
    $languages = array_keys(kotlinskidev_site_values_languages());
    if ([] !== $languages) {
        return $languages;
    }
    $slugs = array_keys($map);
    return [] !== $slugs ? $slugs : ['en'];
}

function kotlinskidev_render_seo_identity_field(array $args): void
{
    $key         = (string) ($args['key'] ?? '');
    $type        = (string) ($args['type'] ?? 'text');
    $id          = (string) ($args['label_for'] ?? '');
    $description = (string) ($args['description'] ?? '');
    $identity    = kotlinskidev_get_seo_identity();
    $value       = $identity[$key] ?? '';
    $name        = KOTLINSKIDEV_SEO_IDENTITY_OPTION . '[' . $key . ']';

    switch ($type) {
        case 'list':
        case 'url_list':
            $lines = implode("\n", array_map('strval', (array) $value));
            ?>
            <textarea id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" rows="6" class="large-text code"><?php echo esc_textarea($lines); ?></textarea>
            <?php
            break;
        case 'lang_text':
        case 'lang_textarea':
            $map = is_array($value) ? $value : [];
            foreach (kotlinskidev_seo_identity_language_slugs($map) as $slug) {
                $field_name = $name . '[' . $slug . ']';
                $field_id   = $id . '_' . $slug;
                $text       = (string) ($map[$slug] ?? '');
                ?>
                <p>
                    <label for="<?php echo esc_attr($field_id); ?>"><strong><?php echo esc_html(strtoupper($slug)); ?></strong></label><br />
                    <?php if ('lang_textarea' === $type) : ?>
                        <textarea id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($field_name); ?>" rows="3" class="large-text"><?php echo esc_textarea($text); ?></textarea>
                    <?php else : ?>
                        <input type="text" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($field_name); ?>" value="<?php echo esc_attr($text); ?>" class="regular-text" />
                    <?php endif; ?>
                </p>
                <?php
            }
            break;
        case 'image':
            $image_id = absint($value);
            ?>
            <input type="hidden" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $image_id); ?>" />
            <div id="<?php echo esc_attr($id); ?>_preview" class="kotlinskidev-seo-media-preview"><?php echo $image_id > 0 ? wp_get_attachment_image($image_id, 'thumbnail') : ''; ?></div>
            <button type="button" class="button kotlinskidev-seo-media-button" data-target="<?php echo esc_attr($id); ?>"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
            <button type="button" class="button kotlinskidev-seo-media-remove" data-target="<?php echo esc_attr($id); ?>"><?php esc_html_e('Remove', 'kotlinskidev'); ?></button>
            <?php
            break;
        case 'country':
            ?>
            <input type="text" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $value); ?>" maxlength="2" size="4" class="code" />
            <?php
            break;
        case 'checkbox':
            ?>
            <input type="hidden" name="<?php echo esc_attr($name); ?>" value="0" />
            <label>
                <input type="checkbox" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="1" <?php checked((bool) $value); ?> />
                <?php echo esc_html($description); ?>
            </label>
            <?php
            $description = '';
            break;
        default:
            ?>
            <input type="text" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $value); ?>" class="regular-text" />
            <?php
    }

    if ('' !== $description) {
        echo '<p class="description">' . esc_html($description) . '</p>';
    }

    if (in_array($key, kotlinskidev_seo_identity_overridable_keys(), true)) {
        kotlinskidev_render_seo_identity_override_notice($key, $type);
    }
}

function kotlinskidev_seo_identity_override_display(mixed $value, string $type): string
{
    if ('image' === $type) {
        $image_id = absint($value);
        $title    = $image_id > 0 ? trim((string) get_the_title($image_id)) : '';
        return '' !== $title ? $title : (string) $image_id;
    }
    if (is_array($value)) {
        return implode(', ', array_map('strval', $value));
    }
    return (string) $value;
}

function kotlinskidev_render_seo_identity_override_notice(string $key, string $type): void
{
    echo '<p class="description">' . esc_html__('Yoast SEO takes precedence over this field when it has a value.', 'kotlinskidev') . '</p>';

    $overrides = kotlinskidev_seo_identity_external_overrides();
    if (! isset($overrides[$key]['value'])) {
        return;
    }
    $source = (string) ($overrides[$key]['source'] ?? 'Yoast SEO');
    $text   = sprintf(
        __('Currently overridden by %1$s: %2$s', 'kotlinskidev'),
        $source,
        kotlinskidev_seo_identity_override_display($overrides[$key]['value'], $type)
    );
    echo '<p class="notice notice-info inline" style="padding:6px 12px;"><strong>' . esc_html($text) . '</strong> ';
    echo '<a href="' . esc_url(admin_url('admin.php?page=wpseo_page_settings')) . '">' . esc_html__('Open Yoast SEO settings', 'kotlinskidev') . '</a></p>';
}

function kotlinskidev_enqueue_seo_identity_media(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'seo' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', <<<'JS'
document.addEventListener("DOMContentLoaded", function () {
    function setImage(targetId, id, url) {
        var input = document.getElementById(targetId);
        var preview = document.getElementById(targetId + "_preview");
        input.value = id;
        preview.textContent = "";
        if (url) {
            var img = document.createElement("img");
            img.src = url;
            img.alt = "";
            preview.appendChild(img);
        }
    }
    document.querySelectorAll(".kotlinskidev-seo-media-button").forEach(function (button) {
        button.addEventListener("click", function () {
            var uploader = wp.media({ title: "Choose Image", button: { text: "Use Image" }, multiple: false });
            uploader.on("select", function () {
                var attachment = uploader.state().get("selection").first().toJSON();
                var thumb = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;
                setImage(button.dataset.target, attachment.id, thumb);
            });
            uploader.open();
        });
    });
    document.querySelectorAll(".kotlinskidev-seo-media-remove").forEach(function (button) {
        button.addEventListener("click", function () {
            setImage(button.dataset.target, 0, "");
        });
    });
});
JS);
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_seo_identity_media');

function kotlinskidev_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $tabs   = kotlinskidev_settings_tabs();
    $active = kotlinskidev_active_settings_tab();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <nav class="nav-tab-wrapper">
            <?php foreach ($tabs as $slug => $tab) : ?>
                <a
                    href="<?php echo esc_url(add_query_arg(['page' => 'kotlinskidev-settings', 'tab' => $slug], admin_url('options-general.php'))); ?>"
                    class="nav-tab <?php echo $slug === $active ? 'nav-tab-active' : ''; ?>"
                >
                    <?php echo esc_html($tab['label']); ?>
                </a>
            <?php endforeach; ?>
        </nav>
        <form method="post" action="options.php">
            <?php
            settings_fields($tabs[$active]['group']);
            do_settings_sections($tabs[$active]['page']);
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
