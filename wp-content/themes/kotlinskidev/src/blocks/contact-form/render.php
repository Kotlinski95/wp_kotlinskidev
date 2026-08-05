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
    });
    </script>
    <?php
}

if ( isset( $_GET['contact-error'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag after redirect, no state change
    $error_type    = sanitize_key( wp_unslash( $_GET['contact-error'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag after redirect, no state change
    $error_message = $attributes['errorMessage'] ?? 'Sorry, there was an error. Please try again.';

    if ( 'captcha' === $error_type ) {
        $error_message = 'turnstile' === $captcha_provider
            ? 'Please complete the Cloudflare Turnstile verification.'
            : 'Please complete the reCAPTCHA verification.';
    }

    echo '<div class="contact-form-error">' . esc_html( $error_message ) . '</div>';
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.querySelector('.contact-form-ts');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });
    </script>
    <?php
}
?>
<form <?php echo get_block_wrapper_attributes( [ 'class' => 'contact-form-ts contact-form-block' ] ); ?> method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
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

    <?php if ( $enable_captcha ) : ?>
        <?php if ( 'recaptcha' === $captcha_provider && ! empty( $recaptcha_site_key ) ) : ?>
            <div class="g-recaptcha" data-sitekey="<?php echo esc_attr( $recaptcha_site_key ); ?>"></div>
        <?php elseif ( 'turnstile' === $captcha_provider && ! empty( $turnstile_site_key ) ) : ?>
            <div class="cf-turnstile" data-sitekey="<?php echo esc_attr( $turnstile_site_key ); ?>"></div>
        <?php endif; ?>
    <?php endif; ?>

    <button type="submit"><?php echo esc_html( $attributes['submitLabel'] ?? 'Send' ); ?></button>
</form>
<?php
