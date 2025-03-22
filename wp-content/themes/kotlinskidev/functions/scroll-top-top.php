<?php

function kotlinskidev_scroll_to_top_shortcode() {
    return '
    <div class="wp-block-buttons" style="margin-top:0;margin-bottom:0">
        <div class="wp-block-button kotlinskidev-scrollto-top is-style-button-hover-secondary-bgcolor">
            <a id="scroll-to-top" class="wp-block-button__link wp-element-button" style="border-radius:100%">
                <span class="icon-circle-up" style="font-size:2rem;"></span>
                <span style="visibility: hidden;">' . esc_html__('Scroll to Top', 'kotlinskidev') . '</span>
            </a>
        </div>
    </div>';
}
add_shortcode('scroll_to_top', 'kotlinskidev_scroll_to_top_shortcode');


?>