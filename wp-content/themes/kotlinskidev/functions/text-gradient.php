<?php
function kotlinskidev_apply_text_gradient_style( string $block_content, array $block ): string
{
    $text_gradient = $block['attrs']['textGradient'] ?? '';

    if ( empty( $block_content ) || '' === $text_gradient ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-gradient-text' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-gradient-text' ) );
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . '--kt-text-gradient:' . $text_gradient . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_text_gradient_style', 10, 2 );
