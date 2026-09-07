<?php
$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'process-step',
] );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<div class="process-step__marker">
		<span class="process-step__number"></span>
	</div>
	<div class="process-step__body">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
	</div>
</div>
