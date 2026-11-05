<?php
function kotlinskidev_scan_blocks_for_canvas_scene( array $blocks ): bool {
    foreach ( $blocks as $block ) {
        if ( absint( $block['attrs']['canvasSceneId'] ?? 0 ) > 0 ) {
            return true;
        }

        if ( ! empty( $block['innerBlocks'] ) && kotlinskidev_scan_blocks_for_canvas_scene( $block['innerBlocks'] ) ) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_post_has_canvas_scene_blocks(): bool {
    static $cached = null;

    if ( null !== $cached ) {
        return $cached;
    }

    if ( ! is_singular() ) {
        $cached = false;
        return $cached;
    }

    $post = get_queried_object();
    if ( ! $post instanceof WP_Post || '' === $post->post_content ) {
        $cached = false;
        return $cached;
    }

    $transient_key = 'kotlinskidev_canvas_bg_present_' . $post->ID . '_' . strtotime( $post->post_modified_gmt );
    $found         = get_transient( $transient_key );

    if ( false === $found ) {
        $found = kotlinskidev_scan_blocks_for_canvas_scene( parse_blocks( $post->post_content ) ) ? '1' : '0';
        set_transient( $transient_key, $found, WEEK_IN_SECONDS );
    }

    $cached = '1' === $found;
    return $cached;
}

function kotlinskidev_enqueue_canvas_background_script(): void {
    if ( ! kotlinskidev_feature_enabled( 'canvas_backgrounds' ) ) {
        return;
    }

    if ( ! kotlinskidev_post_has_canvas_scene_blocks() ) {
        return;
    }

    $asset_path = kotlinskidev_build_path( 'js', 'canvas-background-init.asset.php' );
    if ( ! file_exists( $asset_path ) ) {
        return;
    }

    $asset = include $asset_path;

    wp_enqueue_script(
        'kotlinskidev-canvas-background-init',
        kotlinskidev_build_url( 'js', 'canvas-background-init.js' ),
        $asset['dependencies'],
        $asset['version'],
        [
            'strategy'  => 'defer',
            'in_footer' => true,
        ]
    );

    wp_add_inline_script(
        'kotlinskidev-canvas-background-init',
        'window.kotlinskidevCanvasBuildBaseUrl=' . wp_json_encode( get_template_directory_uri() . '/build/' ) . ';',
        'before'
    );
}
add_action( 'wp_enqueue_scripts', 'kotlinskidev_enqueue_canvas_background_script' );
