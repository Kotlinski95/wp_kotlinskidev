<?php
function kotlinskidev_apply_text_shadow_style( string $block_content, array $block ): string {
    $text_shadow = $block['attrs']['kotlinskidevTextShadow'] ?? '';
    if ( $text_shadow === '' || trim( $block_content ) === '' ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_style = $processor->get_attribute( 'style' );
    $existing_style = is_string( $existing_style ) ? rtrim( trim( $existing_style ), ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . 'text-shadow:' . $text_shadow . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_text_shadow_style', 10, 2 );
