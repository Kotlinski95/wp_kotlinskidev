<?php
function kotlinskidev_apply_link_hover_effects( string $block_content, array $block ): string
{
    $effects = $block['attrs']['linkHoverEffects'] ?? null;

    if ( empty( $block_content ) || ! is_array( $effects ) ) {
        return $block_content;
    }

    $wrapper_classes = [];
    if ( ! empty( $effects['disableBackgroundHover'] ) ) {
        $wrapper_classes[] = 'kt-hover-no-background';
    }
    if ( ! empty( $effects['disableUnderlineHover'] ) ) {
        $wrapper_classes[] = 'kt-hover-no-underline';
    }
    if ( ! empty( $effects['enableUnderlineHover'] ) ) {
        $wrapper_classes[] = 'kt-hover-add-underline';
    }

    if ( ! empty( $wrapper_classes ) ) {
        $processor = new WP_HTML_Tag_Processor( $block_content );
        if ( $processor->next_tag() ) {
            $existing_class = $processor->get_attribute( 'class' ) ?? '';
            $processor->set_attribute( 'class', trim( $existing_class . ' ' . implode( ' ', $wrapper_classes ) ) );
            $block_content = $processor->get_updated_html();
        }
    }

    if ( ! empty( $effects['disableLinkGradient'] ) ) {
        $processor = new WP_HTML_Tag_Processor( $block_content );
        while ( $processor->next_tag( 'a' ) ) {
            $existing_class = $processor->get_attribute( 'class' ) ?? '';
            $processor->set_attribute( 'class', trim( $existing_class . ' kt-hover-no-link-gradient' ) );
        }
        $block_content = $processor->get_updated_html();
    }

    return $block_content;
}
add_filter( 'render_block', 'kotlinskidev_apply_link_hover_effects', 10, 2 );
