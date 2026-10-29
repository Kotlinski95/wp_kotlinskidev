<?php
function kotlinskidev_render_marquee_modal_shell(): void {
    echo '<div id="kt-modal-marquee" class="kt-modal kt-modal--medium" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="kt-modal-marquee-title">';
    echo '<div class="kt-modal__backdrop" data-kt-modal-close></div>';
    echo '<div class="kt-modal__dialog">';
    echo '<button type="button" class="kt-modal__close" data-kt-modal-close aria-label="' . esc_attr__( 'Close', 'kotlinskidev' ) . '">&times;</button>';
    echo '<div class="kt-modal__content">';
    echo '<img id="kt-modal-marquee-icon" class="kt-modal-marquee__icon" src="" alt="" hidden />';
    echo '<h3 id="kt-modal-marquee-title"></h3>';
    echo '<p id="kt-modal-marquee-body"></p>';
    echo '<a id="kt-modal-marquee-link" class="kt-modal-marquee__link" href="" target="_blank" rel="noopener noreferrer" hidden>' . esc_html__( 'View documentation', 'kotlinskidev' ) . ' &rarr;</a>';
    echo '</div>';
    echo '</div>';
    echo '</div>';
}
add_action( 'wp_footer', 'kotlinskidev_render_marquee_modal_shell' );
