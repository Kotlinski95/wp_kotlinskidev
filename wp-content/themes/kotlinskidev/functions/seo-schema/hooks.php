<?php
function kotlinskidev_seo_schema_graph_filter( $graph, $yoast_context = null ) {
    if ( ! kotlinskidev_feature_enabled( 'custom_seo' ) || ! is_array( $graph ) ) {
        return $graph;
    }
    return kotlinskidev_seo_consolidate_schema_graph( $graph, kotlinskidev_schema_build_context() );
}
add_filter( 'wpseo_schema_graph', 'kotlinskidev_seo_schema_graph_filter', 30, 2 );

function kotlinskidev_hreflang_add_x_default( $hreflangs ) {
    if ( ! kotlinskidev_feature_enabled( 'custom_seo' ) || ! is_array( $hreflangs ) || ! function_exists( 'pll_default_language' ) ) {
        return $hreflangs;
    }
    foreach ( array_keys( $hreflangs ) as $code ) {
        if ( 'x-default' === strtolower( (string) $code ) ) {
            return $hreflangs;
        }
    }
    $default = strtolower( (string) pll_default_language() );
    foreach ( $hreflangs as $code => $url ) {
        $prefix = strtolower( (string) strtok( str_replace( '_', '-', (string) $code ), '-' ) );
        if ( $prefix === $default && is_string( $url ) && '' !== $url ) {
            $hreflangs['x-default'] = $url;
            break;
        }
    }
    return $hreflangs;
}
add_filter( 'pll_rel_hreflang_attributes', 'kotlinskidev_hreflang_add_x_default' );
