<?php
const KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES = array( 'mobile', 'tablet' );
const KOTLINSKIDEV_RESPONSIVE_MEDIA_ALL_DEVICES = array( 'mobile', 'tablet', 'desktop' );

function kotlinskidev_responsive_media_registry(): array
{
    static $registry = null;

    if ( null !== $registry ) {
        return $registry;
    }

    $path    = dirname( __DIR__ ) . '/src/blocks/responsive-media/blocks.json';
    $decoded = is_readable( $path ) ? json_decode( (string) file_get_contents( $path ), true ) : null;
    $registry = is_array( $decoded ) ? $decoded : array();

    return $registry;
}

function kotlinskidev_responsive_media_register_attribute( array $args, string $block_type ): array
{
    if ( ! str_starts_with( $block_type, 'core/' ) || ! isset( kotlinskidev_responsive_media_registry()[ $block_type ] ) ) {
        return $args;
    }

    $args['attributes'] = is_array( $args['attributes'] ?? null ) ? $args['attributes'] : array();

    if ( ! isset( $args['attributes']['responsiveMedia'] ) ) {
        $args['attributes']['responsiveMedia'] = array(
            'type'    => 'object',
            'default' => array(),
        );
    }

    return $args;
}
add_filter( 'register_block_type_args', 'kotlinskidev_responsive_media_register_attribute', 10, 2 );

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

function kotlinskidev_responsive_media_has_overrides( array $resolved ): bool
{
    return $resolved['mobile'] !== $resolved['desktop'] || $resolved['tablet'] !== $resolved['desktop'];
}

function kotlinskidev_responsive_media_ranges( array $keys, array $breakpoints ): array
{
    $mobile_max  = (int) $breakpoints['mobile_max'];
    $tablet_min  = (int) $breakpoints['tablet_min'];
    $tablet_max  = (int) $breakpoints['tablet_max'];
    $desktop_min = (int) $breakpoints['desktop_min'];

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

    $media_map = array(
        'mobile'               => sprintf( '(max-width: %dpx)', $mobile_max ),
        'mobile,tablet'        => sprintf( '(max-width: %dpx)', $tablet_max ),
        'tablet'               => sprintf( '(min-width: %dpx) and (max-width: %dpx)', $tablet_min, $tablet_max ),
        'tablet,desktop'       => sprintf( '(min-width: %dpx)', $tablet_min ),
        'desktop'              => sprintf( '(min-width: %dpx)', $desktop_min ),
        'mobile,tablet,desktop' => '',
    );

    foreach ( $groups as $index => $group ) {
        $groups[ $index ]['media'] = $media_map[ implode( ',', $group['devices'] ) ];
    }

    return $groups;
}

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

function kotlinskidev_responsive_media_image_cover( string $block_content, array $resolved ): string
{
    $breakpoints = kotlinskidev_get_breakpoints();

    $result = preg_replace_callback(
        '/<img\b[^>]*\bwp-block-cover__image-background\b[^>]*>/i',
        static fn ( array $matches ): string => kotlinskidev_responsive_media_picture( $matches[0], $resolved, $breakpoints ),
        $block_content,
        1
    );

    return is_string( $result ) ? $result : $block_content;
}

function kotlinskidev_responsive_media_image_block( string $block_content, array $slots ): string
{
    $processor = new WP_HTML_Tag_Processor( $block_content );

    if ( ! $processor->next_tag( 'img' ) ) {
        return $block_content;
    }

    $desktop = $processor->get_attribute( 'src' );
    $sizes   = $processor->get_attribute( 'sizes' );

    if ( ! is_string( $desktop ) || '' === $desktop ) {
        return $block_content;
    }

    $resolved = kotlinskidev_resolve_responsive_media( $desktop, $slots );

    if ( ! kotlinskidev_responsive_media_has_overrides( $resolved ) ) {
        return $block_content;
    }

    $breakpoints = kotlinskidev_get_breakpoints();
    $srcsets     = kotlinskidev_responsive_media_srcsets( $slots, $resolved );
    $sizes       = is_string( $sizes ) ? $sizes : '';

    $result = preg_replace_callback(
        '/<img\b[^>]*>/i',
        static fn ( array $matches ): string => kotlinskidev_responsive_media_picture( $matches[0], $resolved, $breakpoints, $srcsets, $sizes ),
        $block_content,
        1
    );

    return is_string( $result ) ? $result : $block_content;
}

