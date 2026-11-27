<?php
$action     = sanitize_key( (string) ( $attributes['action'] ?? 'url' ) );
$index      = absint( $attributes['index'] ?? 0 );
$labels_ctx = (string) ( $block->context['kotlinskidev/speedDialLabels'] ?? 'auto' );

$default_labels = [
    'phone'         => __( 'Call us', 'kotlinskidev' ),
    'email'         => __( 'Email us', 'kotlinskidev' ),
    'accessibility' => __( 'Accessibility', 'kotlinskidev' ),
    'url'           => __( 'Open link', 'kotlinskidev' ),
    'trigger'       => __( 'Accessibility option', 'kotlinskidev' ),
];
$default_icons  = [
    'phone'         => 'phone',
    'email'         => 'mail',
    'accessibility' => 'accessibility',
    'url'           => 'link',
    'trigger'       => 'accessibility',
];

$item_style = '--kt-speed-dial-index:' . $index;
$item_classes = 'kt-speed-dial__item';

if ( 'custom' === $action ) {
    $allowed_blocks = kotlinskidev_speed_dial_custom_allowed_blocks();
    $custom_html    = '';
    $context_post   = absint( $block->context['postId'] ?? get_the_ID() );
    foreach ( $block->inner_blocks as $child_block ) {
        if ( in_array( $child_block->name, $allowed_blocks, true ) && kotlinskidev_speed_dial_block_permitted( $child_block->name, $context_post ) ) {
            $custom_html .= $child_block->render();
        }
    }
    $custom_html = kotlinskidev_speed_dial_sanitize_custom_html( do_shortcode( $custom_html ) );

    if ( '' === trim( $custom_html ) ) {
        return;
    }

    printf(
        '<li class="%1$s kt-speed-dial__item--custom" style="%2$s">%3$s</li>',
        esc_attr( $item_classes ),
        esc_attr( $item_style ),
        $custom_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- passed through kotlinskidev_speed_dial_sanitize_custom_html(), which strips script, iframe, form, on* attributes and unsafe protocols after the filter
    );
    return;
}

if ( ! isset( $default_labels[ $action ] ) ) {
    return;
}

$use_site_contact = ! isset( $attributes['useSiteContact'] ) || (bool) $attributes['useSiteContact'];
$custom_value     = trim( (string) ( $attributes['value'] ?? '' ) );
$contact          = $use_site_contact ? kotlinskidev_get_contact_info() : [];
$a11y_required    = false;
$element          = 'a';
$link_attributes  = '';

switch ( $action ) {
    case 'phone':
        $href = kotlinskidev_speed_dial_tel_href( $use_site_contact ? (string) ( $contact['phone'] ?? '' ) : $custom_value );
        if ( '' === $href ) {
            return;
        }
        $link_attributes = ' href="' . esc_url( $href, [ 'tel' ] ) . '"';
        break;

    case 'email':
        $email = sanitize_email( $use_site_contact ? (string) ( $contact['email'] ?? '' ) : $custom_value );
        if ( '' === $email || ! is_email( $email ) ) {
            return;
        }
        $link_attributes = ' href="' . esc_url( 'mailto:' . $email, [ 'mailto' ] ) . '"';
        break;

    case 'url':
        $url = esc_url( $custom_value, [ 'http', 'https' ] );
        if ( '' === $url ) {
            return;
        }
        $link_attributes = ' href="' . $url . '"';
        break;

    case 'accessibility':
        if ( ! kotlinskidev_speed_dial_a11y_available() ) {
            return;
        }
        $element         = 'button';
        $a11y_required   = true;
        $link_attributes = ' type="button" data-ka11y="open" data-kt-speed-dial-a11y="open"';
        break;

    case 'trigger':
        $trigger_action = trim( (string) ( $attributes['triggerAction'] ?? '' ) );
        if ( ! kotlinskidev_speed_dial_a11y_available() || ! kotlinskidev_speed_dial_is_valid_trigger_action( $trigger_action ) ) {
            return;
        }
        $element         = 'button';
        $a11y_required   = true;
        $link_attributes = ' type="button" data-ka11y="' . esc_attr( $trigger_action ) . '" data-kt-speed-dial-a11y="' . esc_attr( $trigger_action ) . '"';
        break;
}

$opens_in_new_tab = 'url' === $action && ! empty( $attributes['opensInNewTab'] );
if ( $opens_in_new_tab ) {
    $link_attributes .= ' target="_blank" rel="noopener noreferrer"';
}

$label_text = trim( (string) ( $attributes['label'] ?? '' ) );
$label      = '' !== $label_text ? kotlinskidev_speed_dial_translate( $label_text ) : $default_labels[ $action ];

$aria_label_text = trim( (string) ( $attributes['ariaLabel'] ?? '' ) );
if ( '' !== $aria_label_text ) {
    $link_attributes .= ' aria-label="' . esc_attr( kotlinskidev_speed_dial_translate( $aria_label_text ) ) . '"';
}

$icon_id  = absint( $attributes['iconId'] ?? 0 );
$icon_svg = $icon_id > 0 ? kotlinskidev_inline_nav_icon( $icon_id ) : '';
if ( '' === $icon_svg ) {
    $icon_slug = sanitize_key( (string) ( $attributes['icon'] ?? '' ) );
    $icon_svg  = kotlinskidev_speed_dial_icon_svg( '' !== $icon_slug ? $icon_slug : $default_icons[ $action ] );
}

$background = kotlinskidev_speed_dial_safe_color( $attributes['backgroundColor'] ?? '' );
$text_color = kotlinskidev_speed_dial_safe_color( $attributes['textColor'] ?? '' );
$action_classes = [ 'kt-speed-dial__action' ];
if ( '' !== $background ) {
    $action_classes[] = 'has-background';
    $item_style      .= ';--kt-speed-dial-item-bg:' . $background;
}
if ( '' !== $text_color ) {
    $action_classes[] = 'has-text-color';
    $item_style      .= ';--kt-speed-dial-item-fg:' . $text_color;
}

$label_classes = 'kt-speed-dial__label' . ( 'tooltip' === $labels_ctx ? ' kt-speed-dial__label--tooltip' : '' );
$new_tab_hint  = $opens_in_new_tab
    ? ' <span class="screen-reader-text">' . esc_html__( '(opens in a new tab)', 'kotlinskidev' ) . '</span>'
    : '';

printf(
    '<li class="%1$s" style="%2$s"%3$s><%4$s class="%5$s"%6$s><span class="kt-speed-dial__icon" aria-hidden="true">%7$s</span><span class="%8$s">%9$s</span>%10$s</%4$s></li>',
    esc_attr( $item_classes ),
    esc_attr( $item_style ),
    $a11y_required ? ' data-kt-speed-dial-requires-a11y' : '',
    esc_attr( $element ),
    esc_attr( implode( ' ', $action_classes ) ),
    $link_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each fragment is built from esc_url()/esc_attr() values or fixed literals above
    $icon_svg, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built-in icons use esc_attr()'d regex-validated path data, Media Library icons come from the sanitized kotlinskidev_inline_nav_icon()
    esc_attr( $label_classes ),
    esc_html( $label ),
    $new_tab_hint // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup around esc_html__()
);
