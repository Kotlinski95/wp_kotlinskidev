<?php
if ( ! function_exists( 'kotlinskidev_nav_banner_linked_cover' ) ) {
	function kotlinskidev_nav_banner_linked_cover( string $link_url ): array {
		static $memo = [];
		if ( isset( $memo[ $link_url ] ) ) {
			return $memo[ $link_url ];
		}
		$cover   = [];
		$post_id = $link_url ? (int) url_to_postid( str_starts_with( $link_url, '/' ) ? home_url( $link_url ) : $link_url ) : 0;
		if ( $post_id ) {
			if ( function_exists( 'kotlinskidev_resolve_translatable_post_id' ) ) {
				$post_id = kotlinskidev_resolve_translatable_post_id( $post_id );
			}
			$thumb_id = (int) get_post_thumbnail_id( $post_id );
			if ( $thumb_id ) {
				$url = wp_get_attachment_image_url( $thumb_id, 'large' );
				if ( ! $url ) {
					$url = wp_get_attachment_image_url( $thumb_id, 'full' );
				}
				if ( $url ) {
					$cover = [
						'url' => (string) $url,
						'alt' => (string) get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ),
					];
				}
			}
		}
		$memo[ $link_url ] = $cover;
		return $cover;
	}
}

$media_url     = $attributes['mediaUrl'] ?? '';
$alt_text      = $attributes['altText'] ?? '';
$heading       = $attributes['heading'] ?? '';
$desc          = $attributes['description'] ?? '';
$link_url      = $attributes['linkUrl'] ?? '';
$link_label    = $attributes['linkLabel'] ?? '';
$hover_padding = $attributes['hoverPadding'] ?? '';

if ( ! empty( $attributes['followLinkedCover'] ) ) {
	$linked_cover = kotlinskidev_nav_banner_linked_cover( $link_url );
	if ( $linked_cover ) {
		$media_url = $linked_cover['url'];
		if ( '' === $alt_text ) {
			$alt_text = $linked_cover['alt'];
		}
	}
}

$wrapper_extra = [ 'class' => 'kt-nav-banner' ];
if ( $hover_padding ) {
	$wrapper_extra['style'] = '--kt-nav-banner-hover-pad: ' . esc_attr( $hover_padding ) . ';';
}

$wrapper_attrs = get_block_wrapper_attributes( $wrapper_extra );
?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<?php if ( $media_url ) : ?>
	<figure class="kt-nav-banner__media">
		<?php
		$img = '<img data-src="' . esc_url( $media_url ) . '" alt="' . esc_attr( $alt_text ) . '" loading="lazy">';
		echo $link_url ? '<a class="kt-nav-banner__media-link" href="' . esc_url( $link_url ) . '">' . $img . '</a>' : $img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $img is built exclusively from esc_url()/esc_attr() wrapped values above
		?>
	</figure>
	<?php endif; ?>
	<div class="kt-nav-banner__content">
		<?php if ( $heading ) : ?>
		<h3 class="kt-nav-banner__heading"><?php echo wp_kses_post( $heading ); ?></h3>
		<?php endif; ?>
		<?php if ( $desc ) : ?>
		<p class="kt-nav-banner__desc"><?php echo wp_kses_post( $desc ); ?></p>
		<?php endif; ?>
		<?php if ( $link_url && $link_label ) : ?>
		<a class="kt-nav-banner__link" href="<?php echo esc_url( $link_url ); ?>">
			<?php echo esc_html( $link_label ); ?>
		</a>
		<?php endif; ?>
	</div>
</div>
