<?php

function contact_form_ts_register_block() {
    register_block_type( plugin_dir_path( __FILE__ ) . '../build', [
        'render_callback' => 'contact_form_ts_render',
    ] );
}
add_action( 'init', 'contact_form_ts_register_block' );

function contact_form_ts_render( $attributes, $content = '', $block = null ) {
    // error_log('contact_form_ts_render called');
    ob_start();
    // Show success message if present in URL
    if (isset($_GET['contact-success'])) {
        echo '<div class="contact-form-success" id="contact-form-ts-success">' . esc_html($attributes['successMessage'] ?? 'Thank you! Your message has been sent.') . '</div>';
        // Add JS to scroll to the form on page load
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
    // Show error message if present in URL (optional, for future use)
    if (isset($_GET['contact-error'])) {
        echo '<div class="contact-form-error">' . esc_html($attributes['errorMessage'] ?? 'Sorry, there was an error. Please try again.') . '</div>';
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
    <form <?php if (function_exists('get_block_wrapper_attributes')) { echo get_block_wrapper_attributes(['class' => 'contact-form-ts contact-form-block']); } else { echo 'class="contact-form-ts contact-form-block"'; } ?> method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
        <input type="hidden" name="action" value="contact_form_ts_submit">
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
        <button type="submit"><?php echo esc_html( $attributes['submitLabel'] ?? 'Send' ); ?></button>
    </form>
    <?php
    return ob_get_clean();
}
