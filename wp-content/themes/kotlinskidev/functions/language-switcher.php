<?php
function render_language_switcher()
{
    $languages = [
        'en_US' => 'English',
        'pl_PL' => 'Polish',
    ];
    $current_locale = get_locale();

    echo '<ul class="language-switcher">';
    foreach ($languages as $locale => $name) {
        $current_url = add_query_arg('lang', $locale, $_SERVER['REQUEST_URI']);
        $class = ($locale === $current_locale) ? 'class="active"' : '';
        echo '<li><a href="' . esc_url($current_url) . '" ' . $class . '>' . esc_html($name) . '</a></li>';
    }
    echo '</ul>';
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

// Append the lang parameter to all internal links
function add_lang_param_to_links($url) {
    // Check if the URL is an internal URL (starts with home_url or /)
    if (strpos($url, home_url()) === 0 || strpos($url, '/') === 0) {
        if (isset($_GET['lang'])) {
            // Append the lang parameter to the URL if it exists
            $lang = sanitize_text_field($_GET['lang']);
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
?>