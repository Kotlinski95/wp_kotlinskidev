<?php
require_once __DIR__ . '/responsive-block-markup.php';

const KOTLINSKIDEV_GRID_COLUMNS_MIN = 1;
const KOTLINSKIDEV_GRID_COLUMNS_MAX = 12;

function kotlinskidev_sanitize_grid_columns( $value ): string
{
    if ( ! is_numeric( $value ) ) {
        return '';
    }

    $columns = (int) round( (float) $value );

    if ( $columns < KOTLINSKIDEV_GRID_COLUMNS_MIN || $columns > KOTLINSKIDEV_GRID_COLUMNS_MAX ) {
        return '';
    }

    return (string) $columns;
}

function kotlinskidev_build_responsive_grid_columns_declarations( array $grid_columns ): array
{
    $declarations = [];

    foreach ( KOTLINSKIDEV_DEVICES_DESKTOP_FIRST as $device ) {
        $columns = kotlinskidev_sanitize_grid_columns( $grid_columns[ $device ] ?? '' );
        if ( '' !== $columns ) {
            $declarations[] = "--kt-grid-columns-{$device}:{$columns}";
        }
    }

    return $declarations;
}

function kotlinskidev_apply_responsive_grid_columns_style( string $block_content, array $block ): string
{
    $is_grid = ( $block['attrs']['layout']['type'] ?? '' ) === 'grid';
    $grid_columns = $block['attrs']['kotlinskidevGridColumns'] ?? null;

    if ( empty( $block_content ) || ! $is_grid || ! is_array( $grid_columns ) ) {
        return $block_content;
    }

    $declarations = kotlinskidev_build_responsive_grid_columns_declarations( $grid_columns );
    if ( empty( $declarations ) ) {
        return $block_content;
    }

    $processor = kotlinskidev_responsive_open_block_tag( $block_content );
    if ( null === $processor ) {
        return $block_content;
    }

    kotlinskidev_responsive_add_class_once( $processor, 'kt-has-responsive-grid-columns' );
    kotlinskidev_responsive_append_inline_declarations( $processor, $declarations );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_grid_columns_style', 10, 2 );
