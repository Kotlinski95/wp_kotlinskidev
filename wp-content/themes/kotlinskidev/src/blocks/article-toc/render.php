<?php
if ( ! function_exists( 'kotlinskidev_article_toc_items_for_post' ) ) {
    return;
}

$kt_toc_post_id = (int) get_queried_object_id();
if ( $kt_toc_post_id <= 0 ) {
    $kt_toc_post_id = (int) get_the_ID();
}

$kt_toc_items = kotlinskidev_article_toc_items_for_post( $kt_toc_post_id );
if ( ! is_array( $kt_toc_items ) || count( $kt_toc_items ) < 3 ) {
    return;
}

$kt_toc_list = '<ol class="kt-article-toc__list">';
foreach ( array_values( $kt_toc_items ) as $kt_toc_index => $kt_toc_item ) {
    $kt_toc_list .= '<li class="kt-article-toc__item"><a class="kt-article-toc__link" data-kt-toc-link href="#' . esc_attr( $kt_toc_item['id'] ) . '">'
        . '<span class="kt-article-toc__number" aria-hidden="true">' . esc_html( sprintf( '%02d', $kt_toc_index + 1 ) ) . '</span>'
        . '<span class="kt-article-toc__label">' . esc_html( $kt_toc_item['label'] ) . '</span>'
        . '</a></li>';
}
$kt_toc_list .= '</ol>';

$kt_toc_title        = esc_html__( 'Table of contents', 'kotlinskidev' );
$kt_toc_open_label   = esc_attr__( 'Open table of contents', 'kotlinskidev' );
$kt_toc_close_label  = esc_attr__( 'Close table of contents', 'kotlinskidev' );
$kt_toc_attributes   = isset( $attributes ) && is_array( $attributes ) ? $attributes : [];
$kt_toc_card_style   = kotlinskidev_article_toc_declarations( kotlinskidev_article_toc_card_vars( $kt_toc_attributes ) );
$kt_toc_dialog_style = kotlinskidev_article_toc_dialog_style( $kt_toc_attributes );
$kt_toc_card_extra   = [ 'class' => 'kt-article-toc' ];
if ( '' !== $kt_toc_card_style ) {
    $kt_toc_card_extra['style'] = $kt_toc_card_style;
}
$kt_toc_card_attr    = get_block_wrapper_attributes( $kt_toc_card_extra );
$kt_toc_dialog_attr  = '' !== $kt_toc_dialog_style ? ' style="' . esc_attr( $kt_toc_dialog_style ) . '"' : '';
$kt_toc_icon         = '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>';
$kt_toc_close_icon   = '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

echo '<div class="kt-article-toc-block">'
    . '<nav ' . $kt_toc_card_attr . ' aria-labelledby="kt-article-toc-title">'
    . '<p class="kt-article-toc__title" id="kt-article-toc-title">' . $kt_toc_title . '</p>'
    . $kt_toc_list
    . '</nav>'
    . '<button type="button" class="kt-article-toc-toggle" aria-haspopup="dialog" aria-controls="kt-article-toc-dialog" aria-expanded="false" aria-label="' . $kt_toc_open_label . '">' . $kt_toc_icon . '</button>'
    . '<dialog class="kt-article-toc-dialog" id="kt-article-toc-dialog" aria-labelledby="kt-article-toc-dialog-title"' . $kt_toc_dialog_attr . '>'
    . '<div class="kt-article-toc-dialog__header">'
    . '<p class="kt-article-toc-dialog__title" id="kt-article-toc-dialog-title">' . $kt_toc_title . '</p>'
    . '<button type="button" class="kt-article-toc-dialog__close" aria-label="' . $kt_toc_close_label . '">' . $kt_toc_close_icon . '</button>'
    . '</div>'
    . '<nav class="kt-article-toc" aria-labelledby="kt-article-toc-dialog-title">' . $kt_toc_list . '</nav>'
    . '</dialog>'
    . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- dynamic values are escaped when built; the SVGs are static literals; get_block_wrapper_attributes() self-escapes; the dialog style is built from validated colour values and escaped
