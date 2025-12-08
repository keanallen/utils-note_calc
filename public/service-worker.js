
// Minimal service worker - No caching, just basic PWA functionality
// Notes are saved automatically to localStorage

console.log('Service Worker: No caching enabled - all requests go to network');

// Install event - skip caching
self.addEventListener('install', event => {
  console.log('Service Worker: Installed (no cache)');
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up any old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  
  // Clear all existing caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('Service Worker: All caches cleared');
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Fetch event - always fetch from network (no caching)
self.addEventListener('fetch', event => {
  // Just let all requests go through to the network
  // No caching, no offline functionality
  event.respondWith(fetch(event.request));
});

// Message event - for future communication between app and service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Ready - Notes will be saved to localStorage automatically');
