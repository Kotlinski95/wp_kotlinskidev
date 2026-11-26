<?php
function kotlinskidev_render_contact_submission_delete_link( int $submission_id ): string
{
    return wp_nonce_url(
        admin_url( 'admin-post.php?action=kotlinskidev_delete_contact_submission&id=' . $submission_id ),
        'kotlinskidev_delete_contact_submission_' . $submission_id
    );
}
