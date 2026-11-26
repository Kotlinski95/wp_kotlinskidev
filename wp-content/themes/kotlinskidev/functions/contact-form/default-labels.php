<?php
function kotlinskidev_contact_form_default_label_translations(): array {
    return [
        'Name'                                   => __( 'Name', 'kotlinskidev' ),
        'Your Name'                              => __( 'Your Name', 'kotlinskidev' ),
        'Email'                                  => __( 'Email', 'kotlinskidev' ),
        'Your Email'                             => __( 'Your Email', 'kotlinskidev' ),
        'Topic'                                  => __( 'Topic', 'kotlinskidev' ),
        'Message'                                => __( 'Message', 'kotlinskidev' ),
        'Your Message'                           => __( 'Your Message', 'kotlinskidev' ),
        'I agree to be contacted via email.'     => __( 'I agree to be contacted via email.', 'kotlinskidev' ),
        'Send'                                   => __( 'Send', 'kotlinskidev' ),
        'Thank you! Your message has been sent.' => __( 'Thank you! Your message has been sent.', 'kotlinskidev' ),
        'Sorry, there was an error. Please try again.' => __( 'Sorry, there was an error. Please try again.', 'kotlinskidev' ),
    ];
}

function kotlinskidev_contact_form_label( array $attributes, string $attribute_name, string $default ): string {
    $value = $attributes[ $attribute_name ] ?? $default;
    if ( $value !== $default ) {
        return (string) $value;
    }
    return kotlinskidev_contact_form_default_label_translations()[ $default ] ?? $default;
}
