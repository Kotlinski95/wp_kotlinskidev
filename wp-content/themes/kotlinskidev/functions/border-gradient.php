<?php
function kotlinskidev_border_gradient_excluded_blocks(): array
{
    return [ 'kotlinskidev/button' ];
}

function kotlinskidev_apply_border_gradient_style( string $block_content, array $block ): string
{
    $border_gradient = $block['attrs']['borderGradient'] ?? '';
    $block_name      = $block['blockName'] ?? '';

    if ( empty( $block_content ) || '' === $border_gradient ) {
        return $block_content;
    }

    if ( in_array( $block_name, kotlinskidev_border_gradient_excluded_blocks(), true ) ) {
        return $block_content;
    }

    $declarations = [ '--kt-border-gradient:' . $border_gradient ];

    $border_width = $block['attrs']['style']['border']['width'] ?? '';
    if ( is_string( $border_width ) && '' !== $border_width ) {
        $declarations[] = '--kt-border-width:' . $border_width;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-has-gradient-border' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-has-gradient-border' ) );
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_border_gradient_style', 10, 2 );
