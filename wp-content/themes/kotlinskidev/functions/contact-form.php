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

function kotlinskidev_contact_form_handle_submit() {
    if (
        ! isset( $_POST['kotlinskidev_contact_form_nonce'] )
        || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kotlinskidev_contact_form_nonce'] ) ), 'kotlinskidev_contact_form_submit' )
    ) {
        wp_die( esc_html__( 'Security check failed. Please reload the page and try again.', 'kotlinskidev' ), '', [ 'response' => 403 ] );
    }

    $name    = sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) );
    $email   = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
    $topic   = sanitize_text_field( wp_unslash( $_POST['topic'] ?? '' ) );
    $message = sanitize_textarea_field( wp_unslash( $_POST['message'] ?? '' ) );
    $agree   = isset( $_POST['agree'] ) ? 'Yes' : 'No';

    $recaptcha_response = sanitize_text_field( wp_unslash( $_POST['g-recaptcha-response'] ?? '' ) );
    $turnstile_response = sanitize_text_field( wp_unslash( $_POST['cf-turnstile-response'] ?? '' ) );

    $redirect_type       = 'query_param';
    $thank_you_page_url  = '';

    $referer = wp_get_referer();
    $post_id = $referer ? url_to_postid( $referer ) : 0;
    $post    = $post_id ? get_post( $post_id ) : null;

    if ( ! $post ) {
        global $post;
    }

    $contact_block = null;
    if ( $post && has_blocks( $post->post_content ) ) {
        $contact_block = kotlinskidev_contact_form_find_block( parse_blocks( $post->post_content ) );
    }

    if ( $contact_block ) {
        $enable_captcha     = $contact_block['attrs']['enableCaptcha'] ?? false;
        $captcha_provider   = $contact_block['attrs']['captchaProvider'] ?? 'recaptcha';
        $recaptcha_secret   = $contact_block['attrs']['recaptchaSecretKey'] ?? '';
        $turnstile_secret   = $contact_block['attrs']['turnstileSecretKey'] ?? '';
        $redirect_type      = $contact_block['attrs']['redirectType'] ?? 'query_param';
        $thank_you_page_url = $contact_block['attrs']['thankYouPageUrl'] ?? '';

        if ( $enable_captcha ) {
            if ( 'recaptcha' === $captcha_provider && ! empty( $recaptcha_secret ) ) {
                if ( empty( $recaptcha_response ) ) {
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }

                $response = wp_remote_post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    [
                        'body'    => [
                            'secret'   => $recaptcha_secret,
                            'response' => $recaptcha_response,
                            'remoteip' => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
                        ],
                        'timeout' => 10,
                    ]
                );

                if ( is_wp_error( $response ) ) {
                    error_log( 'reCAPTCHA verification failed: ' . $response->get_error_message() );
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }

                $result = json_decode( wp_remote_retrieve_body( $response ), true );
                if ( empty( $result['success'] ) ) {
                    error_log( 'reCAPTCHA verification failed: ' . print_r( $result, true ) );
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }
            } elseif ( 'turnstile' === $captcha_provider && ! empty( $turnstile_secret ) ) {
                if ( empty( $turnstile_response ) ) {
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }

                $response = wp_remote_post(
                    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                    [
                        'body'    => [
                            'secret'   => $turnstile_secret,
                            'response' => $turnstile_response,
                            'remoteip' => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
                        ],
                        'timeout' => 10,
                    ]
                );

                if ( is_wp_error( $response ) ) {
                    error_log( 'Turnstile verification failed: ' . $response->get_error_message() );
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }

                $result = json_decode( wp_remote_retrieve_body( $response ), true );
                if ( empty( $result['success'] ) ) {
                    error_log( 'Turnstile verification failed: ' . print_r( $result, true ) );
                    kotlinskidev_contact_form_redirect_with_error( 'captcha' );
                }
            }
        }
    }

    $admin_email = get_option( 'admin_email' );
    $subject     = 'New Contact Form Submission';
    $body        = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Contact Form Submission</title>
  <meta name="color-scheme" content="light dark">
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      background: #fff;
      color: #181A1B;
      font-family: Arial, sans-serif;
      margin: 0; padding: 0;
    }
    .container {
      max-width: 30rem;
      margin: 2rem auto;
      background: #f3f4f6;
      border-radius: 0.75rem;
      box-shadow: 0 0.125rem 0.75rem #0001;
      padding: 2rem 1.5rem;
    }
    h2 { color: #2563eb; margin-top: 0; }
    .field { margin-bottom: 1.125rem; }
    .label {
      color: #52525B;
      font-size: .8125rem;
      letter-spacing: .0625rem;
      text-transform: uppercase;
      margin-bottom: .25rem;
      display: block;
    }
    .value { color: #181A1B; font-size: 1rem; font-weight: 500; }
    .footer { margin-top: 2rem; color: #A1A1AA; font-size: 0.75rem; text-align: center; }
    @media (prefers-color-scheme: dark) {
      body { background: #181A1B; color: #F3F4F6; }
      .container { background: #23272A; box-shadow: 0 0.125rem 0.75rem #0008; }
      h2 { color: #7DD3FC; }
      .label { color: #A1A1AA; }
      .value { color: #F3F4F6; }
      .footer { color: #52525B; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Contact Form Message</h2>
    <div class="field"><span class="label">Name</span><span class="value">' . esc_html( $name ) . '</span></div>
    <div class="field"><span class="label">Email</span><span class="value">' . esc_html( $email ) . '</span></div>
    <div class="field"><span class="label">Topic</span><span class="value">' . esc_html( $topic ) . '</span></div>
    <div class="field"><span class="label">Message</span><div class="value" style="white-space:pre-line;">' . nl2br( esc_html( $message ) ) . '</div></div>
    <div class="field"><span class="label">Agreed</span><span class="value">' . esc_html( $agree ) . '</span></div>
    <div class="footer">Contact Form &bull; ' . esc_html( wp_date( 'Y-m-d H:i' ) ) . '</div>
  </div>
</body>
</html>';

    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'Reply-To: ' . $email,
    ];

    if ( ! wp_mail( $admin_email, $subject, $body, $headers ) ) {
        error_log( 'Contact form email sending failed.' );
    }

    if ( 'thank_you_page' === $redirect_type ) {
        $redirect_url = ! empty( $thank_you_page_url )
            ? esc_url_raw( $thank_you_page_url )
            : add_query_arg( 'contact-thankyou', '1', home_url() );
    } else {
        $redirect_url = add_query_arg( 'contact-success', '1', wp_get_referer() ?: home_url() );
    }

    wp_safe_redirect( $redirect_url );
    exit;
}
add_action( 'admin_post_nopriv_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit' );
add_action( 'admin_post_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit' );

function kotlinskidev_contact_form_redirect_with_error( string $error_type ) {
    $redirect_url = add_query_arg( 'contact-error', $error_type, wp_get_referer() ?: home_url() );
    wp_safe_redirect( $redirect_url );
    exit;
}
