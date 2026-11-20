<?php
if (!defined('ABSPATH')) {
    exit;
}

function kotlinskidev_valid_hover_animations() {
    return [
        'hover-jump',
        'hover-jump-subtle',
        'hover-jump-smooth',
        'hover-jump-strong',
        'hover-jump-shadow',
        'hover-scale',
        'hover-fade',
        'hover-rotate',
        'hover-bounce',
        'constant-bounce',
        'constant-bounce-subtle',
        'constant-bounce-strong',
        'constant-bounce-fast',
    ];
}

function kotlinskidev_hover_animation_base_classes( array $attrs ): array {
    $valid_animations = kotlinskidev_valid_hover_animations();

    $primary = (string) ( $attrs['hoverAnimation'] ?? '' );
    $extra = is_array( $attrs['hoverAnimationExtra'] ?? null ) ? $attrs['hoverAnimationExtra'] : [];
    $opacity_enabled = ! empty( $attrs['hoverOpacityEnabled'] );

    $classes = array_values( array_unique( array_filter(
        array_merge( [ $primary ], $extra ),
        fn( $value ) => in_array( $value, $valid_animations, true )
    ) ) );

    if ( $opacity_enabled ) {
        $classes[] = 'has-hover-opacity';
    }

    return $classes;
}

function kotlinskidev_hover_color_rules( array $attrs ): array {
    $hover_background_color = (string) ( $attrs['hoverBackgroundColor'] ?? '' );
    $hover_text_color       = (string) ( $attrs['hoverTextColor'] ?? '' );
    $hover_border_color     = (string) ( $attrs['hoverBorderColor'] ?? '' );
    $hover_enhanced_glow    = ! empty( $attrs['hoverEnhancedGlow'] );
    $classes                = [];
    $declarations           = [];

    if ( '' !== $hover_background_color || '' !== $hover_text_color ) {
        $classes[] = 'has-hover-color-transition';
    }

    if ( '' !== $hover_background_color ) {
        $classes[] = 'has-hover-bg-color';
        $declarations[] = '--hover-bg-color:' . $hover_background_color;
    }

    if ( '' !== $hover_text_color ) {
        $is_text_gradient = str_contains( $hover_text_color, 'gradient' );

        if ( ! $hover_enhanced_glow ) {
            $classes[] = 'has-hover-text-color';
        }

        if ( $is_text_gradient ) {
            $classes[] = 'has-hover-text-gradient';
        }

        $declarations[] = '--hover-text-color:' . $hover_text_color;

        if ( $hover_enhanced_glow && ! $is_text_gradient ) {
            $declarations[] = '--hover-text-spotlight-color:' . $hover_text_color;
        }
    }

    if ( '' !== $hover_border_color ) {
        $classes[] = 'has-hover-border';
        $declarations[] = '--hover-border-color:' . $hover_border_color;
    }

    if ( $hover_enhanced_glow ) {
        $classes[] = 'has-enhanced-hover-glow';
    }

    return [ 'classes' => $classes, 'declarations' => $declarations ];
}

function kotlinskidev_apply_hover_classes_and_styles( string $block_content, array $classes, array $declarations ): ?string {
    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return null;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . implode( ' ', array_unique( $classes ) ) ) );

    if ( ! empty( $declarations ) ) {
        $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
        $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
        $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );
    }

    return $processor->get_updated_html();
}

function kotlinskidev_render_block_with_hover_animation($block_content, $block) {
    if (empty($block_content) || trim($block_content) === '') {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? [];
    $color_rules = kotlinskidev_hover_color_rules( $attrs );
    $classes = array_merge( kotlinskidev_hover_animation_base_classes( $attrs ), $color_rules['classes'] );
    $declarations = $color_rules['declarations'];
    $hover_enhanced_glow = ! empty( $attrs['hoverEnhancedGlow'] );

    if ( false === ( $attrs['inViewHover'] ?? true ) && ! empty( $classes ) ) {
        $classes[] = 'kt-in-view-hover-off';
    }

    if ( empty( $classes ) ) {
        return $block_content;
    }

    $content = kotlinskidev_apply_hover_classes_and_styles( $block_content, $classes, $declarations );
    if ( null === $content ) {
        return $block_content;
    }

    if ( $hover_enhanced_glow && 'core/button' === ( $block['blockName'] ?? '' ) ) {
        $content = kotlinskidev_wrap_button_glow_label( $content );
    }

    return $content;
}

function kotlinskidev_wrap_button_glow_label( string $content ): string
{
    return (string) preg_replace_callback(
        '/(<a\b[^>]*\bclass="[^"]*\bwp-block-button__link\b[^"]*"[^>]*>)(.*?)(<\/a>)/s',
        fn( array $matches ): string => $matches[1] . '<span class="kt-btn-glow-text">' . $matches[2] . '</span>' . $matches[3],
        $content
    );
}
add_filter('render_block', 'kotlinskidev_render_block_with_hover_animation', 10, 2);
