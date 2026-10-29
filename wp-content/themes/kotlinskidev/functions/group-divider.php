<?php
function kotlinskidev_resolve_grid_divider_columns( array $grid_columns ): array
{
    $resolved = [];
    $carry = null;

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        $value = $grid_columns[ $device ] ?? null;
        if ( is_numeric( $value ) ) {
            $columns = (int) round( (float) $value );
            if ( $columns >= 1 && $columns <= 12 ) {
                $carry = $columns;
            }
        }
        if ( null !== $carry ) {
            $resolved[ $device ] = $carry;
        }
    }

    return $resolved;
}

function kotlinskidev_build_grid_divider_edge_css( string $selector, int $columns, int $total_items ): string
{
    if ( $total_items < 1 ) {
        return '';
    }

    $last_row_count = $total_items % $columns;
    if ( 0 === $last_row_count ) {
        $last_row_count = $columns;
    }
    $last_row_start = $total_items - $last_row_count + 1;

    return "{$selector}>*:nth-child(n+{$last_row_start}){border-bottom:none}{$selector}>*:nth-child({$columns}n){border-right:none}";
}

function kotlinskidev_apply_grid_divider_precise_style( string $block_content, array $block ): string
{
    $is_grid = ( $block['attrs']['layout']['type'] ?? '' ) === 'grid';
    $divider_enabled = ! empty( $block['attrs']['kotlinskidevDividerBetween'] );
    $grid_columns = $block['attrs']['kotlinskidevGridColumns'] ?? null;

    if ( empty( $block_content ) || ! $is_grid || ! $divider_enabled || ! is_array( $grid_columns ) ) {
        return $block_content;
    }

    $resolved_columns = kotlinskidev_resolve_grid_divider_columns( $grid_columns );
    if ( empty( $resolved_columns ) ) {
        return $block_content;
    }

    $total_items = count( $block['innerBlocks'] ?? [] );
    if ( $total_items < 1 ) {
        return $block_content;
    }

    static $instance = 0;
    $instance++;
    $unique_class = "kt-divider-grid-{$instance}";

    $media_queries = kotlinskidev_get_css_breakpoints();
    $css = '';

    foreach ( $resolved_columns as $device => $columns ) {
        $declarations = kotlinskidev_build_grid_divider_edge_css( ".{$unique_class}", $columns, $total_items );
        if ( '' !== $declarations ) {
            $css .= "{$media_queries[ $device ]}{{$declarations}}";
        }
    }

    if ( '' === $css ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    $processor->set_attribute( 'class', trim( $existing_class . ' ' . $unique_class ) );

    return $processor->get_updated_html() . '<style>' . $css . '</style>';
}
add_filter( 'render_block', 'kotlinskidev_apply_grid_divider_precise_style', 10, 2 );
