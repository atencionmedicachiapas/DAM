/*
 * Permite instalar el portal como aplicación.
 * Siempre intenta traer la versión más reciente de la página;
 * solo usa la copia guardada si no hay internet.
 * Nunca guarda datos del servidor (indicadores ni sesiones).
 */
const CACHE = 'portal-dam-v1';
const BASICOS = ['./', 'index.html', 'logo-salud.png', 'manifest.webmanifest', 'icono-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // el servidor nunca se guarda
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
