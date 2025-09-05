<?php
// Handles the contact form submission and sends an email to the site admin.
add_action('admin_post_nopriv_contact_form_ts_submit', 'contact_form_ts_handle_form');
add_action('admin_post_contact_form_ts_submit', 'contact_form_ts_handle_form');

function contact_form_ts_handle_form()
{
    // Sanitize and collect form data
    $name    = sanitize_text_field($_POST['name'] ?? '');
    $email   = sanitize_email($_POST['email'] ?? '');
    $topic   = sanitize_text_field($_POST['topic'] ?? '');
    $message = sanitize_textarea_field($_POST['message'] ?? '');
    $agree   = isset($_POST['agree']) ? 'Yes' : 'No';

    // Get block attributes to check if CAPTCHA is enabled
    $recaptcha_response = $_POST['g-recaptcha-response'] ?? '';
    $turnstile_response = $_POST['cf-turnstile-response'] ?? '';
    
    // Simple way to get the block attributes - we'll need to find the block in the current post
    global $post;
    if ($post && has_blocks($post->post_content)) {
        $blocks = parse_blocks($post->post_content);
        $contact_block = null;
        
        // Find our contact form block
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'contact-form-ts/form') {
                $contact_block = $block;
                break;
            }
        }
        
        if ($contact_block) {
            $enable_captcha = $contact_block['attrs']['enableCaptcha'] ?? false;
            $captcha_provider = $contact_block['attrs']['captchaProvider'] ?? 'recaptcha';
            $recaptcha_secret = $contact_block['attrs']['recaptchaSecretKey'] ?? '';
            $turnstile_secret = $contact_block['attrs']['turnstileSecretKey'] ?? '';
            
            // Verify CAPTCHA if enabled
            if ($enable_captcha) {
                $captcha_verified = false;
                
                if ($captcha_provider === 'recaptcha' && !empty($recaptcha_secret)) {
                    if (empty($recaptcha_response)) {
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                    
                    // Verify reCAPTCHA with Google
                    $verify_url = 'https://www.google.com/recaptcha/api/siteverify';
                    $verify_data = [
                        'secret' => $recaptcha_secret,
                        'response' => $recaptcha_response,
                        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
                    ];
                    
                    $response = wp_remote_post($verify_url, [
                        'body' => $verify_data,
                        'timeout' => 10
                    ]);
                    
                    if (is_wp_error($response)) {
                        error_log('reCAPTCHA verification failed: ' . $response->get_error_message());
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                    
                    $response_body = wp_remote_retrieve_body($response);
                    $result = json_decode($response_body, true);
                    
                    if (!$result['success']) {
                        error_log('reCAPTCHA verification failed: ' . print_r($result, true));
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                    
                } elseif ($captcha_provider === 'turnstile' && !empty($turnstile_secret)) {
                    if (empty($turnstile_response)) {
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                    
                    // Verify Turnstile with Cloudflare
                    $verify_url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
                    $verify_data = [
                        'secret' => $turnstile_secret,
                        'response' => $turnstile_response,
                        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
                    ];
                    
                    $response = wp_remote_post($verify_url, [
                        'body' => $verify_data,
                        'timeout' => 10
                    ]);
                    
                    if (is_wp_error($response)) {
                        error_log('Turnstile verification failed: ' . $response->get_error_message());
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                    
                    $response_body = wp_remote_retrieve_body($response);
                    $result = json_decode($response_body, true);
                    
                    if (!$result['success']) {
                        error_log('Turnstile verification failed: ' . print_r($result, true));
                        $redirect_url = add_query_arg('contact-error', 'captcha', wp_get_referer() ?: home_url());
                        wp_redirect($redirect_url);
                        exit;
                    }
                }
            }
        }
    }

    // Prepare email
    $admin_email = get_option('admin_email');
    $subject = 'New Contact Form Submission';
    $body = '<!DOCTYPE html>
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
      max-width: 480px;
      margin: 32px auto;
      background: #f3f4f6;
      border-radius: 12px;
      box-shadow: 0 2px 12px #0001;
      padding: 32px 24px;
    }
    h2 { color: #2563eb; margin-top: 0; }
    .field { margin-bottom: 18px; }
    .label {
      color: #52525B;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }
    .value { color: #181A1B; font-size: 16px; font-weight: 500; }
    .footer { margin-top: 32px; color: #A1A1AA; font-size: 12px; text-align: center; }
    @media (prefers-color-scheme: dark) {
      body { background: #181A1B; color: #F3F4F6; }
      .container { background: #23272A; box-shadow: 0 2px 12px #0008; }
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
    <div class="field"><span class="label">Name</span><span class="value">' . esc_html($name) . '</span></div>
    <div class="field"><span class="label">Email</span><span class="value">' . esc_html($email) . '</span></div>
    <div class="field"><span class="label">Topic</span><span class="value">' . esc_html($topic) . '</span></div>
    <div class="field"><span class="label">Message</span><div class="value" style="white-space:pre-line;">' . nl2br(esc_html($message)) . '</div></div>
    <div class="field"><span class="label">Agreed</span><span class="value">' . esc_html($agree) . '</span></div>
    <div class="footer">Contact Form TS &bull; ' . date('Y-m-d H:i') . '</div>
  </div>
</body>
</html>';
    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'Reply-To: ' . $email
    ];

    // Send email
    $mail_result = wp_mail($admin_email, $subject, $body, $headers);

    if (!$mail_result) {
        error_log('Email sending failed.');
    }

    // Add query param to referrer and redirect back to form page
    $redirect_url = add_query_arg('contact-success', '1', wp_get_referer() ?: home_url());
    wp_redirect($redirect_url);
    exit;
}
