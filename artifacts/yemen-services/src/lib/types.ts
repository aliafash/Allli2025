export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Technician {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  bio?: string;
  photoUrl?: string;
  approved: boolean;
  ratingSum: number;
  ratingCount: number;
  createdAt: number;
}

export interface TechnicianInput {
  name: string;
  category: string;
  city: string;
  phone: string;
  bio: string;
  photoUrl: string;
}

export interface Booking {
  id: string;
  technicianId: string;
  technicianName: string;
  name: string;
  phone: string;
  service: string;
  city: string;
  status: BookingStatus;
  deviceId: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "technician";
  text: string;
  ts: number;
}

export interface Chat {
  id: string;
  technicianId: string;
  technicianName: string;
  deviceId: string;
  blocked: boolean;
  lastMessage?: string;
  lastTs?: number;
}

export interface Rating {
  id: string;
  technicianId: string;
  deviceId: string;
  stars: number;
  comment: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "booking" | "chat" | "general";
  target: "all" | string;
  createdAt: number;
}

export interface UserRecord {
  phone?: string;
  favorites?: Record<string, boolean>;
  readNotifications?: Record<string, boolean>;
  createdAt: number;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "قيد الانتظار",
  accepted: "تم القبول",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];
