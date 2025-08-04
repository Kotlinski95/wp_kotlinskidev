<?php
/**
 * Title: Enhanced Search Form
 * Slug: kotlinskidev/search-form
 * Categories: search, kotlinskidev/search, themeslug/custom
 */
$current_search = get_search_query();
$current_category = isset($_GET['search_category']) ? sanitize_text_field($_GET['search_category']) : '';
$current_type = isset($_GET['search_type']) ? sanitize_text_field($_GET['search_type']) : '';

// Detect current language context and set appropriate search URL dynamically
$search_action_url = home_url('/');

// Get current URL path to detect language prefix
$current_url = $_SERVER['REQUEST_URI'];
$parsed_url = parse_url($current_url);
$full_path = isset($parsed_url['path']) ? trim($parsed_url['path'], '/') : '';

// Get the actual WordPress site path (not the current page path)
$site_url = get_option('home') ?: site_url();
$site_path = trim(parse_url($site_url, PHP_URL_PATH), '/');

// Remove the WordPress installation path to get just the language/page path
$relative_path = $full_path;
if ($site_path && strpos($full_path, $site_path) === 0) {
    $relative_path = trim(substr($full_path, strlen($site_path)), '/');
} else {
    // Fallback: assume the first part is the site directory
    $path_parts = explode('/', $full_path);
    if (count($path_parts) >= 2 && $path_parts[0] === 'adriankotlinski') {
        $relative_path = implode('/', array_slice($path_parts, 1));
    }
}

// Check if URL starts with a language code pattern (2-letter language codes)
if (preg_match('/^([a-z]{2})(?:\/|$)/', $relative_path, $matches)) {
    $lang_prefix = $matches[1];
    $search_action_url = home_url('/' . $lang_prefix . '/');
} 
// Check for longer language codes like en_US, pl_PL format in URL
elseif (preg_match('/^([a-z]{2}[_-][a-z]{2})(?:\/|$)/i', $relative_path, $matches)) {
    $lang_prefix = $matches[1]; 
    $search_action_url = home_url('/' . $lang_prefix . '/');
}
// If no language prefix detected in current URL, this is the primary language
// Keep search_action_url as default home_url('/') without any prefix
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"15px"},"padding":{"top":"15px","bottom":"15px","left":"20px","right":"20px"}},"border":{"radius":"20px","width":"0px"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0px;border-radius:20px;margin-bottom:15px;padding-top:15px;padding-right:20px;padding-bottom:15px;padding-left:20px">
    
    <!-- wp:html -->
    <form method="get" action="<?php echo esc_url($search_action_url); ?>" class="kotlinskidev-search-form">
        
        <!-- Main Search Input -->
        <div style="margin-bottom:20px;">
            <label for="search-input" class="search-label">
                🔍 <?php esc_html_e('Search for content', 'kotlinskidev'); ?>
            </label>
            <input type="text" 
                   id="search-input"
                   name="s" 
                   value="<?php echo esc_attr($current_search); ?>"
                   placeholder="<?php esc_attr_e('Enter keywords, topics, or specific terms...', 'kotlinskidev'); ?>"
                   class="search-input-field"
                   required 
                   aria-describedby="search-input-description" />
            <div id="search-input-description" class="sr-only">
                <?php esc_html_e('Search across all articles, pages, and content on the site', 'kotlinskidev'); ?>
            </div>
        </div>
        
        <!-- Search Filters -->
        <div class="search-filters-grid">
            
            <!-- Content Type Filter -->
            <div>
                <label for="search-type" class="search-label">
                    📄 <?php esc_html_e('Content Type', 'kotlinskidev'); ?>
                </label>
                <select name="search_type" 
                        id="search-type" 
                        class="search-select-field"
                        aria-describedby="search-type-description">
                    <option value=""><?php esc_html_e('All Content', 'kotlinskidev'); ?></option>
                    <option value="post" <?php selected($current_type, 'post'); ?>><?php esc_html_e('Articles', 'kotlinskidev'); ?></option>
                    <option value="page" <?php selected($current_type, 'page'); ?>><?php esc_html_e('Pages', 'kotlinskidev'); ?></option>
                </select>
                <div id="search-type-description" class="sr-only">
                    <?php esc_html_e('Filter results by content type: articles, pages, or all content', 'kotlinskidev'); ?>
                </div>
            </div>
            
            <!-- Category Filter -->
            <div>
                <label for="search-category" class="search-label">
                    📂 <?php esc_html_e('Topic Category', 'kotlinskidev'); ?>
                </label>
                <select name="search_category" 
                        id="search-category" 
                        class="search-select-field"
                        aria-describedby="search-category-description">
                    <option value=""><?php esc_html_e('All Topics', 'kotlinskidev'); ?></option>
                    <?php
                    $categories = get_categories(array(
                        'hide_empty' => true,
                        'orderby' => 'count',
                        'order' => 'DESC'
                    ));
                    foreach ($categories as $category) {
                        echo '<option value="' . esc_attr($category->slug) . '"' . selected($current_category, $category->slug, false) . '>';
                        echo esc_html($category->name) . ' (' . $category->count . ')';
                        echo '</option>';
                    }
                    ?>
                </select>
                <div id="search-category-description" class="sr-only">
                    <?php esc_html_e('Filter results by topic category', 'kotlinskidev'); ?>
                </div>
            </div>
        </div>
        
        <!-- Search Button -->
        <div style="text-align:center;margin-bottom:20px;">
            <button type="submit" class="search-button" aria-describedby="search-button-description">
                <span>🔍</span>
                <span><?php esc_html_e('Search Content', 'kotlinskidev'); ?></span>
            </button>
            <div id="search-button-description" class="sr-only">
                <?php esc_html_e('Search for content using the criteria above', 'kotlinskidev'); ?>
            </div>
        </div>
        
        <?php if (!empty($current_search)) : ?>
        <!-- Clear Search -->
        <div style="text-align:center;">
            <?php
            // Get translatable search slug
            $search_slug = __('search', 'kotlinskidev');
            $clear_url = home_url('/' . $search_slug . '/');
            ?>
            <a href="<?php echo esc_url($clear_url); ?>" 
               class="clear-search-link link-dark-variant-support"
               aria-label="<?php esc_attr_e('Clear search and return to homepage', 'kotlinskidev'); ?>">
                ✕ <?php esc_html_e('Clear search and filters', 'kotlinskidev'); ?>
            </a>
        </div>
        <?php endif; ?>
        
    </form>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const searchForm = document.querySelector('.kotlinskidev-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                // Remove empty form fields before submission
                const inputs = searchForm.querySelectorAll('input, select');
                inputs.forEach(function(input) {
                    if (input.name && (input.value === '' || input.value === null)) {
                        input.removeAttribute('name');
                    }
                });
            });
        }
    });
    </script>
    
</div>
<!-- /wp:group -->