<?php

const KOTLINSKIDEV_FOOTER_BRAND_ALIGNMENT_SETTING = 'kotlinskidev_footer_brand_alignment';
const KOTLINSKIDEV_FOOTER_NAV_ALIGNMENT_SETTING   = 'kotlinskidev_footer_nav_alignment';
const KOTLINSKIDEV_FOOTER_COLUMNS_MOBILE_SETTING  = 'kotlinskidev_footer_columns_mobile';
const KOTLINSKIDEV_FOOTER_COLUMNS_TABLET_SETTING  = 'kotlinskidev_footer_columns_tablet';
const KOTLINSKIDEV_FOOTER_MAX_COLUMNS_MOBILE      = 3;
const KOTLINSKIDEV_FOOTER_MAX_COLUMNS_TABLET      = 4;
const KOTLINSKIDEV_FOOTER_DEFAULT_COLUMNS         = 1;

function kotlinskidev_footer_alignment_choices(): array {
    return [
        'left'   => __( 'Left aligned (default)', 'kotlinskidev' ),
        'center' => __( 'Centered', 'kotlinskidev' ),
    ];
}

function kotlinskidev_footer_columns_choices( int $max ): array {
    $choices = [];

    for ( $columns = 1; $columns <= $max; $columns++ ) {
        $choices[ (string) $columns ] = (string) $columns;
    }

    return $choices;
}

function kotlinskidev_footer_alignment_sanitize( $value ): string {
    $value = is_string( $value ) ? $value : '';

    return array_key_exists( $value, kotlinskidev_footer_alignment_choices() ) ? $value : 'left';
}

function kotlinskidev_footer_columns_sanitize( $value, int $max ): int {
    if ( ! is_numeric( $value ) ) {
        return KOTLINSKIDEV_FOOTER_DEFAULT_COLUMNS;
    }

    return max( 1, min( $max, (int) $value ) );
}

function kotlinskidev_footer_columns_mobile_sanitize( $value ): int {
    return kotlinskidev_footer_columns_sanitize( $value, KOTLINSKIDEV_FOOTER_MAX_COLUMNS_MOBILE );
}

function kotlinskidev_footer_columns_tablet_sanitize( $value ): int {
    return kotlinskidev_footer_columns_sanitize( $value, KOTLINSKIDEV_FOOTER_MAX_COLUMNS_TABLET );
}

function kotlinskidev_footer_brand_alignment_current(): string {
    return kotlinskidev_footer_alignment_sanitize( get_theme_mod( KOTLINSKIDEV_FOOTER_BRAND_ALIGNMENT_SETTING, 'left' ) );
}

function kotlinskidev_footer_nav_alignment_current(): string {
    return kotlinskidev_footer_alignment_sanitize( get_theme_mod( KOTLINSKIDEV_FOOTER_NAV_ALIGNMENT_SETTING, 'left' ) );
}

function kotlinskidev_footer_columns_mobile_current(): int {
    return kotlinskidev_footer_columns_mobile_sanitize( get_theme_mod( KOTLINSKIDEV_FOOTER_COLUMNS_MOBILE_SETTING, KOTLINSKIDEV_FOOTER_DEFAULT_COLUMNS ) );
}

function kotlinskidev_footer_columns_tablet_current(): int {
    return kotlinskidev_footer_columns_tablet_sanitize( get_theme_mod( KOTLINSKIDEV_FOOTER_COLUMNS_TABLET_SETTING, KOTLINSKIDEV_FOOTER_DEFAULT_COLUMNS ) );
}

function kotlinskidev_footer_layout_customize_register( WP_Customize_Manager $wp_customize ): void {
    $wp_customize->add_section(
        'kotlinskidev_footer_layout',
        [
            'title'       => __( 'Footer layout (mobile and tablet)', 'kotlinskidev' ),
            'priority'    => 201,
            'description' => __( 'Choose how the footer is laid out below the desktop breakpoint. Desktop is not affected. Left aligned with 1 column on both devices is the original layout.', 'kotlinskidev' ),
        ]
    );

    $alignment_controls = [
        KOTLINSKIDEV_FOOTER_BRAND_ALIGNMENT_SETTING => __( 'Brand alignment (photo, description, social links)', 'kotlinskidev' ),
        KOTLINSKIDEV_FOOTER_NAV_ALIGNMENT_SETTING   => __( 'Navigation alignment (headings, links, contact)', 'kotlinskidev' ),
    ];

    foreach ( $alignment_controls as $setting => $label ) {
        $wp_customize->add_setting(
            $setting,
            [
                'default'           => 'left',
                'transport'         => 'refresh',
                'sanitize_callback' => 'kotlinskidev_footer_alignment_sanitize',
            ]
        );

        $wp_customize->add_control(
            $setting,
            [
                'label'    => $label,
                'section'  => 'kotlinskidev_footer_layout',
                'settings' => $setting,
                'type'     => 'radio',
                'choices'  => kotlinskidev_footer_alignment_choices(),
            ]
        );
    }

    $column_controls = [
        KOTLINSKIDEV_FOOTER_COLUMNS_MOBILE_SETTING => [
            'label'     => __( 'Link columns on mobile', 'kotlinskidev' ),
            'max'       => KOTLINSKIDEV_FOOTER_MAX_COLUMNS_MOBILE,
            'sanitizer' => 'kotlinskidev_footer_columns_mobile_sanitize',
        ],
        KOTLINSKIDEV_FOOTER_COLUMNS_TABLET_SETTING => [
            'label'     => __( 'Link columns on tablet', 'kotlinskidev' ),
            'max'       => KOTLINSKIDEV_FOOTER_MAX_COLUMNS_TABLET,
            'sanitizer' => 'kotlinskidev_footer_columns_tablet_sanitize',
        ],
    ];

    foreach ( $column_controls as $setting => $control ) {
        $wp_customize->add_setting(
            $setting,
            [
                'default'           => KOTLINSKIDEV_FOOTER_DEFAULT_COLUMNS,
                'transport'         => 'refresh',
                'sanitize_callback' => $control['sanitizer'],
            ]
        );

        $wp_customize->add_control(
            $setting,
            [
                'label'    => $control['label'],
                'section'  => 'kotlinskidev_footer_layout',
                'settings' => $setting,
                'type'     => 'select',
                'choices'  => kotlinskidev_footer_columns_choices( $control['max'] ),
            ]
        );
    }
}
add_action( 'customize_register', 'kotlinskidev_footer_layout_customize_register' );

function kotlinskidev_footer_layout_body_class( array $classes ): array {
    if ( 'center' === kotlinskidev_footer_brand_alignment_current() ) {
        $classes[] = 'kt-footer-brand--center';
    }

    if ( 'center' === kotlinskidev_footer_nav_alignment_current() ) {
        $classes[] = 'kt-footer-nav--center';
    }

    $mobile_columns = kotlinskidev_footer_columns_mobile_current();
    $tablet_columns = kotlinskidev_footer_columns_tablet_current();

    if ( $mobile_columns > 1 ) {
        $classes[] = 'kt-footer-cols-mobile-' . $mobile_columns;
    }

    if ( $tablet_columns > 1 ) {
        $classes[] = 'kt-footer-cols-tablet-' . $tablet_columns;
    }

    return $classes;
}
add_filter( 'body_class', 'kotlinskidev_footer_layout_body_class' );
