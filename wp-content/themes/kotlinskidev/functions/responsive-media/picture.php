<?php
function kotlinskidev_responsive_media_picture( string $img_tag, array $resolved, array $breakpoints, array $srcsets = array(), string $sizes = '' ): string
{
    $sources = '';

    foreach ( kotlinskidev_responsive_media_ranges( $resolved, $breakpoints ) as $range ) {
        if ( in_array( 'desktop', $range['devices'], true ) ) {
            continue;
        }

        $device = $range['devices'][0];
        $srcset = isset( $srcsets[ $device ] ) && '' !== $srcsets[ $device ] ? $srcsets[ $device ] : esc_url( $resolved[ $device ] );

        $sources .= sprintf(
            '<source media="%s" srcset="%s"%s>',
            esc_attr( $range['media'] ),
            $srcset,
            '' !== $sizes ? sprintf( ' sizes="%s"', esc_attr( $sizes ) ) : ''
        );
    }

    return '<picture class="kt-responsive-media">' . $sources . $img_tag . '</picture>';
}

function kotlinskidev_responsive_media_srcsets( array $slots, array $resolved ): array
{
    $srcsets = array();

    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        $slot = kotlinskidev_responsive_media_effective_slot( $slots, $device );
        $id   = $slot['id'] ?? null;
        if ( ! is_numeric( $id ) || (int) $id <= 0 || $resolved[ $device ] === $resolved['desktop'] ) {
            continue;
        }

        $srcset = wp_get_attachment_image_srcset( (int) $id, 'full' );
        if ( is_string( $srcset ) && '' !== $srcset ) {
            $srcsets[ $device ] = esc_attr( $srcset );
        }
    }

    return $srcsets;
}

function kotlinskidev_responsive_media_poster_srcsets( array $slots, array $posters ): array
{
    $srcsets = array();

    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        $slot      = kotlinskidev_responsive_media_effective_slot( $slots, $device );
        $poster_id = $slot['posterId'] ?? null;
        if ( ! is_numeric( $poster_id ) || (int) $poster_id <= 0 || $posters[ $device ] === $posters['desktop'] ) {
            continue;
        }

        $srcset = wp_get_attachment_image_srcset( (int) $poster_id, 'full' );
        if ( is_string( $srcset ) && '' !== $srcset ) {
            $srcsets[ $device ] = esc_attr( $srcset );
        }
    }

    return $srcsets;
}

function kotlinskidev_responsive_media_data_attributes( array $values, string $prefix ): string
{
    $attributes = '';

    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        if ( '' === $values[ $device ] || $values[ $device ] === $values['desktop'] ) {
            continue;
        }

        $attributes .= sprintf( ' data-kt-%s-%s="%s"', $prefix, $device, esc_url( $values[ $device ] ) );
    }

    return $attributes;
}
