<?php
$style_vars = [];

$card_hover_background_color = trim( (string) ( $attributes['cardHoverBackgroundColor'] ?? '' ) );
if ( '' !== $card_hover_background_color ) {
    $style_vars['--kt-post-card-grid-card-hover-bg'] = $card_hover_background_color;
}

$blur_other_cards = ! empty( $attributes['blurOtherCards'] );
if ( $blur_other_cards ) {
    $blur_amount = trim( (string) ( $attributes['blurAmount'] ?? '' ) );
    if ( '' !== $blur_amount ) {
        $style_vars['--kt-blur-amount'] = $blur_amount;
    }
}

$style_declarations = [];
foreach ( $style_vars as $property => $value ) {
    $style_declarations[] = $property . ':' . $value;
}

$wrapper_attrs = get_block_wrapper_attributes( [
    'style' => ! empty( $style_declarations ) ? implode( ';', $style_declarations ) . ';' : '',
] );

echo '<div ' . $wrapper_attrs . '>' . kotlinskidev_render_popular_content_fresh_per_language( $blur_other_cards ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_popular_content_fresh_per_language() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
