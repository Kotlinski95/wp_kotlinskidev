<?php
$title          = $attributes['title'] ?? '';
$count          = absint( $attributes['count'] ?? 5 );
$title_font_size = $attributes['titleFontSize'] ?? '';
$popular        = kotlinskidev_get_popular_posts( $count );

if ( ! $popular->have_posts() ) {
	wp_reset_postdata();
	return;
}

$title_style = $title_font_size !== '' ? ' style="font-size:' . esc_attr( $title_font_size ) . '"' : '';
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-popular-pages' ] ); ?>>
	<?php if ( $title !== '' ) : ?>
		<p class="kt-popular-pages__title"<?php echo $title_style; ?>><?php echo esc_html( $title ); ?></p>
	<?php endif; ?>
	<ul class="kt-popular-pages__list">
		<?php
		$shown = 0;
		while ( $popular->have_posts() && $shown < $count ) :
			$popular->the_post();
			$shown++;
			?>
			<li class="kt-popular-pages__item">
				<a href="<?php the_permalink(); ?>" class="kt-popular-pages__link">
					<?php the_title(); ?>
				</a>
			</li>
		<?php endwhile; ?>
	</ul>
</div>
<?php wp_reset_postdata(); ?>
