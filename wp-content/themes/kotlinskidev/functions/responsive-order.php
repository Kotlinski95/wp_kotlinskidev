<?php
const KOTLINSKIDEV_RESPONSIVE_ORDER_MIN = -1;
const KOTLINSKIDEV_RESPONSIVE_ORDER_MAX = 20;

function kotlinskidev_responsive_order_class( string $device, $order ): string
{
    $is_orderable = null !== $order
        && $order >= KOTLINSKIDEV_RESPONSIVE_ORDER_MIN
        && $order <= KOTLINSKIDEV_RESPONSIVE_ORDER_MAX
        && 0 != $order;

    return $is_orderable ? 'order-' . $device . '-' . $order : '';
}

function kotlinskidev_responsive_order_classes( $responsive_order ): array
{
    $classes = [];

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        $class = kotlinskidev_responsive_order_class( $device, $responsive_order[ $device ] ?? null );
        if ( '' !== $class ) {
            $classes[] = $class;
        }
    }

    return $classes;
}

function kotlinskidev_merge_class_into_first_tag( string $block_content, string $class_attribute ): string
{
    if ( false === strpos( $block_content, 'class=' ) ) {
        return preg_replace(
            '/^(\s*)(<[^>]+)(>)/',
            '$1$2 class="' . $class_attribute . '"$3',
            $block_content
        );
    }

    return preg_replace(
        '/^(\s*<[^>]+class="[^"]*)"/',
        '$1 ' . $class_attribute . '"',
        $block_content
    );
}

function kotlinskidev_add_responsive_order_attributes( $block_content, $block )
{
    if ( ! isset( $block['attrs']['responsiveOrder'] ) ) {
        return $block_content;
    }

    $classes = kotlinskidev_responsive_order_classes( $block['attrs']['responsiveOrder'] );
    if ( empty( $classes ) ) {
        return $block_content;
    }

    return kotlinskidev_merge_class_into_first_tag( $block_content, esc_attr( implode( ' ', $classes ) ) );
}
add_filter( 'render_block', 'kotlinskidev_add_responsive_order_attributes', 10, 2 );
