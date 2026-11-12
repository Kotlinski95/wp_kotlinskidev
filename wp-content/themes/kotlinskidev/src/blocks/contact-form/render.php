<?php
$enable_captcha      = $attributes['enableCaptcha'] ?? false;
$captcha_provider    = $attributes['captchaProvider'] ?? 'recaptcha';
$recaptcha_site_key  = $attributes['recaptchaSiteKey'] ?? '';
$turnstile_site_key  = $attributes['turnstileSiteKey'] ?? '';

if ( $enable_captcha ) {
    if ( 'recaptcha' === $captcha_provider && ! empty( $recaptcha_site_key ) ) {
        wp_enqueue_script( 'google-recaptcha', 'https://www.google.com/recaptcha/api.js', [], null, true );
    } elseif ( 'turnstile' === $captcha_provider && ! empty( $turnstile_site_key ) ) {
        wp_enqueue_script( 'cloudflare-turnstile', 'https://challenges.cloudflare.com/turnstile/v0/api.js', [], null, true );
    }
}

if ( isset( $_GET['contact-success'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag after redirect, no state change
    echo '<div class="contact-form-success" id="contact-form-ts-success">' . esc_html( $attributes['successMessage'] ?? 'Thank you! Your message has been sent.' ) . '</div>';
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.querySelector('.contact-form-ts');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        window.kotlinskiAnalytics && window.kotlinskiAnalytics.trackEvent('generate_lead', { form_name: 'contact_form' });
    });
    </script>
    <?php
}

