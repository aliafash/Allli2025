import { useOnline } from "@/hooks/useOnline";

export function OfflineBanner() {
  const online = useOnline();

  if (online) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-destructive text-destructive-foreground text-center py-2 text-sm font-medium">
      لا يوجد اتصال بالإنترنت — سيتم حفظ التغييرات ومزامنتها عند عودة الاتصال
    </div>
  );
}
