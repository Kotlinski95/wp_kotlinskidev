<?php

class WP_PWA_Manager_Service_Worker {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        
        // Hook into settings updates to regenerate service worker
        add_action('update_option', array($this, 'maybe_regenerate_service_worker'), 10, 3);
    }
    
    public function init() {
        // Always ensure service worker file is current
        $this->ensure_service_worker_file();
    }
    
    public function maybe_regenerate_service_worker($option_name, $old_value, $new_value) {
        // Check if a PWA-related option was updated
        if (strpos($option_name, 'wp_pwa_') === 0) {
            $this->generate_service_worker_file();
        }
    }
    
    public function ensure_service_worker_file() {
        $sw_file = ABSPATH . 'sw.js';
        
        // Check if file exists and settings have changed
        if (file_exists($sw_file)) {
            $settings_hash = $this->get_settings_hash();
            $stored_hash = get_option('wp_pwa_sw_hash', '');
            
            // Regenerate if settings have changed
            if ($settings_hash !== $stored_hash) {
                $this->generate_service_worker_file();
                update_option('wp_pwa_sw_hash', $settings_hash);
            }
        } else {
            // File doesn't exist, create it
            $this->generate_service_worker_file();
            update_option('wp_pwa_sw_hash', $this->get_settings_hash());
        }
    }
    
    public function generate_service_worker_file() {
        $sw_content = $this->generate_service_worker();
        $sw_file = ABSPATH . 'sw.js';
        
        // Write the service worker file
        $result = file_put_contents($sw_file, $sw_content);
        
        if ($result === false) {
            error_log('PWA Manager: Failed to write sw.js file');
        }
        
        return $result !== false;
    }
    
    private function get_settings_hash() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        // Only hash settings that affect the service worker
        $sw_settings = array(
            'cache_strategy' => $settings['cache_strategy'],
            'cache_max_entries' => $settings['cache_max_entries'],
            'cache_max_age' => $settings['cache_max_age'],
            'offline_page_title' => $settings['offline_page_title'],
            'offline_page_message' => $settings['offline_page_message'],
            'offline_page_use_custom_template' => $settings['offline_page_use_custom_template'],
            'offline_page_template' => $settings['offline_page_template'],
            'app_name' => $settings['app_name'],
            'icon_192' => $settings['icon_192'],
            'plugin_version' => WP_PWA_MANAGER_VERSION
        );
        
        return md5(serialize($sw_settings));
    }
    
    private function generate_service_worker() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        $cache_name = 'wp-pwa-cache-v' . WP_PWA_MANAGER_VERSION;
        $offline_url = home_url('/offline/');
        
        ob_start();
        ?>
const CACHE_NAME = '<?php echo esc_js($cache_name); ?>';
const OFFLINE_URL = '<?php echo esc_js($offline_url); ?>';
const CACHE_STRATEGY = '<?php echo esc_js($settings['cache_strategy']); ?>';
const MAX_ENTRIES = <?php echo intval($settings['cache_max_entries']); ?>;
const MAX_AGE = <?php echo intval($settings['cache_max_age']); ?> * 24 * 60 * 60 * 1000; // Convert days to milliseconds

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll([
                '<?php echo esc_js(home_url('/')); ?>',
            ]);
        })
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Only handle requests from the same origin (your website)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    // Skip other browser extension requests
    if (event.request.url.startsWith('moz-extension://') || 
        event.request.url.startsWith('safari-extension://') || 
        event.request.url.startsWith('ms-browser-extension://')) {
        return;
    }
    
    // Skip admin pages
    if (event.request.url.includes('/wp-admin/')) {
        return;
    }
    
    // Skip API requests
    if (event.request.url.includes('/wp-json/')) {
        return;
    }
    
    // Skip WordPress core files that should always come from server
    if (event.request.url.includes('/wp-includes/') || 
        event.request.url.includes('/wp-content/uploads/')) {
        return;
    }
    
    // Always handle navigation requests (page visits)
    if (event.request.mode === 'navigate' || 
        event.request.destination === 'document' || 
        (event.request.method === 'GET' && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
        
        event.respondWith(handleNavigationRequest(event.request));
        return;
    }
    
    // Handle other same-origin requests normally
    event.respondWith(handleFetch(event.request));
});

async function handleNavigationRequest(request) {
    try {
        console.log('Handling navigation request:', request.url);
        
        // Try network first for navigation requests
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Navigation request failed, serving offline page:', error);
        
        // Network failed - try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // No cache available - show offline page
        return new Response(
            getOfflineHTML(),
            { 
                status: 200,
                headers: { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                } 
            }
        );
    }
}

async function handleFetch(request) {
    const url = new URL(request.url);
    
    // Handle different cache strategies
    switch (CACHE_STRATEGY) {
        case 'cache_first':
            return cacheFirst(request);
        case 'network_first':
            return networkFirst(request);
        case 'stale_while_revalidate':
            return staleWhileRevalidate(request);
        default:
            return cacheFirst(request);
    }
}

async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        await addToCache(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('Cache first failed:', error);
        return getOfflineResponse(request);
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        await addToCache(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('Network first failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return getOfflineResponse(request);
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

async function addToCache(request, response) {
    if (response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response);
        await cleanupCache();
    }
}

async function cleanupCache() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    if (requests.length > MAX_ENTRIES) {
        const oldRequests = requests.slice(0, requests.length - MAX_ENTRIES);
        await Promise.all(
            oldRequests.map(request => cache.delete(request))
        );
    }
}

function getOfflineResponse(request) {
    const url = new URL(request.url);
    
    if (request.destination === 'document') {
        return caches.match(OFFLINE_URL) || new Response(
            getOfflineHTML(),
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

function getOfflineHTML() {
    // Use custom template if available, otherwise use default
    <?php if ($settings['offline_page_use_custom_template'] && !empty($settings['offline_page_template'])): ?>
    return `<?php echo addslashes(WP_PWA_Manager_Settings::process_offline_template($settings['offline_page_template'], $settings)); ?>`;
    <?php else: ?>
    return `<?php echo addslashes(WP_PWA_Manager_Settings::process_offline_template(WP_PWA_Manager_Settings::get_default_offline_template(), $settings)); ?>`;
    <?php endif; ?>
}

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    // Handle offline form submissions when back online
    console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '<?php echo esc_js($settings['icon_192'] ?: WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png'); ?>',
            badge: '<?php echo esc_js($settings['icon_192'] ?: WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png'); ?>',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification('<?php echo esc_js($settings['app_name']); ?>', options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
        <?php
        return ob_get_clean();
    }
}
