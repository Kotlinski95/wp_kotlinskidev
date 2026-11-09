<?php
function kotlinskidev_view_transitions_css(): string {
    return '@supports (view-transition-name:none){@media (prefers-reduced-motion:no-preference){'
        . '@view-transition{navigation:auto}'
        . '.mobile-footer-nav{view-transition-name:kt-footer-nav}'
        . '::view-transition-group(kt-footer-nav),::view-transition-old(kt-footer-nav),::view-transition-new(kt-footer-nav){animation:none}'
        . '::view-transition-old(kt-footer-nav){display:none}'
        . '::view-transition-old(root),::view-transition-new(root){animation-duration:180ms;animation-timing-function:ease-out}'
        . 'html.kt-vt #page-loader{display:none}'
        . '}}';
}

function kotlinskidev_render_view_transitions_css(): void {
    if (is_admin()) {
        return;
    }
    echo '<style id="kt-view-transitions">' . kotlinskidev_view_transitions_css() . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static theme-authored CSS constant, no user input
}
add_action('wp_head', 'kotlinskidev_render_view_transitions_css', 1);
