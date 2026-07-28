<?php
$label      = $attributes['label'] ?? '';
$url        = $attributes['url'] ?? '';
$icon_class = $attributes['iconClass'] ?? '';
$icon_id    = (int) ( $attributes['navIconId'] ?? 0 );

if ( $url === '' ) {
	return;
}

if ( ! function_exists( 'kotlinskidev_inline_nav_icon' ) ) {
	function kotlinskidev_inline_nav_icon( int $id ): string {
		if ( ! $id ) {
			return '';
		}
		$file = get_attached_file( $id );
		if ( ! $file || 'svg' !== strtolower( pathinfo( $file, PATHINFO_EXTENSION ) ) ) {
			return '';
		}
		$svg = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! $svg ) {
			return '';
		}
		$svg = preg_replace( '/ fill="[^"]*"/i', '', $svg );
		return preg_replace( '/<svg(\s)/i', '<svg aria-hidden="true" focusable="false" fill="currentColor"$1', $svg, 1 );
	}
}

if ( ! function_exists( 'kotlinskidev_url_has_known_social_icon' ) ) {
	function kotlinskidev_url_has_known_social_icon( string $url ): bool {
		$known_icon_domains = [
			'facebook.com',
			'linkedin.com',
			'twitter.com',
			'x.com',
			'youtube.com',
			'tiktok.com',
			'instagram.com',
			'github.com',
		];
		foreach ( $known_icon_domains as $domain ) {
			if ( false !== stripos( $url, $domain ) ) {
				return true;
			}
		}
		return false;
	}
}

$icon_svg      = kotlinskidev_inline_nav_icon( $icon_id );
$has_icon      = '' !== $icon_svg || '' !== trim( $icon_class ) || kotlinskidev_url_has_known_social_icon( $url );
$li_classes    = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $icon_class, -1, PREG_SPLIT_NO_EMPTY ) ) );
array_unshift( $li_classes, 'menu-item' );
if ( $has_icon ) {
	$li_classes[] = 'kt-social-item--icon';
}
if ( $icon_svg !== '' ) {
	$li_classes[] = 'kt-social-item--svg';
}
$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', $li_classes ),
] );
?>
<li <?php echo $wrapper_attributes; ?>>
	<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer">
		<?php if ( $icon_svg !== '' ) : ?>
			<?php echo $icon_svg; ?>
			<span class="kt-social-item__label"><?php echo esc_html( $label ); ?></span>
		<?php else : ?>
			<?php echo esc_html( $label ); ?>
		<?php endif; ?>
	</a>
</li>
