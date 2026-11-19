<?php
function kotlinskidev_responsive_media_slot_url( array $slots, string $device ): string
{
    $slot = $slots[ $device ] ?? null;

    if ( ! is_array( $slot ) ) {
        return '';
    }

    $url = $slot['url'] ?? '';

    return is_string( $url ) ? $url : '';
}

function kotlinskidev_responsive_media_slot_alpha_url( array $slots, string $device ): string
{
    $slot = $slots[ $device ] ?? null;

    if ( ! is_array( $slot ) ) {
        return '';
    }

    $url = $slot['alphaUrl'] ?? '';

    return is_string( $url ) ? $url : '';
}

function kotlinskidev_responsive_media_alpha_slots( array $slots ): array
{
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        if ( '' !== kotlinskidev_responsive_media_slot_url( $slots, $device ) && '' === kotlinskidev_responsive_media_slot_alpha_url( $slots, $device ) ) {
            unset( $slots[ $device ] );
        }
    }

    return $slots;
}

function kotlinskidev_responsive_media_alpha_sources( string $desktop_alpha_url, array $slots ): array
{
    $alpha_slots = array();
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        $alpha_url = kotlinskidev_responsive_media_slot_alpha_url( $slots, $device );
        if ( '' !== $alpha_url ) {
            $alpha_slots[ $device ] = array( 'url' => $alpha_url );
        }
    }

    return kotlinskidev_resolve_responsive_media( $desktop_alpha_url, $alpha_slots );
}

function kotlinskidev_responsive_media_effective_slot( array $slots, string $device ): array
{
    $candidates = array(
        'mobile'  => array( 'mobile', 'tablet' ),
        'tablet'  => array( 'tablet' ),
        'desktop' => array(),
    );

    foreach ( $candidates[ $device ] ?? array() as $candidate ) {
        if ( '' !== kotlinskidev_responsive_media_slot_url( $slots, $candidate ) ) {
            return $slots[ $candidate ];
        }
    }

    return array();
}
