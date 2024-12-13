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

    // Get the current language from URL or fallback to WordPress default locale
    $current_locale = isset($_GET['lang']) ? sanitize_text_field($_GET['lang']) : get_locale();

    echo '<div class="language-selector">';
    echo '<button class="language-selector-button">';
    echo '<img src="' . esc_url($languages[$current_locale]['flag']) . '" alt="' . esc_attr($languages[$current_locale]['name']) . '" class="language-flag" />';
    echo '</button>';

    // Language options modal (hidden by default)
    echo '<div class="language-modal">';
    echo '<ul class="language-switcher">';
    foreach ($languages as $locale => $data) {
        // Generate the URL for each language
        $current_url = add_query_arg('lang', $locale, remove_query_arg('lang', $_SERVER['REQUEST_URI']));

        // Apply the add_lang_param_to_links filter to ensure lang parameter is added to the URL
        $current_url = apply_filters('clean_url', $current_url);

        // Check if the current loop locale is the selected language, mark it as active
        $class = ($locale === $current_locale) ? 'class="active"' : '';

        // Output the language link with flag and name
        echo '<li><a href="' . esc_url($current_url) . '" ' . $class . '>';
        echo '<img src="' . esc_url($data['flag']) . '" alt="' . esc_attr($data['name']) . '" class="language-flag" />';
        echo esc_html($data['name']);
        echo '</a></li>';
    }
    echo '</ul>';
    echo '</div>'; // End of language modal
    echo '</div>'; // End of language selector
}


function language_switcher_widget()
{
    register_sidebar([
        'name'          => 'Language Switcher Widget',
        'id'            => 'language_switcher_widget',
        'before_widget' => '<div class="widget language-switcher">',
        'after_widget'  => '</div>',
    ]);
}
add_action('widgets_init', 'language_switcher_widget');

function render_language_switcher_widget()
{
    render_language_switcher();
}
add_action('dynamic_sidebar_before', 'render_language_switcher_widget');

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
        switch_to_locale($locale); // Switch the locale dynamically
    }
});

add_filter('locale', function ($locale) {
    if (isset($_GET['lang'])) {
        $requested_locale = sanitize_text_field($_GET['lang']);
        if (in_array($requested_locale, ['en_US', 'pl_PL'])) {
            return $requested_locale;
        }
    }
    return $locale;
});

function kotlinskidev_load_textdomain()
{
    load_theme_textdomain('kotlinskidev', get_template_directory() . '/languages');
}
add_action('after_setup_theme', 'kotlinskidev_load_textdomain');

// Append the lang parameter to all internal links only if it doesn't already exist
function add_lang_param_to_links($url)
{
    // Check if the URL is an internal URL (starts with home_url or /)
    if (strpos($url, home_url()) === 0 || strpos($url, '/') === 0) {
        // Check if the lang parameter is already in the URL
        if (isset($_GET['lang'])) {
            $lang = sanitize_text_field($_GET['lang']);

            // Parse the URL to get its query string
            $url_parts = parse_url($url);

            if (isset($url_parts['query'])) {
                parse_str($url_parts['query'], $query_params);

                // If lang is already in the query string, don't modify the URL
                if (isset($query_params['lang'])) {
                    return $url; // Return the URL unchanged
                }
            }

            // If lang is not already in the query string, append it
            $url = add_query_arg('lang', $lang, $url);
        }
    }
    return $url;
}

add_filter('clean_url', 'add_lang_param_to_links');
add_filter('the_permalink', 'add_lang_param_to_links');
add_filter('wp_nav_menu_items', 'add_lang_param_to_links');
add_filter('widget_text', 'add_lang_param_to_links');
add_filter('widget_text_content', 'add_lang_param_to_links');


// add_filter('language_attributes', function ($output) {
//     // Check if a language cookie is set
//     if (isset($_COOKIE['site_language'])) {
//         $locale = sanitize_text_field($_COOKIE['site_language']);

//         // Convert the locale (e.g., en_US) into a language code (e.g., en)
//         $lang_code = str_replace('_', '-', $locale);

//         // Update the lang attribute
//         $output = 'lang="' . esc_attr($lang_code) . '"';
//     }

//     return $output;
// });

// add_filter('locale', function ($locale) {
//     // Check if a language cookie is set
//     if (isset($_COOKIE['site_language'])) {
//         $cookie_locale = sanitize_text_field($_COOKIE['site_language']);
//         // Verify that the locale is valid for your site
//         $supported_locales = ['en_US', 'pl_PL']; // Add other supported locales here
//         if (in_array($cookie_locale, $supported_locales)) {
//             return $cookie_locale; // Use the cookie-defined locale
//         }
//     }
//     return $locale; // Fallback to the default WordPress locale
// });

function add_lang_param_if_exists($url) {
    // Check if the 'lang' query parameter exists in the current URL
    if (isset($_GET['lang'])) {
        $lang = sanitize_text_field($_GET['lang']);
        // Add the lang parameter to the provided URL
        return add_query_arg('lang', $lang, $url);
    }

    // Return the URL as is if 'lang' parameter is not found
    return $url;
}