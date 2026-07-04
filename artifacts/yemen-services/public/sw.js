self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_NOTIFICATION") return;
  const { title, body, tag, url } = data.payload;
  self.registration.showNotification(title, {
    body,
    tag,
    dir: "rtl",
    lang: "ar",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: url || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
