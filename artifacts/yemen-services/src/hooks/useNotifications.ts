import { useEffect, useState } from "react";
import { watchNotifications } from "@/lib/services";
import type { AppNotification } from "@/lib/types";
import { useSession } from "@/contexts/SessionContext";

export function useNotifications() {
  const { deviceId } = useSession();
  const [list, setList] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsub = watchNotifications((all) =>
      setList(all.filter((n) => n.target === "all" || n.target === deviceId)),
    );
    return () => unsub();
  }, [deviceId]);

  return list;
}
