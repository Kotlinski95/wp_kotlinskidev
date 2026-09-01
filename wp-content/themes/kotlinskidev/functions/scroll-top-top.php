<?php
define( 'KOTLINSKIDEV_SCROLL_TO_TOP_ICON_ID', 5505 );
define( 'KOTLINSKIDEV_SCROLL_TO_TOP_LABEL_STRING_NAME', 'Scroll To Top Button Label' );
define( 'KOTLINSKIDEV_SCROLL_TO_TOP_LABEL_DEFAULT', 'Scroll to Top' );

function kotlinskidev_scroll_to_top_register_string() {
    if ( function_exists( 'pll_register_string' ) ) {
        pll_register_string(
            KOTLINSKIDEV_SCROLL_TO_TOP_LABEL_STRING_NAME,
            KOTLINSKIDEV_SCROLL_TO_TOP_LABEL_DEFAULT,
            'kotlinskidev'
        );
    }
}
add_action( 'init', 'kotlinskidev_scroll_to_top_register_string' );

function kotlinskidev_scroll_to_top_default_label() {
    if ( function_exists( 'pll__' ) ) {
        return pll__( KOTLINSKIDEV_SCROLL_TO_TOP_LABEL_DEFAULT );
    }

    return __( 'Scroll to Top', 'kotlinskidev' );
}

function kotlinskidev_scroll_to_top_fixed_markup( $label ) {
    return '
    <div class="wp-block-buttons" style="margin-top:0;margin-bottom:0">
        <div class="wp-block-button kotlinskidev-scrollto-top is-style-button-hover-secondary-bgcolor">
            <div class="scroll-to-top-wrapper">
                <svg class="progress-ring" width="40" height="40">
                    <circle class="progress-ring__background"
                            cx="20" cy="20" r="18"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            opacity="0.3"/>
                    <circle class="progress-ring__progress"
                            cx="20" cy="20" r="18"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            transform="rotate(0 20 20)"/>
                </svg>
                <a id="scroll-to-top" class="wp-block-button__link wp-element-button" style="border-radius:100%" aria-label="' . esc_attr( $label ) . '" tabindex="0">
                    <span class="kt-icon" style="--kt-icon-size:2rem;">' . kotlinskidev_inline_nav_icon( KOTLINSKIDEV_SCROLL_TO_TOP_ICON_ID ) . '</span>
                    <span tabindex="-1" style="display:none;">' . esc_html( $label ) . '</span>
                </a>
            </div>
        </div>
    </div>';
}

function kotlinskidev_scroll_to_top_arrow_markup( array $attributes ) {
    $icon_id = absint( $attributes['arrowIconId'] ?? 0 );
    if ( empty( $attributes['showArrow'] ) || ! $icon_id ) {
        return '';
    }

    $svg = kotlinskidev_inline_nav_icon( $icon_id );
    if ( '' === $svg ) {
        return '';
    }

    $arrow_size = absint( $attributes['arrowSize'] ?? 16 );
    if ( ! $arrow_size ) {
        $arrow_size = 16;
    }

    return '<span class="kt-icon kt-scroll-to-top__arrow" style="--kt-icon-size:' . $arrow_size . 'px;">' . $svg . '</span>';
}

function kotlinskidev_scroll_to_top_bar_markup( $label, array $attributes = [] ) {
    return '
    <button type="button" class="kt-scroll-to-top__trigger" aria-label="' . esc_attr( $label ) . '">
        <span>' . esc_html( $label ) . '</span>' . kotlinskidev_scroll_to_top_arrow_markup( $attributes ) . '
    </button>';
}

function kotlinskidev_scroll_to_top_markup( $variant = 'fixed', array $attributes = [] ) {
    $label = kotlinskidev_scroll_to_top_default_label();

    if ( 'bar' === $variant ) {
        return kotlinskidev_scroll_to_top_bar_markup( $label, $attributes );
    }

    return kotlinskidev_scroll_to_top_fixed_markup( $label );
}

function kotlinskidev_scroll_to_top_shortcode() {
    return kotlinskidev_scroll_to_top_markup( 'fixed' );
}
add_shortcode( 'scroll_to_top', 'kotlinskidev_scroll_to_top_shortcode' );
