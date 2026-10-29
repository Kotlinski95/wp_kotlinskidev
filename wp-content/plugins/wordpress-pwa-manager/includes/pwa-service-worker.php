<?php

// Functional replacements for WP_PWA_Manager_Service_Worker

function wp_pwa_manager_service_worker_init() {
    add_action('init', 'wp_pwa_manager_service_worker_ensure_file');
    add_action('update_option', 'wp_pwa_manager_maybe_regenerate_service_worker', 10, 3);
}

function wp_pwa_manager_service_worker_ensure_file() {
    $sw_file = ABSPATH . 'sw.js';
    if (file_exists($sw_file)) {
        $settings_hash = wp_pwa_manager_service_worker_get_settings_hash();
        $stored_hash = get_option('wp_pwa_sw_hash', '');
        if ($settings_hash !== $stored_hash) {
            wp_pwa_manager_generate_service_worker_file();
            update_option('wp_pwa_sw_hash', $settings_hash);
        }
    } else {
        wp_pwa_manager_generate_service_worker_file();
        update_option('wp_pwa_sw_hash', wp_pwa_manager_service_worker_get_settings_hash());
    }
}

function wp_pwa_manager_maybe_regenerate_service_worker($option_name, $old_value, $new_value) {
    if (strpos($option_name, 'wp_pwa_') === 0) {
        wp_pwa_manager_generate_service_worker_file();
    }
}

function wp_pwa_manager_service_worker_get_settings_hash() {
    $settings = wp_pwa_manager_get_all_settings();
    $sw_settings = array(
        'home_url' => home_url('/'),
        'pwa_enabled' => $settings['pwa_enabled'],
        'app_name' => $settings['app_name'],
        'app_short_name' => $settings['app_short_name'],
        'app_description' => $settings['app_description'],
        'theme_color' => $settings['theme_color'],
        'background_color' => $settings['background_color'],
        'display' => $settings['display'],
        'orientation' => $settings['orientation'],
        'start_url' => $settings['start_url'],
        'scope' => $settings['scope'],
        'icon_192' => $settings['icon_192'],
        'icon_512' => $settings['icon_512'],
        'install_prompt_enabled' => $settings['install_prompt_enabled'],
        'install_prompt_text' => $settings['install_prompt_text'],
        'install_prompt_button_text' => $settings['install_prompt_button_text'],
        'install_prompt_dismiss_text' => $settings['install_prompt_dismiss_text'],
        'offline_page_enabled' => $settings['offline_page_enabled'],
        'offline_page_title' => $settings['offline_page_title'],
        'offline_page_message' => $settings['offline_page_message'],
        'offline_page_use_custom_template' => $settings['offline_page_use_custom_template'],
        'offline_page_template' => $settings['offline_page_template'],
        'offline_page_template_source' => $settings['offline_page_template_source'],
        'cache_strategy' => $settings['cache_strategy'],
        'cache_max_entries' => $settings['cache_max_entries'],
        'cache_max_age' => $settings['cache_max_age'],
        'push_notifications_enabled' => $settings['push_notifications_enabled'],
        'vapid_public_key' => $settings['vapid_public_key'],
        'vapid_private_key' => $settings['vapid_private_key'],
        'update_prompt_enabled' => $settings['update_prompt_enabled'],
        'update_prompt_text' => $settings['update_prompt_text'],
        'update_prompt_button_text' => $settings['update_prompt_button_text'],
    );
    return md5(serialize($sw_settings));
}

function wp_pwa_manager_generate_service_worker_file() {
    $sw_content = wp_pwa_manager_generate_service_worker();
    $sw_file = ABSPATH . 'sw.js';
    $result = file_put_contents($sw_file, $sw_content);
    if ($result === false) {
        error_log('PWA Manager: Failed to write sw.js file');
    }
    return $result !== false;
}

