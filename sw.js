/* سرمد — Service Worker
   وظيفته الأساسية: تفعيل خاصية التثبيت (PWA) وتخزين هيكل الواجهة الأساسي
   للعمل بسرعة عند الفتح. لا يخزن بيانات الكورسات (تُجلب دائمًا من Firebase). */

const CACHE_NAME = "sarmad-shell-v1";
const SHELL_FILES = ["./index.html", "./style.css", "./script.js", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // خزّن فقط ملفات هيكل التطبيق نفسها (نفس الأصل)، ولا تتدخل في طلبات
  // Firebase / imgbb / PayPal / catbox حتى تبقى البيانات دائمًا محدثة.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match("./index.html"))
      );
    })
  );
});
