<?php
const KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES = array( 'mobile', 'tablet' );

function kotlinskidev_responsive_media_slot_url( array $slots, string $device ): string
{
    $slot = $slots[ $device ] ?? null;

    if ( ! is_array( $slot ) ) {
        return '';
    }

    $url = $slot['url'] ?? '';

    return is_string( $url ) ? $url : '';
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

function kotlinskidev_responsive_media_with_posters( array $slots ): array
{
    foreach ( KOTLINSKIDEV_RESPONSIVE_MEDIA_DEVICES as $device ) {
        $id = $slots[ $device ]['id'] ?? null;

        if ( ! is_array( $slots[ $device ] ?? null ) || ! is_numeric( $id ) ) {
            continue;
        }

        $poster                     = get_the_post_thumbnail_url( (int) $id );
        $slots[ $device ]['poster'] = is_string( $poster ) ? $poster : '';
    }

    return $slots;
}

function kotlinskidev_responsive_media_has_overrides( array $resolved ): bool
{
    return $resolved['mobile'] !== $resolved['desktop'] || $resolved['tablet'] !== $resolved['desktop'];
}

function kotlinskidev_responsive_media_picture( string $img_tag, array $resolved, array $breakpoints ): string
{
    $sources = '';

    if ( $resolved['mobile'] !== $resolved['desktop'] ) {
        $sources .= sprintf(
            '<source media="(max-width: %dpx)" srcset="%s">',
            (int) $breakpoints['mobile_max'],
            esc_url( $resolved['mobile'] )
        );
    }

    if ( $resolved['tablet'] !== $resolved['desktop'] ) {
        $sources .= sprintf(
            '<source media="(min-width: %dpx) and (max-width: %dpx)" srcset="%s">',
            (int) $breakpoints['tablet_min'],
            (int) $breakpoints['tablet_max'],
            esc_url( $resolved['tablet'] )
        );
    }

    return '<picture class="kt-responsive-media">' . $sources . $img_tag . '</picture>';
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

function kotlinskidev_responsive_media_video_cover( string $block_content, array $resolved, array $slots ): string
{
    $breakpoints = kotlinskidev_get_breakpoints();
    $processor   = new WP_HTML_Tag_Processor( $block_content );
    $found       = $processor->next_tag(
        array(
            'tag_name'   => 'video',
            'class_name' => 'wp-block-cover__video-background',
        )
    );

    if ( ! $found ) {
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
    $processor->set_attribute( 'data-kt-bp-mobile', (string) (int) $breakpoints['mobile_max'] );
    $processor->set_attribute( 'data-kt-bp-tablet', (string) (int) $breakpoints['tablet_max'] );

    return $processor->get_updated_html();
}

function kotlinskidev_apply_responsive_media( string $block_content, array $block ): string
{
    if ( '' === $block_content || 'core/cover' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? array();
    $slots = $attrs['responsiveMedia'] ?? array();
    $url   = $attrs['url'] ?? '';

    if ( ! is_array( $slots ) || array() === $slots || ! is_string( $url ) || '' === $url ) {
        return $block_content;
    }

    $resolved = kotlinskidev_resolve_responsive_media( $url, $slots );

    if ( ! kotlinskidev_responsive_media_has_overrides( $resolved ) ) {
        return $block_content;
    }

    if ( 'video' === ( $attrs['backgroundType'] ?? 'image' ) ) {
        return kotlinskidev_responsive_media_video_cover( $block_content, $resolved, $slots );
    }

    return kotlinskidev_responsive_media_image_cover( $block_content, $resolved );
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_media', 20, 2 );
