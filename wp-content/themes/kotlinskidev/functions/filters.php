<?php
function kotlinskidev_get_image_size_cached($src)
{
    static $map = null;
    static $shutdown_registered = false;

    if ($map === null) {
        $cached = get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes');
        $map = is_array($cached) ? $cached : [];
    }

    $cache_key = md5($src);
    if (array_key_exists($cache_key, $map)) {
        return $map[$cache_key];
    }

    $result = kotlinskidev_compute_image_size($src);

    $map[$cache_key] = $result;
    if (!$shutdown_registered) {
        $shutdown_registered = true;
        add_action('shutdown', function () use (&$map) {
            set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes', $map, WEEK_IN_SECONDS);
        });
    }

    return $result;
}

function kotlinskidev_compute_image_size($src)
{
    $site_host = parse_url(site_url(), PHP_URL_HOST);
    $img_host  = parse_url($src, PHP_URL_HOST);
    if ($img_host && $img_host !== $site_host) {
        return [];
    }

    $upload_dir  = wp_upload_dir();
    $upload_url  = $upload_dir['baseurl'];
    $upload_path = $upload_dir['basedir'];

    if (strpos($src, $upload_url) === 0) {
        $file_path = str_replace($upload_url, $upload_path, strtok($src, '?'));
        if (file_exists($file_path)) {
            $info = @getimagesize($file_path);
            return ($info && isset($info[0], $info[1]))
                ? ['width' => $info[0], 'height' => $info[1]]
                : [];
        }
    }

    return [];
}

function kotlinskidev_invalidate_image_size_cache_entry($attachment_id)
{
    $src = wp_get_attachment_url($attachment_id);
    if (!$src) {
        return;
    }
    $map = get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes');
    if (!is_array($map)) {
        return;
    }
    $key = md5($src);
    if (isset($map[$key])) {
        unset($map[$key]);
        set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes', $map, WEEK_IN_SECONDS);
    }
}
add_action('edit_attachment', 'kotlinskidev_invalidate_image_size_cache_entry');
add_action('delete_attachment', 'kotlinskidev_invalidate_image_size_cache_entry');

function kotlinskidev_add_image_dimensions_to_content($content)
{
    if (is_admin()) return $content;
    return preg_replace_callback('/<img([^>]+)>/i', 'kotlinskidev_add_dimensions_to_img_tag', $content);
}
add_filter('the_content', 'kotlinskidev_add_image_dimensions_to_content');

function kotlinskidev_img_tag_has_dimensions($img)
{
    return strpos($img, 'width=') !== false && strpos($img, 'height=') !== false;
}

function kotlinskidev_img_tag_has_custom_aspect_ratio($img)
{
    if (!preg_match('/style=["\'][^"\']*aspect-ratio\s*:\s*([^;"\']+)/i', $img, $aspectMatch)) {
        return false;
    }
    return strtolower(trim($aspectMatch[1])) !== 'original';
}

function kotlinskidev_append_dimension_attributes($img, $width, $height)
{
    return preg_replace('/>$/', " width=\"$width\" height=\"$height\">", $img);
}

function kotlinskidev_add_aspect_ratio_style($img, $width, $height)
{
    if (!preg_match('/style=["\']([^"\']*)["\']/', $img, $styleMatch)) {
        return preg_replace('/<img/', "<img style=\"aspect-ratio: $width / $height;\"", $img);
    }

    $style = rtrim($styleMatch[1]);
    if ($style !== '' && substr($style, -1) !== ';') {
        $style .= ';';
    }
    $newStyle = $style . " aspect-ratio: $width / $height;";
    return preg_replace('/style=["\'][^"\']*["\']/', 'style="' . trim($newStyle) . '"', $img);
}

function kotlinskidev_add_dimensions_to_img_tag($matches)
{
    $img = $matches[0];

    if (kotlinskidev_img_tag_has_dimensions($img)) {
        return $img;
    }

    if (!preg_match('/src=["\']([^"\']+)["\']/', $img, $srcMatch)) {
        return $img;
    }
    $size = kotlinskidev_get_image_size_cached($srcMatch[1]);

    if (empty($size)) {
        return $img;
    }

    $width  = $size['width'];
    $height = $size['height'];

    if (kotlinskidev_img_tag_has_custom_aspect_ratio($img)) {
        return kotlinskidev_append_dimension_attributes($img, $width, $height);
    }

    $img = kotlinskidev_add_aspect_ratio_style($img, $width, $height);
    return kotlinskidev_append_dimension_attributes($img, $width, $height);
}
