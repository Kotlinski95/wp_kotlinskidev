<?php
function kotlinskidev_translated_text_collect_strings( array $blocks, array &$strings ): void {
    foreach ( $blocks as $block ) {
        $block_name = $block['blockName'] ?? '';

        if ( 'kotlinskidev/translated-text' === $block_name ) {
            $string_name = trim( (string) ( $block['attrs']['stringName'] ?? '' ) );
            $fallback    = (string) ( $block['attrs']['fallbackText'] ?? '' );
            $href        = (string) ( $block['attrs']['href'] ?? '' );

            if ( '' !== $string_name && '' !== $fallback ) {
                $strings[ $string_name ] = $fallback;

                if ( '' !== $href ) {
                    $strings[ $string_name . '-href' ] = $href;
                }
            }
        }

        if ( 'kotlinskidev/content-tabs-nav-link' === $block_name ) {
            $label = (string) ( $block['attrs']['label'] ?? '' );
            if ( '' !== $label ) {
                $strings[ $label ] = $label;
            }
        }

        if ( 'core/group' === $block_name ) {
            $button_label = (string) ( $block['attrs']['loadMore']['buttonLabel'] ?? '' );
            if ( '' !== $button_label ) {
                $strings[ $button_label ] = $button_label;
            }
        }

        if ( ! empty( $block['innerBlocks'] ) ) {
            kotlinskidev_translated_text_collect_strings( $block['innerBlocks'], $strings );
        }
    }
}

function kotlinskidev_translated_text_template_files(): array {
    return array_merge(
        glob( get_template_directory() . '/templates/*.html' ) ?: [],
        glob( get_template_directory() . '/parts/*.html' ) ?: []
    );
}

function kotlinskidev_translated_text_file_has_markers( string $content ): bool {
    foreach ( [ 'kotlinskidev/translated-text', 'kotlinskidev/content-tabs-nav-link', '"loadMore"' ] as $marker ) {
        if ( false !== strpos( $content, $marker ) ) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_register_translated_text_strings(): void {
    if ( ! function_exists( 'pll_register_string' ) ) {
        return;
    }

    $strings = [];

    foreach ( kotlinskidev_translated_text_template_files() as $file ) {
        $content = file_get_contents( $file );
        if ( false === $content || ! kotlinskidev_translated_text_file_has_markers( $content ) ) {
            continue;
        }

        kotlinskidev_translated_text_collect_strings( parse_blocks( $content ), $strings );
    }

    foreach ( $strings as $name => $fallback ) {
        pll_register_string( $name, $fallback, 'kotlinskidev' );
    }
}
add_action( 'admin_init', 'kotlinskidev_register_translated_text_strings' );
