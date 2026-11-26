<?php
function kotlinskidev_search_relative_request_path(): string {
    $current_url = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';
    $parsed_url = parse_url($current_url);
    $full_path = isset($parsed_url['path']) ? trim($parsed_url['path'], '/') : '';

    $site_url = get_option('home') ?: site_url();
    $site_path = trim(parse_url($site_url, PHP_URL_PATH) ?? '', '/');

    if ($site_path && strpos($full_path, $site_path) === 0) {
        return trim(substr($full_path, strlen($site_path)), '/');
    }

    $path_parts = explode('/', $full_path);
    if (count($path_parts) >= 2 && $path_parts[0] === 'adriankotlinski') {
        return implode('/', array_slice($path_parts, 1));
    }

    return $full_path;
}

function kotlinskidev_search_action_url_for_current_language() {
    $relative_path = kotlinskidev_search_relative_request_path();

    if (preg_match('/^([a-z]{2})(?:\/|$)/', $relative_path, $matches)) {
        return home_url('/' . $matches[1] . '/');
    }

    if (preg_match('/^([a-z]{2}[_-][a-z]{2})(?:\/|$)/i', $relative_path, $matches)) {
        return home_url('/' . $matches[1] . '/');
    }

    return home_url('/');
}
