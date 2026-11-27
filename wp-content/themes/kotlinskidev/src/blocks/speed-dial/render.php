<?php
$items_html = [];

foreach ( $block->inner_blocks as $item_block ) {
    if ( 'kotlinskidev/speed-dial-item' !== $item_block->name ) {
        continue;
    }

    $item_block->attributes['index'] = count( $items_html );
    $item_html                       = $item_block->render();

    if ( '' !== trim( $item_html ) ) {
        $items_html[] = $item_html;
    }
}

if ( [] === $items_html ) {
    return;
}

$position  = is_array( $attributes['position'] ?? null ) ? $attributes['position'] : [];
$offset    = is_array( $attributes['offset'] ?? null ) ? $attributes['offset'] : [];
$direction = sanitize_key( (string) ( $attributes['direction'] ?? 'auto' ) );
$labels    = in_array( $attributes['labels'] ?? 'auto', [ 'auto', 'tooltip', 'always', 'hidden' ], true ) ? $attributes['labels'] : 'auto';
$motion    = in_array( $attributes['motion'] ?? 'scale', [ 'scale', 'fade', 'none' ], true ) ? $attributes['motion'] : 'scale';

$classes = array_merge(
    [ 'kt-speed-dial', 'kt-speed-dial--motion-' . $motion, 'kt-speed-dial--labels-' . $labels ],
    kotlinskidev_speed_dial_layout_classes( $position, $direction )
);
if ( ! isset( $attributes['avoidMobileNav'] ) || (bool) $attributes['avoidMobileNav'] ) {
    $classes[] = 'kt-speed-dial--avoid-mobile-nav';
}

$style_declarations = [ '--kt-speed-dial-z:' . kotlinskidev_speed_dial_z_index( $attributes['zIndex'] ?? null ) ];
$style_declarations[] = '--kt-speed-dial-toggle-size:' . kotlinskidev_speed_dial_size_css( $attributes['toggleSize'] ?? null, KOTLINSKIDEV_SPEED_DIAL_DEFAULT_TOGGLE_SIZE );
$style_declarations[] = '--kt-speed-dial-item-size:' . kotlinskidev_speed_dial_size_css( $attributes['itemSize'] ?? null, KOTLINSKIDEV_SPEED_DIAL_DEFAULT_ITEM_SIZE );
$device_prefixes    = [ 'desktop' => 'd', 'tablet' => 't', 'mobile' => 'm' ];
foreach ( $device_prefixes as $device => $prefix ) {
    $device_offset        = is_array( $offset[ $device ] ?? null ) ? $offset[ $device ] : [];
    $style_declarations[] = '--kt-speed-dial-' . $prefix . 'x:' . kotlinskidev_speed_dial_offset_css( $device_offset['x'] ?? null );
    $style_declarations[] = '--kt-speed-dial-' . $prefix . 'y:' . kotlinskidev_speed_dial_offset_css( $device_offset['y'] ?? null );
}

$color_properties = [
    'toggleBackgroundColor' => '--kt-speed-dial-toggle-bg',
    'toggleTextColor'       => '--kt-speed-dial-toggle-fg',
    'itemBackgroundColor'   => '--kt-speed-dial-item-bg',
    'itemTextColor'         => '--kt-speed-dial-item-fg',
];
foreach ( $color_properties as $attribute => $property ) {
    $color = kotlinskidev_speed_dial_safe_color( $attributes[ $attribute ] ?? '' );
    if ( '' !== $color ) {
        $style_declarations[] = $property . ':' . $color;
    }
}

$toggle_label_text = trim( (string) ( $attributes['label'] ?? '' ) );
$toggle_label      = '' !== $toggle_label_text ? kotlinskidev_speed_dial_translate( $toggle_label_text ) : __( 'Quick actions', 'kotlinskidev' );

$toggle_icon_id  = absint( $attributes['toggleIconId'] ?? 0 );
$toggle_icon_svg = $toggle_icon_id > 0 ? kotlinskidev_inline_nav_icon( $toggle_icon_id ) : '';
if ( '' === $toggle_icon_svg ) {
    $toggle_icon_svg = kotlinskidev_speed_dial_icon_svg( sanitize_key( (string) ( $attributes['toggleIcon'] ?? 'plus' ) ) );
}
if ( '' === $toggle_icon_svg ) {
    $toggle_icon_svg = kotlinskidev_speed_dial_icon_svg( 'plus' );
}

$list_id = wp_unique_id( 'kt-speed-dial-' ) . '-list';

$wrapper_attributes = get_block_wrapper_attributes( [
    'class'                    => implode( ' ', $classes ),
    'style'                    => implode( ';', $style_declarations ),
    'data-kt-speed-dial'       => '',
    'data-close-on-action'     => ! isset( $attributes['closeOnAction'] ) || (bool) $attributes['closeOnAction'] ? 'true' : 'false',
    'hidden'                   => '',
] );

printf(
    '<div %1$s><button type="button" class="kt-speed-dial__toggle" aria-expanded="false" aria-controls="%2$s" aria-label="%3$s"><span class="kt-speed-dial__toggle-icon" aria-hidden="true">%4$s</span><span class="kt-speed-dial__toggle-close" aria-hidden="true">%5$s</span></button><ul id="%2$s" class="kt-speed-dial__list" aria-label="%3$s" hidden>%6$s</ul></div>',
    $wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already escaped internally
    esc_attr( $list_id ),
    esc_attr( $toggle_label ),
    $toggle_icon_svg, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- validated built-in icon markup or sanitized Media Library SVG
    kotlinskidev_speed_dial_icon_svg( 'close' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- validated built-in icon markup
    implode( '', $items_html ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each item is WP_Block::render() output from the escaping item render.php
);
