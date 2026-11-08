<?php
function kotlinskidev_register_offer_post_type(): void {
	register_post_type( 'kt_offer', [
		'labels' => [
			'name'          => __( 'Offers', 'kotlinskidev' ),
			'singular_name' => __( 'Offer', 'kotlinskidev' ),
			'add_new_item'  => __( 'Add New Offer', 'kotlinskidev' ),
			'edit_item'     => __( 'Edit Offer', 'kotlinskidev' ),
			'search_items'  => __( 'Search Offers', 'kotlinskidev' ),
			'not_found'     => __( 'No offers found', 'kotlinskidev' ),
		],
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,
		'menu_icon'           => 'dashicons-tag',
		'menu_position'       => 24,
		'supports'            => [ 'title', 'custom-fields', 'page-attributes' ],
		'has_archive'         => false,
	] );
}
add_action( 'init', 'kotlinskidev_register_offer_post_type' );

function kotlinskidev_offer_keys(): array {
	return [ 'website', 'ecommerce', 'web-app', 'performance-audit', 'website-optimization', 'local-seo', 'maintenance' ];
}

function kotlinskidev_offer_variant_defaults(): array {
	return [
		'key'          => '',
		'label'        => '',
		'price_from'   => null,
		'price_to'     => null,
		'price_period' => 'once',
		'price_note'   => '',
		'duration_min' => null,
		'duration_max' => null,
		'duration_unit' => 'days',
		'included'     => '',
	];
}

function kotlinskidev_offer_nullable_number( mixed $value ): int|float|null {
	if ( null === $value || '' === $value || ! is_numeric( $value ) ) {
		return null;
	}
	return max( 0, $value + 0 );
}

function kotlinskidev_offer_nullable_int( mixed $value ): ?int {
	$number = kotlinskidev_offer_nullable_number( $value );
	return null === $number ? null : (int) $number;
}

function kotlinskidev_offer_sanitize_variants( mixed $variants ): array {
	if ( ! is_array( $variants ) ) {
		return [];
	}
	$clean = [];
	foreach ( $variants as $variant ) {
		if ( ! is_array( $variant ) ) {
			continue;
		}
		$variant = array_merge( kotlinskidev_offer_variant_defaults(), $variant );
		$key     = sanitize_key( (string) $variant['key'] );
		if ( '' === $key ) {
			continue;
		}
		$clean[] = [
			'key'           => $key,
			'label'         => sanitize_text_field( (string) $variant['label'] ),
			'price_from'    => kotlinskidev_offer_nullable_number( $variant['price_from'] ),
			'price_to'      => kotlinskidev_offer_nullable_number( $variant['price_to'] ),
			'price_period'  => 'month' === $variant['price_period'] ? 'month' : 'once',
			'price_note'    => sanitize_text_field( (string) $variant['price_note'] ),
			'duration_min'  => kotlinskidev_offer_nullable_int( $variant['duration_min'] ),
			'duration_max'  => kotlinskidev_offer_nullable_int( $variant['duration_max'] ),
			'duration_unit' => in_array( $variant['duration_unit'], [ 'hours', 'days', 'weeks' ], true ) ? $variant['duration_unit'] : 'days',
			'included'      => sanitize_text_field( (string) $variant['included'] ),
		];
	}
	return $clean;
}

function kotlinskidev_offer_sanitize_currency( mixed $currency ): string {
	return 'PLN' === $currency ? 'PLN' : 'EUR';
}

function kotlinskidev_offer_variants_schema(): array {
	return [
		'type'  => 'array',
		'items' => [
			'type'                 => 'object',
			'additionalProperties' => false,
			'properties'           => [
				'key'           => [ 'type' => 'string' ],
				'label'         => [ 'type' => 'string' ],
				'price_from'    => [ 'type' => [ 'number', 'null' ] ],
				'price_to'      => [ 'type' => [ 'number', 'null' ] ],
				'price_period'  => [ 'type' => 'string', 'enum' => [ 'once', 'month' ] ],
				'price_note'    => [ 'type' => 'string' ],
				'duration_min'  => [ 'type' => [ 'integer', 'null' ] ],
				'duration_max'  => [ 'type' => [ 'integer', 'null' ] ],
				'duration_unit' => [ 'type' => 'string', 'enum' => [ 'hours', 'days', 'weeks' ] ],
				'included'      => [ 'type' => 'string' ],
			],
		],
	];
}

