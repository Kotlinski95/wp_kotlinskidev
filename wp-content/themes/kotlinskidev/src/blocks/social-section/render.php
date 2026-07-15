<?php
$attach_to_bottom = $attributes['attachToBottom'] ?? true;

if ( trim( $content ) === '' ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'social-menu-container' . ( $attach_to_bottom ? '' : ' social-menu-container--inline' ),
] );
?>
<div <?php echo $wrapper_attributes; ?>>
	<nav class="social-navigation" aria-label="<?php esc_attr_e( 'Social media', 'kotlinskidev' ); ?>">
		<ul class="social-menu-items"><?php echo $content; ?></ul>
	</nav>
</div>
