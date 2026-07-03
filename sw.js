/* 안청초등학교 급식 PWA 서비스워커 */
const CACHE = "ancheong-meal-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

// 설치: 앱 화면 구성 파일을 미리 캐시
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 처리
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // NEIS 급식 데이터는 항상 네트워크에서 최신으로 가져옴(캐시하지 않음)
  if (url.hostname.indexOf("neis.go.kr") >= 0) {
    e.respondWith(fetch(e.request).catch(() => new Response("{}", { headers: { "Content-Type": "application/json" } })));
    return;
  }

  // 그 외(앱 화면 파일)는 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
