<?php
function kotlinskidev_inline_scroll_restoration_script(): void
{
?>
<script type="text/javascript">
(function() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
})();
</script>
<?php
}
add_action('wp_head', 'kotlinskidev_inline_scroll_restoration_script', 1);
