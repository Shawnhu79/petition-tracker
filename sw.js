// 簽呈追蹤系統 Service Worker — 網路優先策略
// 每次都從伺服器取最新版，只有離線才使用快取

const CACHE_NAME = 'petition-tracker-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 只處理同源 HTML 頁面，GAS API 不攔截
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        // 成功取得新版，更新快取並回傳
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))  // 離線時回退快取
  );
});
