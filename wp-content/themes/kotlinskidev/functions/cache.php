<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_' );

const KOTLINSKIDEV_IMAGE_SIZE_TRANSIENT_PREFIX = 'img_size_';

function kotlinskidev_build_fingerprint(): string {
    $build_id_file = get_template_directory() . '/build/build-id.php';

    if ( ! file_exists( $build_id_file ) ) {
        return 'no-build';
    }

    return (string) include $build_id_file;
}

function kotlinskidev_delete_transient_rows_matching_prefixes( string $first_prefix, string $second_prefix ): void {
    global $wpdb;

    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options}
             WHERE option_name LIKE %s
                OR option_name LIKE %s",
            $first_prefix . '%',
            $second_prefix . '%'
        )
    );
}

function kotlinskidev_flush_all_transients(): void {
    global $wpdb;

    kotlinskidev_delete_transient_rows_matching_prefixes(
        $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX ),
        $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_IMAGE_SIZE_TRANSIENT_PREFIX )
    );

    kotlinskidev_delete_transient_rows_matching_prefixes(
        $wpdb->esc_like( '_transient_timeout_' . KOTLINSKIDEV_CACHE_PREFIX ),
        $wpdb->esc_like( '_transient_timeout_' . KOTLINSKIDEV_IMAGE_SIZE_TRANSIENT_PREFIX )
    );

    wp_cache_flush();
}

function kotlinskidev_flush_build_transients(): void {
    global $wpdb;

    foreach ( [ '_transient_', '_transient_timeout_' ] as $row_prefix ) {
        $like = $wpdb->esc_like( $row_prefix . KOTLINSKIDEV_CACHE_PREFIX . 'critical_' );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $like . '%'
            )
        );
    }
}

function kotlinskidev_purge_asset_cleanup_bundles(): void {
    if ( class_exists( '\WpAssetCleanUp\OptimiseAssets\OptimizeCommon' ) ) {
        \WpAssetCleanUp\OptimiseAssets\OptimizeCommon::clearCache();
    }
}

function kotlinskidev_maybe_purge_on_new_build(): void {
    $fingerprint_key  = KOTLINSKIDEV_CACHE_PREFIX . 'build_fingerprint';
    $current          = kotlinskidev_build_fingerprint();
    $stored           = get_transient( $fingerprint_key );

    if ( $stored === $current ) {
        return;
    }

    kotlinskidev_flush_build_transients();
    kotlinskidev_purge_asset_cleanup_bundles();

    set_transient( $fingerprint_key, $current, MONTH_IN_SECONDS );
}
add_action( 'wp_head', 'kotlinskidev_maybe_purge_on_new_build', 0 );

function kotlinskidev_flush_i18n_transients_on_translation_update( $upgrader, $hook_extra ): void {
    if ( isset( $hook_extra['type'] ) && $hook_extra['type'] === 'translation' ) {
        global $wpdb;
        $like = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX . 'i18n_' );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options}
                  WHERE option_name LIKE %s
                     OR option_name LIKE %s",
                $like . '%',
                str_replace( '_transient_', '_transient_timeout_', $like ) . '%'
            )
        );
    }
}

add_action( 'switch_theme', 'kotlinskidev_flush_all_transients' );
add_action( 'upgrader_process_complete', 'kotlinskidev_flush_all_transients' );
add_action( 'upgrader_process_complete', 'kotlinskidev_flush_i18n_transients_on_translation_update', 10, 2 );

function kotlinskidev_cache_admin_menu(): void {
    add_management_page(
        __( 'Theme Cache', 'kotlinskidev' ),
        __( 'Theme Cache', 'kotlinskidev' ),
        'manage_options',
        'kotlinskidev-cache',
        'kotlinskidev_cache_admin_page'
    );
}
add_action( 'admin_menu', 'kotlinskidev_cache_admin_menu' );

function kotlinskidev_count_theme_transients(): int {
    global $wpdb;

    $prefix       = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX );
    $image_prefix = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_IMAGE_SIZE_TRANSIENT_PREFIX );

    return (int) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->options}
              WHERE ( option_name LIKE %s OR option_name LIKE %s )
                AND option_name NOT LIKE %s",
            $prefix . '%',
            $image_prefix . '%',
            '%_timeout_%'
        )
    );
}

