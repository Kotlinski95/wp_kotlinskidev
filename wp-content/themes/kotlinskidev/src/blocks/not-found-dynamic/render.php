<?php
$kotlinskidev_not_found_title = __( 'OOPS! Page Not Found!', 'kotlinskidev' );
$kotlinskidev_not_found_text  = __( 'Something went wrong! We couldn’t find the page you were looking for. But don’t worry, we’ve got some other Links that might be helpful:', 'kotlinskidev' );
$kotlinskidev_not_found_cta   = __( 'Go to Homepage', 'kotlinskidev' );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-not-found' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() self-escapes ?>>
	<svg class="kt-not-found__art" viewBox="0 0 480 240" width="480" height="240" aria-hidden="true" focusable="false">
		<rect class="kt-not-found__art-frame" x="8" y="8" width="464" height="224" rx="20" />
		<path class="kt-not-found__art-frame" d="M8 52H472" />
		<circle class="kt-not-found__art-dot" cx="36" cy="30" r="5" />
		<circle class="kt-not-found__art-dot" cx="56" cy="30" r="5" />
		<circle class="kt-not-found__art-dot" cx="76" cy="30" r="5" />
		<path class="kt-not-found__art-digit" d="M130 88V198M130 88L68 166H168" />
		<ellipse class="kt-not-found__art-digit" cx="240" cy="143" rx="44" ry="55" />
		<path class="kt-not-found__art-digit" d="M374 88V198M374 88L312 166H412" />
		<path class="kt-not-found__art-plus" d="M36 112V128M28 120H44" />
		<path class="kt-not-found__art-plus" d="M444 176V192M436 184H452" />
		<path class="kt-not-found__art-plus" d="M446 82V94M440 88H452" />
	</svg>
	<h1 class="kt-not-found__title"><?php echo esc_html( $kotlinskidev_not_found_title ); ?></h1>
	<p class="kt-not-found__text"><?php echo esc_html( $kotlinskidev_not_found_text ); ?></p>
	<div class="wp-block-buttons kt-not-found__actions">
		<div class="wp-block-button is-style-fill-adaptive-contrast hover-jump-smooth has-hover-color-transition">
			<a class="wp-block-button__link has-normal-font-size has-custom-font-size wp-element-button kt-not-found__button" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( $kotlinskidev_not_found_cta ); ?></a>
		</div>
	</div>
</div>
