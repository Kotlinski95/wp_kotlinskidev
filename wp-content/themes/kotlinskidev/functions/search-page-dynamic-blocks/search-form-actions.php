<?php
function kotlinskidev_search_form_submit_markup(): string {
    ob_start();
?>
            <div style="text-align:center;margin-bottom:1.25rem;">
                <button type="submit" class="search-button" aria-describedby="search-button-description">
                    <span>🔍</span>
                    <span><?php esc_html_e('Search Content', 'kotlinskidev'); ?></span>
                </button>
                <div id="search-button-description" class="sr-only">
                    <?php esc_html_e('Search for content using the criteria above', 'kotlinskidev'); ?>
                </div>
            </div>

<?php
    return ob_get_clean();
}

function kotlinskidev_search_form_clear_link_markup( array $form ): string {
    $current_search = $form['current_search'];
    ob_start();
?>
            <?php if (!empty($current_search)) : ?>
            <div style="text-align:center;">
                <?php
                $search_slug = __('search', 'kotlinskidev');
                $clear_url = home_url('/' . $search_slug . '/');
                ?>
                <a href="<?php echo esc_url($clear_url); ?>"
                   class="clear-search-link link-dark-variant-support"
                   aria-label="<?php esc_attr_e('Clear search and return to homepage', 'kotlinskidev'); ?>">
                    ✕ <?php esc_html_e('Clear search and filters', 'kotlinskidev'); ?>
                </a>
            </div>
            <?php endif; ?>

<?php
    return ob_get_clean();
}

function kotlinskidev_search_form_submit_script_markup(): string {
    ob_start();
?>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchForm = document.querySelector('.kotlinskidev-search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', function(e) {
                    const inputs = searchForm.querySelectorAll('input, select');
                    inputs.forEach(function(input) {
                        if (input.name && (input.value === '' || input.value === null)) {
                            input.removeAttribute('name');
                        }
                    });
                });
            }
        });
        </script>
<?php
    return ob_get_clean();
}
