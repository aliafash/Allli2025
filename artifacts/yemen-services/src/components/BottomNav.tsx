import { Link, useLocation } from "wouter";
import { Home, Heart, Bell, ClipboardList, Info } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useNotifications } from "@/hooks/useNotifications";

export function BottomNav() {
  const [location] = useLocation();
  const { readNotifications } = useSession();
  const notifications = useNotifications();
  const unread = notifications.filter((n) => !readNotifications[n.id]).length;

  const items = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/favorites", label: "المفضلة", icon: Heart },
    { href: "/notifications", label: "الإشعارات", icon: Bell, badge: unread },
    { href: "/bookings", label: "حجوزاتي", icon: ClipboardList },
    { href: "/about", label: "عن التطبيق", icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t flex items-center justify-around h-16 px-1">
      {items.map((item) => {
        const active = location === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}
          >
            <div className="relative">
              <Icon size={20} className={active ? "fill-primary/10" : ""} />
              {!!item.badge && (
                <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
