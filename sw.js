const CACHE='star-dungeon-shell-20260726b';
const SHELL=['./','./index.html','./manifest.webmanifest','./app-icon.svg',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('star-dungeon-shell-')&&key!==CACHE).map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok)caches.open(CACHE).then(cache=>cache.put('./index.html',res.clone()));
      return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>{
    const fresh=fetch(req).then(res=>{
      if(res.ok)caches.open(CACHE).then(cache=>cache.put(req,res.clone()));
      return res;
    }).catch(()=>cached);
    return cached||fresh;
  }));
});
