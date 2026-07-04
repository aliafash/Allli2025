import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNotifications } from "@/hooks/useNotifications";
import { useSession } from "@/contexts/SessionContext";
import { markNotificationRead } from "@/lib/services";
import { Bell, CalendarCheck, MessageCircle, Megaphone } from "lucide-react";

const ICONS: Record<string, typeof Bell> = {
  booking: CalendarCheck,
  chat: MessageCircle,
  general: Megaphone,
};

export default function Notifications() {
  const { deviceId, readNotifications } = useSession();
  const notifications = useNotifications();

  useEffect(() => {
    notifications.forEach((n) => {
      if (!readNotifications[n.id]) {
        markNotificationRead(deviceId, n.id);
      }
    });
  }, [notifications, deviceId, readNotifications]);

  return (
    <Layout title="الإشعارات" back>
      <div className="p-4 space-y-3">
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
