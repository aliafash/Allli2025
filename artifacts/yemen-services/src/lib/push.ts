let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    swRegistration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
    );
    return swRegistration;
  } catch {
    return null;
  }
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function showLocalNotification(
  title: string,
  body: string,
  tag: string,
  url?: string,
) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const reg = swRegistration ?? (await navigator.serviceWorker.getRegistration());
  if (reg) {
    if (reg.active) {
      reg.active.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: { title, body, tag, url },
      });
      return;
    }
    try {
      await reg.showNotification(title, {
        body,
        tag,
        dir: "rtl",
        lang: "ar",
        icon: `${import.meta.env.BASE_URL}favicon.svg`,
      });
      return;
    } catch {
      // fall through to plain Notification
    }
  }

  new Notification(title, { body, tag, dir: "rtl", lang: "ar" });
}
