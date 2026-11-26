<?php

function kotlinskidev_feature_canvas_variants(): array {
	return [ 'browser-stream', 'node-tree', 'dot-image-stack', 'chart-growth', 'storefront', 'layout-builder', 'speed-gauge', 'nav-about', 'nav-projects', 'nav-services', 'nav-contact', 'site-scroll', 'checkout-flow', 'app-dashboard', 'load-waterfall', 'local-search', 'support-shield', 'benefit-marketing', 'benefit-saas', 'benefit-design-system', 'benefit-api', 'commerce-conversion', 'commerce-scale', 'commerce-secure', 'commerce-platforms', 'illus-storefront', 'illus-audit', 'illus-mobile-first', 'illus-vitals', 'illus-mobile-checkout', 'illus-seo-growth', 'illus-handover', 'illus-app-services', 'vs-frameworks', 'pwa-install', 'ssr-smartedit', 'nextjs-architecture', 'perf-by-design', 'smart-shopping-list', 'wp-custom-theme', 'wp-stack-ownership', 'wp-flex-control' ];
}

function kotlinskidev_feature_canvas_default_labels( string $variant ): array {
	if ( 'dot-image-stack' === $variant ) {
		return [
			esc_html__( 'Original', 'kotlinskidev' ),
			esc_html__( '1440px', 'kotlinskidev' ),
			esc_html__( '375px', 'kotlinskidev' ),
		];
	}

	if ( 'speed-gauge' === $variant ) {
		return [
			esc_html__( 'LCP', 'kotlinskidev' ),
			esc_html__( 'INP', 'kotlinskidev' ),
			esc_html__( 'CLS', 'kotlinskidev' ),
		];
	}

	if ( 'nav-about' === $variant ) {
		return [
			esc_html__( 'Frontend', 'kotlinskidev' ),
			esc_html__( 'Next.js', 'kotlinskidev' ),
			esc_html__( 'WordPress', 'kotlinskidev' ),
		];
	}

	if ( 'checkout-flow' === $variant ) {
		return [
			esc_html__( 'Cart', 'kotlinskidev' ),
			esc_html__( 'Payment', 'kotlinskidev' ),
			esc_html__( 'Done', 'kotlinskidev' ),
		];
	}

	if ( 'local-search' === $variant ) {
		return [
			esc_html__( 'website near me', 'kotlinskidev' ),
			'',
			'',
		];
	}

	if ( 'support-shield' === $variant ) {
		return [
			esc_html__( 'Uptime', 'kotlinskidev' ),
			esc_html__( 'Backups', 'kotlinskidev' ),
			'',
		];
	}

	if ( 'benefit-api' === $variant ) {
		return [
			esc_html__( 'CMS', 'kotlinskidev' ),
			esc_html__( 'GraphQL', 'kotlinskidev' ),
			esc_html__( 'API', 'kotlinskidev' ),
		];
	}

	if ( 'commerce-platforms' === $variant ) {
		return [
			esc_html__( 'Shopify', 'kotlinskidev' ),
			esc_html__( 'WooCommerce', 'kotlinskidev' ),
			esc_html__( 'SAP Hybris', 'kotlinskidev' ),
		];
	}

	if ( 'illus-vitals' === $variant ) {
		return [
			esc_html__( 'LCP', 'kotlinskidev' ),
			esc_html__( 'INP', 'kotlinskidev' ),
			esc_html__( 'CLS', 'kotlinskidev' ),
		];
	}

	if ( 'vs-frameworks' === $variant ) {
		return [
			esc_html__( 'Next.js', 'kotlinskidev' ),
			esc_html__( 'Angular', 'kotlinskidev' ),
			esc_html__( 'VS', 'kotlinskidev' ),
		];
	}

	return [ '', '', '' ];
}

function kotlinskidev_feature_canvas_render_data( array $attributes ): array {
	$variant = sanitize_key( (string) ( $attributes['variant'] ?? '' ) );
	if ( ! in_array( $variant, kotlinskidev_feature_canvas_variants(), true ) ) {
		$variant = 'browser-stream';
	}

	$aspect_ratio = sanitize_text_field( (string) ( $attributes['aspectRatio'] ?? '' ) );
	if ( 1 !== preg_match( '/^\d{1,2}\/\d{1,2}$/', $aspect_ratio ) ) {
		$aspect_ratio = '16/10';
	}

	$accent = (string) ( $attributes['accentColor'] ?? '' );
	if ( 1 !== preg_match( '/^[a-z0-9-]{1,64}$/', $accent ) ) {
		$accent = 'primary';
	}

	$touch_autoplay = ! array_key_exists( 'touchAutoplay', $attributes ) || filter_var( $attributes['touchAutoplay'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ) !== false;

	$trigger = 'in-view' === ( $attributes['trigger'] ?? '' ) ? 'in-view' : 'hover';

	$defaults = kotlinskidev_feature_canvas_default_labels( $variant );
	$custom   = [
		sanitize_text_field( (string) ( $attributes['labelOne'] ?? '' ) ),
		sanitize_text_field( (string) ( $attributes['labelTwo'] ?? '' ) ),
		sanitize_text_field( (string) ( $attributes['labelThree'] ?? '' ) ),
	];

	$description = sanitize_text_field( (string) ( $attributes['description'] ?? '' ) );

	$labels = [];
	foreach ( $custom as $index => $label ) {
		$labels[] = '' !== $label ? $label : $defaults[ $index ];
	}

	return [
		'variant'      => $variant,
		'aspect_ratio' => $aspect_ratio,
		'labels'       => $labels,
		'accent'         => $accent,
		'touch_autoplay' => $touch_autoplay,
		'trigger'        => $trigger,
		'description'    => $description,
	];
}
