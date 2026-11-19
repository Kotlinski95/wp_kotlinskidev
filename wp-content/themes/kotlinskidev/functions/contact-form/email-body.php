<?php
function kotlinskidev_contact_form_email_document_start(): string {
    return '<!DOCTYPE html>
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
';
}

function kotlinskidev_contact_form_email_field( string $label, string $escaped_value ): string {
    return '    <div class="field"><span class="label">' . $label . '</span><span class="value">' . $escaped_value . '</span></div>' . "\n";
}

function kotlinskidev_contact_form_email_message_field( string $message ): string {
    return '    <div class="field"><span class="label">Message</span><div class="value" style="white-space:pre-line;">' . nl2br( esc_html( $message ) ) . '</div></div>' . "\n";
}

function kotlinskidev_contact_form_email_document_end(): string {
    return '    <div class="footer">Contact Form &bull; ' . esc_html( wp_date( 'Y-m-d H:i' ) ) . '</div>
  </div>
</body>
</html>';
}

function kotlinskidev_contact_form_email_body( array $submission, array $stored_attachments ): string {
    return kotlinskidev_contact_form_email_document_start()
        . "    <h2>New Contact Form Message</h2>\n"
        . kotlinskidev_contact_form_email_field( 'Name', esc_html( $submission['name'] ) )
        . kotlinskidev_contact_form_email_field( 'Email', esc_html( $submission['email'] ) )
        . kotlinskidev_contact_form_email_field( 'Topic', esc_html( $submission['topic'] ) )
        . kotlinskidev_contact_form_email_message_field( $submission['message'] )
        . kotlinskidev_contact_form_email_field( 'Agreed', esc_html( $submission['agree'] ) )
        . kotlinskidev_contact_attachment_email_block( $stored_attachments )
        . kotlinskidev_contact_form_email_document_end();
}
