<?php
function kotlinskidev_device_frame_lightbox_registry( ?array $entry = null, ?string $modal_id = null ): array {
    static $registry = [];

    if ( null !== $entry && null !== $modal_id ) {
        $registry[ $modal_id ] = $entry;
    }

    return $registry;
}

function kotlinskidev_register_device_frame_lightbox_media( int $media_id, bool $is_video ): string {
    static $instance = 0;
    $instance++;

    $modal_id = 'kt-modal-device-frame-' . $instance . '-' . $media_id;
    kotlinskidev_device_frame_lightbox_registry(
        [
            'media_id' => $media_id,
            'is_video' => $is_video,
        ],
        $modal_id
    );

    return $modal_id;
}

function kotlinskidev_render_device_frame_lightbox_shells(): void {
    $registry = kotlinskidev_device_frame_lightbox_registry();
    if ( empty( $registry ) ) {
        return;
    }

    foreach ( $registry as $modal_id => $entry ) {
        $media_id = $entry['media_id'];
        $is_video = $entry['is_video'];

        echo '<div id="' . esc_attr( $modal_id ) . '" class="kt-modal kt-modal--large kt-device-frame-lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="' . esc_attr__( 'Expanded media', 'kotlinskidev' ) . '">';
        echo '<div class="kt-modal__backdrop" data-kt-modal-close></div>';
        echo '<div class="kt-modal__dialog">';
        echo '<button type="button" class="kt-modal__close" data-kt-modal-close aria-label="' . esc_attr__( 'Close', 'kotlinskidev' ) . '">&times;</button>';
        echo '<div class="kt-modal__content kt-device-frame-lightbox__content">';

        if ( $is_video ) {
            echo '<video class="kt-device-frame-lightbox__media" src="' . esc_url( wp_get_attachment_url( $media_id ) ) . '" controls playsinline></video>';
        } else {
            echo wp_get_attachment_image( $media_id, 'full', false, [ 'class' => 'kt-device-frame-lightbox__media' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() self-escapes
        }

        echo '</div></div></div>';
    }
}
add_action( 'wp_footer', 'kotlinskidev_render_device_frame_lightbox_shells' );
