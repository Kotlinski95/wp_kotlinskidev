<?php
$col_count      = max( 1, count( $block->inner_blocks ) );
$wrapper_attrs  = get_block_wrapper_attributes( [
	'class' => 'kt-simple-grid',
	'style' => '--kt-sg-cols:' . $col_count,
] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<?php echo $content; ?>
</div>
