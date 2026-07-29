<?php
/**
 * Cache Manager — kotlinskidev theme
 *
 * Single source of truth for every transient and object-cache entry the theme
 * creates. Responsibilities:
 *
 *  1. Define all cache key prefixes in one place.
 *  2. Detect new builds via a combined filemtime fingerprint and purge stale
 *     transients automatically — no manual cache clearing needed after deploy.
 *  3. Flush everything on theme switch, theme update, or from the WP admin
 *     "Tools → Cache" page (or via WP-CLI).
 *  4. Keep the wp_options table lean by never leaving orphaned transients behind.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CACHE KEY REGISTRY  (all theme transient / object-cache keys documented here)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Transients (stored in wp_options when no persistent object cache is active):
 *
 *   kotlinskidev_critical_css_{filemtime}   Inlined critical CSS file contents.
 *                                           Auto-busted by filemtime on new build.
 *
 *   kotlinskidev_critical_js_{filemtime}    Inlined critical JS file contents.
 *                                           Auto-busted by filemtime on new build.
 *
 *   kotlinskidev_i18n_{locale}              JS translation array assembled from
 *                                           ~40 __() calls, cached per locale.
 *
 *   kotlinskidev_img_sizes                  Single map of md5(url) => width/height
 *                                           for the content filter (replaces live
 *                                           getimagesize()) — one transient for every
 *                                           image site-wide instead of one per URL,
 *                                           loaded once per request and written back
 *                                           at most once, at shutdown. Per-entry
 *                                           invalidation on edit_/delete_attachment.
 *                                           Legacy `img_size_{md5(url)}` entries from
 *                                           before this consolidation may still exist
 *                                           until they expire or a manual flush runs.
 *
 *   kotlinskidev_popular_posts_{md5(args)}  Post IDs for the popular-pages block's
 *                                           view-count query. 15 minute TTL — view
 *                                           counts don't need to be real-time.
 *
 *   kotlinskidev_svg_{attachment_id}        Inlined SVG file contents for nav icons
 *                                           and image-block SVGs. WEEK_IN_SECONDS.
 *                                           Invalidated on edit_/delete_attachment.
 *
 *   kotlinskidev_build_fingerprint          Combined filemtime hash of all tracked
 *                                           build files. Used to detect new deploys.
 *
 *  Object-cache (wp_cache_get / wp_cache_set — ephemeral, per-request only when
 *  no persistent backend like Redis is active):
 *
 *   kotlinskidev_polish_search_page_id      Page ID for the Polish search template,
 *                                           looked up at most once per request.
 *
 *  Static / in-memory (never written to DB, live only for the current PHP process):
 *
 *   $cached_keys       in kotlinskidev_get_or_create_keys()   RSA key pair
 *   $lazy_class        in control_block_lazy_loading()         Theme-mod value
 *   $cache[$locale]    in kotlinskidev_get_breadcrumb_settings() Breadcrumb opts
 * ─────────────────────────────────────────────────────────────────────────────
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ─── 1. PREFIX CONSTANT ──────────────────────────────────────────────────────

/** All theme transient names must start with this prefix. */
define( 'KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_' );

// ─── 2. BUILD FILES TRACKED FOR FINGERPRINTING ───────────────────────────────

/**
 * Build files whose modification time is used to detect a new deployment.
 * Add any new compiled file here if it gets inlined or heavily cached.
 */
function kotlinskidev_tracked_build_files(): array {
    $build = get_template_directory() . '/build/';
    return [
        $build . 'critical.css',
        $build . 'critical.js',
        $build . 'main.css',
        $build . 'main.js',
    ];
}

// ─── 3. FINGERPRINT HELPER ───────────────────────────────────────────────────

/**
 * Return a hash that uniquely represents the current build output.
 * Changes whenever any tracked build file is replaced on disk.
 */
function kotlinskidev_build_fingerprint(): string {
    $raw = '';
    foreach ( kotlinskidev_tracked_build_files() as $path ) {
        $raw .= file_exists( $path ) ? filemtime( $path ) : '0';
    }
    return md5( $raw );
}

// ─── 4. FLUSH HELPERS ────────────────────────────────────────────────────────

/**
 * Delete every theme transient whose name starts with KOTLINSKIDEV_CACHE_PREFIX.
 * Also deletes the img_size_* transients created by the image-dimension filter.
 *
 * Safe to call at any time. Uses a single targeted SQL query instead of looping
 * over individual delete_transient() calls to avoid hammering the DB.
 */
function kotlinskidev_flush_all_transients(): void {
    global $wpdb;

    $prefix = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX );
    $img    = $wpdb->esc_like( '_transient_img_size_' );

    // Delete the transient values
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options}
             WHERE option_name LIKE %s
                OR option_name LIKE %s",
            $prefix . '%',
            $img . '%'
        )
    );

    // Delete the corresponding timeout rows
    $prefix_timeout = $wpdb->esc_like( '_transient_timeout_' . KOTLINSKIDEV_CACHE_PREFIX );
    $img_timeout    = $wpdb->esc_like( '_transient_timeout_img_size_' );

    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options}
             WHERE option_name LIKE %s
                OR option_name LIKE %s",
            $prefix_timeout . '%',
            $img_timeout . '%'
        )
    );

    // Also flush the WP object cache for the current request
    wp_cache_flush();
}

