<?php
function kotlinskidev_register_certificate_post_type(): void {
    if ( ! kotlinskidev_feature_enabled( 'certificates' ) ) {
        return;
    }

    register_post_type( 'kt_certificate', [
        'labels' => [
            'name'          => __( 'Certificates', 'kotlinskidev' ),
            'singular_name' => __( 'Certificate', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Certificate', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Certificate', 'kotlinskidev' ),
            'search_items'  => __( 'Search Certificates', 'kotlinskidev' ),
            'not_found'     => __( 'No certificates found', 'kotlinskidev' ),
        ],
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'menu_icon'           => 'dashicons-awards',
        'menu_position'       => 25,
        'supports'            => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
        'has_archive'         => false,
    ] );
}
add_action( 'init', 'kotlinskidev_register_certificate_post_type' );

function kotlinskidev_certificate_meta_fields(): array {
    return [
        'cert_issuer'         => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
        'cert_issued_date'    => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
        'cert_description'    => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field' ],
        'cert_credential_id'  => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
        'cert_verify_url'     => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
        'cert_source_url'     => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
    ];
}

function kotlinskidev_register_certificate_meta(): void {
    if ( ! kotlinskidev_feature_enabled( 'certificates' ) ) {
        return;
    }

    foreach ( kotlinskidev_certificate_meta_fields() as $key => $field ) {
        register_post_meta( 'kt_certificate', $key, [
            'type'              => $field['type'],
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => $field['sanitize_callback'],
            'auth_callback'     => function () {
                return current_user_can( 'edit_posts' );
            },
        ] );
    }
}
add_action( 'init', 'kotlinskidev_register_certificate_meta' );

function kotlinskidev_format_certificate_issued_label( string $issued_date ): string {
    if ( '' === trim( $issued_date ) ) {
        return '';
    }

    foreach ( [ 'Y-m-d', 'Y-m', 'Y' ] as $format ) {
        $date = DateTime::createFromFormat( $format, $issued_date );
        if ( $date instanceof DateTime ) {
            $pattern = 'Y' === $format ? 'Y' : 'M Y';
            /* translators: %s: formatted issue date */
            return sprintf( __( 'Issued %s', 'kotlinskidev' ), $date->format( $pattern ) );
        }
    }

    return sprintf( __( 'Issued %s', 'kotlinskidev' ), $issued_date );
}

function kotlinskidev_certificate_fallback_image_url(): string {
    return trailingslashit( get_template_directory_uri() ) . 'assets/images/service_icon.webp';
}

function kotlinskidev_map_certificate_post( WP_Post $post ): array {
    $image_url  = has_post_thumbnail( $post ) ? (string) get_the_post_thumbnail_url( $post, 'full' ) : '';
    $verify_url = (string) get_post_meta( $post->ID, 'cert_verify_url', true );
    $source_url = (string) get_post_meta( $post->ID, 'cert_source_url', true );

    return [
        'name'          => get_the_title( $post ),
        'issuer'        => (string) get_post_meta( $post->ID, 'cert_issuer', true ),
        'issued_label'  => kotlinskidev_format_certificate_issued_label( (string) get_post_meta( $post->ID, 'cert_issued_date', true ) ),
        'description'   => (string) get_post_meta( $post->ID, 'cert_description', true ),
        'credential_id' => (string) get_post_meta( $post->ID, 'cert_credential_id', true ),
        'link_url'      => $verify_url ?: $source_url,
        'image_url'     => $image_url ?: kotlinskidev_certificate_fallback_image_url(),
    ];
}

function kotlinskidev_get_certificates(): array {
    $posts = get_posts( [
        'post_type'      => 'kt_certificate',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'menu_order date',
        'order'          => 'DESC',
    ] );

    return array_map( 'kotlinskidev_map_certificate_post', $posts );
}

function kotlinskidev_certificate_color_declaration( string $color ): string {
    if ( '' === $color ) {
        return '';
    }

    return 'color:' . esc_attr( $color ) . ' !important;--kt-underline-color:' . esc_attr( $color ) . ';';
}