function kotlinskidev_responsive_media_video_tag( string $block_content, array $slots, ?string $class_name, string $desktop_url = '' ): string
{
    $processor = new WP_HTML_Tag_Processor( $block_content );
    $query     = array( 'tag_name' => 'video' );
    if ( null !== $class_name ) {
        $query['class_name'] = $class_name;
    }

    if ( ! $processor->next_tag( $query ) ) {
        return $block_content;
    }

    if ( '' === $desktop_url ) {
        $tag_src     = $processor->get_attribute( 'src' );
        $desktop_url = is_string( $tag_src ) ? $tag_src : '';
    }

    if ( '' === $desktop_url ) {
        return $block_content;
    }

    $resolved = kotlinskidev_resolve_responsive_media( $desktop_url, $slots );

    if ( ! kotlinskidev_responsive_media_has_overrides( $resolved ) ) {
        return $block_content;
    }

    $desktop_poster = $processor->get_attribute( 'poster' );
    $posters        = kotlinskidev_resolve_responsive_posters(
        is_string( $desktop_poster ) ? $desktop_poster : '',
        kotlinskidev_responsive_media_with_posters( $slots )
    );

    $processor->remove_attribute( 'src' );
    $processor->set_attribute( 'data-kt-poster-desktop', esc_url( $posters['desktop'] ) );
    $processor->set_attribute( 'data-kt-poster-tablet', esc_url( $posters['tablet'] ) );
    $processor->set_attribute( 'data-kt-poster-mobile', esc_url( $posters['mobile'] ) );

    if ( $posters['mobile'] !== $posters['desktop'] || $posters['tablet'] !== $posters['desktop'] ) {
        $processor->remove_attribute( 'poster' );
    }

    $processor->set_attribute( 'data-kt-src-desktop', esc_url( $resolved['desktop'] ) );
    $processor->set_attribute( 'data-kt-src-tablet', esc_url( $resolved['tablet'] ) );
    $processor->set_attribute( 'data-kt-src-mobile', esc_url( $resolved['mobile'] ) );

    return $processor->get_updated_html();
}

function kotlinskidev_apply_responsive_media( string $block_content, array $block ): string
{
    $adapter = kotlinskidev_responsive_media_registry()[ $block['blockName'] ?? '' ] ?? '';

    if ( '' === $block_content || ! in_array( $adapter, array( 'cover', 'image', 'video' ), true ) ) {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? array();
    $slots = $attrs['responsiveMedia'] ?? array();

    if ( ! is_array( $slots ) || array() === $slots ) {
        return $block_content;
    }

    if ( 'image' === $adapter ) {
        return kotlinskidev_responsive_media_image_block( $block_content, $slots );
    }

    if ( 'video' === $adapter ) {
        return kotlinskidev_responsive_media_video_tag( $block_content, $slots, null );
    }

    $url = $attrs['url'] ?? '';

    if ( ! is_string( $url ) || '' === $url ) {
        return $block_content;
    }

    if ( 'video' === ( $attrs['backgroundType'] ?? 'image' ) ) {
        return kotlinskidev_responsive_media_video_tag( $block_content, $slots, 'wp-block-cover__video-background', $url );
    }

    $resolved = kotlinskidev_resolve_responsive_media( $url, $slots );

    if ( ! kotlinskidev_responsive_media_has_overrides( $resolved ) ) {
        return $block_content;
    }

    return kotlinskidev_responsive_media_image_cover( $block_content, $resolved );
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_media', 20, 2 );
