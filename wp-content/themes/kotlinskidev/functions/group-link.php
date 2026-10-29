<?php
function kotlinskidev_group_link_has_nested_anchor( string $inner_html ): bool
{
    return (bool) preg_match( '/<a[\s>]/i', $inner_html );
}

function kotlinskidev_apply_group_link( string $block_content, array $block ): string
{
    $url = $block['attrs']['groupLinkUrl'] ?? '';

    if ( empty( $block_content ) || '' === $url || 'core/group' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $tag = strtolower( (string) $processor->get_tag() );

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-group-link' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-group-link' ) );
    }

    $can_wrap_as_anchor = 'a' !== $tag && ! kotlinskidev_group_link_has_nested_anchor( $block_content );

    if ( $can_wrap_as_anchor ) {
        $processor->set_attribute( 'href', esc_url( $url ) );
        if ( ! empty( $block['attrs']['groupLinkOpensInNewTab'] ) ) {
            $processor->set_attribute( 'target', '_blank' );
            $processor->set_attribute( 'rel', 'noopener' );
        }
    } else {
        $processor->set_attribute( 'data-kt-group-link-url', esc_url_raw( $url ) );
        if ( ! empty( $block['attrs']['groupLinkOpensInNewTab'] ) ) {
            $processor->set_attribute( 'data-kt-group-link-target', '_blank' );
        }
        $processor->set_attribute( 'role', 'link' );
        $processor->set_attribute( 'tabindex', '0' );
    }

    $block_content = $processor->get_updated_html();

    if ( ! $can_wrap_as_anchor ) {
        return $block_content;
    }

    $open_needle = '<' . $tag;
    $open_pos = strpos( $block_content, $open_needle );
    if ( false === $open_pos ) {
        return $block_content;
    }
    $block_content = substr_replace( $block_content, '<a', $open_pos, strlen( $open_needle ) );

    $close_needle = '</' . $tag . '>';
    $close_pos = strrpos( $block_content, $close_needle );
    if ( false === $close_pos ) {
        return $block_content;
    }
    $block_content = substr_replace( $block_content, '</a>', $close_pos, strlen( $close_needle ) );

    return $block_content;
}
add_filter( 'render_block', 'kotlinskidev_apply_group_link', 10, 2 );
