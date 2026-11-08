<?php
function kotlinskidev_tracked_event_names(): array
{
    return [
        'cta_click'                   => __('CTA clicks', 'kotlinskidev'),
        'select_content'              => __('Project card views', 'kotlinskidev'),
        'language_switch'             => __('Language switch', 'kotlinskidev'),
        'form_start'                  => __('Contact form started', 'kotlinskidev'),
        'generate_lead'               => __('Contact form completed', 'kotlinskidev'),
        'form_error'                  => __('Contact form error', 'kotlinskidev'),
        'lightbox_open'               => __('Lightbox opened', 'kotlinskidev'),
        'lightbox_navigate'           => __('Lightbox slide navigation', 'kotlinskidev'),
        'page_not_found'              => __('404 page views', 'kotlinskidev'),
        'read_more_click'             => __('Read more/less toggled', 'kotlinskidev'),
        'faq_expand'                  => __('FAQ accordion expanded', 'kotlinskidev'),
        'scroll_to_top_click'         => __('Scroll-to-top clicked', 'kotlinskidev'),
        'cookie_consent_click'        => __('Cookie consent icon clicked', 'kotlinskidev'),
        'accessibility_toggle_click'  => __('Accessibility toolbar toggled', 'kotlinskidev'),
        'search_panel_open'           => __('Search panel opened', 'kotlinskidev'),
        'modal_open'                  => __('Content modal opened', 'kotlinskidev'),
        'load_more_click'             => __('Load more clicked', 'kotlinskidev'),
        'theme_mode_toggle'           => __('Dark/light mode toggled', 'kotlinskidev'),
        'protected_content_reveal'    => __('Protected content copied/clicked', 'kotlinskidev'),
    ];
}

function kotlinskidev_sanitize_enabled_analytics_events($value): array
{
    $known = array_keys(kotlinskidev_tracked_event_names());
    if (!is_array($value)) {
        return [];
    }
    return array_values(array_intersect($known, array_filter(array_map('sanitize_key', $value))));
}

function kotlinskidev_get_enabled_analytics_events(): array
{
    $known = array_keys(kotlinskidev_tracked_event_names());
    return (array) get_option('kotlinskidev_enabled_analytics_events', $known);
}

function kotlinskidev_get_disabled_analytics_events(): array
{
    $known = array_keys(kotlinskidev_tracked_event_names());
    return array_values(array_diff($known, kotlinskidev_get_enabled_analytics_events()));
}

function kotlinskidev_localize_analytics_config(): void
{
    wp_localize_script('wp-typescript', 'kotlinskiAnalyticsConfig', [
        'disabledEvents' => kotlinskidev_get_disabled_analytics_events(),
    ]);
}
add_action('wp_enqueue_scripts', 'kotlinskidev_localize_analytics_config', 20);
