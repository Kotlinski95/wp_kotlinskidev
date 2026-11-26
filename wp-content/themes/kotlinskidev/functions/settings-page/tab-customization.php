<?php
function kotlinskidev_register_customization_settings(): void
{
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

    kotlinskidev_add_settings_fields('kotlinskidev-settings-customization', 'kotlinskidev_section_feature_toggles', [
        'kotlinskidev_enabled_features' => [
            'title'    => esc_html__('Enabled features', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_feature_toggles_field',
        ],
    ]);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_customization', 'kotlinskidev_in_view_hover_enabled', true);

    register_setting(
        'kotlinskidev_settings_customization',
        'kotlinskidev_in_view_band_center',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_viewport_percent',
            'default'           => 50,
        ]
    );

    register_setting(
        'kotlinskidev_settings_customization',
        'kotlinskidev_in_view_band_size',
        [
            'type'              => 'integer',
            'sanitize_callback' => 'kotlinskidev_sanitize_in_view_band_size',
            'default'           => 30,
        ]
    );

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_customization', 'kotlinskidev_in_view_hover_links', false);

    add_settings_section(
        'kotlinskidev_section_in_view_hover',
        esc_html__('Touch in-view trigger', 'kotlinskidev'),
        'kotlinskidev_render_in_view_hover_section',
        'kotlinskidev-settings-customization'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-customization', 'kotlinskidev_section_in_view_hover', [
        'kotlinskidev_in_view_hover_enabled' => [
            'title'    => esc_html__('Enable', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_in_view_hover_enabled_field',
        ],
        'kotlinskidev_in_view_hover_links' => [
            'title'    => esc_html__('Include links and buttons', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_in_view_hover_links_field',
        ],
        'kotlinskidev_in_view_band_center' => [
            'title'    => esc_html__('Band centre (% from viewport top)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_in_view_band_center_field',
        ],
        'kotlinskidev_in_view_band_size' => [
            'title'    => esc_html__('Band size (% of viewport height)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_in_view_band_size_field',
        ],
    ]);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_customization', 'kotlinskidev_mobile_parallax', true);

    add_settings_section(
        'kotlinskidev_section_mobile_parallax',
        esc_html__('Touch parallax', 'kotlinskidev'),
        'kotlinskidev_render_mobile_parallax_section',
        'kotlinskidev-settings-customization'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-customization', 'kotlinskidev_section_mobile_parallax', [
        'kotlinskidev_mobile_parallax' => [
            'title'    => esc_html__('Enable', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_mobile_parallax_field',
        ],
    ]);
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

function kotlinskidev_sanitize_viewport_percent($value): int
{
    return min(100, absint($value));
}

function kotlinskidev_sanitize_in_view_band_size($value): int
{
    return max(1, kotlinskidev_sanitize_viewport_percent($value));
}

function kotlinskidev_render_mobile_parallax_section(): void
{
    echo '<p>' . esc_html__('Touch screens cannot render a fixed background, so parallax banners are emulated with a scroll-driven animation. Browsers without scroll-driven animation support, and visitors who prefer reduced motion, keep the static background.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_mobile_parallax_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_mobile_parallax',
        'default' => true,
        'label'   => __('Pin parallax banner backgrounds while scrolling on touch screens', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_in_view_hover_section(): void
{
    echo '<p>' . esc_html__('On touch screens there is no hover, so the one hover-capable element nearest the centre of this horizontal band gets its hover effect. Feature card canvases use the same band. Individual blocks can opt out in the Hover animation panel.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_in_view_hover_enabled_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_in_view_hover_enabled',
        'default' => true,
        'label'   => __('Trigger hover effects for the element centred on touch screens', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_in_view_hover_links_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_in_view_hover_links',
        'default' => false,
        'label'   => __('Also trigger hover effects on links, buttons and navigation items', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_in_view_band_center_field(): void
{
    $value = (int) get_option('kotlinskidev_in_view_band_center', 50);
    ?>
    <input type="number" min="0" max="100" step="1" name="kotlinskidev_in_view_band_center" value="<?php echo esc_attr((string) $value); ?>" class="small-text" />
    <?php
}

function kotlinskidev_render_in_view_band_size_field(): void
{
    $value = (int) get_option('kotlinskidev_in_view_band_size', 30);
    ?>
    <input type="number" min="1" max="100" step="1" name="kotlinskidev_in_view_band_size" value="<?php echo esc_attr((string) $value); ?>" class="small-text" />
    <?php
}
