<?php
function kotlinskidev_contact_form_redirect_with_error( string $error_type ) {
    $redirect_url = add_query_arg( 'contact-error', $error_type, wp_get_referer() ?: home_url() );
    wp_safe_redirect( $redirect_url );
    exit;
}
