<?php
function kotlinskidev_contact_form_captcha_providers(): array {
    return [
        'recaptcha' => [
            'label'    => 'reCAPTCHA',
            'endpoint' => 'https://www.google.com/recaptcha/api/siteverify',
        ],
        'turnstile' => [
            'label'    => 'Turnstile',
            'endpoint' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        ],
    ];
}

function kotlinskidev_contact_form_verify_captcha_token( array $provider, string $secret, string $token ): void {
    if ( empty( $token ) ) {
        kotlinskidev_contact_form_redirect_with_error( 'captcha' );
    }

    $response = wp_remote_post(
        $provider['endpoint'],
        [
            'body'    => [
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
            ],
            'timeout' => 10,
        ]
    );

    if ( is_wp_error( $response ) ) {
        error_log( $provider['label'] . ' verification failed: ' . $response->get_error_message() );
        kotlinskidev_contact_form_redirect_with_error( 'captcha' );
    }

    $result = json_decode( wp_remote_retrieve_body( $response ), true );
    if ( empty( $result['success'] ) ) {
        error_log( $provider['label'] . ' verification failed: ' . print_r( $result, true ) );
        kotlinskidev_contact_form_redirect_with_error( 'captcha' );
    }
}

function kotlinskidev_contact_form_verify_captcha( array $block_attributes ): void {
    if ( ! ( $block_attributes['enableCaptcha'] ?? false ) ) {
        return;
    }

    $captcha_provider = $block_attributes['captchaProvider'] ?? 'recaptcha';
    $recaptcha_secret = $block_attributes['recaptchaSecretKey'] ?? '';
    $turnstile_secret = $block_attributes['turnstileSecretKey'] ?? '';
    $providers        = kotlinskidev_contact_form_captcha_providers();

    // phpcs:disable WordPress.Security.NonceVerification.Missing -- the nonce is verified by kotlinskidev_contact_form_require_valid_nonce() before this runs
    if ( 'recaptcha' === $captcha_provider && ! empty( $recaptcha_secret ) ) {
        $recaptcha_response = sanitize_text_field( wp_unslash( $_POST['g-recaptcha-response'] ?? '' ) );
        kotlinskidev_contact_form_verify_captcha_token( $providers['recaptcha'], $recaptcha_secret, $recaptcha_response );
    } elseif ( 'turnstile' === $captcha_provider && ! empty( $turnstile_secret ) ) {
        $turnstile_response = sanitize_text_field( wp_unslash( $_POST['cf-turnstile-response'] ?? '' ) );
        kotlinskidev_contact_form_verify_captcha_token( $providers['turnstile'], $turnstile_secret, $turnstile_response );
    }
    // phpcs:enable WordPress.Security.NonceVerification.Missing
}
