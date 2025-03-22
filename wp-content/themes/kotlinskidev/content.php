<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <h1 aria-hidden="true" style="display:none;"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
    <div class="entry-content">
        <?php the_content(); ?>
    </div>
</article>
