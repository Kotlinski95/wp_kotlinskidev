<?php
$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'kt-holder' ] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<?php echo $content; ?>
</div>
