<?php
get_header();

$locale = get_locale();
if ($locale == 'en_US') {
    echo do_blocks('<!-- wp:template-part {"slug":"header","theme":"kotlinskidev","area":"header"} /-->');
    echo do_blocks('<!-- wp:pattern {"slug":"kotlinskidev/template-404"} /-->');
    echo do_blocks('<!-- wp:template-part {"slug":"footer","theme":"kotlinskidev","area":"footer"} /-->');
} elseif ($locale == 'pl_PL') {
    echo do_blocks('<!-- wp:template-part {"slug":"header","theme":"kotlinskidev","area":"header"} /-->');
    echo do_blocks('<!-- wp:pattern {"slug":"kotlinskidev/template-404"} /-->');
    echo do_blocks('<!-- wp:template-part {"slug":"footer-pl","theme":"kotlinskidev","area":"footer"} /-->');
}