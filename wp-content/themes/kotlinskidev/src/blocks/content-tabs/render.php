<?php
$nav_position            = sanitize_key( $attributes['navPosition'] ?? 'top' );
$nav_position_mobile     = sanitize_key( $attributes['navPositionMobile'] ?? 'top' );
$nav_gap                 = is_array( $attributes['navGap'] ?? null ) ? $attributes['navGap'] : [];
$active_tab_underline    = ! isset( $attributes['activeTabUnderline'] ) || (bool) $attributes['activeTabUnderline'];
$active_tab_text_enabled = ! empty( $attributes['activeTabTextColorEnabled'] );
$active_tab_bg_enabled   = ! empty( $attributes['activeTabBackgroundEnabled'] );
$active_tab_color        = (string) ( $attributes['activeTabColor'] ?? '' );
$active_tab_bg_color     = (string) ( $attributes['activeTabBackgroundColor'] ?? '' );
$panel_transition        = sanitize_key( $attributes['panelTransition'] ?? '' );
$card_animation          = sanitize_key( $attributes['cardAnimation'] ?? '' );
$orientation             = in_array( $nav_position, [ 'left', 'right' ], true ) ? 'vertical' : 'horizontal';
$unique                  = wp_unique_id( 'kt-content-tabs-' );

$nav_html    = '';
$panels_html = '';
$index       = 0;

foreach ( $block->inner_blocks as $item_block ) {
    if ( 'kotlinskidev/content-tabs-item' !== $item_block->name ) {
        continue;
    }

    $tab_id    = $unique . '-tab-' . $index;
    $panel_id  = $unique . '-panel-' . $index;
    $is_active = 0 === $index;

    $nav_link_markup = '';
    foreach ( $item_block->inner_blocks as $child_block ) {
        if ( 'kotlinskidev/content-tabs-nav-link' === $child_block->name ) {
            $nav_link_markup = $child_block->render();
            break;
        }
    }

    $nav_html .= sprintf(
        '<button type="button" id="%1$s" class="kt-content-tabs__nav-trigger" role="tab" aria-controls="%2$s" aria-selected="%3$s" tabindex="%4$s">%5$s</button>',
        esc_attr( $tab_id ),
        esc_attr( $panel_id ),
        $is_active ? 'true' : 'false',
        $is_active ? '0' : '-1',
        $nav_link_markup // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WP_Block::render()'s own self-escaping block render pipeline
    );

    $item_block->attributes['tabId']    = $tab_id;
    $item_block->attributes['panelId']  = $panel_id;
    $item_block->attributes['isActive'] = $is_active;

    $panels_html .= $item_block->render();

    $index++;
}

$active_classes = [];
if ( $active_tab_underline ) {
    $active_classes[] = 'kt-content-tabs--active-underline';
}
if ( $active_tab_text_enabled && '' !== $active_tab_color ) {
    $active_classes[] = 'kt-content-tabs--active-text-color';
    if ( str_contains( $active_tab_color, 'gradient' ) ) {
        $active_classes[] = 'kt-content-tabs--active-text-gradient';
    }
}
if ( $active_tab_bg_enabled && '' !== $active_tab_bg_color ) {
    $active_classes[] = 'kt-content-tabs--active-background';
}
if ( 'fade' === $panel_transition ) {
    $active_classes[] = 'kt-content-tabs--transition-fade';
}
if ( '' !== $card_animation ) {
    $active_classes[] = 'kt-content-tabs--card-animation-' . $card_animation;
}

$wrapper_attributes = get_block_wrapper_attributes( [
    'class' => trim(
        'kt-content-tabs kt-content-tabs--' . esc_attr( $nav_position )
            . ' kt-content-tabs--mobile-' . esc_attr( $nav_position_mobile )
            . ' ' . esc_attr( implode( ' ', $active_classes ) )
    ),
] );

$block_html = sprintf(
    '<div %1$s><div class="kt-content-tabs__nav" role="tablist" aria-orientation="%2$s">%3$s</div><div class="kt-content-tabs__panels">%4$s</div></div>',
    $wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally
    esc_attr( $orientation ),
    $nav_html, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above from esc_attr()'d values plus WP_Block::render() output
    $panels_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from WP_Block::render()'s own self-escaping block render pipeline
);

$style_declarations = [];
foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
    $device_gap = $nav_gap[ $device ] ?? null;
    if ( null !== $device_gap && is_numeric( $device_gap ) ) {
        $style_declarations[] = '--kt-content-tabs-nav-gap-' . $device . ':' . absint( $device_gap ) . 'px';
    }
}
if ( $active_tab_text_enabled && '' !== $active_tab_color ) {
    $style_declarations[] = '--kt-content-tabs-active-color:' . $active_tab_color;
}
if ( $active_tab_bg_enabled && '' !== $active_tab_bg_color ) {
    $style_declarations[] = '--kt-content-tabs-active-bg:' . $active_tab_bg_color;
}

if ( ! empty( $style_declarations ) ) {
    $processor = new WP_HTML_Tag_Processor( $block_html );
    if ( $processor->next_tag() ) {
        $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
        $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
        $processor->set_attribute( 'style', $existing_style . implode( ';', $style_declarations ) . ';' );
        $block_html = $processor->get_updated_html();
    }
}

echo $block_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_attr()'d values, get_block_wrapper_attributes(), and WP_HTML_Tag_Processor's own attribute escaping
