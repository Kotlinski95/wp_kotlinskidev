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
    kotlinskidev_register_general_settings();
    kotlinskidev_register_theme_mode_settings();
    kotlinskidev_register_breakpoints_settings();
    kotlinskidev_register_advanced_settings();
    kotlinskidev_register_login_settings();
    kotlinskidev_register_tracking_settings();
    kotlinskidev_register_customization_settings();
    kotlinskidev_register_site_values_settings();
    kotlinskidev_register_security_settings();
    kotlinskidev_register_contact_settings();
    kotlinskidev_register_monitoring_settings();
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
