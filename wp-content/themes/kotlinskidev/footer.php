<footer>
    <?php get_template_part('patterns/footer'); ?>
    <section class="copyrights-container">
        <p class="copyrights">&copy; <?php echo esc_html(date("Y")); ?> <?php esc_html_e('Copyrights', 'kotlinskidev'); ?></p>
        <p class="has-text-align-center" style="line-height:1.5">
            <?php echo wp_kses(__('Proudly powered by', 'kotlinskidev'), ['a' => ['href' => true, 'target' => true]]); ?>
        </p>
    </section>
</footer>