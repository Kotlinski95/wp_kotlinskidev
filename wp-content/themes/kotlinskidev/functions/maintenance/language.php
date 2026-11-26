<?php
function get_maintenance_current_language()
{
    if (!function_exists('pll_languages_list')) {
        return null;
    }

    $languages = pll_languages_list();

    if (isset($_GET['lang'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only locale lookup, no state change
        $lang_param = sanitize_text_field(wp_unslash($_GET['lang'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only locale lookup, no state change
        if (in_array($lang_param, $languages, true)) {
            return $lang_param;
        }
    }

    if (function_exists('pll_current_language')) {
        $current_lang = pll_current_language();
        if ($current_lang) {
            return $current_lang;
        }
    }

    $accept_language = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ACCEPT_LANGUAGE'])) : '';
    $browser_lang = substr($accept_language, 0, 2);

    if (in_array($browser_lang, $languages)) {
        return $browser_lang;
    }

    return $languages[0] ?? null;
}

function get_maintenance_translation($option_key, $default_value = '')
{
    $current_lang = get_maintenance_current_language();

    if ($current_lang) {
        $translated_value = get_option($option_key . '_' . $current_lang, '');
        if (!empty($translated_value)) {
            return $translated_value;
        }
    }

    $default = get_option($option_key, $default_value);
    return !empty($default) ? $default : $default_value;
}

function get_maintenance_language_switcher()
{
    if (!function_exists('pll_languages_list') || !get_option('maintenance_mode_show_language_switcher', true)) {
        return '';
    }

    $languages = pll_languages_list();
    $current_lang = get_maintenance_current_language();

    if (count($languages) <= 1) {
        return '';
    }

    $switcher_html = '<div class="maintenance-language-switcher">';
    $switcher_html .= '<div class="language-dropdown">';

    $current_lang_name = $current_lang ? strtoupper($current_lang) : 'EN';
    $current_flag = $current_lang ? get_maintenance_flag_url($current_lang) : '';

    $switcher_html .= '<button class="language-current" onclick="toggleLanguageDropdown()">';
    if ($current_flag) {
        $switcher_html .= '<img src="' . esc_url($current_flag) . '" alt="' . esc_attr($current_lang_name) . '" class="flag-icon">';
    }
    $switcher_html .= '<span>' . esc_html($current_lang_name) . '</span>';
    $switcher_html .= '<span class="dropdown-arrow">▼</span>';
    $switcher_html .= '</button>';

    $switcher_html .= '<div class="language-options" id="languageOptions">';
    foreach ($languages as $lang) {
        if ($lang === $current_lang) continue;

        $lang_name = strtoupper($lang);
        $flag_url = get_maintenance_flag_url($lang);
        $lang_url = get_maintenance_language_url($lang);

        $switcher_html .= '<a href="' . esc_url($lang_url) . '" class="language-option">';
        if ($flag_url) {
            $switcher_html .= '<img src="' . esc_url($flag_url) . '" alt="' . esc_attr($lang_name) . '" class="flag-icon">';
        }
        $switcher_html .= '<span>' . esc_html($lang_name) . '</span>';
        $switcher_html .= '</a>';
    }
    $switcher_html .= '</div>';
    $switcher_html .= '</div>';
    $switcher_html .= '</div>';

    return $switcher_html;
}

function get_maintenance_flag_url($lang)
{
    $flags = [
        'en' => 'https://flagcdn.com/w20/us.png',
        'pl' => 'https://flagcdn.com/w20/pl.png',
        'de' => 'https://flagcdn.com/w20/de.png',
        'fr' => 'https://flagcdn.com/w20/fr.png',
        'es' => 'https://flagcdn.com/w20/es.png',
        'it' => 'https://flagcdn.com/w20/it.png',
    ];

    return $flags[$lang] ?? '';
}

function get_maintenance_language_url($lang)
{
    $request_uri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '/';
    $current_url = home_url($request_uri);

    $current_url = preg_replace('/[?&]lang=[^&]*/', '', $current_url);

    $separator = strpos($current_url, '?') !== false ? '&' : '?';
    return $current_url . $separator . 'lang=' . $lang;
}
