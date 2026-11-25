var C="forma-app-v5";
var CORE=["miforma","miforma.html","miforma.css?v=51","config.js?v=9","frases.js?v=1","dia.js?v=15","programas.js?v=7","herramientas.js?v=5","miforma.js?v=96","icon-192.png","manifest.webmanifest"];
self.addEventListener("install",function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){});}));}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  var u=new URL(e.request.url);
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(function(r){var c=r.clone();if(r.ok&&u.origin===location.origin)caches.open(C).then(function(ch){ch.put(e.request,c);});return r;}).catch(function(){return caches.match(e.request,{ignoreSearch:e.request.mode==="navigate"}).then(function(m){return m||(e.request.mode==="navigate"?caches.match("miforma.html"):null)||new Response("Sin conexión. Revisá tu internet y volvé a intentar.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});});}));
});
self.addEventListener("notificationclick",function(e){e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(function(cs){for(var i=0;i<cs.length;i++){if("focus" in cs[i])return cs[i].focus();}return self.clients.openWindow("miforma");}));});
