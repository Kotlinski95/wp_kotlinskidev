<?php
function kotlinskidev_apply_load_more_attributes( string $block_content, array $block ): string
{
    if ( 'core/group' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    $load_more = $block['attrs']['loadMore'] ?? null;
    if ( empty( $block_content ) || ! is_array( $load_more ) || empty( $load_more['enabled'] ) ) {
        return $block_content;
    }

    $initial_count = absint( $load_more['initialCount'] ?? 0 );
    if ( $initial_count < 1 ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-has-load-more' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-has-load-more' ) );
    }

    $processor->set_attribute( 'data-kt-load-more-initial', (string) $initial_count );

    $button_label = sanitize_text_field( (string) ( $load_more['buttonLabel'] ?? '' ) );
    if ( '' !== $button_label ) {
        $processor->set_attribute( 'data-kt-load-more-label', $button_label );
    }

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_load_more_attributes', 10, 2 );
