<?php
/**
 * Server-side rendering for the Google Maps Block (frontend, dynamic JS API with marker and tooltip).
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
        $mapType = isset($attributes['mapType']) ? $attributes['mapType'] : 'roadmap';
        $showZoomControl = isset($attributes['showZoomControl']) ? (bool)$attributes['showZoomControl'] : true;
        $showStreetViewControl = isset($attributes['showStreetViewControl']) ? (bool)$attributes['showStreetViewControl'] : true;
        $showFullscreenControl = isset($attributes['showFullscreenControl']) ? (bool)$attributes['showFullscreenControl'] : true;
        $showMapTypeControl = isset($attributes['showMapTypeControl']) ? (bool)$attributes['showMapTypeControl'] : true;
        $markerLabel = isset($attributes['markerLabel']) ? $attributes['markerLabel'] : '';
        $markerTooltip = isset($attributes['markerTooltip']) ? $attributes['markerTooltip'] : '';
        $markerColor = isset($attributes['markerColor']) ? $attributes['markerColor'] : 'red';

        if (!$apiKey || (!$address && (!$lat || !$lng))) {
            return '<div style="color:#888; background:#f3f3f3; width:' . esc_attr($width) . '; height:' . esc_attr($height) . '; display:flex; align-items:center; justify-content:center;">' . esc_html__('Please provide a Google Maps API key and address or coordinates in the block settings.', 'google-maps-block') . '</div>';
        }

        // Use only underscores in map_id for valid JS function names
        $map_id = 'google_maps_block_' . uniqid();
        ob_start();
        ?>
        <div style="width:<?php echo esc_attr($width); ?>;height:<?php echo esc_attr($height); ?>;position:relative;">
            <div id="<?php echo esc_attr($map_id); ?>" style="width:100%;height:100%;"></div>
            <?php if (!empty($attributes['showResetViewButton'])): ?>
                <button type="button" id="reset-view-btn-<?php echo esc_attr($map_id); ?>" style="font-size:18px;position:absolute;bottom:10px;left:10px;z-index:5;padding:6px 14px;background:#fff;color:#000;border:none;border-radius:3px;cursor:pointer;">
                    <?php echo esc_html__('Reset View', 'google-maps-block'); ?>
                </button>
            <?php endif; ?>
        </div>
        <script type="text/javascript">
        (function(){
            function initMap_<?php echo $map_id; ?>() {
                const mapOptions = {
                    zoom: <?php echo (int)$zoom; ?>,
                    mapTypeId: '<?php echo esc_js($mapType); ?>',
                    zoomControl: <?php echo $showZoomControl ? 'true' : 'false'; ?>,
                    streetViewControl: <?php echo $showStreetViewControl ? 'true' : 'false'; ?>,
                    fullscreenControl: <?php echo $showFullscreenControl ? 'true' : 'false'; ?>,
                    mapTypeControl: <?php echo $showMapTypeControl ? 'true' : 'false'; ?>,
                };
                const map = new google.maps.Map(document.getElementById('<?php echo esc_js($map_id); ?>'), mapOptions);
                const geocoder = new google.maps.Geocoder();
                const markerOptions = {
                    map: map,
					label: <?php
						if ($markerLabel) {
							// Build a JS object for the label with extra options
							echo '{';
							echo "text: '" . esc_js($markerLabel) . "',";
							echo "color: 'black',";
							echo "fontSize: '12px',";
							echo "className: 'marker-position'";
							echo '}';
						} else {
							echo 'undefined';
						}
					?>
                };
                const markerColor = '<?php echo esc_js($markerColor); ?>';
                if (markerColor !== 'red') {
                    markerOptions.icon = {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: markerColor,
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: '#fff'
                    };
                }
                function placeMarker(position) {
                    markerOptions.position = position;
                    const marker = new google.maps.Marker(markerOptions);
                    if (<?php echo $markerTooltip !== '' ? 'true' : 'false'; ?>) {
                        var infowindow = new google.maps.InfoWindow({
                            content: <?php echo json_encode('<div class="marker-tooltip" style="padding:8px 12px; font-size:1.1em; font-weight:bold; text-align:center; margin-top:8px; color:black;">' . htmlspecialchars($markerTooltip, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</div>'); ?>,
                            pixelOffset: new google.maps.Size(0, 32) // Move tooltip below the marker
                        });
                        marker.addListener('click', function() { infowindow.open(map, marker); });
                        infowindow.open(map, marker);
                    }
                }
                <?php if ($lat && $lng): ?>
                    const position = { lat: parseFloat('<?php echo esc_js($lat); ?>'), lng: parseFloat('<?php echo esc_js($lng); ?>') };
                    map.setCenter(position);
                    placeMarker(position);
                <?php else: ?>
                    geocoder.geocode({ address: <?php echo json_encode($address); ?> }, function(results, status) {
                        if (status === 'OK' && results[0]) {
                            map.setCenter(results[0].geometry.location);
                            placeMarker(results[0].geometry.location);
                        }
                    });
                <?php endif; ?>
                <?php if (!empty($attributes['showResetViewButton'])): ?>
                const resetBtn = document.getElementById('reset-view-btn-<?php echo esc_js($map_id); ?>');
                if (resetBtn) {
                    const initialCenter = <?php echo ($lat && $lng) ? '{lat:' . floatval($lat) . ',lng:' . floatval($lng) . '}' : 'null'; ?>;
                    const initialZoom = <?php echo (int)$zoom; ?>;
                    resetBtn.addEventListener('click', function() {
                        if (initialCenter) map.setCenter(initialCenter);
                        map.setZoom(initialZoom);
                    });
                }
                <?php endif; ?>
            }
            if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=<?php echo esc_attr($apiKey); ?>';
                script.async = true;
                script.onload = initMap_<?php echo $map_id; ?>;
                document.body.appendChild(script);
            } else {
                initMap_<?php echo $map_id; ?>();
            }
        })();
        </script>
        <?php
        // Output custom marker label CSS for this block instance if provided
        if (!empty($attributes['customCSS'])) {
            // Prefix all CSS selectors with the unique map ID for per-block scoping
            $css = preg_replace_callback('/(^|\}|\s)(\.[a-zA-Z0-9_-]+)/', function($matches) use ($map_id) {
                return $matches[1] . '#' . $map_id . ' ' . $matches[2];
            }, $attributes['customCSS']);
            echo '<style id="marker-label-css-' . esc_attr($map_id) . '">' . $css . '</style>';
        }
        return ob_get_clean();
    }
}

$attributes = isset($attributes) ? $attributes : [];
echo '<div ' . get_block_wrapper_attributes() . '>';
echo google_maps_block_render_map($attributes);
echo '</div>';
