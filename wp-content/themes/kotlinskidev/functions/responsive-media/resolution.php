<?php
function kotlinskidev_resolve_responsive_media( string $desktop_url, array $slots ): array
{
    $tablet = kotlinskidev_responsive_media_slot_url( $slots, 'tablet' );
    $tablet = '' !== $tablet ? $tablet : $desktop_url;

    $mobile = kotlinskidev_responsive_media_slot_url( $slots, 'mobile' );
    $mobile = '' !== $mobile ? $mobile : $tablet;

    return array(
        'desktop' => $desktop_url,
        'tablet'  => $tablet,
        'mobile'  => $mobile,
    );
}

function kotlinskidev_resolve_responsive_posters( string $desktop_poster, array $slots ): array
{
    $tablet = $desktop_poster;
    if ( '' !== kotlinskidev_responsive_media_slot_url( $slots, 'tablet' ) ) {
        $tablet = is_string( $slots['tablet']['poster'] ?? null ) ? $slots['tablet']['poster'] : '';
    }

    $mobile = $tablet;
    if ( '' !== kotlinskidev_responsive_media_slot_url( $slots, 'mobile' ) ) {
        $mobile = is_string( $slots['mobile']['poster'] ?? null ) ? $slots['mobile']['poster'] : '';
    }

    return array(
        'desktop' => $desktop_poster,
        'tablet'  => $tablet,
        'mobile'  => $mobile,
    );
}

function kotlinskidev_responsive_media_slot_poster( array $slot ): string
{
    if ( 'image' === ( $slot['type'] ?? '' ) ) {
        return is_string( $slot['url'] ?? null ) ? $slot['url'] : '';
    }

    $poster_url = $slot['posterUrl'] ?? '';
    if ( is_string( $poster_url ) && '' !== $poster_url ) {
        return $poster_url;
    }

    $poster_id = $slot['posterId'] ?? null;
    if ( is_numeric( $poster_id ) && (int) $poster_id > 0 ) {
        $url = wp_get_attachment_url( (int) $poster_id );
        if ( is_string( $url ) && '' !== $url ) {
            return $url;
        }
    }

    $id = $slot['id'] ?? null;
    if ( is_numeric( $id ) ) {
        $thumbnail = get_the_post_thumbnail_url( (int) $id );

        return is_string( $thumbnail ) ? $thumbnail : '';
    }

    return '';
}

function kotlinskidev_responsive_media_with_posters( array $slots ): array
{
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        if ( ! is_array( $slots[ $device ] ?? null ) ) {
            continue;
        }

        $slots[ $device ]['poster'] = kotlinskidev_responsive_media_slot_poster( $slots[ $device ] );
    }

    return $slots;
}

function kotlinskidev_resolve_responsive_media_assets( array $desktop, array $slots, bool $default_mobile_poster = false ): array
{
    $sources        = kotlinskidev_resolve_responsive_media( (string) ( $desktop['src'] ?? '' ), $slots );
    $desktop_poster = (string) ( $desktop['poster'] ?? '' );
    $posters        = kotlinskidev_resolve_responsive_posters( $desktop_poster, kotlinskidev_responsive_media_with_posters( $slots ) );

    $no_slots = '' === kotlinskidev_responsive_media_slot_url( $slots, 'mobile' ) && '' === kotlinskidev_responsive_media_slot_url( $slots, 'tablet' );
    if ( $default_mobile_poster && $no_slots && '' !== $desktop_poster ) {
        $poster_id = (int) ( $desktop['poster_id'] ?? 0 );
        $medium    = $poster_id > 0 ? wp_get_attachment_image_url( $poster_id, 'medium_large' ) : false;
        if ( is_string( $medium ) && '' !== $medium ) {
            $posters['mobile'] = $medium;
        }
    }

    $assets = array();
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_ALL_DEVICES as $device ) {
        $assets[ $device ] = array(
            'src'    => $sources[ $device ],
            'poster' => $posters[ $device ],
        );
    }

    return $assets;
}

function kotlinskidev_responsive_media_has_overrides( array $resolved ): bool
{
    return $resolved['mobile'] !== $resolved['desktop'] || $resolved['tablet'] !== $resolved['desktop'];
}
