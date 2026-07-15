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
}

function kotlinskidev_sanitize_theme_default_mode(string $value): string
{
    return in_array($value, ['auto', 'light', 'dark'], true) ? $value : 'auto';
}

function kotlinskidev_sanitize_breakpoint_px($value): int
{
    return max(320, min(1920, absint($value)));
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
