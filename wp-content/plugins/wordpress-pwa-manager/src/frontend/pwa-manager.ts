interface PWASettings {
    app_name: string;
    theme_color: string;
    background_color: string;
    install_prompt_enabled: boolean;
    install_prompt_text: string;
    install_prompt_button_text: string;
    install_prompt_dismiss_text: string;
    update_prompt_enabled: boolean;
    update_prompt_text: string;
    update_prompt_button_text: string;
    push_notifications_enabled: boolean;
    vapid_public_key: string;
}

declare global {
    interface Window {
        wpPwaManager: {
            settings: PWASettings;
            ajaxUrl: string;
            nonce: string;
            swUrl: string;
            i18n: {
                installPromptTitle: string;
                installPromptText: string;
                installPromptInstall: string;
                installPromptLater: string;
                installPromptDismiss: string;
                updatePromptTitle: string;
                updatePromptText: string;
                updatePromptUpdate: string;
                updatePromptLater: string;
                connectionOnline: string;
                connectionOffline: string;
            };
        };
    }
}

export class PWAManager {
    private settings: PWASettings;
    private deferredPrompt: any = null;
    private swRegistration: ServiceWorkerRegistration | null = null;

    constructor() {
        this.settings = window.wpPwaManager?.settings || {} as PWASettings;
    }

    public async init(): Promise<void> {
        console.log('Initializing PWA Manager...');

        // Register service worker
        await this.registerServiceWorker();

        // Setup install prompt
        this.setupInstallPrompt();

        // Setup update prompt
        this.setupUpdatePrompt();

        // Setup push notifications
        if (this.settings.push_notifications_enabled) {
            await this.setupPushNotifications();
        }

        // Setup offline detection
        this.setupOfflineDetection();
    }

