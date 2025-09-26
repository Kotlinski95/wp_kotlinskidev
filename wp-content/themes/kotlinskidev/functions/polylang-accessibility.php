<?php
/**
 * Fix Polylang accessibility issues
 */

// Add JavaScript to fix Polylang accessibility issues
function fix_polylang_accessibility() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Add a small delay to ensure all other scripts have run
        setTimeout(function() {
            // Fix links with href="#pll_switcher" that have no accessible name
            const pllLinks = document.querySelectorAll('a[href="#pll_switcher"]');
            
            pllLinks.forEach(function(link) {
                // Always ensure these links have proper accessibility attributes
                if (!link.getAttribute('aria-label')) {
                    link.setAttribute('aria-label', 'Language Switcher');
                }
                if (!link.getAttribute('title')) {
                    link.setAttribute('title', 'Switch Language');
                }
                
                // Add role for better semantic meaning
                link.setAttribute('role', 'button');
                
                // Add visually hidden text as additional fallback
                if (!link.querySelector('.screen-reader-text')) {
                    const span = document.createElement('span');
                    span.className = 'screen-reader-text';
                    span.textContent = 'Language Switcher';
                    span.style.cssText = 'position: absolute !important; clip: rect(0.0625rem, 0.0625rem, 0.0625rem, 0.0625rem) !important; padding: 0 !important; border: 0 !important; height: 0.0625rem !important; width: 0.0625rem !important; overflow: hidden !important;';
                    link.appendChild(span);
                }
            });
            
            // Fix language flag images - remove alt text if there's a span with language text
            const langImages = document.querySelectorAll('.pll-parent-menu-item img, .lang-item img');
            langImages.forEach(function(img) {
                const parentLink = img.closest('a');
                if (parentLink) {
                    // Check if there's a span with text content in the same link
                    const spanWithText = parentLink.querySelector('span');
                    if (spanWithText && spanWithText.textContent.trim()) {
                        // Remove alt attribute to avoid duplicate announcements
                        img.removeAttribute('alt');
                        // Set empty alt to make it decorative
                        img.setAttribute('alt', '');
                    } else if (!img.getAttribute('alt')) {
                        // Only add alt text if there's no span with text
                        const linkText = parentLink.textContent.trim();
                        img.setAttribute('alt', linkText || 'Language flag');
                    }
                }
            });
            
            // Ensure all language links have proper accessibility
            const languageLinks = document.querySelectorAll('.pll-parent-menu-item a, .lang-item a');
            languageLinks.forEach(function(link) {
                if (!link.getAttribute('aria-label') && !link.textContent.trim()) {
                    const img = link.querySelector('img');
                    if (img && img.getAttribute('alt')) {
                        link.setAttribute('aria-label', 'Switch to ' + img.getAttribute('alt'));
                    }
                }
            });
        }, 500); // Small delay to let Polylang load
    });
    </script>
    <?php
}
add_action('wp_footer', 'fix_polylang_accessibility');

/**
 * Add proper ARIA attributes to Polylang language switcher via PHP filters
 */
function enhance_polylang_language_links($output, $args) {
    // Add aria-label to language links that don't have accessible text
    $output = preg_replace_callback(
        '/<a([^>]*href="[^"]*"[^>]*)>(\s*<img[^>]*>\s*)<\/a>/',
        function($matches) {
            $link_attrs = $matches[1];
            $link_content = $matches[2];
            
            // Check if link already has aria-label or title
            if (strpos($link_attrs, 'aria-label=') === false && strpos($link_attrs, 'title=') === false) {
                // Extract alt text from image if present
                if (preg_match('/alt="([^"]*)"/', $link_content, $alt_match)) {
                    $alt_text = $alt_match[1];
                    $aria_label = 'Switch to ' . $alt_text;
                    $link_attrs .= ' aria-label="' . esc_attr($aria_label) . '"';
                } else {
                    $link_attrs .= ' aria-label="Language option"';
                }
            }
            
            return '<a' . $link_attrs . '>' . $link_content . '</a>';
        },
        $output
    );
    
    return $output;
}

// Hook into Polylang's language switcher output if the filter exists
if (function_exists('pll_the_languages')) {
    add_filter('pll_the_languages', 'enhance_polylang_language_links', 10, 2);
}

/**
 * Remove or modify problematic Polylang elements
 */
function modify_polylang_output() {
    // This function can be used to modify Polylang's output before it reaches the browser
    ob_start('fix_pll_switcher_links');
}

function fix_pll_switcher_links($content) {
    // Fix any remaining #pll_switcher links
    $content = preg_replace(
        '/<a([^>]*)href="#pll_switcher"([^>]*)>(\s*)<\/a>/',
        '<a$1href="#pll_switcher"$2 aria-label="Language Switcher" role="button">$3<span class="screen-reader-text">Language Switcher</span></a>',
        $content
    );
    
    return $content;
}

// Only enable output buffering if we detect Polylang is active
if (function_exists('pll_current_language')) {
    add_action('init', 'modify_polylang_output');
}
