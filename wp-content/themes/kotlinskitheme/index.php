<?php get_header(); ?>
<body <?php body_class(); ?>>
<?php get_template_part('nav'); ?>

    <div id="content">
        <?php
        if ( have_posts() ) :
            while ( have_posts() ) : the_post();
                get_template_part( 'content', get_post_format() );
            endwhile;
        else :
            echo '<p>No content found</p>';
        endif;
        ?>
    </div>

    <?php get_footer(); ?>
    <?php wp_footer(); ?>
</body>
</html>
