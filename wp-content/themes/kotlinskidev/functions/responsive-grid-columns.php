<?php
function kotlinskidev_sanitize_grid_columns( $value ): string
{
    if ( ! is_numeric( $value ) ) {
        return '';
    }

    $columns = (int) round( (float) $value );

    if ( $columns < 1 || $columns > 12 ) {
        return '';
    }

    return (string) $columns;
}

function kotlinskidev_build_responsive_grid_columns_declarations( array $grid_columns ): array
{
    $declarations = [];

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
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

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-has-responsive-grid-columns' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-has-responsive-grid-columns' ) );
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_grid_columns_style', 10, 2 );