function kotlinskidev_cache_admin_page(): void {
    if (
        isset( $_POST['kotlinskidev_clear_cache'] ) &&
        check_admin_referer( 'kotlinskidev_clear_cache_action' )
    ) {
        kotlinskidev_flush_all_transients();
        echo '<div class="notice notice-success"><p>'
            . esc_html__( 'Theme cache cleared successfully.', 'kotlinskidev' )
            . '</p></div>';
    }

    $count = kotlinskidev_count_theme_transients();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'kotlinskidev — Theme Cache', 'kotlinskidev' ); ?></h1>

        <p><?php esc_html_e( 'Cached entries currently stored in the database:', 'kotlinskidev' ); ?>
           <strong><?php echo esc_html( $count ); ?></strong></p>

<?php kotlinskidev_render_cache_groups_table(); ?>

        <form method="post">
            <?php wp_nonce_field( 'kotlinskidev_clear_cache_action' ); ?>
            <p>
                <button type="submit" name="kotlinskidev_clear_cache" class="button button-primary">
                    <?php esc_html_e( 'Clear all theme cache', 'kotlinskidev' ); ?>
                </button>
            </p>
        </form>
    </div>
    <?php
}

function kotlinskidev_render_cache_groups_table(): void {
    ?>
        <table class="widefat striped" style="max-width:600px;margin-bottom:1.5rem;">
            <thead>
                <tr>
                    <th><?php esc_html_e( 'Cache group', 'kotlinskidev' ); ?></th>
                    <th><?php esc_html_e( 'Key pattern', 'kotlinskidev' ); ?></th>
                    <th><?php esc_html_e( 'Invalidated by', 'kotlinskidev' ); ?></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><?php esc_html_e( 'Critical CSS', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_critical_css_*</code></td>
                    <td><?php esc_html_e( 'Build deploy (filemtime)', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Critical JS', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_critical_js_*</code></td>
                    <td><?php esc_html_e( 'Build deploy (filemtime)', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'JS translations', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_i18n_{locale}</code></td>
                    <td><?php esc_html_e( 'Language file update / manual flush', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Image dimensions', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_img_sizes</code></td>
                    <td><?php esc_html_e( 'Attachment edit / delete / manual flush', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Popular posts', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_popular_posts_{md5}</code></td>
                    <td><?php esc_html_e( '15 minute TTL / manual flush', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Inlined SVGs', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_svg_{attachment_id}</code></td>
                    <td><?php esc_html_e( 'Attachment edit / delete / manual flush', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Build fingerprint', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_build_fingerprint</code></td>
                    <td><?php esc_html_e( 'Set automatically on every new build', 'kotlinskidev' ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Certificate badge fetch', 'kotlinskidev' ); ?></td>
                    <td><code>kotlinskidev_badge_fetch_{md5}</code></td>
                    <td><?php esc_html_e( '1 day TTL / manual flush', 'kotlinskidev' ); ?></td>
                </tr>
            </tbody>
        </table>
<?php
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
    /**
     * Manage the kotlinskidev theme cache.
     */
    class Kotlinskidev_Cache_CLI {
        /**
         * Flush all theme transients.
         *
         * ## EXAMPLES
         *
         *   wp kotlinskidev cache flush
         *
         * @subcommand flush
         */
        public function flush(): void {
            kotlinskidev_flush_all_transients();
            WP_CLI::success( 'kotlinskidev theme cache flushed.' );
        }

        /**
         * Show how many theme transients are currently stored.
         *
         * ## EXAMPLES
         *
         *   wp kotlinskidev cache status
         *
         * @subcommand status
         */
        public function status(): void {
            $count = kotlinskidev_count_theme_transients();
            WP_CLI::line( "kotlinskidev theme transients in DB: {$count}" );
        }
    }

    WP_CLI::add_command( 'kotlinskidev cache', 'Kotlinskidev_Cache_CLI' );
}
