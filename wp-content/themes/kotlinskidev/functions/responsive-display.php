<?php
/**
 * Responsive Display Block Extension
 * Adds responsive display controls to all WordPress blocks
 */

// Add responsive display attributes to block render
function kotlinskidev_add_responsive_display_attributes($block_content, $block) {
    // Skip if no responsive display attributes
    if (!isset($block['attrs']['responsiveDisplay'])) {
        return $block_content;
    }

    $responsive_display = $block['attrs']['responsiveDisplay'];
    $classes = [];

    // Generate CSS classes for desktop breakpoint
    if (isset($responsive_display['desktop']) && is_array($responsive_display['desktop'])) {
        $desktop = $responsive_display['desktop'];
        
        if (!empty($desktop['display'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['display']);
        }
        if (!empty($desktop['flexDirection'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['flexDirection']);
        }
        if (!empty($desktop['justifyContent'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['justifyContent']);
        }
        if (!empty($desktop['alignItems'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['alignItems']);
        }
        if (!empty($desktop['justifySelf'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['justifySelf']);
        }
        if (!empty($desktop['alignSelf'])) {
            $classes[] = 'desktop:' . sanitize_html_class($desktop['alignSelf']);
        }
    }

    // Generate CSS classes for tablet breakpoint
    if (isset($responsive_display['tablet']) && is_array($responsive_display['tablet'])) {
        $tablet = $responsive_display['tablet'];
        
        if (!empty($tablet['display'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['display']);
        }
        if (!empty($tablet['flexDirection'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['flexDirection']);
        }
        if (!empty($tablet['justifyContent'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['justifyContent']);
        }
        if (!empty($tablet['alignItems'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['alignItems']);
        }
        if (!empty($tablet['justifySelf'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['justifySelf']);
        }
        if (!empty($tablet['alignSelf'])) {
            $classes[] = 'tablet:' . sanitize_html_class($tablet['alignSelf']);
        }
    }

    // Generate CSS classes for mobile breakpoint
    if (isset($responsive_display['mobile']) && is_array($responsive_display['mobile'])) {
        $mobile = $responsive_display['mobile'];
        
        if (!empty($mobile['display'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['display']);
        }
        if (!empty($mobile['flexDirection'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['flexDirection']);
        }
        if (!empty($mobile['justifyContent'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['justifyContent']);
        }
        if (!empty($mobile['alignItems'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['alignItems']);
        }
        if (!empty($mobile['justifySelf'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['justifySelf']);
        }
        if (!empty($mobile['alignSelf'])) {
            $classes[] = 'mobile:' . sanitize_html_class($mobile['alignSelf']);
        }
    }

    // Add classes to the block wrapper if we have any display classes
    if (!empty($classes)) {
        $class_string = implode(' ', $classes);
        
        // Find the first opening tag and add our classes
        $new_content = preg_replace(
            '/^(\s*)(<[^>]+class="[^"]*")/',
            '$1$2 ' . esc_attr($class_string),
            $block_content
        );
        
        // If no class attribute exists, add one
        if (strpos($block_content, 'class=') === false) {
            $new_content = preg_replace(
                '/^(\s*)(<[^>]+)(>)/',
                '$1$2 class="' . esc_attr($class_string) . '"$3',
                $block_content
            );
        }
        
        return $new_content;
    }

    return $block_content;
}
add_filter( 'render_block', 'kotlinskidev_add_responsive_display_attributes', 10, 2 );

function kotlinskidev_apply_block_visibility( string $block_content, array $block ): string {
	$visibility = $block['attrs']['visibility'] ?? 'both';

	if ( 'both' === $visibility || empty( $block_content ) ) {
		return $block_content;
	}

	$target_class = 'is-visible-' . sanitize_html_class( $visibility );

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$existing = $processor->get_attribute( 'class' ) ?? '';

	if ( str_contains( $existing, $target_class ) ) {
		return $block_content;
	}

	$processor->set_attribute( 'class', trim( $existing . ' ' . $target_class ) );
	return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_block_visibility', 10, 2 );

/**
 * Enqueue responsive display block editor assets
 */
function kotlinskidev_enqueue_responsive_display_assets() {
    if (!is_admin()) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-responsive-display-controls',
        get_template_directory_uri() . '/build/responsive-display.js',
        array(
            'wp-blocks',
            'wp-element',
            'wp-block-editor',
            'wp-components',
            'wp-i18n',
            'wp-hooks',
            'wp-compose'
        ),
        filemtime(get_template_directory() . '/build/responsive-display.js'),
        true
    );

    // Make script translatable
    wp_set_script_translations(
        'kotlinskidev-responsive-display-controls',
        'kotlinskidev',
        get_template_directory() . '/languages'
    );
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_enqueue_responsive_display_assets');
