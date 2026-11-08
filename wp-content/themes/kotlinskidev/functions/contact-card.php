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

function kotlinskidev_parse_postal_address( string $address ): array {
    $parts = array_values( array_filter( array_map( 'trim', explode( ',', $address ) ), 'strlen' ) );
    if ( [] === $parts ) {
        return [];
    }

    $postal = [ '@type' => 'PostalAddress', 'addressCountry' => 'PL' ];

    if ( count( $parts ) >= 2 && 1 === preg_match( '/^(\d{2}-\d{3})\s+(.+)$/u', $parts[1], $m ) ) {
        $postal['streetAddress']   = $parts[0];
        $postal['postalCode']      = $m[1];
        $postal['addressLocality'] = $m[2];
        return $postal;
    }

    if ( count( $parts ) >= 2 && 1 === preg_match( '/^(\d{2}-\d{3})\s+(.+)$/u', $parts[0], $m ) ) {
        $postal['streetAddress']   = $parts[1];
        $postal['postalCode']      = $m[1];
        $postal['addressLocality'] = $m[2];
        return $postal;
    }

    $postal['streetAddress'] = $address;

    return $postal;
}

function kotlinskidev_opening_hours_day_codes(): array {
    return [
        'mon' => 'Mo', 'monday' => 'Mo', 'pon' => 'Mo', 'poniedzialek' => 'Mo', 'poniedziałek' => 'Mo',
        'tue' => 'Tu', 'tues' => 'Tu', 'tuesday' => 'Tu', 'wt' => 'Tu', 'wtorek' => 'Tu',
        'wed' => 'We', 'wednesday' => 'We', 'sr' => 'We', 'śr' => 'We', 'sroda' => 'We', 'środa' => 'We',
        'thu' => 'Th', 'thur' => 'Th', 'thurs' => 'Th', 'thursday' => 'Th', 'czw' => 'Th', 'czwartek' => 'Th',
        'fri' => 'Fr', 'friday' => 'Fr', 'pt' => 'Fr', 'piatek' => 'Fr', 'piątek' => 'Fr',
        'sat' => 'Sa', 'saturday' => 'Sa', 'sob' => 'Sa', 'sobota' => 'Sa',
        'sun' => 'Su', 'sunday' => 'Su', 'niedz' => 'Su', 'nd' => 'Su', 'niedziela' => 'Su',
    ];
}

function kotlinskidev_format_opening_hours( string $hours ): string {
    $pattern = '/^\s*([\p{L}.]+)(?:\s*[-–—]\s*([\p{L}.]+))?\s*,?\s*(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\s*$/u';
    if ( 1 !== preg_match( $pattern, $hours, $m ) ) {
        return '';
    }

    $codes = kotlinskidev_opening_hours_day_codes();
    $from  = $codes[ mb_strtolower( rtrim( $m[1], '.' ) ) ] ?? '';
    $to    = '' === $m[2] ? $from : ( $codes[ mb_strtolower( rtrim( $m[2], '.' ) ) ] ?? '' );
    if ( '' === $from || '' === $to ) {
        return '';
    }

    foreach ( [ [ $m[3], $m[4] ], [ $m[5], $m[6] ] ] as [ $h, $min ] ) {
        if ( (int) $h > 24 || (int) $min > 59 ) {
            return '';
        }
    }

    $days = $from === $to ? $from : $from . '-' . $to;

    return sprintf( '%s %02d:%s-%02d:%s', $days, (int) $m[3], $m[4], (int) $m[5], $m[6] );
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
        $schema['address'] = kotlinskidev_parse_postal_address( $info['address'] );
    }
    if ( $info['phone'] ) {
        $schema['telephone'] = $info['phone'];
    }
    if ( $info['email'] ) {
        $schema['email'] = $info['email'];
    }
    $opening_hours = kotlinskidev_format_opening_hours( (string) $info['hours'] );
    if ( '' !== $opening_hours ) {
        $schema['openingHours'] = $opening_hours;
    }
    if ( $city ) {
        $schema['areaServed'] = $city;
    }

    $schema = apply_filters( 'kotlinskidev_service_location_schema', $schema, (int) get_the_ID() );
    if ( [] === $schema ) {
        return;
    }

    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() output of a server-built array, no user HTML
}
add_action( 'wp_head', 'kotlinskidev_output_service_location_business_schema' );
