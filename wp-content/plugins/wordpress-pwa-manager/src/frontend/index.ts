import { PWAManager } from './pwa-manager';
import './styles/frontend.scss';

// Initialize PWA Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const pwaManager = new PWAManager();
    pwaManager.init();
});