function kotlinskidev_register_offer_meta(): void {
	$auth = static function (): bool {
		return current_user_can( 'edit_posts' );
	};

	register_post_meta( 'kt_offer', 'offer_key', [
		'type'              => 'string',
		'single'            => true,
		'show_in_rest'      => [ 'schema' => [ 'type' => 'string', 'enum' => array_merge( [ '' ], kotlinskidev_offer_keys() ) ] ],
		'sanitize_callback' => 'sanitize_key',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'currency', [
		'type'              => 'string',
		'single'            => true,
		'default'           => 'EUR',
		'show_in_rest'      => [ 'schema' => [ 'type' => 'string', 'enum' => [ 'EUR', 'PLN' ] ] ],
		'sanitize_callback' => 'kotlinskidev_offer_sanitize_currency',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'is_placeholder', [
		'type'              => 'boolean',
		'single'            => true,
		'default'           => false,
		'show_in_rest'      => true,
		'sanitize_callback' => 'rest_sanitize_boolean',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'variants', [
		'type'              => 'array',
		'single'            => true,
		'default'           => [],
		'show_in_rest'      => [ 'schema' => kotlinskidev_offer_variants_schema() ],
		'sanitize_callback' => 'kotlinskidev_offer_sanitize_variants',
		'auth_callback'     => $auth,
	] );
}
add_action( 'init', 'kotlinskidev_register_offer_meta' );

function kotlinskidev_offer_current_lang(): string {
	if ( function_exists( 'pll_current_language' ) ) {
		$lang = pll_current_language();
		if ( is_string( $lang ) && '' !== $lang ) {
			return $lang;
		}
	}
	if ( function_exists( 'pll_default_language' ) ) {
		$lang = pll_default_language();
		if ( is_string( $lang ) && '' !== $lang ) {
			return $lang;
		}
	}
	return substr( (string) get_locale(), 0, 2 );
}

function kotlinskidev_offer_languages(): array {
	if ( function_exists( 'pll_languages_list' ) ) {
		$languages = pll_languages_list();
		if ( is_array( $languages ) && array() !== $languages ) {
			return $languages;
		}
	}
	return [ kotlinskidev_offer_current_lang() ];
}

function kotlinskidev_offer_transient_name( string $lang ): string {
	return 'kotlinskidev_offers_' . $lang;
}

function kotlinskidev_offer_memo( ?string $lang = null, ?array $set = null, bool $reset = false ): ?array {
	static $memo = [];

	if ( $reset ) {
		$memo = [];
		return null;
	}
	if ( null !== $set && null !== $lang ) {
		$memo[ $lang ] = $set;
	}
	return null === $lang ? null : ( $memo[ $lang ] ?? null );
}

function kotlinskidev_offer_build_map( string $lang ): array {
	$posts = get_posts( [
		'post_type'        => 'kt_offer',
		'post_status'      => 'publish',
		'numberposts'      => -1,
		'orderby'          => 'menu_order',
		'order'            => 'ASC',
		'lang'             => $lang,
		'suppress_filters' => false,
	] );

	$map = [];
	foreach ( $posts as $post ) {
		$key = sanitize_key( (string) get_post_meta( $post->ID, 'offer_key', true ) );
		if ( '' === $key || isset( $map[ $key ] ) ) {
			continue;
		}
		$currency = kotlinskidev_offer_sanitize_currency( get_post_meta( $post->ID, 'currency', true ) );
		$variants = [];
		foreach ( kotlinskidev_offer_sanitize_variants( get_post_meta( $post->ID, 'variants', true ) ) as $variant ) {
			$variants[ $variant['key'] ] = $variant;
		}
		$map[ $key ] = [
			'name'           => (string) get_the_title( $post ),
			'currency'       => $currency,
			'is_placeholder' => (bool) get_post_meta( $post->ID, 'is_placeholder', true ),
			'variants'       => $variants,
		];
	}
	return $map;
}

function kotlinskidev_offer_map( string $lang ): array {
	$memoized = kotlinskidev_offer_memo( $lang );
	if ( null !== $memoized ) {
		return $memoized;
	}

	$cached = get_transient( kotlinskidev_offer_transient_name( $lang ) );
	if ( is_array( $cached ) ) {
		kotlinskidev_offer_memo( $lang, $cached );
		return $cached;
	}

	$map = kotlinskidev_offer_build_map( $lang );
	set_transient( kotlinskidev_offer_transient_name( $lang ), $map, WEEK_IN_SECONDS );
	kotlinskidev_offer_memo( $lang, $map );
	return $map;
}

function kotlinskidev_offer_get( string $key, string $lang ): ?array {
	$map = kotlinskidev_offer_map( $lang );
	return $map[ $key ] ?? null;
}

function kotlinskidev_offer_flush_cache(): void {
	foreach ( kotlinskidev_offer_languages() as $lang ) {
		delete_transient( kotlinskidev_offer_transient_name( (string) $lang ) );
	}
	kotlinskidev_offer_memo( null, null, true );
}

function kotlinskidev_offer_flush_on_save(): void {
	kotlinskidev_offer_flush_cache();
}
add_action( 'save_post_kt_offer', 'kotlinskidev_offer_flush_on_save' );
add_action( 'pll_save_post', 'kotlinskidev_offer_flush_on_save' );

function kotlinskidev_offer_flush_on_post_removal( int $post_id ): void {
	if ( 'kt_offer' === get_post_type( $post_id ) ) {
		kotlinskidev_offer_flush_cache();
	}
}
add_action( 'trashed_post', 'kotlinskidev_offer_flush_on_post_removal' );
add_action( 'deleted_post', 'kotlinskidev_offer_flush_on_post_removal' );

function kotlinskidev_offer_flush_on_meta_change( $meta_id, int $post_id, string $meta_key = '' ): void {
	if ( in_array( $meta_key, [ 'offer_key', 'currency', 'is_placeholder', 'variants' ], true ) && 'kt_offer' === get_post_type( $post_id ) ) {
		kotlinskidev_offer_flush_cache();
	}
}
add_action( 'added_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );
add_action( 'updated_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );
add_action( 'deleted_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );

function kotlinskidev_offer_format_number( int|float $number ): string {
	$decimals = ( (float) $number === floor( (float) $number ) ) ? 0 : 2;
	return number_format_i18n( (float) $number, $decimals );
}

function kotlinskidev_offer_format_money( int|float $number, string $currency ): string {
	$formatted = kotlinskidev_offer_format_number( $number );
	if ( 'PLN' === $currency ) {
		return $formatted . ( str_starts_with( get_locale(), 'pl' ) ? ' zł' : ' PLN' );
	}
	return '€' . $formatted;
}

function kotlinskidev_offer_format_price( array $variant, string $currency ): string {
	$from = kotlinskidev_offer_nullable_number( $variant['price_from'] ?? null );
	$to   = kotlinskidev_offer_nullable_number( $variant['price_to'] ?? null );
	if ( null === $from && null === $to ) {
		return __( 'Price on request', 'kotlinskidev' );
	}

	if ( null !== $from && null !== $to && $from !== $to ) {
		if ( 'PLN' === $currency ) {
			$text = kotlinskidev_offer_format_number( $from ) . '–' . kotlinskidev_offer_format_money( $to, $currency );
		} else {
			$text = kotlinskidev_offer_format_money( $from, $currency ) . '–' . kotlinskidev_offer_format_money( $to, $currency );
		}
	} elseif ( null !== $from && null === $to ) {
		$text = __( 'from', 'kotlinskidev' ) . ' ' . kotlinskidev_offer_format_money( $from, $currency );
	} else {
		$text = kotlinskidev_offer_format_money( $to ?? $from, $currency );
	}

	if ( 'month' === ( $variant['price_period'] ?? 'once' ) ) {
		$text .= ' ' . __( '/ month', 'kotlinskidev' );
	}
	return $text;
}

function kotlinskidev_offer_format_duration( array $variant ): string {
	$min  = kotlinskidev_offer_nullable_int( $variant['duration_min'] ?? null );
	$max  = kotlinskidev_offer_nullable_int( $variant['duration_max'] ?? null );
	$unit = $variant['duration_unit'] ?? 'days';
	if ( null === $min && null === $max ) {
		return __( 'Timeline agreed individually', 'kotlinskidev' );
	}

	$low    = $min ?? $max;
	$high   = $max ?? $min;
	$amount = $low === $high ? (string) $high : $low . '–' . $high;

	switch ( $unit ) {
		case 'hours':
			/* translators: %s: number of hours */
			return sprintf( _n( '%s hour', '%s hours', $high, 'kotlinskidev' ), $amount );
		case 'weeks':
			return sprintf( _n( '%s week', '%s weeks', $high, 'kotlinskidev' ), $amount );
		default:
			return sprintf( _n( '%s day', '%s days', $high, 'kotlinskidev' ), $amount );
	}
}

function kotlinskidev_offer_format( array $variant, string $field, string $currency ): string {
	switch ( $field ) {
		case 'price':
			return kotlinskidev_offer_format_price( $variant, $currency );
		case 'price_from':
			$from = kotlinskidev_offer_nullable_number( $variant['price_from'] ?? null );
			return null === $from ? __( 'Price on request', 'kotlinskidev' ) : kotlinskidev_offer_format_money( $from, $currency );
		case 'price_to':
			$to = kotlinskidev_offer_nullable_number( $variant['price_to'] ?? null );
			return null === $to ? __( 'Price on request', 'kotlinskidev' ) : kotlinskidev_offer_format_money( $to, $currency );
		case 'duration':
			return kotlinskidev_offer_format_duration( $variant );
		case 'label':
			return (string) ( $variant['label'] ?? '' );
		case 'included':
			return (string) ( $variant['included'] ?? '' );
	}
	return '';
}

function kotlinskidev_offer_fallback( string $field ): string {
	if ( 'duration' === $field ) {
		return __( 'Timeline agreed individually', 'kotlinskidev' );
	}
	if ( in_array( $field, [ 'price', 'price_from', 'price_to' ], true ) ) {
		return __( 'Price on request', 'kotlinskidev' );
	}
	return '';
}

function kotlinskidev_offer_is_money_field( string $field ): bool {
	return in_array( $field, [ 'price', 'price_from', 'price_to', 'duration' ], true );
}

function kotlinskidev_offer_resolve( string $key, string $variant, string $field, string $lang ): array {
	$offer = kotlinskidev_offer_get( $key, $lang );
	if ( null === $offer || ! isset( $offer['variants'][ $variant ] ) || ! in_array( $field, [ 'price', 'price_from', 'price_to', 'duration', 'label', 'included' ], true ) ) {
		return [
			'value'       => kotlinskidev_offer_fallback( $field ),
			'placeholder' => false,
			'missing'     => true,
		];
	}
	return [
		'value'       => kotlinskidev_offer_format( $offer['variants'][ $variant ], $field, (string) $offer['currency'] ),
		'placeholder' => ! empty( $offer['is_placeholder'] ) && kotlinskidev_offer_is_money_field( $field ),
		'missing'     => false,
	];
}

function kotlinskidev_offer_leaf_blocks(): array {
	return (array) apply_filters( 'kotlinskidev_offer_leaf_blocks', [
		'core/paragraph',
		'core/heading',
		'core/button',
		'core/list-item',
		'core/table',
		'core/quote',
		'core/pullquote',
		'core/verse',
		'core/preformatted',
		'core/details',
	] );
}

function kotlinskidev_offer_replace_spans( string $content, string $lang, bool $is_editor ): string {
	$pattern = '#<span\b([^>]*\bdata-kt-offer="[^"]*"[^>]*)>(.*?)</span>#s';
	return (string) preg_replace_callback(
		$pattern,
		static function ( array $matches ) use ( $lang, $is_editor ): string {
			$attrs = $matches[1];
			if ( ! preg_match( '/\bclass="([^"]*)"/', $attrs, $class_match ) || ! in_array( 'kt-offer', preg_split( '/\s+/', trim( $class_match[1] ) ), true ) ) {
				return $matches[0];
			}
			preg_match( '/\bdata-kt-offer="([^"]*)"/', $attrs, $key_match );
			preg_match( '/\bdata-kt-variant="([^"]*)"/', $attrs, $variant_match );
			preg_match( '/\bdata-kt-field="([^"]*)"/', $attrs, $field_match );

			$resolved = kotlinskidev_offer_resolve(
				sanitize_key( $key_match[1] ?? '' ),
				sanitize_key( $variant_match[1] ?? '' ),
				sanitize_key( $field_match[1] ?? '' ),
				$lang
			);

			$classes = array_diff( preg_split( '/\s+/', trim( $class_match[1] ) ), [ 'kt-offer--placeholder', 'kt-offer--missing' ] );
			$value   = $resolved['value'];
			if ( $resolved['missing'] ) {
				if ( $is_editor ) {
					$classes[] = 'kt-offer--missing';
				}
			} elseif ( $resolved['placeholder'] ) {
				if ( $is_editor ) {
					$classes[] = 'kt-offer--placeholder';
				} else {
					$value = kotlinskidev_offer_fallback( sanitize_key( $field_match[1] ?? '' ) );
				}
			}

			$attrs = str_replace( $class_match[0], 'class="' . esc_attr( implode( ' ', $classes ) ) . '"', $attrs );
			return '<span' . $attrs . '>' . esc_html( $value ) . '</span>';
		},
		$content
	);
}

function kotlinskidev_offer_render_block( string $block_content, array $block ): string {
	if ( false === strpos( $block_content, 'data-kt-offer' ) ) {
		return $block_content;
	}
	if ( ! in_array( $block['blockName'] ?? '', kotlinskidev_offer_leaf_blocks(), true ) ) {
		return $block_content;
	}
	return kotlinskidev_offer_replace_spans( $block_content, kotlinskidev_offer_current_lang(), current_user_can( 'edit_posts' ) );
}
add_filter( 'render_block', 'kotlinskidev_offer_render_block', 20, 2 );

function kotlinskidev_offer_rest_value( WP_REST_Request $request ): array {
	$lang     = (string) ( $request->get_param( 'lang' ) ?: kotlinskidev_offer_current_lang() );
	$resolved = kotlinskidev_offer_resolve(
		sanitize_key( (string) $request->get_param( 'offer' ) ),
		sanitize_key( (string) $request->get_param( 'variant' ) ),
		sanitize_key( (string) $request->get_param( 'field' ) ),
		sanitize_key( $lang )
	);
	return [
		'value'       => $resolved['value'],
		'placeholder' => $resolved['placeholder'],
	];
}

function kotlinskidev_offer_rest_list( WP_REST_Request $request ): array {
	$lang = sanitize_key( (string) ( $request->get_param( 'lang' ) ?: kotlinskidev_offer_current_lang() ) );
	$list = [];
	foreach ( kotlinskidev_offer_map( $lang ) as $key => $offer ) {
		$variants = [];
		foreach ( $offer['variants'] as $variant_key => $variant ) {
			$variants[] = [
				'key'   => (string) $variant_key,
				'label' => $variant['label'],
			];
		}
		$list[] = [
			'key'            => (string) $key,
			'name'           => $offer['name'],
			'currency'       => $offer['currency'],
			'is_placeholder' => $offer['is_placeholder'],
			'variants'       => $variants,
		];
	}
	return $list;
}

function kotlinskidev_offer_rest_permission(): bool {
	return current_user_can( 'edit_posts' );
}

function kotlinskidev_register_offer_routes(): void {
	register_rest_route( 'kotlinskidev/v1', '/offer-value', [
		'methods'             => 'GET',
		'callback'            => 'kotlinskidev_offer_rest_value',
		'permission_callback' => 'kotlinskidev_offer_rest_permission',
		'args'                => [
			'offer'   => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'variant' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'field'   => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'lang'    => [ 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_key' ],
		],
	] );

	register_rest_route( 'kotlinskidev/v1', '/offers', [
		'methods'             => 'GET',
		'callback'            => 'kotlinskidev_offer_rest_list',
		'permission_callback' => 'kotlinskidev_offer_rest_permission',
		'args'                => [
			'lang' => [ 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_key' ],
		],
	] );
}
add_action( 'rest_api_init', 'kotlinskidev_register_offer_routes' );

function kotlinskidev_offer_placeholder_count(): int {
	$ids = get_posts( [
		'post_type'        => 'kt_offer',
		'post_status'      => [ 'publish', 'draft', 'pending', 'private' ],
		'numberposts'      => -1,
		'fields'           => 'ids',
		'lang'             => '',
		'suppress_filters' => true,
		'meta_key'         => 'is_placeholder',
		'meta_value'       => '1',
	] );
	return is_array( $ids ) ? count( $ids ) : 0;
}

function kotlinskidev_offer_placeholder_message( int $count ): string {
	return sprintf(
		_n( '%d offer uses placeholder prices', '%d offers use placeholder prices', $count, 'kotlinskidev' ),
		$count
	);
}

function kotlinskidev_offer_placeholder_notice(): void {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	$count = kotlinskidev_offer_placeholder_count();
	if ( $count < 1 ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s <a href="%s">%s</a></p></div>',
		esc_html( kotlinskidev_offer_placeholder_message( $count ) ),
		esc_url( admin_url( 'edit.php?post_type=kt_offer' ) ),
		esc_html__( 'Review offers', 'kotlinskidev' )
	);
}
add_action( 'admin_notices', 'kotlinskidev_offer_placeholder_notice' );

function kotlinskidev_offer_admin_bar_node( WP_Admin_Bar $admin_bar ): void {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	$count = kotlinskidev_offer_placeholder_count();
	if ( $count < 1 ) {
		return;
	}
	$admin_bar->add_node( [
		'id'    => 'kotlinskidev-offer-placeholders',
		'title' => esc_html( kotlinskidev_offer_placeholder_message( $count ) ),
		'href'  => admin_url( 'edit.php?post_type=kt_offer' ),
	] );
}
add_action( 'admin_bar_menu', 'kotlinskidev_offer_admin_bar_node', 100 );

function kotlinskidev_offer_references( string $content ): array {
	if ( false === strpos( $content, 'data-kt-offer' ) ) {
		return [];
	}
	preg_match_all( '#<span\b[^>]*\bdata-kt-offer="([^"]*)"[^>]*>#', $content, $matches, PREG_SET_ORDER );
	$references = [];
	foreach ( $matches as $match ) {
		$key = sanitize_key( $match[1] );
		if ( '' === $key ) {
			continue;
		}
		preg_match( '/\bdata-kt-variant="([^"]*)"/', $match[0], $variant_match );
		$references[ $key ][ sanitize_key( $variant_match[1] ?? '' ) ] = true;
	}
	return array_map( 'array_keys', $references );
}

function kotlinskidev_offer_schema_pieces( string $content, string $lang, string $base_url ): array {
	$pieces = [];
	foreach ( kotlinskidev_offer_references( $content ) as $key => $variant_keys ) {
		$offer = kotlinskidev_offer_get( $key, $lang );
		if ( null === $offer || ! empty( $offer['is_placeholder'] ) ) {
			continue;
		}
		$prices = [];
		foreach ( $variant_keys as $variant_key ) {
			$variant = $offer['variants'][ $variant_key ] ?? null;
			if ( null === $variant ) {
				continue;
			}
			foreach ( [ 'price_from', 'price_to' ] as $price_field ) {
				$price = kotlinskidev_offer_nullable_number( $variant[ $price_field ] ?? null );
				if ( null !== $price ) {
					$prices[] = $price;
				}
			}
		}
		if ( array() === $prices ) {
			continue;
		}
		$piece = [
			'@type'  => 'Service',
			'@id'    => trailingslashit( $base_url ) . '#/schema/offer/' . $key,
			'name'   => $offer['name'],
			'offers' => [
				'@type'         => 'AggregateOffer',
				'priceCurrency' => $offer['currency'],
				'lowPrice'      => min( $prices ),
				'highPrice'     => max( $prices ),
			],
		];
		$pieces[] = $piece;
	}
	return $pieces;
}

function kotlinskidev_offer_schema_graph( array $graph, $context = null ): array {
	if ( ! is_singular() ) {
		return $graph;
	}
	$post_id = (int) get_queried_object_id();
	$content = (string) get_post_field( 'post_content', $post_id );
	foreach ( kotlinskidev_offer_schema_pieces( $content, kotlinskidev_offer_current_lang(), home_url( '/' ) ) as $piece ) {
		$graph[] = $piece;
	}
	return $graph;
}
add_filter( 'wpseo_schema_graph', 'kotlinskidev_offer_schema_graph', 20, 2 );

function kotlinskidev_offer_copy_post_metas( array $keys ): array {
	$keys = array_diff( $keys, [ 'variants', 'currency', 'is_placeholder' ] );
	if ( ! in_array( 'offer_key', $keys, true ) ) {
		$keys[] = 'offer_key';
	}
	return array_values( $keys );
}
add_filter( 'pll_copy_post_metas', 'kotlinskidev_offer_copy_post_metas' );
