<?php
function kotlinskidev_apply_bg_effect_preset( string $block_content, array $block ): string {
    if ( '' === trim( $block_content ) ) {
        return $block_content;
    }

    $preset_id = absint( $block['attrs']['backgroundEffectPresetId'] ?? 0 );
    if ( ! $preset_id ) {
        return $block_content;
    }

    $preset = kotlinskidev_build_bg_effect_preset( $preset_id );
    if ( empty( $preset ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_classes = preg_split( '/\s+/', trim( (string) ( $processor->get_attribute( 'class' ) ?? '' ) ) );
    $existing_classes = array_filter( $existing_classes );
    $kept_classes     = array_diff( $existing_classes, array_map(
        static fn ( string $type ) => 'kt-bg-fx-' . $type,
        kotlinskidev_bg_effect_types()
    ) );

    $preset_class = 'kt-bg-fx-' . $preset['effectType'];
    $processor->set_attribute( 'class', trim( implode( ' ', [ ...$kept_classes, $preset_class ] ) ) );

    $style_parts = [ '--kt-bg-fx-duration:' . $preset['duration'] . 's;' ];
    if ( '' !== $preset['color1'] ) {
        $style_parts[] = '--kt-bg-fx-color-1:' . $preset['color1'] . ';';
    }
    if ( '' !== $preset['color2'] ) {
        $style_parts[] = '--kt-bg-fx-color-2:' . $preset['color2'] . ';';
    }
    if ( '' !== $preset['color3'] ) {
        $style_parts[] = '--kt-bg-fx-color-3:' . $preset['color3'] . ';';
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( '', $style_parts ) );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_bg_effect_preset', 10, 2 );
