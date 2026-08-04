<?php
/**
 * Return cached image dimensions for a given URL.
 *
 * Previously the theme called @getimagesize($src) inside a `the_content` filter
 * with NO caching, issuing a blocking HTTP or filesystem call per image per page
 * view — the primary cause of 504 timeout errors under any sustained load.
 *
 * All results for a request are held in one in-memory map, loaded from a single
 * transient on first use and written back once at `shutdown` if anything new was
 * computed — instead of one transient (one DB round trip) per unique image URL.
 *
 * This helper:
 *  - Skips external/CDN images entirely (no blocking HTTP calls).
 *  - Maps local upload URLs to filesystem paths for a fast, non-HTTP read.
 *  - Caches every result so the filesystem read happens at most once per unique
 *    image URL (cleared automatically when the attachment changes).
 */
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
        return $map[$cache_key]; // [] means "no size found" — still a valid cached result
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
    // Skip external images — fetching them synchronously blocks PHP execution.
    $site_host = parse_url(site_url(), PHP_URL_HOST);
    $img_host  = parse_url($src, PHP_URL_HOST);
    if ($img_host && $img_host !== $site_host) {
        return [];
    }

    // Map upload URL to filesystem path to avoid HTTP overhead.
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

// Add width and height to all images in post content for Lighthouse.
add_filter('the_content', function ($content) {
    if (is_admin()) return $content;
    return preg_replace_callback(
        '/<img([^>]+)>/i',
        function ($matches) {
            $img = $matches[0];

            // Already has explicit dimensions — nothing to do.
            if (strpos($img, 'width=') !== false && strpos($img, 'height=') !== false) {
                return $img;
            }

            if (!preg_match('/src=["\']([^"\']+)["\']/', $img, $srcMatch)) {
                return $img;
            }
            $src  = $srcMatch[1];
            $size = kotlinskidev_get_image_size_cached($src);

            if (empty($size)) {
                return $img; // No size available — return untouched.
            }

            $width  = $size['width'];
            $height = $size['height'];

            // If the element already has an aspect-ratio style that is not 'original',
            // only append w/h attributes; do not overwrite the existing ratio.
            if (preg_match('/style=["\'][^"\']*aspect-ratio\s*:\s*([^;"\']+)/i', $img, $aspectMatch)) {
                $aspectValue = trim($aspectMatch[1]);
                if (strtolower($aspectValue) !== 'original') {
                    $img = preg_replace('/>$/', " width=\"$width\" height=\"$height\">", $img);
                    return $img;
                }
            }

            // Add or append the computed aspect-ratio to the style attribute.
            if (preg_match('/style=["\']([^"\']*)["\']/', $img, $styleMatch)) {
                $style = rtrim($styleMatch[1]);
                if ($style !== '' && substr($style, -1) !== ';') {
                    $style .= ';';
                }
                $newStyle = $style . " aspect-ratio: $width / $height;";
                $img = preg_replace('/style=["\'][^"\']*["\']/', 'style="' . trim($newStyle) . '"', $img);
            } else {
                $img = preg_replace('/<img/', "<img style=\"aspect-ratio: $width / $height;\"", $img);
            }

            $img = preg_replace('/>$/', " width=\"$width\" height=\"$height\">", $img);
            return $img;
        },
        $content
    );
});