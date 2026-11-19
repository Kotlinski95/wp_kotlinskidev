<?php
function kotlinskidev_register_breakpoints_settings(): void
{
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

    kotlinskidev_add_settings_fields('kotlinskidev-settings-breakpoints', 'kotlinskidev_section_breakpoints', [
        'kotlinskidev_breakpoint_mobile_max' => [
            'title'    => esc_html__('Mobile max width (px)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_breakpoint_mobile_field',
            'args'     => ['label_for' => 'kotlinskidev_breakpoint_mobile_max'],
        ],
        'kotlinskidev_breakpoint_tablet_max' => [
            'title'    => esc_html__('Tablet max width (px)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_breakpoint_tablet_field',
            'args'     => ['label_for' => 'kotlinskidev_breakpoint_tablet_max'],
        ],
        'kotlinskidev_breakpoint_large' => [
            'title'    => esc_html__('Large desktop min width (px)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_breakpoint_large_field',
            'args'     => ['label_for' => 'kotlinskidev_breakpoint_large'],
        ],
    ]);
}

function kotlinskidev_sanitize_breakpoint_px($value): int
{
    return max(320, min(1920, absint($value)));
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
    kotlinskidev_render_number_field([
        'option'      => 'kotlinskidev_breakpoint_mobile_max',
        'value'       => (int) get_option('kotlinskidev_breakpoint_mobile_max', 781),
        'min'         => 320,
        'max'         => 1023,
        'description' => __('Screens up to this width are mobile. Tablet starts at this value + 1px. Theme default: 781.', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_breakpoint_tablet_field(): void
{
    kotlinskidev_render_number_field([
        'option'      => 'kotlinskidev_breakpoint_tablet_max',
        'value'       => (int) get_option('kotlinskidev_breakpoint_tablet_max', 1023),
        'min'         => 768,
        'max'         => 1399,
        'description' => __('Screens up to this width are tablet. Desktop starts at this value + 1px. Theme default: 1023.', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_breakpoint_large_field(): void
{
    kotlinskidev_render_number_field([
        'option'      => 'kotlinskidev_breakpoint_large',
        'value'       => (int) get_option('kotlinskidev_breakpoint_large', 1200),
        'min'         => 1024,
        'max'         => 1920,
        'description' => __('Wide-desktop refinements (e.g. wider content container) start here. Theme default: 1200.', 'kotlinskidev'),
    ]);
}
