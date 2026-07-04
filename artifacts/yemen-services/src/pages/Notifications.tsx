import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNotifications } from "@/hooks/useNotifications";
import { useSession } from "@/contexts/SessionContext";
import { markNotificationRead } from "@/lib/services";
import { getNotificationPermission, requestNotificationPermission } from "@/lib/push";
import { Bell, CalendarCheck, MessageCircle, Megaphone, BellRing } from "lucide-react";

const ICONS: Record<string, typeof Bell> = {
  booking: CalendarCheck,
  chat: MessageCircle,
  general: Megaphone,
};

export default function Notifications() {
  const { deviceId, readNotifications } = useSession();
  const notifications = useNotifications();
  const [permission, setPermission] = useState(getNotificationPermission());

  useEffect(() => {
    notifications.forEach((n) => {
      if (!readNotifications[n.id]) {
        markNotificationRead(deviceId, n.id);
      }
    });
  }, [notifications, deviceId, readNotifications]);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
  };

  return (
    <Layout title="الإشعارات" back>
      <div className="p-4 space-y-3">
        {permission !== "unsupported" && permission !== "granted" && (
          <button
            onClick={handleEnable}
            className="w-full border border-primary/30 bg-primary/5 text-primary rounded-xl p-3 flex items-center gap-2 text-sm font-bold"
            data-testid="button-enable-push"
          >
            <BellRing size={18} />
            فعّل إشعارات الجهاز لتصلك تحديثات الحجز والمحادثات فوراً
          </button>
        )}
        {notifications.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <div key={n.id} className="border rounded-xl p-3 bg-card flex gap-3" data-testid={`notification-${n.id}`}>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-center text-muted-foreground py-16 text-sm">لا توجد إشعارات حالياً</p>
        )}
      </div>
    </Layout>
  );
}
