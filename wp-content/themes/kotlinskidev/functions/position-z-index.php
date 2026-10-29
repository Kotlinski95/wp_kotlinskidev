<?php
function kotlinskidev_valid_position_values(): array {
    return [ 'static', 'relative', 'absolute', 'sticky' ];
}

function kotlinskidev_valid_z_index_values(): array {
    return [ 'below', '0', '1', '2', '3', '4', '5' ];
}

function kotlinskidev_position_class_for( string $position ): string {
    return in_array( $position, kotlinskidev_valid_position_values(), true ) ? 'kt-position-' . $position : '';
}

function kotlinskidev_z_index_class_for( string $z_index ): string {
    return in_array( $z_index, kotlinskidev_valid_z_index_values(), true ) ? 'kt-z-' . $z_index : '';
}

function kotlinskidev_apply_position_z_index_classes( string $block_content, array $block ): string {
    if ( '' === trim( $block_content ) ) {
        return $block_content;
    }

    $attrs = is_array( $block['attrs'] ?? null ) ? $block['attrs'] : [];

    $classes = array_filter( [
        kotlinskidev_position_class_for( (string) ( $attrs['kotlinskidevPosition'] ?? '' ) ),
        kotlinskidev_z_index_class_for( (string) ( $attrs['kotlinskidevZIndex'] ?? '' ) ),
    ] );

    if ( empty( $classes ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . implode( ' ', $classes ) ) );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_position_z_index_classes', 10, 2 );
