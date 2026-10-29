<?php
$tab_id    = $attributes['tabId'] ?? '';
$panel_id  = $attributes['panelId'] ?? '';
$is_active = (bool) ( $attributes['isActive'] ?? false );

$panel_content  = '';
$skipped_nav_link = false;

foreach ( $block->inner_blocks as $child_block ) {
    if ( ! $skipped_nav_link && 'kotlinskidev/content-tabs-nav-link' === $child_block->name ) {
        $skipped_nav_link = true;
        continue;
    }
    $panel_content .= $child_block->render();
}

$wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'kt-content-tabs__panel' ] );

$block_html = '<div ' . $wrapper_attributes . '>' . $panel_content . '</div>';

$processor = new WP_HTML_Tag_Processor( $block_html );
if ( $processor->next_tag() ) {
    $processor->set_attribute( 'id', $panel_id );
    $processor->set_attribute( 'role', 'tabpanel' );
    $processor->set_attribute( 'aria-labelledby', $tab_id );
    $processor->set_attribute( 'tabindex', '0' );
    if ( ! $is_active ) {
        $processor->set_attribute( 'hidden', 'hidden' );
    }
    $block_html = $processor->get_updated_html();
}

echo $block_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from get_block_wrapper_attributes() plus WP_Block::render()'s own self-escaping pipeline, attributes set via WP_HTML_Tag_Processor
