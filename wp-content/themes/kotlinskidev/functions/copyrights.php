<?php
function kotlinskidev_copyrights_shortcode()
{
    ob_start();
?>
    <section class="copyrights-container">
        <p class="copyrights">&copy; <?php echo date("Y"); ?> <?php esc_html_e('Copyrights', 'kotlinskidev'); ?></p>
        <p class="has-text-align-center" style="line-height:1.5">
            <?php echo wp_kses(__('Proudly powered by', 'kotlinskidev'), ['a' => ['href' => true, 'target' => true]]); ?>
        </p>
    </section>
<?php
    return ob_get_clean();
}
add_shortcode('copyrights', 'kotlinskidev_copyrights_shortcode');