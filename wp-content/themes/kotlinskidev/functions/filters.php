<?php
add_filter('nocache_headers', function ($headers) {
    unset($headers['Cache-Control']);
    $headers['Cache-Control'] = 'public, max-age=31536000';
    return $headers;
});

// Add width and height to all images in post content for Lighthouse
add_filter('the_content', function($content) {
    if (is_admin()) return $content;
    return preg_replace_callback(
        '/<img([^>]+)>/i',
        function($matches) {
            $img = $matches[0];
            if (strpos($img, 'width=') !== false && strpos($img, 'height=') !== false) {
                return $img;
            }
            if (preg_match('/src=["\']([^"\']+)["\']/', $img, $srcMatch)) {
                $src = $srcMatch[1];
                $image_info = @getimagesize($src);
                if ($image_info && isset($image_info[0], $image_info[1])) {
                    $width = $image_info[0];
                    $height = $image_info[1];
                    $aspect_ratio = $width / $height;
                    // Add or append to the style attribute
                    if (preg_match('/style=["\']([^"\']*)["\']/', $img, $styleMatch)) {
                        $style = $styleMatch[1];
                        $newStyle = trim($style . " aspect-ratio: " . $width . " / " . $height . ";");
                        $img = preg_replace('/style=["\'][^"\']*["\']/', 'style="' . $newStyle . '"', $img);
                    } else {
                        $img = preg_replace('/<img/', '<img style="aspect-ratio: ' . $width . ' / ' . $height . ';"', $img);
                    }
                    $img = preg_replace('/>$/', " width=\"$width\" height=\"$height\">", $img);
                }
            }
            return $img;
        },
        $content
    );
});