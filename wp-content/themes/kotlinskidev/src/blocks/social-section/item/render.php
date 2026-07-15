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

$icon_svg   = kotlinskidev_inline_nav_icon( $icon_id );
$li_classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $icon_class, -1, PREG_SPLIT_NO_EMPTY ) ) );
array_unshift( $li_classes, 'menu-item' );
if ( $icon_svg !== '' ) {
	$li_classes[] = 'kt-social-item--svg';
}
?>
<li class="<?php echo esc_attr( implode( ' ', $li_classes ) ); ?>">
	<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer">
		<?php if ( $icon_svg !== '' ) : ?>
			<?php echo $icon_svg; ?>
			<span class="kt-social-item__label"><?php echo esc_html( $label ); ?></span>
		<?php else : ?>
			<?php echo esc_html( $label ); ?>
		<?php endif; ?>
	</a>
</li>