/**
 * Delete only the stale build-file transients (critical CSS / critical JS)
 * whose filemtime-based keys are no longer valid. Leaves img_size_* and i18n
 * transients intact since those are still current.
 */
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

// ─── 5. AUTO-DETECTION OF NEW DEPLOYS ────────────────────────────────────────

/**
 * Run once per new build: compare the current fingerprint against the stored one.
 * If they differ, flush stale build transients and store the new fingerprint.
 *
 * Hooked at priority 0 on wp_head so it runs before CSS / JS inlining hooks.
 * The stored fingerprint transient itself is excluded from the flush.
 */
function kotlinskidev_maybe_purge_on_new_build(): void {
    $fingerprint_key  = KOTLINSKIDEV_CACHE_PREFIX . 'build_fingerprint';
    $current          = kotlinskidev_build_fingerprint();
    $stored           = get_transient( $fingerprint_key );

    if ( $stored === $current ) {
        return; // Nothing changed — bail immediately (zero extra DB work)
    }

    // New build detected — wipe stale build-file transients
    kotlinskidev_flush_build_transients();

    // Persist the new fingerprint for MONTH_IN_SECONDS so this check is cheap
    set_transient( $fingerprint_key, $current, MONTH_IN_SECONDS );
}
add_action( 'wp_head', 'kotlinskidev_maybe_purge_on_new_build', 0 );

// ─── 6. LIFECYCLE HOOKS — flush on theme events ───────────────────────────────

/**
 * Full flush when the theme is deactivated or switched away.
 * Ensures no cached data from this theme bleeds into the next active theme.
 */
add_action( 'switch_theme', 'kotlinskidev_flush_all_transients' );

/**
 * Full flush when WordPress completes any upgrade (theme or otherwise).
 * Catches deployments done via the WP admin Themes > Update flow.
 */
add_action( 'upgrader_process_complete', 'kotlinskidev_flush_all_transients' );

/**
 * Full flush when a language / locale file is updated.
 * Invalidates the i18n translation transient so new strings appear immediately.
 */
add_action( 'upgrader_process_complete', function ( $upgrader, $hook_extra ) {
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
}, 10, 2 );

// ─── 7. ADMIN UI — manual "Clear Cache" button ───────────────────────────────

/**
 * Register a minimal admin page under Tools > Theme Cache.
 */
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

/**
 * Handle the form POST and render the admin page.
 */
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

    // Gather stats
    global $wpdb;
    $prefix     = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX );
    $img_prefix = $wpdb->esc_like( '_transient_img_size_' );

    $count = (int) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->options}
              WHERE ( option_name LIKE %s OR option_name LIKE %s )
                AND option_name NOT LIKE %s",
            $prefix . '%',
            $img_prefix . '%',
            '%_timeout_%'
        )
    );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'kotlinskidev — Theme Cache', 'kotlinskidev' ); ?></h1>

        <p><?php esc_html_e( 'Cached entries currently stored in the database:', 'kotlinskidev' ); ?>
           <strong><?php echo esc_html( $count ); ?></strong></p>

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
                    <td>Critical CSS</td>
                    <td><code>kotlinskidev_critical_css_*</code></td>
                    <td>Build deploy (filemtime)</td>
                </tr>
                <tr>
                    <td>Critical JS</td>
                    <td><code>kotlinskidev_critical_js_*</code></td>
                    <td>Build deploy (filemtime)</td>
                </tr>
                <tr>
                    <td>JS translations</td>
                    <td><code>kotlinskidev_i18n_{locale}</code></td>
                    <td>Language file update / manual flush</td>
                </tr>
                <tr>
                    <td>Image dimensions</td>
                    <td><code>kotlinskidev_img_sizes</code></td>
                    <td>Attachment edit / delete / manual flush</td>
                </tr>
                <tr>
                    <td>Popular posts</td>
                    <td><code>kotlinskidev_popular_posts_{md5}</code></td>
                    <td>15 minute TTL / manual flush</td>
                </tr>
                <tr>
                    <td>Inlined SVGs</td>
                    <td><code>kotlinskidev_svg_{attachment_id}</code></td>
                    <td>Attachment edit / delete / manual flush</td>
                </tr>
                <tr>
                    <td>Build fingerprint</td>
                    <td><code>kotlinskidev_build_fingerprint</code></td>
                    <td>Set automatically on every new build</td>
                </tr>
            </tbody>
        </table>

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

// ─── 8. WP-CLI COMMAND ───────────────────────────────────────────────────────

/**
 * WP-CLI usage:
 *   wp eval 'kotlinskidev_flush_all_transients();' && echo "Cache cleared"
 *
 * Or via the registered command if WP-CLI is available:
 *   wp kotlinskidev cache flush
 */
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
            global $wpdb;
            $prefix = $wpdb->esc_like( '_transient_' . KOTLINSKIDEV_CACHE_PREFIX );
            $img    = $wpdb->esc_like( '_transient_img_size_' );
            $count  = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->options}
                      WHERE ( option_name LIKE %s OR option_name LIKE %s )
                        AND option_name NOT LIKE %s",
                    $prefix . '%',
                    $img . '%',
                    '%_timeout_%'
                )
            );
            WP_CLI::line( "kotlinskidev theme transients in DB: {$count}" );
        }
    }

    WP_CLI::add_command( 'kotlinskidev cache', 'Kotlinskidev_Cache_CLI' );
}
