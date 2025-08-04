<?php
function render_language_switcher()
{
    $languages = [
        'en_US' => [
            'name' => 'English',
            'flag' => get_template_directory_uri() . '/assets/images/flags/Flag_of_the_United_States.webp',
        ],
        'pl_PL' => [
            'name' => 'Polish',
            'flag' => get_template_directory_uri() . '/assets/images/flags/Flag_of_Poland.webp',
        ],
    ];

    // Get the current locale or fallback to WordPress default locale
    $current_locale = get_locale();

    echo '<div class="language-selector">';
    echo '<button class="language-selector-button">';
    echo '<img src="' . esc_url($languages[$current_locale]['flag']) . '" alt="' . esc_attr($languages[$current_locale]['name']) . '" class="language-flag" />';
    echo '</button>';

    // Language options modal (hidden by default)
    echo '<div class="language-modal">';
    echo '<ul class="language-switcher">';
    foreach ($languages as $locale => $data) {
        // Redirect to homepages based on locale
        $current_url = ($locale === 'pl_PL') ? home_url('/pl/') : home_url('/');
        $class = ($locale === $current_locale) ? 'class="active"' : '';

        echo '<li><a href="' . esc_url($current_url) . '" ' . $class . '>';
        echo '<img src="' . esc_url($data['flag']) . '" alt="' . esc_attr($data['name']) . '" class="language-flag" />';
        echo esc_html($data['name']);
        echo '</a></li>';
    }
    echo '</ul>';
    echo '</div>'; // End of language modal
    echo '</div>'; // End of language selector
}

// Shortcode to add the language switcher anywhere
function render_language_switcher_shortcode()
{
    ob_start();
    render_language_switcher();
    return ob_get_clean();
}
add_shortcode('language_switcher', 'render_language_switcher_shortcode');

add_action('init', function () {
    if (isset($_GET['lang'])) {
        $locale = sanitize_text_field($_GET['lang']);
        if (in_array($locale, ['en_US', 'pl_PL'])) {
            $home_url = ($locale === 'pl_PL') ? home_url('/pl/') : home_url('/');
            wp_redirect($home_url);
            exit;
        }
    }
});