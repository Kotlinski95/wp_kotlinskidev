<?php
if ( ! function_exists( 'kotlinskidev_sanitize_map_css' ) ) {
    function kotlinskidev_sanitize_map_css( string $css ): string {
        $css = preg_replace( '/([;{}])n(?=[\s}.#@a-zA-Z-]|$)/', "$1\n", $css );
        $css = preg_replace( '/@import\b[^;]*;?/i', '', $css );
        $css = preg_replace( '/url\s*\([^)]*\)/i', '', $css );
        return $css;
    }
}

if ( ! function_exists( 'kotlinskidev_google_maps_directions_url' ) ) {
    function kotlinskidev_google_maps_directions_url( string $lat, string $lng, string $address ): string {
        $query = ( '' !== $lat && '' !== $lng ) ? $lat . ',' . $lng : $address;
        return 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $query );
    }
}

if ( ! function_exists( 'kotlinskidev_google_maps_marker_card' ) ) {
    function kotlinskidev_google_maps_marker_card( array $attributes, string $lat, string $lng, string $address ): string {
        $name = isset( $attributes['markerLabel'] ) ? trim( (string) $attributes['markerLabel'] ) : '';
        $tagline = isset( $attributes['markerTooltip'] ) ? trim( wp_strip_all_tags( (string) $attributes['markerTooltip'] ) ) : '';
        $logo = isset( $attributes['markerLogoUrl'] ) ? trim( (string) $attributes['markerLogoUrl'] ) : '';
        if ( '' === $logo ) {
            $logo = (string) get_site_icon_url( 128 );
        }
        $url = kotlinskidev_google_maps_directions_url( $lat, $lng, $address );
        $accessible_name = trim( $name . ' ' . $tagline );
        $aria_label = sprintf(
            /* translators: %s: place name and tagline shown on the map marker */
            __( '%s, opens in Google Maps in a new tab', 'kotlinskidev' ),
            '' !== $accessible_name ? $accessible_name : __( 'Location', 'kotlinskidev' )
        );
        ob_start();
        ?>
        <a class="kt-google-maps__marker has-background has-text-color" href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $aria_label ); ?>" data-kt-google-maps-marker hidden>
            <?php if ( '' !== $logo ) : ?>
                <img class="kt-google-maps__marker-logo" src="<?php echo esc_url( $logo ); ?>" alt="" width="40" height="40" loading="lazy" decoding="async">
            <?php endif; ?>
            <span class="kt-google-maps__marker-text">
                <?php if ( '' !== $name ) : ?>
                    <strong class="kt-google-maps__marker-name"><?php echo esc_html( $name ); ?></strong>
                <?php endif; ?>
                <?php if ( '' !== $tagline ) : ?>
                    <span class="kt-google-maps__marker-tagline"><?php echo esc_html( $tagline ); ?></span>
                <?php endif; ?>
            </span>
        </a>
        <?php
        return (string) ob_get_clean();
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

        if ( ! $apiKey || ( ! $address && ( ! $lat || ! $lng ) ) ) {
            return '<div style="color:#888; background:#f3f3f3; width:' . esc_attr( $width ) . '; height:' . esc_attr( $height ) . '; display:flex; align-items:center; justify-content:center;">' . esc_html__( 'Please provide a Google Maps API key and address or coordinates in the block settings.', 'kotlinskidev' ) . '</div>';
        }

        $button_style  = kotlinskidev_resolve_button_style( $attributes['buttonStyle'] ?? '' );
        $consent_label = trim( (string) ( $attributes['consentButtonLabel'] ?? '' ) );
        $consent_label = '' !== $consent_label ? $consent_label : __( 'Cookie settings', 'kotlinskidev' );
        $reset_label   = trim( (string) ( $attributes['resetViewLabel'] ?? '' ) );
        $reset_label   = '' !== $reset_label ? $reset_label : __( 'Reset View', 'kotlinskidev' );
        $map_id = 'google_maps_block_' . uniqid();
        ob_start();
        ?>
        <div class="kt-google-maps" data-kt-google-maps style="width:<?php echo esc_attr( $width ); ?>;height:<?php echo esc_attr( $height ); ?>;position:relative;">
            <div id="<?php echo esc_attr( $map_id ); ?>" style="width:100%;height:100%;"></div>
            <?php echo kotlinskidev_google_maps_marker_card( $attributes, $lat, $lng, $address ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside kotlinskidev_google_maps_marker_card() ?>
            <div class="kt-google-maps__placeholder" role="status" data-kt-google-maps-placeholder>
                <p class="kt-google-maps__title"><?php echo esc_html__( 'Map unavailable', 'kotlinskidev' ); ?></p>
                <p class="kt-google-maps__text"><?php echo esc_html__( 'This map is provided by Google and needs your consent to marketing cookies before it can load.', 'kotlinskidev' ); ?></p>
                <button type="button" class="kt-google-maps__consent is-style-<?php echo esc_attr( $button_style ); ?>" data-kt-google-maps-consent><?php echo esc_html( $consent_label ); ?></button>
            </div>
            <?php if ( ! empty( $attributes['showResetViewButton'] ) ) : ?>
                <button type="button" class="kt-google-maps__reset is-style-<?php echo esc_attr( $button_style ); ?>" hidden id="reset-view-btn-<?php echo esc_attr( $map_id ); ?>">
                    <?php echo esc_html( $reset_label ); ?>
                </button>
            <?php endif; ?>
        </div>
        <script type="text/javascript">
        (function () {
            function initMap_<?php echo esc_js( $map_id ); ?>() {
                const mapContainer = document.getElementById('<?php echo esc_js( $map_id ); ?>');
                const mapRoot = mapContainer && mapContainer.parentNode;
                if (mapRoot) {
                    const consentPlaceholder = mapRoot.querySelector('[data-kt-google-maps-placeholder]');
                    if (consentPlaceholder) consentPlaceholder.remove();
                    const consentResetBtn = mapRoot.querySelector('button[id^="reset-view-btn-"]');
                    if (consentResetBtn) consentResetBtn.hidden = false;
                }
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
                const markerCard = mapRoot ? mapRoot.querySelector('[data-kt-google-maps-marker]') : null;
                function placeMarker(position) {
                    if (!markerCard) return;
                    const anchor = position instanceof google.maps.LatLng ? position : new google.maps.LatLng(position.lat, position.lng);
                    class KotlinskidevMarkerOverlay extends google.maps.OverlayView {
                        onAdd() {
                            markerCard.hidden = false;
                            this.getPanes().overlayMouseTarget.appendChild(markerCard);
                        }
                        draw() {
                            const point = this.getProjection().fromLatLngToDivPixel(anchor);
                            if (!point) return;
                            markerCard.style.left = point.x + 'px';
                            markerCard.style.top = point.y + 'px';
                        }
                        onRemove() {
                            if (markerCard.parentNode) markerCard.parentNode.removeChild(markerCard);
                        }
                    }
                    new KotlinskidevMarkerOverlay().setMap(map);
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
