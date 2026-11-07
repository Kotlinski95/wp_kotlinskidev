<?php
function kotlinskidev_apply_cover_video_playback( string $block_content, array $attrs ): string
{
    $autoplay        = (bool) ( $attrs['coverVideoAutoplay'] ?? true );
    $loop            = (bool) ( $attrs['coverVideoLoop'] ?? true );
    $pause_offscreen = (bool) ( $attrs['coverVideoPauseOffscreen'] ?? false );
    $reveal_after    = (bool) ( $attrs['coverVideoRevealAfterEnd'] ?? false );

    if ( $reveal_after ) {
        $loop = false;
    }

    if ( $autoplay && $loop && ! $pause_offscreen && ! $reveal_after ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    $found     = $processor->next_tag(
        array(
            'tag_name'   => 'video',
            'class_name' => 'wp-block-cover__video-background',
        )
    );

    if ( ! $found ) {
        return $block_content;
    }

    if ( ! $loop ) {
        $processor->remove_attribute( 'loop' );
    }

    if ( ! $autoplay ) {
        $processor->remove_attribute( 'autoplay' );
        $processor->set_attribute( 'preload', 'auto' );
        $processor->set_attribute( 'data-kt-video-autoplay', 'off' );
    }

    if ( $pause_offscreen ) {
        $processor->set_attribute( 'data-kt-video-pause-offscreen', 'true' );
    }

    $updated = $processor->get_updated_html();

    if ( ! $reveal_after ) {
        return $updated;
    }

    $root = new WP_HTML_Tag_Processor( $updated );
    if ( $root->next_tag( array( 'class_name' => 'wp-block-cover' ) ) ) {
        $root->set_attribute( 'data-kt-reveal-after-end', 'true' );
    }

    return $root->get_updated_html();
}
function kotlinskidev_cover_video_ratio( mixed $attachment_id ): string
{
    if ( ! is_numeric( $attachment_id ) || absint( $attachment_id ) < 1 ) {
        return '';
    }

    $metadata = wp_get_attachment_metadata( absint( $attachment_id ) );
    $width    = is_array( $metadata ) ? absint( $metadata['width'] ?? 0 ) : 0;
    $height   = is_array( $metadata ) ? absint( $metadata['height'] ?? 0 ) : 0;

    return $width > 0 && $height > 0 ? sprintf( '%d / %d', $width, $height ) : '';
}

function kotlinskidev_cover_video_ratio_style( array $attrs ): string
{
    $slots   = is_array( $attrs['responsiveMedia'] ?? null ) ? $attrs['responsiveMedia'] : array();
    $ratios  = array(
        'desktop' => kotlinskidev_cover_video_ratio( $attrs['id'] ?? null ),
        'tablet'  => kotlinskidev_cover_video_ratio( $slots['tablet']['id'] ?? null ),
        'mobile'  => kotlinskidev_cover_video_ratio( $slots['mobile']['id'] ?? null ),
    );
    $declarations = '';

    foreach ( $ratios as $device => $ratio ) {
        if ( '' !== $ratio ) {
            $declarations .= sprintf( '--kt-vr-%s:%s;', $device, $ratio );
        }
    }

    return $declarations;
}

function kotlinskidev_apply_cover_video_fit( string $block_content, array $attrs ): string
{
    if ( ! (bool) ( $attrs['coverVideoFitAspect'] ?? false ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag( array( 'class_name' => 'wp-block-cover' ) ) ) {
        return $block_content;
    }

    $processor->add_class( 'kt-cover-fit-video' );

    $declarations = kotlinskidev_cover_video_ratio_style( $attrs );
    if ( '' !== $declarations ) {
        $existing = trim( (string) $processor->get_attribute( 'style' ) );
        if ( '' !== $existing && ! str_ends_with( $existing, ';' ) ) {
            $existing .= ';';
        }
        $processor->set_attribute( 'style', $existing . $declarations );
    }

    return $processor->get_updated_html();
}

function kotlinskidev_apply_cover_video_controls( string $block_content, array $block ): string
{
    if ( '' === $block_content || 'core/cover' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? array();

    if ( 'video' !== ( $attrs['backgroundType'] ?? '' ) ) {
        return $block_content;
    }

    $block_content = kotlinskidev_apply_cover_video_playback( $block_content, $attrs );

    return kotlinskidev_apply_cover_video_fit( $block_content, $attrs );
}
add_filter( 'render_block', 'kotlinskidev_apply_cover_video_controls', 10, 2 );
