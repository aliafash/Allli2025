import { useEffect, useRef } from "react";
import { watchNotifications } from "@/lib/services";
import { registerServiceWorker, showLocalNotification } from "@/lib/push";
import type { AppNotification } from "@/lib/types";

const SEEN_KEY = "yemen-services:seen-notifications";

function loadSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSeen(data: Record<string, number>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(data));
}

/**
 * Watches the shared `notifications` collection and surfaces an OS-level
 * notification (via the registered service worker) for any notification
 * created after this hook mounted and targeted at this device (or "all").
 *
 * Covers all 4 required triggers, since every one of them writes into the
 * same `notifications` collection server-side:
 *  1. Booking accepted by technician (updateBookingStatus -> "booking")
 *  2. Booking status changed (updateBookingStatus -> "booking")
 *  3. New chat message from technician (sendMessage -> "chat")
 *  4. General admin broadcast (createNotification -> "general", target "all")
 */
export function usePushNotifications(deviceId: string) {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const seen = loadSeen();
    const unsub = watchNotifications((list: AppNotification[]) => {
      for (const n of list) {
        if (seen[n.id]) continue;
        seen[n.id] = n.createdAt;

        const targetsMe = n.target === "all" || n.target === deviceId;
        const isNew = n.createdAt >= mountedAt.current;
        if (targetsMe && isNew) {
          const url = n.type === "chat" ? "/notifications" : n.type === "booking" ? "/bookings" : "/notifications";
          showLocalNotification(n.title, n.body, `notif-${n.id}`, url);
        }
      }
      saveSeen(seen);
    });

    return () => unsub();
  }, [deviceId]);
}
