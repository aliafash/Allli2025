import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { watchBookingsByDevice, updateBookingStatus } from "@/lib/services";
import { useSession } from "@/contexts/SessionContext";
import { BOOKING_STATUS_LABELS } from "@/lib/types";
import type { Booking } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  accepted: "bg-primary/10 text-primary",
  in_progress: "bg-accent/20 text-accent-foreground",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function BookingHistory() {
  const { deviceId } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    return watchBookingsByDevice(deviceId, setBookings);
  }, [deviceId]);

  const sorted = [...bookings].sort((a, b) => b.createdAt - a.createdAt);

  const cancel = async (id: string) => {
    setCancelling(id);
    try {
      await updateBookingStatus(id, "cancelled");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Layout title="سجل الحجوزات" back>
      <div className="p-4 space-y-3">
        {sorted.map((b) => (
          <div key={b.id} className="border rounded-xl p-3 bg-card" data-testid={`card-booking-${b.id}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{b.technicianName}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                {BOOKING_STATUS_LABELS[b.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {b.service} — {b.city}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(b.createdAt).toLocaleString("ar-EG")}
            </p>
            {b.status === "pending" && (
              <button
                onClick={() => cancel(b.id)}
                disabled={cancelling === b.id}
                className="mt-2 text-sm text-destructive font-medium"
                data-testid={`button-cancel-${b.id}`}
              >
                {cancelling === b.id ? "جاري الإلغاء..." : "إلغاء الحجز"}
              </button>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground py-16 text-sm">لا توجد حجوزات سابقة</p>
        )}
      </div>
    </Layout>
  );
}