function wp_pwa_manager_generate_service_worker() {
    $settings     = wp_pwa_manager_get_all_settings();
    $home_url     = home_url('/');
    $offline_url  = home_url('/offline/');
    $cache_name   = 'wp-pwa-cache-' . substr(md5($home_url . WP_PWA_MANAGER_VERSION . wp_pwa_manager_service_worker_get_settings_hash()), 0, 12);
    $icon_192     = !empty($settings['icon_192']) ? $settings['icon_192'] : WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png';
    $icon_512     = !empty($settings['icon_512']) ? $settings['icon_512'] : WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-512x512.png';
    $max_entries  = max(1, (int) $settings['cache_max_entries']);
    $max_age_ms   = max(0, (int) $settings['cache_max_age']) * DAY_IN_SECONDS * 1000;
    $cache_strategy = in_array($settings['cache_strategy'], array('cache_first', 'network_first', 'stale_while_revalidate'), true)
        ? $settings['cache_strategy']
        : 'cache_first';
    $offline_enabled = $settings['offline_page_enabled'] ? 'true' : 'false';
    $offline_html    = $settings['offline_page_enabled'] ? wp_pwa_manager_get_processed_offline_template() : '';

    $config = array(
        'cacheName'      => $cache_name,
        'homeUrl'        => $home_url,
        'offlineUrl'     => $offline_url,
        'cacheStrategy'  => $cache_strategy,
        'maxEntries'     => $max_entries,
        'maxAgeMs'       => $max_age_ms,
        'icon192'        => $icon_192,
        'icon512'        => $icon_512,
        'offlineEnabled' => $settings['offline_page_enabled'],
        'offlineHtml'    => $offline_html,
        'appName'        => $settings['app_name'],
    );

    $config_json = wp_json_encode($config);

    return <<<JS
const CONFIG = {$config_json};
const CACHE_NAME = CONFIG.cacheName;

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.add(CONFIG.homeUrl).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => cacheName !== CACHE_NAME ? caches.delete(cacheName) : null)
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    if (/\\/(wp-admin|wp-json|wp-includes)\\//.test(request.url)) {
        return;
    }
    if (request.referrer && request.referrer.includes('/wp-admin/')) {
        return;
    }

    const isNavigation = request.mode === 'navigate'
        || request.destination === 'document'
        || (request.headers.get('accept') || '').includes('text/html');

    event.respondWith(isNavigation ? handleNavigationRequest(request) : handleAssetRequest(request));
});

async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        if (CONFIG.offlineEnabled && CONFIG.offlineHtml) {
            return new Response(CONFIG.offlineHtml, {
                status: 200,
                headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' },
            });
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

async function handleAssetRequest(request) {
    switch (CONFIG.cacheStrategy) {
        case 'network_first':
            return networkFirst(request);
        case 'stale_while_revalidate':
            return staleWhileRevalidate(request);
        case 'cache_first':
        default:
            return cacheFirst(request);
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        await addToCache(request, networkResponse);
        return networkResponse;
    } catch (error) {
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        await addToCache(request, networkResponse);
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    const fetchPromise = fetch(request).then(networkResponse => {
        addToCache(request, networkResponse.clone());
        return networkResponse;
    }).catch(() => cachedResponse);
    return cachedResponse || fetchPromise;
}

async function addToCache(request, response) {
    if (!response || response.status !== 200) {
        return;
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    await cleanupCache(cache);
}

async function cleanupCache(cache) {
    const requests = await cache.keys();
    if (requests.length > CONFIG.maxEntries) {
        const toDelete = requests.slice(0, requests.length - CONFIG.maxEntries);
        await Promise.all(toDelete.map(request => cache.delete(request)));
    }
}

self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(Promise.resolve());
    }
});

self.addEventListener('push', event => {
    if (!event.data) {
        return;
    }
    const options = {
        body: event.data.text(),
        icon: CONFIG.icon192,
        badge: CONFIG.icon192,
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: 1 },
    };
    event.waitUntil(self.registration.showNotification(CONFIG.appName, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(CONFIG.homeUrl));
});

JS;
}
