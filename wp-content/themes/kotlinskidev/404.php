<?php
get_header();



echo do_blocks('<!-- wp:template-part {"slug":"header","theme":"kotlinskidev","area":"header"} /-->');
echo do_blocks('<!-- wp:pattern {"slug":"kotlinskidev/template-404"} /-->');
echo do_blocks('<!-- wp:pattern {"slug":"kotlinskidev/footer-dynamic"} /-->');

wp_footer();