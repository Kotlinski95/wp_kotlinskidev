<?php
/**
 * Title: Content Tabs with Media
 * Slug: kotlinskidev/content-tabs-media
 * Categories: sections, kotlinskidev/sections
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
	$kotlinskidev_url . 'assets/images/about.webp',
	$kotlinskidev_url . 'assets/images/work.webp',
	$kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:kotlinskidev/content-tabs {"navPosition":"top","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"blockGap":"1.5rem"},"border":{"radius":"0.5rem"}},"backgroundColor":"light-shade"} -->

<!-- wp:kotlinskidev/content-tabs-item -->
<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Our Story","style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"}},"border":{"radius":"0.375rem"}},"backgroundColor":"primary","textColor":"background"} /-->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"2rem"}}}} -->
<div class="wp-block-columns">
<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%">
<!-- wp:image {"width":"100%","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"0.5rem"}}} -->
<figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url( $kotlinskidev_images[0] ); ?>" alt="<?php esc_attr_e( 'Team working on a project', 'kotlinskidev' ); ?>" style="border-radius:0.5rem;object-fit:cover;width:100%" /></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column {"width":"60%"} -->
<div class="wp-block-column" style="flex-basis:60%">
<!-- wp:group {"style":{"spacing":{"blockGap":"0.75rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'From a One-Person Studio to a Trusted Partner', 'kotlinskidev' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'We started building WordPress sites for local businesses and grew into a full-service partner for brands that need fast, accessible, block-based experiences.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong><?php esc_html_e( 'Since:', 'kotlinskidev' ); ?></strong> <?php esc_html_e( '2019 — over 40 projects shipped.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:kotlinskidev/content-tabs-item -->

<!-- wp:kotlinskidev/content-tabs-item -->
<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Our Work","style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"}},"border":{"radius":"0.375rem"}},"backgroundColor":"primary","textColor":"background"} /-->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"2rem"}}}} -->
<div class="wp-block-columns">
<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%">
<!-- wp:image {"width":"100%","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"0.5rem"}}} -->
<figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url( $kotlinskidev_images[1] ); ?>" alt="<?php esc_attr_e( 'Recent project showcase', 'kotlinskidev' ); ?>" style="border-radius:0.5rem;object-fit:cover;width:100%" /></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column {"width":"60%"} -->
<div class="wp-block-column" style="flex-basis:60%">
<!-- wp:group {"style":{"spacing":{"blockGap":"0.75rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Projects Built to Last', 'kotlinskidev' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'From multilingual corporate sites to custom Gutenberg blocks, every project is built on maintainable, semantic markup.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong><?php esc_html_e( 'Recent:', 'kotlinskidev' ); ?></strong> <?php esc_html_e( 'A full FSE theme with 15 custom blocks and 57 patterns.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:kotlinskidev/content-tabs-item -->

<!-- wp:kotlinskidev/content-tabs-item -->
<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Our Services","style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"}},"border":{"radius":"0.375rem"}},"backgroundColor":"primary","textColor":"background"} /-->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"2rem"}}}} -->
<div class="wp-block-columns">
<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%">
<!-- wp:image {"width":"100%","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"0.5rem"}}} -->
<figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url( $kotlinskidev_images[2] ); ?>" alt="<?php esc_attr_e( 'Service icon', 'kotlinskidev' ); ?>" style="border-radius:0.5rem;object-fit:cover;width:100%" /></figure>
<!-- /wp:image -->
</div>
<!-- /wp:column -->

<!-- wp:column {"width":"60%"} -->
<div class="wp-block-column" style="flex-basis:60%">
<!-- wp:group {"style":{"spacing":{"blockGap":"0.75rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Design, Build, and Ongoing Support', 'kotlinskidev' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'From first wireframe to launch and beyond — design, development, performance tuning, and support all under one roof.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong><?php esc_html_e( 'Includes:', 'kotlinskidev' ); ?></strong> <?php esc_html_e( 'Design system, custom blocks, SEO, and monthly maintenance.', 'kotlinskidev' ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:kotlinskidev/content-tabs-item -->

<!-- /wp:kotlinskidev/content-tabs -->
