<?php
if ( ! function_exists( 'kotlinskidev_sanitize_map_css' ) ) {
    function kotlinskidev_sanitize_map_css( string $css ): string {
        $css = preg_replace( '/@import\b[^;]*;?/i', '', $css );
        $css = preg_replace( '/url\s*\([^)]*\)/i', '', $css );
        return $css;
    }
}

if ( ! function_exists( 'kotlinskidev_google_maps_block_render_map' ) ) {
    function kotlinskidev_google_maps_block_render_map( $attributes ) {
        $apiKey = isset( $attributes['apiKey'] ) ? trim( $attributes['apiKey'] ) : '';
        $address = isset( $attributes['address'] ) ? trim( $attributes['address'] ) : '';
        $lat = isset( $attributes['lat'] ) ? trim( $attributes['lat'] ) : '';
        $lng = isset( $attributes['lng'] ) ? trim( $attributes['lng'] ) : '';
        $zoom = isset( $attributes['zoom'] ) ? intval( $attributes['zoom'] ) : 14;
        $width = isset( $attributes['width'] ) ? $attributes['width'] : '100%';
        $height = isset( $attributes['height'] ) ? $attributes['height'] : '25rem';
        $mapType = isset( $attributes['mapType'] ) ? $attributes['mapType'] : 'roadmap';
        $showZoomControl = isset( $attributes['showZoomControl'] ) ? (bool) $attributes['showZoomControl'] : true;
        $showStreetViewControl = isset( $attributes['showStreetViewControl'] ) ? (bool) $attributes['showStreetViewControl'] : true;
        $showFullscreenControl = isset( $attributes['showFullscreenControl'] ) ? (bool) $attributes['showFullscreenControl'] : true;
        $showMapTypeControl = isset( $attributes['showMapTypeControl'] ) ? (bool) $attributes['showMapTypeControl'] : true;
        $markerLabel = isset( $attributes['markerLabel'] ) ? $attributes['markerLabel'] : '';
        $markerTooltip = isset( $attributes['markerTooltip'] ) ? wp_kses_post( $attributes['markerTooltip'] ) : '';
        $markerColor = isset( $attributes['markerColor'] ) ? $attributes['markerColor'] : 'red';

        if ( ! $apiKey || ( ! $address && ( ! $lat || ! $lng ) ) ) {
            return '<div style="color:#888; background:#f3f3f3; width:' . esc_attr( $width ) . '; height:' . esc_attr( $height ) . '; display:flex; align-items:center; justify-content:center;">' . esc_html__( 'Please provide a Google Maps API key and address or coordinates in the block settings.', 'kotlinskidev' ) . '</div>';
        }

        $map_id = 'google_maps_block_' . uniqid();
        ob_start();
        ?>
        <div style="width:<?php echo esc_attr( $width ); ?>;height:<?php echo esc_attr( $height ); ?>;position:relative;">
            <div id="<?php echo esc_attr( $map_id ); ?>" style="width:100%;height:100%;"></div>
            <?php if ( ! empty( $attributes['showResetViewButton'] ) ) : ?>
                <button type="button" id="reset-view-btn-<?php echo esc_attr( $map_id ); ?>" style="font-size:1.125rem;position:absolute;bottom:0.625rem;left:0.625rem;z-index:5;padding:0.375rem 0.875rem;background:#fff;color:#000;border:none;border-radius:0.1875rem;cursor:pointer;">
                    <?php echo esc_html__( 'Reset View', 'kotlinskidev' ); ?>
                </button>
            <?php endif; ?>
        </div>
        <script type="text/javascript">
        function kotlinskidevDecodeBase64(str) {
            try {
                return decodeURIComponent(escape(atob(str)));
            } catch (e) {
                return str;
            }
        }

        (function () {
            function initMap_<?php echo esc_js( $map_id ); ?>() {
                const mapOptions = {
                    zoom: <?php echo (int) $zoom; ?>,
                    mapTypeId: '<?php echo esc_js( $mapType ); ?>',
                    zoomControl: <?php echo $showZoomControl ? 'true' : 'false'; ?>,
                    streetViewControl: <?php echo $showStreetViewControl ? 'true' : 'false'; ?>,
                    fullscreenControl: <?php echo $showFullscreenControl ? 'true' : 'false'; ?>,
                    mapTypeControl: <?php echo $showMapTypeControl ? 'true' : 'false'; ?>,
                };
                const map = new google.maps.Map(document.getElementById('<?php echo esc_js( $map_id ); ?>'), mapOptions);
                const geocoder = new google.maps.Geocoder();
                const markerOptions = {
                    map: map,
                    label: <?php
                        if ( $markerLabel ) {
                            $encodedLabel = base64_encode( $markerLabel );
                            echo '{';
                            echo "text: kotlinskidevDecodeBase64('" . esc_js( $encodedLabel ) . "'),";
                            echo "color: 'black',";
                            echo "fontSize: '0.75rem',";
                            echo "className: 'marker-position'";
                            echo '}';
                        } else {
                            echo 'undefined';
                        }
                    ?>
                };
                const markerColor = '<?php echo esc_js( $markerColor ); ?>';
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
                    if (<?php echo '' !== $markerTooltip ? 'true' : 'false'; ?>) {
                        var infowindow = new google.maps.InfoWindow({
                            content: <?php echo wp_json_encode( '<div class="marker-tooltip" style="padding:0.5rem 0.75rem; font-size:1.1em; font-weight:bold; text-align:center; margin-top:0.5rem; color:black;">' . $markerTooltip . '</div>', JSON_UNESCAPED_UNICODE ); ?>,
                            pixelOffset: new google.maps.Size(0, 32)
                        });
                        marker.addListener('click', function() { infowindow.open(map, marker); });
                        infowindow.open(map, marker);
                    }
                }
                <?php if ( $lat && $lng ) : ?>
                    const position = { lat: parseFloat('<?php echo esc_js( $lat ); ?>'), lng: parseFloat('<?php echo esc_js( $lng ); ?>') };
                    map.setCenter(position);
                    placeMarker(position);
                <?php else : ?>
                    geocoder.geocode({ address: <?php echo wp_json_encode( $address ); ?> }, function(results, status) {
                        if (status === 'OK' && results[0]) {
                            map.setCenter(results[0].geometry.location);
                            placeMarker(results[0].geometry.location);
                        }
                    });
                <?php endif; ?>
                <?php if ( ! empty( $attributes['showResetViewButton'] ) ) : ?>
                const resetBtn = document.getElementById('reset-view-btn-<?php echo esc_js( $map_id ); ?>');
                if (resetBtn) {
                    const initialCenter = <?php echo ( $lat && $lng ) ? '{lat:' . floatval( $lat ) . ',lng:' . floatval( $lng ) . '}' : 'null'; ?>;
                    const initialZoom = <?php echo (int) $zoom; ?>;
                    resetBtn.addEventListener('click', function() {
                        if (initialCenter) map.setCenter(initialCenter);
                        map.setZoom(initialZoom);
                    });
                }
                <?php endif; ?>
            }
            if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=<?php echo esc_attr( $apiKey ); ?>';
                script.async = true;
                script.onload = initMap_<?php echo esc_js( $map_id ); ?>;
                document.body.appendChild(script);
            } else {
                initMap_<?php echo esc_js( $map_id ); ?>();
            }
        })();
        </script>
        <?php
        if ( ! empty( $attributes['customCSS'] ) ) {
            $css = kotlinskidev_sanitize_map_css( $attributes['customCSS'] );
            $css = preg_replace_callback(
                '/(^|\}|\s)(\.[a-zA-Z0-9_-]+)/',
                function ( $matches ) use ( $map_id ) {
                    return $matches[1] . '#' . $map_id . ' ' . $matches[2];
                },
                $css
            );
            echo '<style id="marker-label-css-' . esc_attr( $map_id ) . '">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $css is sanitized by kotlinskidev_sanitize_map_css() (strips @import and url()) before this point
        }
        return ob_get_clean();
    }
}

$attributes = isset( $attributes ) ? $attributes : [];
echo '<div ' . get_block_wrapper_attributes() . '>';
echo kotlinskidev_google_maps_block_render_map( $attributes );
echo '</div>';
