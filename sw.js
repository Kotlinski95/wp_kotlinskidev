const CACHE_NAME = 'wp-pwa-cache-v1.0.0';
const OFFLINE_URL = 'http://localhost:8888/adriankotlinski/offline/';
const CACHE_STRATEGY = 'network_first';
const MAX_ENTRIES = 330;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // Convert days to milliseconds

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll([
                'http://localhost:8888/adriankotlinski/',
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
    if (event.request.url.includes('/wp-includes/')) {
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
    // Use the new method that handles both plugin and theme file sources
    return `<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>You are offline - Kotlinskidev Web Development</title>
    <script>
      // Translation system - matches your 500.html implementation
      (function () {
        // Default site language - change this to set your default language
        const DEFAULT_LANGUAGE = \"pl\";

        const translations = {
          en: {
            offline_title: \"You\'re Offline\",
            offline_message:
              \"Please check your internet connection and try again.\",
            no_connection: \"No Internet Connection\",
            try_again: \"Try Again\",
            go_home: \"Go Home\",
          },
          pl: {
            offline_title: \"Jesteś Offline\",
            offline_message:
              \"Sprawdź połączenie internetowe i spróbuj ponownie.\",
            no_connection: \"Brak połączenia internetowego\",
            try_again: \"Spróbuj ponownie\",
            go_home: \"Przejdź do strony głównej\",
          },
        };

        // Function to detect user\'s preferred language
        function detectLanguage() {
          // Try to get language from URL query parameter (e.g., ?lang=pl)
          const urlParams = new URLSearchParams(window.location.search);
          const urlLang = urlParams.get(\"lang\");
          if (urlLang && translations[urlLang]) {
            return urlLang;
          }

          // Check if URL path contains language indicator (e.g., /en/, /pl/)
          const path = window.location.pathname;
          for (const lang in translations) {
            // Check if path has language segment like /en/ or /pl/
            if (path.includes(\"/\" + lang + \"/\")) {
              return lang;
            }
          }

          // Special case: if URL doesn\'t contain \'/en/\', default to Polish
          if (!path.includes(\"/en/\")) {
            // If English isn\'t explicitly indicated, use default language
            return DEFAULT_LANGUAGE;
          }

          // Try to get language from localStorage
          const storedLang = localStorage.getItem(\"language\");
          if (storedLang && translations[storedLang]) {
            return storedLang;
          }

          // Try to get language from browser settings
          const browserLang = navigator.language || navigator.userLanguage;
          if (browserLang) {
            const langCode = browserLang.split(\"-\")[0];
            if (translations[langCode]) {
              return langCode;
            }
          }

          // If nothing else matches, use the default language
          return DEFAULT_LANGUAGE;
        }

        // Store the detected language
        const currentLang = detectLanguage();
        document.documentElement.lang = currentLang;

        // Function to translate the page
        function translatePage() {
          const elements = document.querySelectorAll(\"[data-i18n]\");
          elements.forEach((element) => {
            const key = element.getAttribute(\"data-i18n\");
            if (translations[currentLang] && translations[currentLang][key]) {
              element.textContent = translations[currentLang][key];
            }
          });
        }

        // Apply translations after DOM is loaded
        document.addEventListener(\"DOMContentLoaded\", translatePage);

        // Language selector functions
        let activeLang = currentLang;

        // Function to update language button states
        function updateLanguageButtons() {
          const buttons = document.querySelectorAll(\".lang-btn\");
          buttons.forEach((btn) => {
            const btnLang = btn.textContent.toLowerCase();
            if (btnLang === activeLang) {
              btn.classList.add(\"active\");
            } else {
              btn.classList.remove(\"active\");
            }
          });
        }

        // Expose language change function globally
        window.changeLanguage = function (lang) {
          if (translations[lang]) {
            localStorage.setItem(\"language\", lang);
            document.documentElement.lang = lang;
            // Update our local tracking variable
            activeLang = lang;

            // Apply translations
            const elements = document.querySelectorAll(\"[data-i18n]\");
            elements.forEach((element) => {
              const key = element.getAttribute(\"data-i18n\");
              if (translations[lang][key]) {
                element.textContent = translations[lang][key];
              }
            });

            // Update button states
            updateLanguageButtons();
          }
        };

        // Update language buttons after DOM is loaded
        document.addEventListener(\"DOMContentLoaded\", function () {
          translatePage();
          updateLanguageButtons();
        });
      })();
    </script>
    <style>
      :root {
          --primary-color: {
                  {
                  THEME_COLOR
              }
          }

          ;

          --bg-color: {
                  {
                  BACKGROUND_COLOR
              }
          }

          ;
          --text-primary: #1a1a1a;
          --text-secondary: #6b7280;
          --surface: #ffffff;
          --surface-alt: #f9fafb;
          --border: #e5e7eb;
          --shadow: 0 1.25rem 1.5625rem -0.3125rem rgba(0, 0, 0, 0.1),
          0 0.625rem 0.625rem -0.3125rem rgba(0, 0, 0, 0.04);
          --shadow-lg: 0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25);
          --gradient: linear-gradient(135deg, var(--primary-color) 0%, #9466ea 100%);
      }

      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }

      body {
          font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Helvetica Neue\', \'Arial\', sans-serif;
          background: var(--gradient);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          line-height: 1.6;
          overflow-x: hidden;
      }

      .offline-container {
          background: var(--surface);
          backdrop-filter: blur(1.25rem);
          border-radius: 1.5rem;
          padding: 3rem;
          max-width: 30rem;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
      }

      .offline-container::before {
          content: \'\';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0.25rem;
          background: var(--gradient);
      }

      .offline-icon {
          width: 7.5rem;
          height: 7.5rem;
          margin: 0 auto 2rem;
          background: var(--surface-alt);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: var(--shadow);
          animation: float 3s ease-in-out infinite;
      }

      .offline-icon svg {
          width: 3.75rem;
          height: 3.75rem;
          color: var(--text-secondary);
      }

      .offline-icon::after {
          content: \'\';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 0.125rem solid var(--primary-color);
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
      }

      @keyframes float {

          0%,
          100% {
              transform: translateY(0);
          }

          50% {
              transform: translateY(-0.625rem);
          }
      }

      @keyframes pulse {
          0% {
              transform: scale(1);
              opacity: 0.3;
          }

          50% {
              transform: scale(1.05);
              opacity: 0.1;
          }

          100% {
              transform: scale(1);
              opacity: 0.3;
          }
      }

      h1 {
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
      }

      .offline-message {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-bottom: 2rem;
          line-height: 1.7;
      }

      .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
      }

      .btn {
          padding: 0.875rem 1.75rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0.025em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
      }

      .btn-primary {
          color: var(--text-secondary);
          background-clip: border-box;
          background-color: rgba(0, 0, 0, 0);
          background-image: linear-gradient(135deg,
                  rgb(130, 9, 211) 0,
                  rgba(59, 130, 246, 0.8) 100%);
          box-shadow:
              rgba(59, 130, 246, 0.3) 0 0.375rem 1.25rem 0,
              rgba(0, 0, 0, 0.1) 0 0.125rem 0.25rem 0;
          border: none;
      }

      .btn-primary:hover {
          transform: translateY(-0.125rem);
      }

      .btn-secondary {
          background: var(--surface-alt);
          color: var(--text-primary);
          border: 0.125rem solid var(--border);
      }

      .btn-secondary:hover {
          background: var(--surface);
          border-color: var(--primary-color);
          transform: translateY(-0.0625rem);
      }

      .btn:active {
          transform: translateY(0);
      }

      .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef3c7;
          color: #92400e;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
      }

      .status-dot {
          width: 0.5rem;
          height: 0.5rem;
          background: #f59e0b;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
      }

      @keyframes blink {

          0%,
          50% {
              opacity: 1;
          }

          51%,
          100% {
              opacity: 0.3;
          }
      }

      .site-info {
          padding-top: 1.5rem;
          border-top: 0.0625rem solid var(--border);
          color: var (--text-secondary);
          font-size: 0.875rem;
      }

      .site-name {
          font-weight: 600;
          color: var(--text-secondary);
      }

      /* Language selector styling */
      .language-selector {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          display: flex;
          gap: 0.3125rem;
      }

      .lang-btn {
          background: var(--text-primary);
          border: 0.0625rem solid var(--border);
          color: var(--surface);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(0.625rem);
      }

      .lang-btn:hover {
          transform: translateY(-0.125rem);
          box-shadow: var(--shadow);
          border-color: var(--primary-color);
      }

      .lang-btn.active {
        color: var(--text-secondary);
        background-clip: border-box;
        background-color: rgba(0, 0, 0, 0);
        background-image: linear-gradient(135deg,
            rgb(130, 9, 211) 0,
            rgba(59, 130, 246, 0.8) 100%);
        box-shadow:
            rgba(59, 130, 246, 0.3) 0 0.375rem 1.25rem 0,
            rgba(0, 0, 0, 0.1) 0 0.125rem 0.25rem 0;
        border: none;
      }

      /* Mobile Responsive */
      @media (max-width: 40rem) {
          body {
              padding: 0 !important;
          }

          .offline-container {
              padding: 2rem 1.5rem;
              border-radius: 1rem;
              margin: 0.5rem !important;
          }

          .offline-icon {
              width: 6.25rem;
              height: 6.25rem;
              margin-bottom: 1.5rem;
          }

          .offline-icon svg {
              width: 3.125rem;
              height: 3.125rem;
          }

          h1 {
              font-size: 1.75rem;
              margin-bottom: 0.75rem;
          }

          .offline-message {
              font-size: 1rem;
              margin-bottom: 1.5rem;
          }

          .btn {
              padding: 0.75rem 1.5rem;
              font-size: 0.95rem;
          }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
          :root {
              --text-primary: #f9fafb;
              --text-secondary: #d1d5db;
              --surface: #1f2937;
              --surface-alt: #374151;
              --border: #4b5563;
          }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {

          .offline-icon,
          .offline-icon::after,
          .status-dot {
              animation: none;
          }

          .btn {
              transition: none;
          }
      }
    </style>
  </head>

  <body>
    <div class=\"language-selector\">
      <button class=\"lang-btn\" onclick=\"changeLanguage(\'en\')\">EN</button>
      <button class=\"lang-btn\" onclick=\"changeLanguage(\'pl\')\">PL</button>
    </div>

    <div class=\"offline-container\">
      <div class=\"offline-icon\">
        <svg
          viewBox=\"0 0 24 24\"
          fill=\"none\"
          stroke=\"currentColor\"
          stroke-width=\"2\"
          stroke-linecap=\"round\"
          stroke-linejoin=\"round\"
        >
          <path d=\"M2 3l20 18\"></path>
          <path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path>
          <path d=\"M2 8.82a15 18 0 0 1 9.17-3.85\"></path>
          <path d=\"M10.66 5c4.01-.36 8.14.9 11.34 3.76\"></path>
          <path d=\"M16.85 11.25a10 10 0 0 1 2.22 1.68\"></path>
          <path d=\"M5 12.859a10 10 0 0 1 12.17-1.39\"></path>
          <circle cx=\"12\" cy=\"20\" r=\"1\"></circle>
        </svg>
      </div>

      <div class=\"status-indicator\">
        <div class=\"status-dot\"></div>
        <span data-i18n=\"no_connection\">No Internet Connection</span>
      </div>

      <h1 data-i18n=\"offline_title\">You are offline</h1>

      <p class=\"offline-message\" data-i18n=\"offline_message\">
        Please check your internet connection and try again.
      </p>

      <div class=\"action-buttons\">
        <button class=\"btn btn-primary\" onclick=\"location.reload()\">
          <svg
            width=\"16\"
            height=\"16\"
            viewBox=\"0 0 24 24\"
            fill=\"none\"
            stroke=\"currentColor\"
            stroke-width=\"2\"
          >
            <polyline points=\"23 4 23 10 17 10\"></polyline>
            <polyline points=\"1 20 1 14 7 14\"></polyline>
            <path
              d=\"M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15\"
            ></path>
          </svg>
          <span data-i18n=\"try_again\">Try Again</span>
        </button>

        <a href=\"http://localhost:8888/adriankotlinski/\" class=\"btn btn-secondary\">
          <svg
            width=\"16\"
            height=\"16\"
            viewBox=\"0 0 24 24\"
            fill=\"none\"
            stroke=\"currentColor\"
            stroke-width=\"2\"
          >
            <path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path>
            <polyline points=\"9,22 9,12 15,12 15,22\"></polyline>
          </svg>
          <span data-i18n=\"go_home\">Go Home</span>
        </a>
      </div>

      <div class=\"site-info\">
        <div class=\"site-name\">Kotlinskidev Web Development</div>
        <div>Kotlinskidev portfolio - senior software engineer working in web development area</div>
      </div>
    </div>
  </body>
</html>
`;
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
            icon: 'http://localhost:8888/adriankotlinski/wp-content/uploads/2025/09/Kotlinskidev-192.png',
            badge: 'http://localhost:8888/adriankotlinski/wp-content/uploads/2025/09/Kotlinskidev-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification('Kotlinskidev Web Development', options)
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
