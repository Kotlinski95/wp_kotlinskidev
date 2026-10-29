<?php
if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class Kotlinskidev_Contact_Submissions_List_Table extends WP_List_Table
{
    public function __construct()
    {
        parent::__construct(
            [
                'singular' => 'submission',
                'plural'   => 'submissions',
                'ajax'     => false,
            ]
        );
    }

    public function get_columns(): array
    {
        return [
            'cb'           => '<input type="checkbox" />',
            'status'       => esc_html__( 'Status', 'kotlinskidev' ),
            'name'         => esc_html__( 'Name', 'kotlinskidev' ),
            'email'        => esc_html__( 'Email', 'kotlinskidev' ),
            'topic'        => esc_html__( 'Topic', 'kotlinskidev' ),
            'message'      => esc_html__( 'Message', 'kotlinskidev' ),
            'submitted_at' => esc_html__( 'Date', 'kotlinskidev' ),
        ];
    }

    protected function get_sortable_columns(): array
    {
        return [
            'submitted_at' => [ 'submitted_at', true ],
            'name'         => [ 'name', false ],
        ];
    }

    protected function get_bulk_actions(): array
    {
        return [ 'bulk-delete' => esc_html__( 'Delete', 'kotlinskidev' ) ];
    }

    protected function column_cb( $item ): string
    {
        return sprintf( '<input type="checkbox" name="submission[]" value="%d" />', (int) $item->id );
    }

    protected function column_status( $item ): string
    {
        $badge = $item->read_at
            ? ''
            : '<span class="dashicons dashicons-marker" style="color:#2271b1;" title="' . esc_attr__( 'Unread', 'kotlinskidev' ) . '"></span> ';

        $badge .= $item->email_sent
            ? '<span title="' . esc_attr__( 'Emailed successfully', 'kotlinskidev' ) . '">✅</span>'
            : '<span title="' . esc_attr__( 'Email delivery failed', 'kotlinskidev' ) . '">⚠️</span>';

        return $badge;
    }

    protected function column_name( $item ): string
    {
        $view_url = add_query_arg(
            [
                'page'   => 'kotlinskidev-contact-submissions',
                'action' => 'view',
                'id'     => $item->id,
            ],
            admin_url( 'admin.php' )
        );

        $delete_url = kotlinskidev_render_contact_submission_delete_link( (int) $item->id );

        $actions = [
            'view'   => sprintf( '<a href="%s">%s</a>', esc_url( $view_url ), esc_html__( 'View', 'kotlinskidev' ) ),
            'delete' => sprintf(
                '<a href="%s" onclick="return confirm(\'%s\');">%s</a>',
                esc_url( $delete_url ),
                esc_js( __( 'Delete this submission permanently?', 'kotlinskidev' ) ),
                esc_html__( 'Delete', 'kotlinskidev' )
            ),
        ];

        $name = $item->read_at ? esc_html( $item->name ) : '<strong>' . esc_html( $item->name ) . '</strong>';

        return sprintf( '<a href="%s">%s</a>%s', esc_url( $view_url ), $name, $this->row_actions( $actions ) );
    }

    protected function column_default( $item, $column_name ): string
    {
        switch ( $column_name ) {
            case 'email':
                return esc_html( $item->email );
            case 'topic':
                return esc_html( $item->topic );
            case 'message':
                $excerpt = mb_substr( $item->message, 0, 80 );
                return esc_html( $excerpt . ( mb_strlen( $item->message ) > 80 ? '…' : '' ) );
            case 'submitted_at':
                return esc_html( mysql2date( 'Y-m-d H:i', $item->submitted_at ) );
            default:
                return '';
        }
    }

    public function process_bulk_action(): void
    {
        if ( 'bulk-delete' !== $this->current_action() ) {
            return;
        }

        check_admin_referer( 'bulk-submissions' );

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $ids = isset( $_POST['submission'] ) ? array_map( 'absint', (array) wp_unslash( $_POST['submission'] ) ) : [];
        if ( empty( $ids ) ) {
            return;
        }

        global $wpdb;
        $table = kotlinskidev_contact_submissions_table_name();
        foreach ( $ids as $id ) {
            $wpdb->delete( $table, [ 'id' => $id ], [ '%d' ] );
        }
    }

    public function prepare_items(): void
    {
        global $wpdb;
        $table = kotlinskidev_contact_submissions_table_name();

        $this->_column_headers = [ $this->get_columns(), [], $this->get_sortable_columns() ];

        $this->process_bulk_action();

        $per_page     = 20;
        $current_page = $this->get_pagenum();

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only list filter, no state change
        $status_filter = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : 'all';

        $where = '1=1';
        if ( 'sent' === $status_filter ) {
            $where = 'email_sent = 1';
        } elseif ( 'failed' === $status_filter ) {
            $where = 'email_sent = 0';
        } elseif ( 'unread' === $status_filter ) {
            $where = 'read_at IS NULL';
        }

        $orderby = 'submitted_at';
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only sort control, no state change
        if ( isset( $_GET['orderby'] ) && in_array( wp_unslash( $_GET['orderby'] ), [ 'submitted_at', 'name' ], true ) ) {
            $orderby = sanitize_key( wp_unslash( $_GET['orderby'] ) );
        }

        $order = 'DESC';
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only sort control, no state change
        if ( isset( $_GET['order'] ) && 'asc' === strtolower( sanitize_key( wp_unslash( $_GET['order'] ) ) ) ) {
            $order = 'ASC';
        }

        $total_items = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE {$where}" );

        $offset       = ( $current_page - 1 ) * $per_page;
        $this->items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d",
                $per_page,
                $offset
            )
        );

        $this->set_pagination_args(
            [
                'total_items' => $total_items,
                'per_page'    => $per_page,
                'total_pages' => (int) ceil( $total_items / $per_page ),
            ]
        );
    }
}
