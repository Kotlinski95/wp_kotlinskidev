<?php
function kotlinskidev_contact_card_register_strings(): void {
    if ( ! function_exists( 'pll_register_string' ) ) {
        return;
    }

    pll_register_string( 'Contact Card Address', get_option( 'kotlinskidev_contact_address', '' ), 'kotlinskidev' );
    pll_register_string( 'Contact Card Hours', get_option( 'kotlinskidev_contact_hours', '' ), 'kotlinskidev' );
}
add_action( 'init', 'kotlinskidev_contact_card_register_strings' );

function kotlinskidev_get_contact_info(): array {
    $address = (string) get_option( 'kotlinskidev_contact_address', '' );
    $hours   = (string) get_option( 'kotlinskidev_contact_hours', '' );

    if ( function_exists( 'pll__' ) ) {
        $address = '' !== $address ? pll__( $address ) : '';
        $hours   = '' !== $hours ? pll__( $hours ) : '';
    }

    return [
        'address' => $address,
        'phone'   => (string) get_option( 'kotlinskidev_contact_phone', '' ),
        'email'   => (string) get_option( 'kotlinskidev_contact_email', '' ),
        'hours'   => $hours,
    ];
}

function kotlinskidev_render_protected_contact_field( string $value, string $type ): string {
    if ( '' === $value ) {
        return '';
    }

    return sprintf(
        '<span class="protected-content protected-content--%1$s" data-protected="true" data-protection-type="%1$s" data-original-content="%2$s"></span>',
        esc_attr( $type ),
        esc_attr( kotlinskidev_encrypt_content( $value ) )
    );
}

function kotlinskidev_render_contact_card_block( array $attributes = [] ): string {
    $info = kotlinskidev_get_contact_info();

    if ( ! $info['address'] && ! $info['phone'] && ! $info['email'] && ! $info['hours'] ) {
        return '';
    }

    $grid_gap = is_numeric( $attributes['gridGap'] ?? null ) ? (float) $attributes['gridGap'] : 1.5;

    ob_start();
    ?>
	<div class="kt-contact-card">
		<p class="kt-contact-card__label"><?php esc_html_e( 'Contact details', 'kotlinskidev' ); ?></p>
		<div class="kt-contact-card__grid" style="--kt-contact-card-gap: <?php echo esc_attr( $grid_gap ); ?>rem">
			<?php if ( $info['address'] ) : ?>
			<div class="kt-contact-card__item">
				<span class="kt-contact-card__item-label"><?php esc_html_e( 'Address', 'kotlinskidev' ); ?></span>
				<span class="kt-contact-card__item-value"><?php echo kotlinskidev_render_protected_contact_field( $info['address'], 'address' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_protected_contact_field() esc_attr()'s both the encrypted payload and the type ?></span>
			</div>
			<?php endif; ?>
			<?php if ( $info['hours'] ) : ?>
			<div class="kt-contact-card__item">
				<span class="kt-contact-card__item-label"><?php esc_html_e( 'Hours', 'kotlinskidev' ); ?></span>
				<span class="kt-contact-card__item-value"><?php echo esc_html( $info['hours'] ); ?></span>
			</div>
			<?php endif; ?>
			<?php if ( $info['phone'] ) : ?>
			<div class="kt-contact-card__item">
				<span class="kt-contact-card__item-label"><?php esc_html_e( 'Phone', 'kotlinskidev' ); ?></span>
				<span class="kt-contact-card__item-value"><?php echo kotlinskidev_render_protected_contact_field( $info['phone'], 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_protected_contact_field() esc_attr()'s both the encrypted payload and the type ?></span>
			</div>
			<?php endif; ?>
			<?php if ( $info['email'] ) : ?>
			<div class="kt-contact-card__item">
				<span class="kt-contact-card__item-label"><?php esc_html_e( 'Email', 'kotlinskidev' ); ?></span>
				<span class="kt-contact-card__item-value"><?php echo kotlinskidev_render_protected_contact_field( $info['email'], 'email' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_protected_contact_field() esc_attr()'s both the encrypted payload and the type ?></span>
			</div>
			<?php endif; ?>
		</div>
	</div>
	<?php
    return (string) ob_get_clean();
}

function kotlinskidev_register_contact_card_block(): void {
    register_block_type( 'kotlinskidev/contact-card', [
        'title'           => __( 'Contact Card', 'kotlinskidev' ),
        'category'        => 'kotlinskidev',
        'icon'            => 'phone',
        'attributes'      => [
            'gridGap' => [
                'type'    => 'number',
                'default' => 1.5,
            ],
        ],
        'render_callback' => 'kotlinskidev_render_contact_card_block',
    ] );
}
add_action( 'init', 'kotlinskidev_register_contact_card_block' );

function kotlinskidev_output_service_location_business_schema(): void {
    if ( ! is_singular( 'service_location' ) ) {
        return;
    }

    $info = kotlinskidev_get_contact_info();
    if ( ! $info['address'] && ! $info['phone'] && ! $info['email'] ) {
        return;
    }

    $city = get_post_meta( get_the_ID(), 'city', true );

    $schema = [
        '@context' => 'https://schema.org',
        '@type'    => 'ProfessionalService',
        'name'     => get_bloginfo( 'name' ),
        'url'      => get_permalink(),
    ];

    if ( $info['address'] ) {
        $schema['address'] = [
            '@type'         => 'PostalAddress',
            'streetAddress' => $info['address'],
        ];
    }
    if ( $info['phone'] ) {
        $schema['telephone'] = $info['phone'];
    }
    if ( $info['email'] ) {
        $schema['email'] = $info['email'];
    }
    if ( $info['hours'] ) {
        $schema['openingHours'] = $info['hours'];
    }
    if ( $city ) {
        $schema['areaServed'] = $city;
    }

    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() output of a server-built array, no user HTML
}
add_action( 'wp_head', 'kotlinskidev_output_service_location_business_schema' );
