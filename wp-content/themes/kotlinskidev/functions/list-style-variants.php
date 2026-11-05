<?php
function kotlinskidev_register_list_style_variants(): void {
    register_block_style(
        'core/list',
        [
            'name'  => 'checkmark',
            'label' => __( 'Checkmark', 'kotlinskidev' ),
        ]
    );
}
add_action( 'init', 'kotlinskidev_register_list_style_variants' );
