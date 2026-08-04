import { render } from '@wordpress/element';
import AdminApp from './components/AdminApp';
import './styles/admin.scss';

const adminRoot = document.getElementById('wp-pwa-manager-admin-root');

if (adminRoot) {
    render(<AdminApp />, adminRoot);
}
