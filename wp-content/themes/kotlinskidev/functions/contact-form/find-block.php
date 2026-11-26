<?php
function kotlinskidev_contact_form_find_block( array $blocks ) {
    foreach ( $blocks as $block ) {
        if ( 'contact-form-ts/form' === $block['blockName'] ) {
            return $block;
        }

        if ( ! empty( $block['innerBlocks'] ) ) {
            $found = kotlinskidev_contact_form_find_block( $block['innerBlocks'] );
            if ( $found ) {
                return $found;
            }
        }
    }

    return null;
}
