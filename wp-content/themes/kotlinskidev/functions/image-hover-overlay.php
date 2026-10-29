<?php
function kotlinskidev_image_overlay_markup( string $heading, string $description ): string {
    $heading_markup     = '' !== $heading ? '<span class="kt-image-hover-overlay__heading">' . esc_html( $heading ) . '</span>' : '';
    $description_markup = '' !== $description ? '<span class="kt-image-hover-overlay__description">' . esc_html( $description ) . '</span>' : '';

    return '<div class="kt-image-hover-overlay__content">' . $heading_markup . $description_markup . '</div>';
}

function kotlinskidev_apply_image_overlay( string $block_content, array $block ): string {
    $enabled = ! empty( $block['attrs']['kotlinskidevOverlayEnabled'] );

    if ( 'core/image' !== ( $block['blockName'] ?? '' ) || ! $enabled || '' === trim( $block_content ) ) {
        return $block_content;
    }

    $heading     = sanitize_text_field( $block['attrs']['kotlinskidevOverlayHeading'] ?? '' );
    $description = sanitize_text_field( $block['attrs']['kotlinskidevOverlayDescription'] ?? '' );

    if ( '' === $heading && '' === $description ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag( 'figure' ) ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . 'kt-image-hover-overlay' ) );

    $block_content = $processor->get_updated_html();

    $close_pos = strrpos( $block_content, '</figure>' );
    if ( false === $close_pos ) {
        return $block_content;
    }

    return substr_replace(
        $block_content,
        kotlinskidev_image_overlay_markup( $heading, $description ) . '</figure>',
        $close_pos,
        strlen( '</figure>' )
    );
}
add_filter( 'render_block', 'kotlinskidev_apply_image_overlay', 10, 2 );
