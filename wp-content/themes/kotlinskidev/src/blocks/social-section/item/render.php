<?php
$label      = $attributes['label'] ?? '';
$url        = $attributes['url'] ?? '';
$icon_class = $attributes['iconClass'] ?? '';
$icon_id    = (int) ( $attributes['navIconId'] ?? 0 );

if ( $url === '' ) {
	return;
}

$icon_svg      = kotlinskidev_inline_nav_icon( $icon_id );
$has_icon      = '' !== $icon_svg || '' !== trim( $icon_class );
$tooltip_attrs = ( $icon_svg !== '' && $label !== '' )
	? ' class="kt-tooltip" data-tooltip="' . esc_attr( $label ) . '"'
	: '';
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
<li <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer"<?php echo $tooltip_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tooltip_attrs is built above with esc_attr() already applied to the interpolated label ?>>
		<?php if ( $icon_svg !== '' ) : ?>
			<?php echo $icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $icon_svg comes from kotlinskidev_inline_nav_icon(), which reuses the sanitized functions/blocks.php implementation (kotlinskidev_load_svg_content()/kotlinskidev_sanitize_svg()) ?>
			<span class="kt-social-item__label"><?php echo esc_html( $label ); ?></span>
		<?php else : ?>
			<?php echo esc_html( $label ); ?>
		<?php endif; ?>
	</a>
</li>
