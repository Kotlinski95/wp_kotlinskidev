<?php
const KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES = array( 'mobile', 'tablet' );
const KOTLINSKIDEV_RESPONSIVE_MEDIA_ALL_DEVICES = array( 'mobile', 'tablet', 'desktop' );
const KOTLINSKIDEV_RESPONSIVE_MEDIA_ADAPTERS = array( 'cover', 'image', 'video' );

function kotlinskidev_responsive_media_registry(): array
{
    static $registry = null;

    if ( null !== $registry ) {
        return $registry;
    }

    $path    = dirname( __DIR__, 2 ) . '/src/blocks/responsive-media/blocks.json';
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
