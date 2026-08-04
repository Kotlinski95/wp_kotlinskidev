<?php
$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'scroll-section__item',
] );
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php echo $content; ?>
</div>
