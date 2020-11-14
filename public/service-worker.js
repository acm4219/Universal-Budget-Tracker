 const CACHE_NAME = "static-cache-v2";
 const DATA_CACHE_NAME = "data-cache-v1";

 const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/db.js",
    "/manifest.webmanifest",
];
 self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
      );
     evt.waitUntil(
         caches
         .open(CACHE_NAME)
         .then((cache) => cache.addAll(FILES_TO_CACHE))
         .then(self.skipWaiting())
     );
 });

 self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  self.addEventListener("fetch", function(evt) {
    const {url} = evt.request;
    if (url.includes("/all") || url.includes("/find")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(evt.request, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
    } else {
      evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    }
  });