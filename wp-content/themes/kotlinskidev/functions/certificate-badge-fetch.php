<?php
function kotlinskidev_certificate_badge_allowed_hosts(): array {
    return [ 'credly.com', 'www.credly.com', 'api.credly.com', 'accredible.com', 'www.accredible.com', 'api.accredible.com' ];
}

function kotlinskidev_certificate_badge_host_allowed( string $host ): bool {
    $host = strtolower( $host );

    foreach ( kotlinskidev_certificate_badge_allowed_hosts() as $allowed ) {
        if ( $host === $allowed || str_ends_with( $host, '.' . $allowed ) ) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_certificate_badge_host_is_safe( string $host ): bool {
    $ip = gethostbyname( $host );

    if ( $ip === $host ) {
        return false;
    }

    return false !== filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE );
}

function kotlinskidev_extract_meta_tag_content( string $html, string $property ): string {
    $pattern = '/<meta[^>]+(?:property|name)=["\']' . preg_quote( $property, '/' ) . '["\'][^>]+content=["\']([^"\']*)["\']/i';

    if ( 1 === preg_match( $pattern, $html, $matches ) ) {
        return html_entity_decode( trim( $matches[1] ), ENT_QUOTES );
    }

    $pattern_reversed = '/<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' . preg_quote( $property, '/' ) . '["\']/i';

    if ( 1 === preg_match( $pattern_reversed, $html, $matches ) ) {
        return html_entity_decode( trim( $matches[1] ), ENT_QUOTES );
    }

    return '';
}

function kotlinskidev_parse_credly_title( string $title ): array {
    if ( 1 === preg_match( '/^(.*?) was issued by (.*?) to .*$/i', $title, $matches ) ) {
        return [ 'name' => trim( $matches[1] ), 'issuer' => trim( $matches[2] ) ];
    }

    return [ 'name' => $title, 'issuer' => '' ];
}

function kotlinskidev_parse_certificate_badge_page( string $html, string $url ): array {
    $title       = kotlinskidev_extract_meta_tag_content( $html, 'og:title' );
    $description = kotlinskidev_extract_meta_tag_content( $html, 'og:description' );
    $image       = kotlinskidev_extract_meta_tag_content( $html, 'og:image' );
    $site_name   = kotlinskidev_extract_meta_tag_content( $html, 'og:site_name' );

    $name   = $title;
    $issuer = '';

    if ( false !== strpos( $url, 'credly.com' ) ) {
        $parsed_title = kotlinskidev_parse_credly_title( $title );
        $name         = $parsed_title['name'];
        $issuer       = $parsed_title['issuer'];
    }

    if ( ! $issuer ) {
        $issuer = $site_name ?: ( false !== strpos( $url, 'accredible.com' ) ? 'Accredible' : 'Credly' );
    }

    return [
        'name'        => $name,
        'issuer'      => $issuer,
        'description' => $description,
        'image_url'   => $image,
    ];
}

function kotlinskidev_sideload_certificate_badge_image( string $image_url ): int {
    if ( '' === $image_url ) {
        return 0;
    }

    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $tmp_file = download_url( $image_url );

    if ( is_wp_error( $tmp_file ) ) {
        return 0;
    }

    $image_type = exif_imagetype( $tmp_file );
    $extension  = $image_type ? image_type_to_extension( $image_type, false ) : false;

    if ( ! $extension ) {
        wp_delete_file( $tmp_file );
        return 0;
    }

    $file_array = [
        'name'     => 'certificate-badge-' . wp_generate_password( 8, false ) . '.' . $extension,
        'tmp_name' => $tmp_file,
    ];

    $attachment_id = media_handle_sideload( $file_array, 0 );

    if ( is_wp_error( $attachment_id ) ) {
        wp_delete_file( $tmp_file );
        return 0;
    }

    return absint( $attachment_id );
}

function kotlinskidev_ajax_fetch_certificate_badge(): void {
    if ( ! kotlinskidev_feature_enabled( 'certificates' ) ) {
        wp_send_json_error( __( 'Certificates are disabled on this site.', 'kotlinskidev' ) );
    }

    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( __( 'Insufficient permissions.', 'kotlinskidev' ) );
    }

    $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
    if ( ! wp_verify_nonce( $nonce, 'kotlinskidev_certificate_fetch' ) ) {
        wp_send_json_error( __( 'Security check failed.', 'kotlinskidev' ) );
    }

    $url = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
    if ( '' === $url ) {
        wp_send_json_error( __( 'A badge URL is required.', 'kotlinskidev' ) );
    }

    $host = (string) wp_parse_url( $url, PHP_URL_HOST );
    if ( '' === $host || ! kotlinskidev_certificate_badge_host_allowed( $host ) ) {
        wp_send_json_error( __( 'Only Credly or Accredible badge URLs are supported.', 'kotlinskidev' ) );
    }

    if ( ! kotlinskidev_certificate_badge_host_is_safe( $host ) ) {
        wp_send_json_error( __( 'That URL could not be verified.', 'kotlinskidev' ) );
    }

    $cache_key = 'kotlinskidev_badge_fetch_' . md5( $url );
    $parsed    = get_transient( $cache_key );

    if ( false === $parsed ) {
        $response = wp_remote_get( $url, [ 'timeout' => 10 ] );

        if ( is_wp_error( $response ) ) {
            wp_send_json_error( __( 'Could not reach that URL.', 'kotlinskidev' ) );
        }

        if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
            wp_send_json_error( __( 'That URL did not return a page we could read.', 'kotlinskidev' ) );
        }

        $parsed = kotlinskidev_parse_certificate_badge_page( wp_remote_retrieve_body( $response ), $url );
        set_transient( $cache_key, $parsed, DAY_IN_SECONDS );
    }

    $attachment_id = kotlinskidev_sideload_certificate_badge_image( $parsed['image_url'] );

    wp_send_json_success( [
        'name'                 => $parsed['name'],
        'issuer'               => $parsed['issuer'],
        'description'          => $parsed['description'],
        'credential_image_id'  => $attachment_id,
        'credential_image_url' => $attachment_id ? (string) wp_get_attachment_image_url( $attachment_id, 'full' ) : '',
        'verify_url'           => $url,
    ] );
}
add_action( 'wp_ajax_kotlinskidev_fetch_certificate_badge', 'kotlinskidev_ajax_fetch_certificate_badge' );