function kotlinskidev_render_certificate_badge_card( array $certificate, string $wrapper_attrs = '', string $secondary_text_color = '', string $accent_color = '' ): string {
    $secondary_decl = kotlinskidev_certificate_color_declaration( $secondary_text_color );
    $accent_decl    = kotlinskidev_certificate_color_declaration( $accent_color );
    $secondary_attr = $secondary_decl ? ' style="' . $secondary_decl . '"' : '';
    $accent_attr    = $accent_decl ? ' style="' . $accent_decl . '"' : '';

    $verify_link = '';
    if ( $certificate['link_url'] ) {
        $separator   = $certificate['issued_label'] ? ' · ' : '';
        $verify_link = $separator . '<a class="kt-certificate__verify-link has-primary-color has-text-color"' . $accent_attr . ' href="' . esc_url( $certificate['link_url'] ) . '" target="_blank" rel="noopener">' . esc_html__( 'Verify', 'kotlinskidev' ) . '</a>';
    }

    $html  = $wrapper_attrs
        ? '<div ' . $wrapper_attrs . '>'
        : '<div class="wp-block-group kt-link-card kt-link-card--lift has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.625rem;padding-right:1.5rem;padding-bottom:1.375rem;padding-left:1.5rem;display:flex;flex-direction:column;align-items:center;text-align:center">';
    $html .= '<img src="' . esc_url( $certificate['image_url'] ) . '" alt="" class="has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:50%;width:6rem;height:6rem;object-fit:cover" />';
    $html .= '<h3 class="wp-block-heading has-text-align-center has-normal-font-size" style="margin-top:0.75rem;margin-bottom:0">' . esc_html( $certificate['name'] ) . '</h3>';
    $html .= '<p class="has-text-align-center has-foreground-alt-color has-text-color has-small-font-size"' . $secondary_attr . '>' . esc_html( $certificate['issuer'] ) . '</p>';
    $html .= '<p class="has-text-align-center has-foreground-alt-color has-text-color has-x-small-font-size"' . $secondary_attr . '>' . esc_html( $certificate['issued_label'] ) . $verify_link . '</p>';
    $html .= '</div>';

    return $html;
}

function kotlinskidev_render_certificate_badge_grid( array $certificates ): string {
    $html = '<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><div class="wp-block-group" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14.375rem,1fr));gap:1.25rem">';

    foreach ( $certificates as $certificate ) {
        $html .= kotlinskidev_render_certificate_badge_card( $certificate );
    }

    $html .= '</div></div>';

    return $html;
}

function kotlinskidev_render_certificate_feature_card( array $certificate, string $wrapper_attrs = '', string $secondary_text_color = '', string $accent_color = '' ): string {
    $secondary_decl = kotlinskidev_certificate_color_declaration( $secondary_text_color );
    $accent_decl    = kotlinskidev_certificate_color_declaration( $accent_color );

    $credential_id = $certificate['credential_id']
        ? '<p class="has-foreground-alt-color has-text-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;' . $secondary_decl . '">' . sprintf(
            /* translators: %s: credential ID */
            esc_html__( 'Credential ID: %s', 'kotlinskidev' ),
            esc_html( $certificate['credential_id'] )
        ) . '</p>'
        : '';

    $verify_link = $certificate['link_url']
        ? '<a class="kt-certificate__verify-link has-primary-color has-text-color" style="' . $accent_decl . '" href="' . esc_url( $certificate['link_url'] ) . '" target="_blank" rel="noopener">' . esc_html__( 'View credential →', 'kotlinskidev' ) . '</a>'
        : esc_html__( 'View credential →', 'kotlinskidev' );

    $html  = $wrapper_attrs
        ? '<div ' . $wrapper_attrs . '>'
        : '<div class="wp-block-group kt-link-card has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:1.75rem;padding-right:1.625rem;padding-bottom:1.75rem;padding-left:1.625rem;display:flex;flex-direction:column;gap:1.125rem">';
    $html .= '<div class="wp-block-group" style="display:flex;align-items:center;gap:1rem">';
    $html .= '<img src="' . esc_url( $certificate['image_url'] ) . '" alt="" class="has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;width:3.5rem;height:3.5rem;object-fit:cover" />';
    $html .= '<div class="wp-block-group" style="display:flex;flex-direction:column;gap:0.25rem">';
    $html .= '<p class="has-foreground-alt-color has-text-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;' . $secondary_decl . '">' . esc_html( $certificate['issuer'] ) . '</p>';
    $html .= '<h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0">' . esc_html( $certificate['name'] ) . '</h3>';
    $html .= '</div></div>';
    $html .= '<p class="has-foreground-alt-color has-text-color has-small-font-size" style="margin-top:0;margin-bottom:0;' . $secondary_decl . '">' . esc_html( $certificate['description'] ) . '</p>';
    $html .= $credential_id;
    $html .= '<div class="wp-block-group" style="display:flex;flex-wrap:wrap;align-items:center;gap:0.625rem">';
    $html .= '<p class="has-primary-color has-divider-background-color has-text-color has-background has-x-small-font-size" style="border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.375rem;padding-right:0.75rem;padding-bottom:0.375rem;padding-left:0.75rem;font-weight:600;' . $accent_decl . '">' . esc_html( $certificate['issued_label'] ) . '</p>';
    $html .= '<p class="has-primary-color has-text-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600;' . $accent_decl . '">' . $verify_link . '</p>';
    $html .= '</div></div>';

    return $html;
}

