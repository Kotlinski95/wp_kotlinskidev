<?php
function kotlinskidev_apply_line_clamp( string $block_content, array $block ): string {
    $enabled = ! empty( $block['attrs']['kotlinskidevLineClampEnabled'] );
    $lines   = absint( $block['attrs']['kotlinskidevLineClampLines'] ?? 0 );

    if ( ! $enabled || $lines < 1 || trim( $block_content ) === '' ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . 'kt-line-clamp' ) );

    $existing_style = $processor->get_attribute( 'style' );
    $existing_style = is_string( $existing_style ) ? rtrim( trim( $existing_style ), ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . '--kt-line-clamp-lines:' . $lines . ';' );

    $toggle = '<button type="button" class="kt-line-clamp-toggle" aria-expanded="false">' . esc_html__( 'Read more', 'kotlinskidev' ) . '</button>';

    return $processor->get_updated_html() . $toggle;
}
add_filter( 'render_block', 'kotlinskidev_apply_line_clamp', 10, 2 );
