<?php
/**
 * Title: Enhanced Search Form
 * Slug: kotlinskidev/search-form
 * Categories: search, kotlinskidev/search, themeslug/custom
 */

$current_search = get_search_query();
$current_category = isset($_GET['search_category']) ? sanitize_text_field($_GET['search_category']) : '';
$current_type = isset($_GET['search_type']) ? sanitize_text_field($_GET['search_type']) : '';
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"60px"},"padding":{"top":"40px","bottom":"40px","left":"30px","right":"30px"}},"border":{"radius":"20px","width":"1px"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:1px;border-radius:20px;margin-bottom:60px;padding-top:40px;padding-right:30px;padding-bottom:40px;padding-left:30px">
    
    <!-- wp:html -->
    <form method="get" action="<?php echo esc_url(home_url('/')); ?>" class="kotlinskidev-search-form">
        
        <!-- Main Search Input -->
        <div style="margin-bottom:28px;">
            <label for="search-input" class="search-label">
                🔍 Search for content
            </label>
            <input type="text" 
                   id="search-input"
                   name="s" 
                   value="<?php echo esc_attr($current_search); ?>"
                   placeholder="Enter keywords, topics, or specific terms..."
                   class="search-input-field"
                   required 
                   aria-describedby="search-input-description" />
            <div id="search-input-description" class="sr-only">
                Search across all articles, pages, and content on the site
            </div>
        </div>
        
        <!-- Search Filters -->
        <div class="search-filters-grid">
            
            <!-- Content Type Filter -->
            <div>
                <label for="search-type" class="search-label">
                    📄 Content Type
                </label>
                <select name="search_type" 
                        id="search-type" 
                        class="search-select-field"
                        aria-describedby="search-type-description">
                    <option value="">All Content</option>
                    <option value="post" <?php selected($current_type, 'post'); ?>>Articles</option>
                    <option value="page" <?php selected($current_type, 'page'); ?>>Pages</option>
                </select>
                <div id="search-type-description" class="sr-only">
                    Filter results by content type: articles, pages, or all content
                </div>
            </div>
            
            <!-- Category Filter -->
            <div>
                <label for="search-category" class="search-label">
                    📂 Topic Category
                </label>
                <select name="search_category" 
                        id="search-category" 
                        class="search-select-field"
                        aria-describedby="search-category-description">
                    <option value="">All Topics</option>
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
                    Filter results by topic category
                </div>
            </div>
        </div>
        
        <!-- Search Button -->
        <div style="text-align:center;margin-bottom:20px;">
            <button type="submit" class="search-button" aria-describedby="search-button-description">
                <span>🔍</span>
                <span>Search Content</span>
            </button>
            <div id="search-button-description" class="sr-only">
                Search for content using the criteria above
            </div>
        </div>
        
        <?php if (!empty($current_search)) : ?>
        <!-- Clear Search -->
        <div style="text-align:center;">
            <a href="<?php echo esc_url(home_url('/')); ?>" 
               class="clear-search-link"
               aria-label="Clear search and return to homepage">
                ✕ Clear search and filters
            </a>
        </div>
        <?php endif; ?>
        
    </form>
    
</div>
<!-- /wp:group -->
