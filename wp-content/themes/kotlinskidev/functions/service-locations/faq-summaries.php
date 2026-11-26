<?php
function kotlinskidev_service_location_faq_summary_strings(): array {
    return [
        'Ile trwa realizacja strony internetowej?',
        'Czy spotkamy się w %CITY%?',
        'Co obejmuje opieka po wdrożeniu?',
        'Czy strona będzie widoczna w Google?',
        'Kto tworzy treści na stronę?',
    ];
}

function kotlinskidev_register_service_location_faq_summary_strings(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    if ( ! function_exists( 'pll_register_string' ) ) {
        return;
    }
    foreach ( kotlinskidev_service_location_faq_summary_strings() as $string ) {
        pll_register_string( $string, $string, 'kotlinskidev' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_faq_summary_strings' );

function kotlinskidev_translate_service_location_faq_summary( string $summary ): ?string {
    $translated = function_exists( 'pll__' ) ? pll__( $summary ) : $summary;

    if ( false === strpos( $summary, '%CITY%' ) ) {
        return $translated;
    }

    $city = (string) get_post_meta( get_the_ID(), 'city', true );
    if ( '' === $city ) {
        return null;
    }

    return str_replace( '%CITY%', esc_html( $city ), $translated );
}

function kotlinskidev_apply_service_location_faq_summaries( string $block_content, array $block ): string {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $block_content;
    }

    if ( 'core/details' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    foreach ( kotlinskidev_service_location_faq_summary_strings() as $string ) {
        if ( false === strpos( $block_content, $string ) ) {
            continue;
        }

        $translated = kotlinskidev_translate_service_location_faq_summary( $string );
        if ( null === $translated ) {
            continue;
        }

        $block_content = str_replace( $string, $translated, $block_content );
    }

    return $block_content;
}
add_filter( 'render_block', 'kotlinskidev_apply_service_location_faq_summaries', 10, 2 );
