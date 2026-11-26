<?php

if (!function_exists('kotlinskidev_render_protection_settings_script')) {
    function kotlinskidev_render_protection_settings_script($needs_wp_config_setup)
    {
?>
            <script>
                document.getElementById('regenerate-keys').addEventListener('click', function() {
                    if (!confirm('<?php echo esc_js(__('Are you sure? This will invalidate all existing protected content.', 'kotlinskidev')); ?>')) {
                        return;
                    }

                    var data = new FormData();
                    data.append('action', 'kotlinskidev_regenerate_keys');
                    data.append('nonce', '<?php echo esc_js(wp_create_nonce('kotlinskidev_admin_nonce')); ?>');

                    fetch('<?php echo esc_url(admin_url('admin-ajax.php')); ?>', {
                            method: 'POST',
                            body: data
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                alert('<?php echo esc_js(__('Keys regenerated successfully!', 'kotlinskidev')); ?>');
                                location.reload();
                            } else {
                                alert('<?php echo esc_js(__('Error: ', 'kotlinskidev')); ?>' + result.data);
                            }
                        })
                        .catch(error => {
                            alert('<?php echo esc_js(__('Network error occurred', 'kotlinskidev')); ?>');
                        });
                });

                <?php if ($needs_wp_config_setup): ?>
                    document.getElementById('show-wp-config-keys').addEventListener('click', function() {
                        var data = new FormData();
                        data.append('action', 'kotlinskidev_get_wp_config_constants');
                        data.append('nonce', '<?php echo esc_js(wp_create_nonce('kotlinskidev_admin_nonce')); ?>');

                        fetch('<?php echo esc_url(admin_url('admin-ajax.php')); ?>', {
                                method: 'POST',
                                body: data
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    document.getElementById('wp-config-constants').value = result.data;
                                    document.getElementById('wp-config-instructions').style.display = 'block';
                                    this.textContent = '<?php echo esc_js(__('Constants Generated', 'kotlinskidev')); ?>';
                                    this.disabled = true;
                                } else {
                                    alert('<?php echo esc_js(__('Error: ', 'kotlinskidev')); ?>' + result.data);
                                }
                            })
                            .catch(error => {
                                alert('<?php echo esc_js(__('Network error occurred', 'kotlinskidev')); ?>');
                            });
                    });
                <?php endif; ?>
            </script>

<?php
    }
}