function kotlinskidev_render_certificate_feature_cards( array $certificates ): string {
    $html = '<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><div class="wp-block-group" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(19.375rem,1fr));gap:1.25rem">';

    foreach ( $certificates as $certificate ) {
        $html .= kotlinskidev_render_certificate_feature_card( $certificate );
    }

    $html .= '</div></div>';

    return $html;
}

function kotlinskidev_render_certificate_compact_pill( array $certificate, string $wrapper_attrs = '' ): string {
    $pill_tag   = $certificate['link_url'] ? 'a' : 'div';
    $pill_attrs = $certificate['link_url'] ? ' href="' . esc_url( $certificate['link_url'] ) . '" target="_blank" rel="noopener"' : '';

    $html  = '<' . $pill_tag . $pill_attrs . ' ' . ( $wrapper_attrs ?: 'class="wp-block-group kt-pill-link has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:999px;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:0.5rem;display:flex;align-items:center;gap:0.625rem"' ) . '>';
    $html .= '<img src="' . esc_url( $certificate['image_url'] ) . '" alt="" style="border-radius:50%;width:1.625rem;height:1.625rem;object-fit:cover" />';
    $html .= '<p class="has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600">' . esc_html( $certificate['issuer'] ) . '</p>';
    $html .= '</' . $pill_tag . '>';

    return $html;
}

function kotlinskidev_render_certificate_compact_strip( array $certificates, string $view_all_url ): string {
    $html = '<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.375rem;padding-right:1.625rem;padding-bottom:1.375rem;padding-left:1.625rem;display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem">';

    $html .= '<div class="wp-block-group" style="display:flex;flex-wrap:wrap;align-items:center;gap:0.875rem">';
    $html .= '<p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="font-weight:700;letter-spacing:0.14em;text-transform:uppercase">' . esc_html__( 'Certified in', 'kotlinskidev' ) . '</p>';

    foreach ( $certificates as $certificate ) {
        $html .= kotlinskidev_render_certificate_compact_pill( $certificate );
    }

    $html .= '</div>';

    if ( $view_all_url ) {
        $html .= '<p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><a href="' . esc_url( $view_all_url ) . '">' . esc_html__( 'All credentials →', 'kotlinskidev' ) . '</a></p>';
    }

    $html .= '</div></div>';

    return $html;
}

function kotlinskidev_render_certificate_embed( int $certificate_id, string $layout = 'badge-grid', string $wrapper_attrs = '', string $secondary_text_color = '', string $accent_color = '' ): string {
    $certificate_id = $certificate_id ? kotlinskidev_resolve_translatable_post_id( $certificate_id ) : $certificate_id;

    if ( ! $certificate_id || 'publish' !== get_post_status( $certificate_id ) ) {
        return '<div class="kt-certificate kt-certificate--empty"><p>' . esc_html__( 'Select a certificate to display it here.', 'kotlinskidev' ) . '</p></div>';
    }

    $post = get_post( $certificate_id );

    if ( ! $post instanceof WP_Post ) {
        return '';
    }

    $certificate = kotlinskidev_map_certificate_post( $post );

    switch ( $layout ) {
        case 'feature-cards':
            return kotlinskidev_render_certificate_feature_card( $certificate, $wrapper_attrs, $secondary_text_color, $accent_color );
        case 'compact-strip':
            return kotlinskidev_render_certificate_compact_pill( $certificate, $wrapper_attrs );
        default:
            return kotlinskidev_render_certificate_badge_card( $certificate, $wrapper_attrs, $secondary_text_color, $accent_color );
    }
}

function kotlinskidev_render_certificates_grid( string $layout, string $view_all_url ): string {
    $certificates = kotlinskidev_get_certificates();

    if ( empty( $certificates ) ) {
        return '';
    }

    switch ( $layout ) {
        case 'feature-cards':
            return kotlinskidev_render_certificate_feature_cards( $certificates );
        case 'compact-strip':
            return kotlinskidev_render_certificate_compact_strip( $certificates, $view_all_url );
        default:
            return kotlinskidev_render_certificate_badge_grid( $certificates );
    }
}

function kotlinskidev_certificate_editor_panel_script(): void {
    if ( ! kotlinskidev_feature_enabled( 'certificates' ) ) {
        return;
    }

    $screen = get_current_screen();

    if ( ! $screen || 'kt_certificate' !== $screen->post_type ) {
        return;
    }

    $path = kotlinskidev_build_path( 'js', 'certificate-panel.js' );

    if ( ! file_exists( $path ) ) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-certificate-panel',
        kotlinskidev_build_url( 'js', 'certificate-panel.js' ),
        [ 'wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-element', 'wp-components', 'wp-data', 'wp-core-data', 'wp-i18n', 'wp-api-fetch' ],
        (string) filemtime( $path ),
        true
    );

    wp_localize_script( 'kotlinskidev-certificate-panel', 'kotlinskidevCertificateConfig', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'kotlinskidev_certificate_fetch' ),
    ] );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_certificate_editor_panel_script' );
