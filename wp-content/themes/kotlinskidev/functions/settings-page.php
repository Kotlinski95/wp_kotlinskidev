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
        'advanced' => [
            'label' => esc_html__('Advanced', 'kotlinskidev'),
            'group' => 'kotlinskidev_settings_advanced',
            'page'  => 'kotlinskidev-settings-advanced',
        ],
    ];
}

function kotlinskidev_active_settings_tab(): string
{
    $tabs = kotlinskidev_settings_tabs();
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
        'kotlinskidev_section_theme_mode'
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
        'kotlinskidev_section_breakpoints'
    );

    add_settings_field(
        'kotlinskidev_breakpoint_tablet_max',
        esc_html__('Tablet max width (px)', 'kotlinskidev'),
        'kotlinskidev_render_breakpoint_tablet_field',
        'kotlinskidev-settings-breakpoints',
        'kotlinskidev_section_breakpoints'
    );

    add_settings_field(
        'kotlinskidev_breakpoint_large',
        esc_html__('Large desktop min width (px)', 'kotlinskidev'),
        'kotlinskidev_render_breakpoint_large_field',
        'kotlinskidev-settings-breakpoints',
        'kotlinskidev_section_breakpoints'
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
        'kotlinskidev_section_scroll_offset'
    );

    add_settings_field(
        'kotlinskidev_scroll_offset_mobile',
        esc_html__('Mobile offset (px)', 'kotlinskidev'),
        'kotlinskidev_render_scroll_offset_mobile_field',
        'kotlinskidev-settings-advanced',
        'kotlinskidev_section_scroll_offset'
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
        'kotlinskidev_section_login'
    );

    add_settings_field(
        'kotlinskidev_login_logo_image',
        esc_html__('Logo image', 'kotlinskidev'),
        'kotlinskidev_render_login_logo_image_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login'
    );

    add_settings_field(
        'kotlinskidev_login_bg_color',
        esc_html__('Background color', 'kotlinskidev'),
        'kotlinskidev_render_login_bg_color_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login'
    );

    add_settings_field(
        'kotlinskidev_login_accent_color',
        esc_html__('Accent color', 'kotlinskidev'),
        'kotlinskidev_render_login_accent_color_field',
        'kotlinskidev-settings-login',
        'kotlinskidev_section_login'
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
        'kotlinskidev_section_tracking_fb'
    );

    add_settings_field(
        'custom_fb_pixel_loader_custom_script',
        esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
        'kotlinskidev_render_fb_pixel_script_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_fb'
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
        'kotlinskidev_section_tracking_ga'
    );

    add_settings_field(
        'custom_ga_loader_custom_script',
        esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
        'kotlinskidev_render_ga_script_field',
        'kotlinskidev-settings-tracking',
        'kotlinskidev_section_tracking_ga'
    );
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
    <select name="kotlinskidev_theme_default_mode">
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
    <input type="number" name="kotlinskidev_breakpoint_mobile_max" value="<?php echo esc_attr((string) $value); ?>" min="320" max="1023" step="1" />
    <p class="description">
        <?php esc_html_e('Screens up to this width are mobile. Tablet starts at this value + 1px. Theme default: 781.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_breakpoint_tablet_field(): void
{
    $value = (int) get_option('kotlinskidev_breakpoint_tablet_max', 1023);
    ?>
    <input type="number" name="kotlinskidev_breakpoint_tablet_max" value="<?php echo esc_attr((string) $value); ?>" min="768" max="1399" step="1" />
    <p class="description">
        <?php esc_html_e('Screens up to this width are tablet. Desktop starts at this value + 1px. Theme default: 1023.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_breakpoint_large_field(): void
{
    $value = (int) get_option('kotlinskidev_breakpoint_large', 1200);
    ?>
    <input type="number" name="kotlinskidev_breakpoint_large" value="<?php echo esc_attr((string) $value); ?>" min="1024" max="1920" step="1" />
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
    <input type="number" name="kotlinskidev_scroll_offset_desktop" value="<?php echo esc_attr((string) $value); ?>" min="0" max="400" step="1" />
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
    <input type="number" name="kotlinskidev_scroll_offset_mobile" value="<?php echo esc_attr((string) $value); ?>" min="0" max="400" step="1" />
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
    <input type="url" name="kotlinskidev_login_bg_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
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
    <input type="url" name="kotlinskidev_login_logo_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
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
    <input type="color" name="kotlinskidev_login_bg_color" value="<?php echo esc_attr($value); ?>" />
    <p class="description"><?php esc_html_e('Fallback background color when no image loads.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_login_accent_color_field(): void
{
    $value = get_option('kotlinskidev_login_accent_color', '#8209d3');
    ?>
    <input type="color" name="kotlinskidev_login_accent_color" value="<?php echo esc_attr($value); ?>" />
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
    echo '<p>' . esc_html__('Loads the Facebook Pixel on the frontend only (not in wp-admin or REST responses).', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_fb_pixel_id_field(): void
{
    $value = get_option('custom_fb_pixel_loader_pixel_id', '');
    ?>
    <input type="text" name="custom_fb_pixel_loader_pixel_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="123456789012345" />
    <?php
}

function kotlinskidev_render_fb_pixel_script_field(): void
{
    $value = get_option('custom_fb_pixel_loader_custom_script', '');
    ?>
    <textarea name="custom_fb_pixel_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_ga_section(): void
{
    echo '<p>' . esc_html__('Loads Google Analytics (gtag.js) on the frontend only (not in wp-admin or REST responses).', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_ga_id_field(): void
{
    $value = get_option('custom_ga_loader_ga_id', '');
    ?>
    <input type="text" name="custom_ga_loader_ga_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="G-XXXXXXXXXX" />
    <?php
}

function kotlinskidev_render_ga_script_field(): void
{
    $value = get_option('custom_ga_loader_custom_script', '');
    ?>
    <textarea name="custom_ga_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

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
