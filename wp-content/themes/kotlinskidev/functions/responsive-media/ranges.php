<?php
function kotlinskidev_responsive_media_device_groups( array $keys ): array
{
    $groups = array();
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_ALL_DEVICES as $device ) {
        $last = count( $groups ) - 1;
        if ( $last >= 0 && $groups[ $last ]['key'] === $keys[ $device ] ) {
            $groups[ $last ]['devices'][] = $device;
            continue;
        }
        $groups[] = array(
            'key'     => $keys[ $device ],
            'devices' => array( $device ),
        );
    }

    return $groups;
}

function kotlinskidev_responsive_media_query_by_devices( array $breakpoints ): array
{
    $mobile_max  = (int) $breakpoints['mobile_max'];
    $tablet_min  = (int) $breakpoints['tablet_min'];
    $tablet_max  = (int) $breakpoints['tablet_max'];
    $desktop_min = (int) $breakpoints['desktop_min'];

    return array(
        'mobile'                => sprintf( '(max-width: %dpx)', $mobile_max ),
        'mobile,tablet'         => sprintf( '(max-width: %dpx)', $tablet_max ),
        'tablet'                => sprintf( '(min-width: %dpx) and (max-width: %dpx)', $tablet_min, $tablet_max ),
        'tablet,desktop'        => sprintf( '(min-width: %dpx)', $tablet_min ),
        'desktop'               => sprintf( '(min-width: %dpx)', $desktop_min ),
        'mobile,tablet,desktop' => '',
    );
}

function kotlinskidev_responsive_media_ranges( array $keys, array $breakpoints ): array
{
    $groups    = kotlinskidev_responsive_media_device_groups( $keys );
    $media_map = kotlinskidev_responsive_media_query_by_devices( $breakpoints );

    foreach ( $groups as $index => $group ) {
        $groups[ $index ]['media'] = $media_map[ implode( ',', $group['devices'] ) ];
    }

    return $groups;
}

function kotlinskidev_responsive_media_preload_entries( array $assets, array $srcsets, string $sizes, array $breakpoints ): array
{
    $keys = array();
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_ALL_DEVICES as $device ) {
        $keys[ $device ] = $assets[ $device ];
    }

    $entries = array();
    foreach ( kotlinskidev_responsive_media_ranges( $keys, $breakpoints ) as $range ) {
        $srcset = '';
        foreach ( array_reverse( $range['devices'] ) as $device ) {
            if ( '' !== ( $srcsets[ $device ] ?? '' ) ) {
                $srcset = $srcsets[ $device ];
                break;
            }
        }

        $entries[] = array(
            'href'   => $assets[ $range['devices'][0] ],
            'srcset' => $srcset,
            'sizes'  => '' !== $srcset ? $sizes : '',
            'media'  => $range['media'],
        );
    }

    return $entries;
}
