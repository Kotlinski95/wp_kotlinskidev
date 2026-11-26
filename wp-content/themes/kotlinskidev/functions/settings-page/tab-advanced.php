<?php
function kotlinskidev_register_advanced_settings(): void
{
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

    kotlinskidev_add_settings_fields('kotlinskidev-settings-advanced', 'kotlinskidev_section_scroll_offset', [
        'kotlinskidev_scroll_offset_desktop' => [
            'title'    => esc_html__('Desktop offset (px)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_scroll_offset_desktop_field',
            'args'     => ['label_for' => 'kotlinskidev_scroll_offset_desktop'],
        ],
        'kotlinskidev_scroll_offset_mobile' => [
            'title'    => esc_html__('Mobile offset (px)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_scroll_offset_mobile_field',
            'args'     => ['label_for' => 'kotlinskidev_scroll_offset_mobile'],
        ],
    ]);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_advanced', 'kotlinskidev_active_link_state_enabled', true);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_advanced', 'kotlinskidev_active_link_state_block_clicks', true);

    add_settings_section(
        'kotlinskidev_section_active_link_state',
        esc_html__('Active Page Links', 'kotlinskidev'),
        'kotlinskidev_render_active_link_state_section',
        'kotlinskidev-settings-advanced'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-advanced', 'kotlinskidev_section_active_link_state', [
        'kotlinskidev_active_link_state_enabled' => [
            'title'    => esc_html__('Highlight active-page links', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_active_link_state_enabled_field',
        ],
        'kotlinskidev_active_link_state_block_clicks' => [
            'title'    => esc_html__('Disable current-page link clicks', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_active_link_state_block_clicks_field',
        ],
    ]);
}

function kotlinskidev_sanitize_scroll_offset_px($value): int
{
    return max(0, min(400, absint($value)));
}

function kotlinskidev_render_scroll_offset_section(): void
{
    echo '<p>' . esc_html__('Distance kept between the sticky header and the target when clicking an in-page anchor link (e.g. "#services"). Desktop keeps its floating header visible at all times, so it needs the full header height as clearance. Mobile hides the header while scrolling and only re-shows it near the top of the page, so it typically needs little or no offset.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_scroll_offset_desktop_field(): void
{
    $default = KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['desktop'];
    kotlinskidev_render_number_field([
        'option'      => 'kotlinskidev_scroll_offset_desktop',
        'value'       => (int) get_option('kotlinskidev_scroll_offset_desktop', $default),
        'min'         => 0,
        'max'         => 400,
        'description' => sprintf(
            /* translators: %d: default desktop scroll offset in pixels */
            __('Applies above the desktop breakpoint, where the header stays visible while scrolling. Theme default: %d (matches the header height).', 'kotlinskidev'),
            (int) $default
        ),
    ]);
}

function kotlinskidev_render_scroll_offset_mobile_field(): void
{
    $default = KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS['mobile'];
    kotlinskidev_render_number_field([
        'option'      => 'kotlinskidev_scroll_offset_mobile',
        'value'       => (int) get_option('kotlinskidev_scroll_offset_mobile', $default),
        'min'         => 0,
        'max'         => 400,
        'description' => sprintf(
            /* translators: %d: default mobile scroll offset in pixels */
            __('Applies below the desktop breakpoint, where the header hides on scroll. Theme default: %d, since the header is typically hidden by the time the scroll finishes.', 'kotlinskidev'),
            (int) $default
        ),
    ]);
}

function kotlinskidev_render_active_link_state_section(): void
{
    echo '<p>' . esc_html__('When a link (navigation, button, in-content) points at the page currently being viewed, it can be marked as active — the same gradient-text/underline style normally reserved for hover — and/or prevented from being clicked, since navigating to the page a visitor is already on does nothing useful. Individual blocks can still opt out from their own Advanced panel regardless of these settings.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_active_link_state_enabled_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_active_link_state_enabled',
        'default' => true,
        'label'   => __('Mark links pointing at the current page with the active hover-style highlight', 'kotlinskidev'),
        'description' => __('Adds a kt-link-current class and aria-current="page" to matching links sitewide (navigation, footer, hamburger, mega menu, popular pages).', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_active_link_state_block_clicks_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_active_link_state_block_clicks',
        'default' => true,
        'label'   => __('Prevent clicking a link/button that points at the page currently being viewed', 'kotlinskidev'),
        'description' => __('Adds aria-disabled and removes the link from tab order. Menu items that also open a mega-menu panel stay fully interactive. Has no effect if highlighting above is disabled.', 'kotlinskidev'),
    ]);
}
