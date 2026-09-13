<?php
function kotlinskidev_output_facebook_pixel(): void
{
    if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        return;
    }

    $custom_script = get_option( 'custom_fb_pixel_loader_custom_script' );
    $pixel_id      = trim( (string) get_option( 'custom_fb_pixel_loader_pixel_id' ) );

    if ( $custom_script ) {
        echo $custom_script; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        return;
    }

    if ( ! $pixel_id ) {
        return;
    }
    ?>
    <!-- Facebook Pixel Code -->
    <script type="text/plain" data-category="marketing">
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '<?php echo esc_js( $pixel_id ); ?>');
      fbq('track', 'PageView');
    </script>
    <!-- End Facebook Pixel Code -->
    <?php
}
add_action( 'wp_head', 'kotlinskidev_output_facebook_pixel' );

function kotlinskidev_output_google_analytics(): void
{
    if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        return;
    }

    $custom_script = get_option( 'custom_ga_loader_custom_script' );
    $ga_id         = trim( (string) get_option( 'custom_ga_loader_ga_id' ) );

    if ( $custom_script ) {
        echo $custom_script; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        return;
    }

    if ( ! $ga_id ) {
        return;
    }
    ?>
    <!-- Google tag (gtag.js) -->
    <script type="text/plain" data-category="statistics" data-src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $ga_id ); ?>"></script>
    <script type="text/plain" data-category="statistics">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '<?php echo esc_js( $ga_id ); ?>');
    </script>
    <?php
}
add_action( 'wp_head', 'kotlinskidev_output_google_analytics' );