    private async registerServiceWorker(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                // Enhanced debugging
                const swUrl = window.wpPwaManager?.swUrl || '/sw.js';
                console.log('Attempting to register service worker at:', swUrl);
                console.log('wpPwaManager object:', window.wpPwaManager);
                
                this.swRegistration = await navigator.serviceWorker.register(swUrl);
                console.log('Service Worker registered successfully:', this.swRegistration);
                console.log('Service Worker scope:', this.swRegistration.scope);
                console.log('Service Worker state:', {
                    installing: this.swRegistration.installing,
                    waiting: this.swRegistration.waiting,
                    active: this.swRegistration.active
                });

                // Listen for service worker updates
                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('Service Worker update found');
                    this.handleServiceWorkerUpdate();
                });

                // Check if there's a waiting service worker
                if (this.swRegistration.waiting) {
                    console.log('Found waiting service worker');
                    this.showUpdatePrompt();
                }

                // Test if service worker is actually controlling the page
                if (navigator.serviceWorker.controller) {
                    console.log('Service Worker is controlling the page:', navigator.serviceWorker.controller);
                } else {
                    console.log('Service Worker is NOT controlling the page yet');
                }

            } catch (error) {
                console.error('Service Worker registration failed:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
            }
        } else {
            console.error('Service Workers are not supported in this browser');
        }
    }

    private setupInstallPrompt(): void {
        if (!this.settings.install_prompt_enabled) return;

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.deferredPrompt = event;

            // Show custom install prompt after a delay
            setTimeout(() => {
                this.showInstallPrompt();
            }, 3000);
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPrompt();
            this.deferredPrompt = null;
        });
    }

    private showInstallPrompt(): void {
        if (!this.deferredPrompt) return;

        // Check if user has permanently dismissed the prompt
        if (localStorage.getItem('pwa-install-dismissed-permanently')) return;

        // Check if user has temporarily dismissed the prompt (with time delay)
        const dismissedUntil = localStorage.getItem('pwa-install-dismissed-until');
        if (dismissedUntil) {
            const dismissedTime = parseInt(dismissedUntil);
            const now = Date.now();
            
            // If still within the dismissal period, don't show prompt
            if (now < dismissedTime) {
                console.log('Install prompt still dismissed until:', new Date(dismissedTime));
                return;
            } else {
                // Dismissal period has expired, remove the temporary dismissal
                localStorage.removeItem('pwa-install-dismissed-until');
                console.log('Install prompt dismissal period expired, can show again');
            }
        }

        const promptElement = this.createInstallPromptElement();
        document.body.appendChild(promptElement);

        // Animate in
        setTimeout(() => {
            promptElement.classList.add('show');
        }, 100);
    }

    private createInstallPromptElement(): HTMLElement {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-install-prompt';
        prompt.innerHTML = `
            <div class="pwa-prompt-content">
                <div class="pwa-prompt-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </div>
                <div class="pwa-prompt-text">
                    <h3>${window.wpPwaManager.i18n.installPromptTitle}</h3>
                    <p>${window.wpPwaManager.i18n.installPromptText}</p>
                </div>
                <div class="pwa-prompt-buttons">
                    <button class="pwa-install-button" data-action="install">
                        ${window.wpPwaManager.i18n.installPromptInstall}
                    </button>
                    <button class="pwa-dismiss-button" data-action="dismiss-temp">
                        ${window.wpPwaManager.i18n.installPromptLater}
                    </button>
                    <button class="pwa-dismiss-button pwa-dismiss-permanent" data-action="dismiss-permanent">
                        ${window.wpPwaManager.i18n.installPromptDismiss}
                    </button>
                </div>
                <button class="pwa-close-button" data-action="close">×</button>
            </div>
        `;

        // Add event listeners
        prompt.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const action = target.getAttribute('data-action');

            switch (action) {
                case 'install':
                    this.installApp();
                    break;
                case 'dismiss-temp':
                    this.dismissInstallPromptTemporarily();
                    break;
                case 'dismiss-permanent':
                    this.dismissInstallPromptPermanently();
                    break;
                case 'close':
                    this.dismissInstallPromptTemporarily(); // Treat close as temporary dismissal
                    break;
            }
        });

        return prompt;
    }

    private async installApp(): Promise<void> {
        if (!this.deferredPrompt) return;

        const result = await this.deferredPrompt.prompt();
        console.log('Install prompt result:', result);

        this.hideInstallPrompt();
        this.deferredPrompt = null;
    }

    private dismissInstallPrompt(): void {
        localStorage.setItem('pwa-install-dismissed', 'true');
        this.hideInstallPrompt();
    }

    private dismissInstallPromptTemporarily(): void {
        // Dismiss for 24 hours (1 day)
        const dismissUntil = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('pwa-install-dismissed-until', dismissUntil.toString());
        console.log('Install prompt temporarily dismissed until:', new Date(dismissUntil));
        this.hideInstallPrompt();
    }

    private dismissInstallPromptPermanently(): void {
        // Permanently dismiss the prompt
        localStorage.setItem('pwa-install-dismissed-permanently', 'true');
        // Clean up any temporary dismissal
        localStorage.removeItem('pwa-install-dismissed-until');
        localStorage.removeItem('pwa-install-dismissed'); // Clean up old method
        console.log('Install prompt permanently dismissed');
        this.hideInstallPrompt();
    }

    private hideInstallPrompt(): void {
        const prompt = document.querySelector('.pwa-install-prompt');
        if (prompt) {
            prompt.classList.remove('show');
            setTimeout(() => {
                prompt.remove();
            }, 300);
        }
    }

    private handleServiceWorkerUpdate(): void {
        if (!this.swRegistration) return;

        const newWorker = this.swRegistration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                this.showUpdatePrompt();
            }
        });
    }

    private setupUpdatePrompt(): void {
        // Listen for messages from service worker about updates
        navigator.serviceWorker?.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                this.showUpdatePrompt();
            }
        });
    }

    private showUpdatePrompt(): void {
        if (!this.settings.update_prompt_enabled) return;

        const promptElement = this.createUpdatePromptElement();
        document.body.appendChild(promptElement);

        setTimeout(() => {
            promptElement.classList.add('show');
        }, 100);
    }

    private createUpdatePromptElement(): HTMLElement {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-update-prompt';
        prompt.innerHTML = `
            <div class="pwa-prompt-content">
                <div class="pwa-prompt-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                </div>
                <div class="pwa-prompt-text">
                    <p>${this.settings.update_prompt_text}</p>
                </div>
                <div class="pwa-prompt-buttons">
                    <button class="pwa-update-button" data-action="update">
                        ${this.settings.update_prompt_button_text}
                    </button>
                    <button class="pwa-dismiss-button" data-action="dismiss">
                        Later
                    </button>
                </div>
            </div>
        `;

        prompt.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const action = target.getAttribute('data-action');

            switch (action) {
                case 'update':
                    this.updateApp();
                    break;
                case 'dismiss':
                    this.hideUpdatePrompt();
                    break;
            }
        });

        return prompt;
    }

    private updateApp(): void {
        if (!this.swRegistration?.waiting) return;

        // Tell the waiting service worker to skip waiting
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload the page to use the new service worker
        window.location.reload();
    }

    private hideUpdatePrompt(): void {
        const prompt = document.querySelector('.pwa-update-prompt');
        if (prompt) {
            prompt.classList.remove('show');
            setTimeout(() => {
                prompt.remove();
            }, 300);
        }
    }

    private async setupPushNotifications(): Promise<void> {
        if (!('Notification' in window) || !this.settings.vapid_public_key) {
            return;
        }

        // Request notification permission
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                return;
            }
        }

        if (Notification.permission === 'granted' && this.swRegistration) {
            try {
                // Subscribe to push notifications
                const subscription = await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.settings.vapid_public_key)
                });

                // Send subscription to server
                await this.sendSubscriptionToServer(subscription);
            } catch (error) {
                console.error('Failed to subscribe to push notifications:', error);
            }
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }

    private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        try {
            const response = await fetch(window.wpPwaManager.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'wp_pwa_save_subscription',
                    subscription: JSON.stringify(subscription),
                    nonce: window.wpPwaManager.nonce
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    private setupOfflineDetection(): void {
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
        });
    }

    private showConnectionStatus(status: 'online' | 'offline'): void {
        const existing = document.querySelector('.pwa-connection-status');
        if (existing) {
            existing.remove();
        }

        const statusElement = document.createElement('div');
        statusElement.className = `pwa-connection-status pwa-status-${status}`;
        statusElement.innerHTML = `
            <div class="pwa-status-content">
                <span class="pwa-status-icon">
                    ${status === 'online' ? '📶' : '📵'}
                </span>
                <span class="pwa-status-text">
                    ${status === 'online' ? 'Back online' : 'You are offline'}
                </span>
            </div>
        `;

        document.body.appendChild(statusElement);

        setTimeout(() => {
            statusElement.classList.add('show');
        }, 100);

        // Auto-hide after 3 seconds for online status
        if (status === 'online') {
            setTimeout(() => {
                statusElement.classList.remove('show');
                setTimeout(() => {
                    statusElement.remove();
                }, 300);
            }, 3000);
        }
    }
}
