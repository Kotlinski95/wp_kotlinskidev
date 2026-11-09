<?php
function kotlinskidev_view_transitions_css(): string {
    return '@supports (view-transition-name:none){@media (prefers-reduced-motion:no-preference){'
        . '@view-transition{navigation:auto}'
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
