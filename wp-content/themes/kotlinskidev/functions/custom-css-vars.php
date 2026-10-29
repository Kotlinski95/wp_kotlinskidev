<?php
function kotlinskidev_custom_css_vars_supported_blocks(): array
{
    return [ 'kotlinskidev/icon', 'core/image', 'core/site-logo' ];
}

function kotlinskidev_sanitize_css_var_name( string $name ): string
{
    $name = trim( $name );
    if ( 1 !== preg_match( '/^--[a-zA-Z][a-zA-Z0-9-]*$/', $name ) ) {
        return '';
    }

    return $name;
}

function kotlinskidev_sanitize_css_var_value( string $value ): string
{
    $value = trim( $value );
    if ( '' === $value || strlen( $value ) > 200 ) {
        return '';
    }
    if ( false !== stripos( $value, 'url(' ) ) {
        return '';
    }
    if ( 1 !== preg_match( '/^[#a-zA-Z0-9.,%\s()\-]+$/', $value ) ) {
        return '';
    }

    return $value;
}

function kotlinskidev_build_custom_css_vars_declarations( array $custom_css_vars ): array
{
    $declarations = [];

    foreach ( $custom_css_vars as $entry ) {
        if ( ! is_array( $entry ) ) {
            continue;
        }

        $name = kotlinskidev_sanitize_css_var_name( (string) ( $entry['name'] ?? '' ) );
        if ( '' === $name ) {
            continue;
        }

        $value = kotlinskidev_sanitize_css_var_value( (string) ( $entry['value'] ?? '' ) );
        if ( '' === $value ) {
            continue;
        }

        $declarations[] = "{$name}:{$value}";
    }

    return $declarations;
}

function kotlinskidev_apply_custom_css_vars_style( string $block_content, array $block ): string
{
    $block_name = $block['blockName'] ?? '';
    if ( ! in_array( $block_name, kotlinskidev_custom_css_vars_supported_blocks(), true ) ) {
        return $block_content;
    }

    $custom_css_vars = $block['attrs']['customCssVars'] ?? null;
    if ( empty( $block_content ) || ! is_array( $custom_css_vars ) ) {
        return $block_content;
    }

    $declarations = kotlinskidev_build_custom_css_vars_declarations( $custom_css_vars );
    if ( empty( $declarations ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_custom_css_vars_style', 10, 2 );

function kotlinskidev_localize_custom_css_vars_blocks(): void
{
    wp_localize_script(
        'kotlinskidev-editor-only',
        'kotlinskidevCssVarBlocks',
        kotlinskidev_custom_css_vars_supported_blocks()
    );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_localize_custom_css_vars_blocks', 20 );
