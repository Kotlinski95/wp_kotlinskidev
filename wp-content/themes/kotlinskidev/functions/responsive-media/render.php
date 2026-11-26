<?php
function kotlinskidev_responsive_media_cover_block( string $block_content, array $attrs, array $slots ): string
{
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

function kotlinskidev_apply_responsive_media( string $block_content, array $block ): string
{
    $adapter = kotlinskidev_responsive_media_registry()[ $block['blockName'] ?? '' ] ?? '';

    if ( '' === $block_content || ! in_array( $adapter, KOTLINSKIDEV_RESPONSIVE_MEDIA_ADAPTERS, true ) ) {
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

    return kotlinskidev_responsive_media_cover_block( $block_content, $attrs, $slots );
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_media', 20, 2 );
