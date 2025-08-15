

const CACHE_NAME = 'ordino-pos-v8';

// This list now includes EVERY asset required for the app to run offline.
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './print.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './types.ts',
  './constants.ts',
  './App.tsx',

  // All component files used by the app
  './components/icons/MinusIcon.tsx',
  './components/icons/PlusIcon.tsx',
  './components/icons/TrashIcon.tsx',
  './components/CategoryTabs.tsx',
  './components/MenuItemCard.tsx',
  './components/MenuGrid.tsx',
  './components/ModifierModal.tsx',
  './components/OrderItem.tsx',
  './components/OrderSummary.tsx',
  './components/icons/UserCircleIcon.tsx',

  // All images from constants.ts
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://images.unsplash.com/photo-1579523595213-2a4b4817a028?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-16290A2335136-15a4d75e8331?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1598511653313-28a16f2c9918?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1598214886328-795c6902b489?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1556910110-a5a6350d39d8?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://plus.unsplash.com/premium_photo-1671401314332-6014ac273012?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1611270418597-a6c77f724c35?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1603043435882-75c1d3921345?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1598021680131-33f17c4384e2?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1632778149955-e83f0ce923e0?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1594041682492-3d0a8d513834?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1629509095204-5853bd5a7a70?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1588013273468-31508b946d3d?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1621996346565-e326e22e3e20?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1542826438-643292d59490?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1570197788417-0e82375c934d?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1556679343-c7306c19761a?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1512568400610-62da2848a098?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1551538850-024e05a54825?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=400&q=80&fm=webp',
  'https://images.unsplash.com/photo-1551024709-8f237c2045e5',

  // CDN assets
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching all app assets.');
      // Use individual adds for resilience against single failed requests.
      const promises = URLS_TO_CACHE.map(url => {
        return cache.add(new Request(url, { mode: 'no-cors' })).catch(err => {
          console.warn(`Failed to cache ${url}:`, err);
        });
      });
      return Promise.all(promises);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Use a cache-first, network-fallback strategy for all requests.
  // This ensures the fastest possible response and offline functionality.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Optional: Cache new requests on the fly.
        // Be careful with this for non-versioned APIs.
        // For this app, since all assets are pre-cached, this is mainly a fallback.
        return caches.open(CACHE_NAME).then(cache => {
           // Don't cache POST requests or other non-essentials
           if (event.request.method === 'GET') {
              try {
                cache.put(event.request, networkResponse.clone());
              } catch (e) {
                console.warn(`Could not cache new request for ${event.request.url}:`, e);
              }
           }
           return networkResponse;
        });
      }).catch(error => {
        console.error('Fetch failed; returning offline page instead.', error);
        // You could return a custom offline page here if desired.
        // For now, if it's not in the cache and network fails, it will result in an error.
      });
    })
  );
});