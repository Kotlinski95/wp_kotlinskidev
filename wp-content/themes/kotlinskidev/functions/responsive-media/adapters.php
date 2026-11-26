<?php
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
        static fn ( array $matches ): string => kotlinskidev_responsive_media_picture( $matches[0], $resolved, $breakpoints, $srcsets, $sizes, kotlinskidev_responsive_media_source_dimensions( $slots ) ),
        $block_content,
        1
    );

    return is_string( $result ) ? $result : $block_content;
}

function kotlinskidev_responsive_media_video_desktop_url( WP_HTML_Tag_Processor $processor, string $desktop_url ): string
{
    if ( '' !== $desktop_url ) {
        return $desktop_url;
    }

    $tag_src = $processor->get_attribute( 'src' );

    return is_string( $tag_src ) ? $tag_src : '';
}

function kotlinskidev_responsive_media_set_video_posters( WP_HTML_Tag_Processor $processor, array $posters ): void
{
    $processor->remove_attribute( 'src' );
    $processor->set_attribute( 'data-kt-poster-desktop', esc_url( $posters['desktop'] ) );
    $processor->set_attribute( 'data-kt-poster-tablet', esc_url( $posters['tablet'] ) );
    $processor->set_attribute( 'data-kt-poster-mobile', esc_url( $posters['mobile'] ) );

    if ( $posters['mobile'] !== $posters['desktop'] || $posters['tablet'] !== $posters['desktop'] ) {
        $processor->remove_attribute( 'poster' );
    }
}

function kotlinskidev_responsive_media_set_video_sources( WP_HTML_Tag_Processor $processor, array $resolved ): void
{
    $processor->set_attribute( 'data-kt-src-desktop', esc_url( $resolved['desktop'] ) );
    $processor->set_attribute( 'data-kt-src-tablet', esc_url( $resolved['tablet'] ) );
    $processor->set_attribute( 'data-kt-src-mobile', esc_url( $resolved['mobile'] ) );
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

    $desktop_url = kotlinskidev_responsive_media_video_desktop_url( $processor, $desktop_url );
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

    kotlinskidev_responsive_media_set_video_posters( $processor, $posters );
    kotlinskidev_responsive_media_set_video_sources( $processor, $resolved );

    return $processor->get_updated_html();
}
