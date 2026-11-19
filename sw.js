var C="forma-app-v4";
self.addEventListener("install",function(e){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(function(r){var c=r.clone();caches.open(C).then(function(ch){ch.put(e.request,c);});return r;}).catch(function(){return caches.match(e.request).then(function(m){return m||new Response("Sin conexión. Revisá tu internet y volvé a intentar.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});});}));
});
