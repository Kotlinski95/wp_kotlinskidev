<?php
/**
 * Server-side rendering for the Google Maps Block.
 */

if ( ! function_exists( 'google_maps_block_render_map' ) ) {
    function google_maps_block_render_map($attributes) {
        $apiKey = isset($attributes['apiKey']) ? trim($attributes['apiKey']) : '';
        $address = isset($attributes['address']) ? trim($attributes['address']) : '';
        $lat = isset($attributes['lat']) ? trim($attributes['lat']) : '';
        $lng = isset($attributes['lng']) ? trim($attributes['lng']) : '';
        $zoom = isset($attributes['zoom']) ? intval($attributes['zoom']) : 14;
        $width = isset($attributes['width']) ? $attributes['width'] : '100%';
        $height = isset($attributes['height']) ? $attributes['height'] : '400px';

        if (!$apiKey || (!$address && (!$lat || !$lng))) {
            return '<div style="color:#888; background:#f3f3f3; width:' . esc_attr($width) . '; height:' . esc_attr($height) . '; display:flex; align-items:center; justify-content:center;">' . esc_html__('Please provide a Google Maps API key and address or coordinates in the block settings.', 'google-maps-block') . '</div>';
        }

        $src = $address
            ? 'https://www.google.com/maps/embed/v1/place?key=' . urlencode($apiKey) . '&q=' . urlencode($address) . '&zoom=' . $zoom
            : 'https://www.google.com/maps/embed/v1/view?key=' . urlencode($apiKey) . '&center=' . urlencode($lat) . ',' . urlencode($lng) . '&zoom=' . $zoom;

        return '<iframe
            title="Google Map"
            width="' . esc_attr($width) . '"
            height="' . esc_attr($height) . '"
            style="border:0;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="' . esc_url($src) . '"></iframe>';
    }
}

$attributes = isset($attributes) ? $attributes : [];
echo '<div ' . get_block_wrapper_attributes() . '>';
echo google_maps_block_render_map($attributes);
echo '</div>';
