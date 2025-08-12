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
