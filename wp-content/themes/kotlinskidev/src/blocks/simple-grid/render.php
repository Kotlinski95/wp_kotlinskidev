<?php
$col_count   = max( 1, count( $block->inner_blocks ) );
$grid_style  = '--kt-sg-cols:' . $col_count;
$mobile_cols = (int) ( $attributes['mobileColumns'] ?? 0 );
if ( $mobile_cols > 0 ) {
	$grid_style .= ';--kt-sg-cols-mobile:' . min( $mobile_cols, $col_count );
}
$tablet_cols = (int) ( $attributes['tabletColumns'] ?? 0 );
if ( $tablet_cols > 0 ) {
	$grid_style .= ';--kt-sg-cols-tablet:' . min( $tablet_cols, $col_count );
}
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'kt-simple-grid',
	'style' => $grid_style,
] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<?php echo $content; ?>
</div>
