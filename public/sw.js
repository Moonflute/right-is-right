// Basic Service Worker to pass PWA install requirements
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Pass-through strategy for simple PWA compliance
});
