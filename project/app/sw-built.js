/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* *********
Step 4 - Write a basic service worker
********* */

importScripts('workbox-sw.dev.v2.0.0.js');

const workboxSW = new WorkboxSW();
workboxSW.precache([
  {
    "url": "style/main.css",
    "revision": "0d33e0b65de991c0d0d9af23942284bd"
  },
  {
    "url": "index.html",
    "revision": "16657a002dff934fc6d6b9f1578de9c7"
  },
  {
    "url": "js/animation.js",
    "revision": "0bf12cb40b8edf22b9c5b68a7293c407"
  },
  {
    "url": "pages/404.html",
    "revision": "c6fe74afde63befbce266d713e943b56"
  },
  {
    "url": "pages/offline.html",
    "revision": "ee2d52a86f577038705c154f79767451"
  },
  {
    "url": "/",
    "revision": "254b3768a0c2bc75318bdd19de321a1d"
  }
]);

/* *********
Step 7 - Add routes to the service worker
********* */

// Cache Google Fonts
//   1. Allow up to 20 entries in the cache
//   2. Allow responses of :
//       "0"  : No CORS
//       "200": Valid
workboxSW.router.registerRoute(
  'https://fonts.googleapis.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheExpiration: {
      maxEntries: 20
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);

// Cache Images
//    1. Allow up to 50 entries in the cache
//    (By default, allows 200 response)
workboxSW.router.registerRoute(
  /\.(?:png|gif|jpg)$/,
  workboxSW.strategies.cacheFirst({
    cacheName: 'images-cache',
    cacheExpiration: {
      maxEntries: 50
    }
  })
);

/* Optional: Write your own route that matches all requests to the domain http://weloveiconfonts.com/ and handles the request/response using the cacheFirst strategy. Give the cache the name "iconfonts" and allow a maximum of 20 entries to be stored in the cache. Make sure network responses with statuses of 0 or 200 can be cached. Additionally, make sure the cache expires after one week using the configuration options. */
workboxSW.router.registerRoute(
  'http://weloveiconfonts.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'iconfonts',
    cacheExpiration: {
      maxEntries: 20,
      maxAgeSeconds: 604800
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);

/* Optional: Write your own route that matches requests to app/images/icon/ and handles the request/response using the staleWhileRevalidate strategy. Give the cache the name "icon-cache" and allow a maximum of 20 entries to be stored in the cache. This strategy is good for icons and user avatars that change frequently but the latest versions are not essential to the user experience. */
workboxSW.router.registerRoute(
  '/images/icon/(.*)',
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'icon-cache',
    cacheExpiration: {
      maxEntries: 20
    }
  })
);


/* *********
Step 8 - Use a customized networkFirst cache strategy
********* */

const articleHandler = workboxSW.strategies.networkFirst({
  cacheName: 'articles-cache',
  cacheExpiration: {
    maxEntries: 50
  }
});

workboxSW.router.registerRoute(
  '/**/article*.html', 
  args => {
    return articleHandler.handle(args).then((response) => {
        if (!response) {
          // User is offline
          return caches.match('pages/offline.html');
        } else if (response.status === 404) {
          // Page not found 
          // (user likely still online to view this page unless they have viewed previously)
          return caches.match('pages/404.html');
        }

        // User is online
        return response;
    })

  }
);


/* *********
Step 9 - Optional: Add a customized cacheFirst cache strategy

This last exercise is a challenge with less guidance (you can still see the solution code if you get stuck). You need to:

  - Add a final service worker route for the app's "post" pages (pages/post1.html, pages/post2.html, etc.).
  - The route should use Workbox's cacheFirst strategy, creating a cache called "posts-cache" that stores a maximum of 50 entries.
  - If the cache or network returns a resources with a 404 status, then return the pages/404.html resource.
  - If the resource is not available in the cache, and the app is offline, then return the pages/offline.html resource.
********* */

const postHandler = workboxSW.strategies.cacheFirst({
  cacheName: 'posts-cache',
  cacheExpiration: {
    maxEntries: 50
  }
});

workboxSW.router.registerRoute(
  '/**/post*.html',
  args => {
    return postHandler.handle(args).then((response) => {

        if (response.status === 404) {
          // Page not found 
          return caches.match('pages/404.html');
        }

        // Cache response found
        return response;

    }).catch(() => {

      // User is offline
      return caches.match('pages/offline.html');

    })
  }
);

