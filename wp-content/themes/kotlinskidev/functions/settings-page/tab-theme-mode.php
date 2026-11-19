<?php
function kotlinskidev_register_theme_mode_settings(): void
{
    kotlinskidev_register_boolean_setting('kotlinskidev_settings_theme_mode', 'kotlinskidev_theme_switching_enabled', true);

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

    kotlinskidev_add_settings_fields('kotlinskidev-settings-theme-mode', 'kotlinskidev_section_theme_mode', [
        'kotlinskidev_theme_switching_enabled' => [
            'title'    => esc_html__('Light/dark switching', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_theme_switching_field',
        ],
        'kotlinskidev_theme_default_mode' => [
            'title'    => esc_html__('Default mode', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_theme_default_mode_field',
            'args'     => ['label_for' => 'kotlinskidev_theme_default_mode'],
        ],
    ]);
}

function kotlinskidev_sanitize_theme_default_mode(string $value): string
{
    return in_array($value, ['auto', 'light', 'dark'], true) ? $value : 'auto';
}

function kotlinskidev_render_theme_mode_section(): void
{
    echo '<p>' . esc_html__('Controls the light/dark color mode. When switching is disabled, the theme switcher button is hidden and the site stays locked to the default mode.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_theme_switching_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_theme_switching_enabled',
        'default' => true,
        'label'   => __('Show the theme switcher and let visitors toggle light/dark mode', 'kotlinskidev'),
    ]);
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
