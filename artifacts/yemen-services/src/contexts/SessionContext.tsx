import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDeviceId } from "@/lib/deviceId";
import { ensureUser, watchUser, setUserPhone as setUserPhoneFb, toggleFavorite as toggleFavoriteFb } from "@/lib/services";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { UserRecord } from "@/lib/types";

interface SessionContextValue {
  deviceId: string;
  phone: string | null;
  favorites: Record<string, boolean>;
  readNotifications: Record<string, boolean>;
  setPhone: (phone: string) => Promise<void>;
  toggleFavorite: (technicianId: string) => Promise<void>;
  isFavorite: (technicianId: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [deviceId] = useState(() => getDeviceId());
  const [record, setRecord] = useState<UserRecord | null>(null);

  useEffect(() => {
    ensureUser(deviceId);
    const unsub = watchUser(deviceId, setRecord);
    return () => unsub();
  }, [deviceId]);

  usePushNotifications(deviceId);

  const value: SessionContextValue = {
    deviceId,
    phone: record?.phone ?? null,
    favorites: record?.favorites ?? {},
    readNotifications: record?.readNotifications ?? {},
    setPhone: async (phone: string) => {
      await setUserPhoneFb(deviceId, phone);
    },
    toggleFavorite: async (technicianId: string) => {
      const isFav = !!record?.favorites?.[technicianId];
      await toggleFavoriteFb(deviceId, technicianId, !isFav);
    },
    isFavorite: (technicianId: string) => !!record?.favorites?.[technicianId],
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
