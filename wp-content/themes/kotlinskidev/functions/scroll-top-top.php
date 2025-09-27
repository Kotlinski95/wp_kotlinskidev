<?php
function kotlinskidev_scroll_to_top_shortcode() {
    return '
    <div class="wp-block-buttons" style="margin-top:0;margin-bottom:0">
        <div class="wp-block-button kotlinskidev-scrollto-top is-style-button-hover-secondary-bgcolor">
            <div class="scroll-to-top-wrapper">
                <svg class="progress-ring" width="40" height="40">
                    <circle class="progress-ring__background" 
                            cx="20" cy="20" r="18" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="3" 
                            opacity="0.3"/>
                    <circle class="progress-ring__progress" 
                            cx="20" cy="20" r="18" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="3" 
                            stroke-linecap="round" 
                            transform="rotate(0 20 20)"/>
                </svg>
                <a id="scroll-to-top" class="wp-block-button__link wp-element-button" style="border-radius:100%" aria-label="' . esc_html__('Scroll to Top', 'kotlinskidev') . '" tabindex="0">
                    <span class="icon-arrow-up" style="font-size:2rem;"></span>
                    <span tabindex="-1" style="display:none;">' . esc_html__('Scroll to Top', 'kotlinskidev') . '</span>
                </a>
            </div>
        </div>
    </div>';
}
add_shortcode('scroll_to_top', 'kotlinskidev_scroll_to_top_shortcode');