if ( isset( $_GET['contact-error'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag after redirect, no state change
    $error_type    = sanitize_key( wp_unslash( $_GET['contact-error'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag after redirect, no state change
    $error_message = $attributes['errorMessage'] ?? 'Sorry, there was an error. Please try again.';

    $attachment_errors = [
        'attachment_type'   => static fn (): string => __( 'One of the files is not an allowed type or its content does not match its extension.', 'kotlinskidev' ),
        'attachment_size'   => static fn (): string => __( 'The files are too large. Please attach fewer or smaller files.', 'kotlinskidev' ),
        'attachment_count'  => static fn (): string => __( 'Too many files. Please attach fewer files.', 'kotlinskidev' ),
        'attachment_failed' => static fn (): string => __( 'The files could not be processed. Please try again.', 'kotlinskidev' ),
        'ratelimit'         => static fn (): string => __( 'Too many submissions with attachments. Please wait a few minutes and try again.', 'kotlinskidev' ),
        'toolarge'          => static fn (): string => __( 'The upload is too large. Please attach fewer or smaller files.', 'kotlinskidev' ),
    ];

    if ( isset( $attachment_errors[ $error_type ] ) ) {
        $error_message = $attachment_errors[ $error_type ]();
    }

    if ( 'captcha' === $error_type ) {
        $error_message = 'turnstile' === $captcha_provider
            ? 'Please complete the Cloudflare Turnstile verification.'
            : 'Please complete the reCAPTCHA verification.';
    }

    echo '<div class="contact-form-error"' . ( isset( $attachment_errors[ $error_type ] ) ? ' role="alert"' : '' ) . '>' . esc_html( $error_message ) . '</div>';
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.querySelector('.contact-form-ts');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        window.kotlinskiAnalytics && window.kotlinskiAnalytics.trackEvent('form_error', { form_name: 'contact_form', error_type: '<?php echo esc_js( $error_type ); ?>' });
    });
    </script>
    <?php
}
?>
<?php
$enable_attachments = true === ( $attributes['enableAttachments'] ?? false );
$form_attachment_attributes = '';
$form_action_path           = 'admin-post.php';

if ( $enable_attachments ) {
    $attachment_limits          = kotlinskidev_contact_attachment_limits();
    $form_action_path           = 'admin-post.php?action=kotlinskidev_contact_form_submit';
    $form_attachment_attributes = sprintf(
        ' enctype="multipart/form-data" data-attachments-max-files="%1$d" data-attachments-max-total="%2$d" data-attachments-max-file="%3$d" data-attachments-extensions="%4$s" data-attachments-messages="%5$s"',
        absint( $attachment_limits['max_files'] ),
        absint( $attachment_limits['max_total_bytes'] ),
        absint( $attachment_limits['max_file_bytes'] ),
        esc_attr( implode( ',', array_keys( kotlinskidev_contact_attachment_allowed_types() ) ) ),
        esc_attr(
            (string) wp_json_encode(
                [
                    'count'  => __( 'You can attach up to %s files.', 'kotlinskidev' ),
                    'total'  => __( 'The files together are larger than %s.', 'kotlinskidev' ),
                    'file'   => __( '"%s" is larger than the per-file limit.', 'kotlinskidev' ),
                    'type'   => __( '"%s" is not an allowed file type.', 'kotlinskidev' ),
                    'remove' => __( 'Remove %s', 'kotlinskidev' ),
                ]
            )
        )
    );
}
?>
<form <?php echo get_block_wrapper_attributes( [ 'class' => 'contact-form-ts contact-form-block' ] ); ?> data-nonce-url="<?php echo esc_url( admin_url( 'admin-ajax.php?action=kotlinskidev_contact_form_nonce' ) ); ?>" method="post" action="<?php echo esc_url( admin_url( $form_action_path ) ); ?>"<?php echo $form_attachment_attributes; ?>>
    <input type="hidden" name="action" value="kotlinskidev_contact_form_submit">
    <?php wp_nonce_field( 'kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_nonce' ); ?>
    <label for="name"><?php echo esc_html( $attributes['nameLabel'] ?? 'Name' ); ?></label>
    <input type="text" id="name" name="name" placeholder="<?php echo esc_attr( $attributes['namePlaceholder'] ?? 'Your Name' ); ?>" required>
    <label for="email"><?php echo esc_html( $attributes['emailLabel'] ?? 'Email' ); ?></label>
    <input type="email" id="email" name="email" placeholder="<?php echo esc_attr( $attributes['emailPlaceholder'] ?? 'Your Email' ); ?>" required>
    <label for="topic"><?php echo esc_html( $attributes['topicLabel'] ?? 'Topic' ); ?></label>
    <input type="text" id="topic" name="topic" placeholder="<?php echo esc_attr( $attributes['topicPlaceholder'] ?? 'Topic' ); ?>">
    <label for="message"><?php echo esc_html( $attributes['messageLabel'] ?? 'Message' ); ?></label>
    <textarea id="message" name="message" placeholder="<?php echo esc_attr( $attributes['messagePlaceholder'] ?? 'Your Message' ); ?>" required></textarea>
    <label>
        <input type="checkbox" name="agree" required>
        <?php echo esc_html( $attributes['agreeLabel'] ?? 'I agree to be contacted via email.' ); ?>
    </label>

    <?php if ( $enable_attachments ) : ?>
        <div class="kt-contact-attachments">
            <label for="kt-contact-attachments-input" class="kt-contact-attachments__label"><?php esc_html_e( 'Attachments (optional)', 'kotlinskidev' ); ?></label>
            <input type="file" id="kt-contact-attachments-input" class="kt-contact-attachments__input" name="attachments[]" multiple accept="<?php echo esc_attr( kotlinskidev_contact_attachment_accept_attribute() ); ?>" aria-describedby="kt-contact-attachments-help kt-contact-attachments-error">
            <p id="kt-contact-attachments-help" class="kt-contact-attachments__help">
                <?php
                echo esc_html(
                    sprintf(
                        __( 'Allowed types: %1$s. Max %2$d files, %3$d MB total.', 'kotlinskidev' ),
                        implode( ', ', array_keys( kotlinskidev_contact_attachment_allowed_types() ) ),
                        absint( $attachment_limits['max_files'] ),
                        (int) round( absint( $attachment_limits['max_total_bytes'] ) / 1048576 )
                    )
                );
                ?>
            </p>
            <p class="kt-contact-attachments__note"><?php esc_html_e( 'Files are sent to the site owner by email and are not stored on the website.', 'kotlinskidev' ); ?></p>
            <ul class="kt-contact-attachments__list" aria-live="polite"></ul>
            <div id="kt-contact-attachments-error" class="kt-contact-attachments__error" role="alert"></div>
        </div>
    <?php endif; ?>

    <?php if ( $enable_captcha ) : ?>
        <?php if ( 'recaptcha' === $captcha_provider && ! empty( $recaptcha_site_key ) ) : ?>
            <div class="g-recaptcha" data-sitekey="<?php echo esc_attr( $recaptcha_site_key ); ?>"></div>
        <?php elseif ( 'turnstile' === $captcha_provider && ! empty( $turnstile_site_key ) ) : ?>
            <div class="cf-turnstile" data-sitekey="<?php echo esc_attr( $turnstile_site_key ); ?>"></div>
        <?php endif; ?>
    <?php endif; ?>

    <button type="submit" class="is-style-<?php echo esc_attr( kotlinskidev_resolve_button_style( $attributes['submitButtonStyle'] ?? '' ) ); ?>"><?php echo esc_html( $attributes['submitLabel'] ?? 'Send' ); ?></button>
</form>
<?php
