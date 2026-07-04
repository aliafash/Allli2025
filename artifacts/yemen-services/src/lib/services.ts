import {
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { rtdb } from "./firebase";
import type {
  Technician,
  TechnicianInput,
  Booking,
  BookingStatus,
  Chat,
  ChatMessage,
  Rating,
  AppNotification,
  UserRecord,
} from "./types";

function toArray<T>(obj: Record<string, unknown> | null | undefined): T[] {
  if (!obj) return [];
  return Object.entries(obj).map(([id, val]) => ({ id, ...(val as object) })) as T[];
}

// ---------- Technicians ----------

export function watchTechnicians(cb: (list: Technician[]) => void) {
  const r = ref(rtdb, "technicians");
  return onValue(r, (snap) => {
    cb(toArray<Technician>(snap.val()));
  });
}

export function watchTechnician(id: string, cb: (t: Technician | null) => void) {
  const r = ref(rtdb, `technicians/${id}`);
  return onValue(r, (snap) => {
    const val = snap.val();
    cb(val ? ({ id, ...val } as Technician) : null);
  });
}

export async function addTechnician(input: TechnicianInput & { approved?: boolean }) {
  const r = ref(rtdb, "technicians");
  const newRef = push(r);
  await set(newRef, {
    ...input,
    approved: input.approved ?? false,
    ratingSum: 0,
    ratingCount: 0,
    createdAt: Date.now(),
  });
  return newRef.key;
}

export async function updateTechnician(id: string, patch: Partial<Technician>) {
  await update(ref(rtdb, `technicians/${id}`), patch);
}

export async function deleteTechnician(id: string) {
  await remove(ref(rtdb, `technicians/${id}`));
}

// ---------- Bookings ----------

export function watchAllBookings(cb: (list: Booking[]) => void) {
  return onValue(ref(rtdb, "bookings"), (snap) => cb(toArray<Booking>(snap.val())));
}

export function watchBookingsByDevice(deviceId: string, cb: (list: Booking[]) => void) {
  const q = query(ref(rtdb, "bookings"), orderByChild("deviceId"), equalTo(deviceId));
  return onValue(q, (snap) => cb(toArray<Booking>(snap.val())));
}

export function watchBookingsByTechnician(technicianId: string, cb: (list: Booking[]) => void) {
  const q = query(ref(rtdb, "bookings"), orderByChild("technicianId"), equalTo(technicianId));
  return onValue(q, (snap) => cb(toArray<Booking>(snap.val())));
}

export async function createBooking(data: {
  technicianId: string;
  technicianName: string;
  name: string;
  phone: string;
  service: string;
  city: string;
  deviceId: string;
}) {
  const r = push(ref(rtdb, "bookings"));
  await set(r, {
    ...data,
    status: "pending" as BookingStatus,
    createdAt: Date.now(),
  });
  await createNotification({
    title: "تم استلام طلب حجزك",
    body: `تم إرسال طلب الحجز إلى ${data.technicianName} بنجاح، بانتظار الموافقة.`,
    type: "booking",
    target: data.deviceId,
  });
  return r.key;
}

const STATUS_NOTIFICATION_TEXT: Record<BookingStatus, { title: string; body: (techName: string) => string }> = {
  pending: {
    title: "حجزك قيد الانتظار",
    body: (t) => `طلب حجزك مع ${t} بانتظار المراجعة.`,
  },
  accepted: {
    title: "تم قبول حجزك",
    body: (t) => `وافق ${t} على طلب حجزك، سيتم التواصل معك قريباً.`,
  },
  in_progress: {
    title: "الحجز قيد التنفيذ",
    body: (t) => `${t} بدأ بتنفيذ الخدمة المطلوبة.`,
  },
  completed: {
    title: "تم إكمال الخدمة",
    body: (t) => `أكمل ${t} تنفيذ الخدمة. يمكنك الآن تقييمه.`,
  },
  cancelled: {
    title: "تم إلغاء الحجز",
    body: (t) => `تم إلغاء حجزك مع ${t}.`,
  },
};

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const snap = await get(ref(rtdb, `bookings/${id}`));
  const booking = snap.val();
  await update(ref(rtdb, `bookings/${id}`), { status });
  if (booking) {
    const text = STATUS_NOTIFICATION_TEXT[status];
    await createNotification({
      title: text.title,
      body: text.body(booking.technicianName ?? "الفني"),
      type: "booking",
      target: booking.deviceId,
    });
  }
}

export async function deleteBooking(id: string) {
  await remove(ref(rtdb, `bookings/${id}`));
}

// ---------- Chats ----------

export function chatIdFor(technicianId: string, deviceId: string) {
  return `${technicianId}_${deviceId}`;
}

export function watchChat(chatId: string, cb: (chat: Chat | null) => void) {
  return onValue(ref(rtdb, `chats/${chatId}`), (snap) => {
    const val = snap.val();
    cb(val ? ({ id: chatId, ...val } as Chat) : null);
  });
}

export function watchAllChats(cb: (list: Chat[]) => void) {
  return onValue(ref(rtdb, "chats"), (snap) => cb(toArray<Chat>(snap.val())));
}

export function watchChatMessages(chatId: string, cb: (msgs: ChatMessage[]) => void) {
  return onValue(ref(rtdb, `chats/${chatId}/messages`), (snap) => {
    cb(toArray<ChatMessage>(snap.val()).sort((a, b) => a.ts - b.ts));
  });
}

export async function ensureChat(chatId: string, technicianId: string, technicianName: string, deviceId: string) {
  const snap = await get(ref(rtdb, `chats/${chatId}`));
  if (!snap.exists()) {
    await set(ref(rtdb, `chats/${chatId}`), {
      technicianId,
      technicianName,
      deviceId,
      blocked: false,
    });
  }
}

export async function sendMessage(chatId: string, sender: "user" | "technician", text: string) {
  const r = push(ref(rtdb, `chats/${chatId}/messages`));
  await set(r, { sender, text, ts: Date.now() });

  if (sender === "technician") {
    const chatSnap = await get(ref(rtdb, `chats/${chatId}`));
    const chat = chatSnap.val();
    if (chat) {
      await createNotification({
        title: `رسالة جديدة من ${chat.technicianName}`,
        body: text,
        type: "chat",
        target: chat.deviceId,
      });
    }
  }
}

export async function setChatBlocked(chatId: string, blocked: boolean) {
  await update(ref(rtdb, `chats/${chatId}`), { blocked });
}

// deleting chats is intentionally NOT exposed anywhere in the app —
// conversations must never be deleted.

// ---------- Ratings ----------

export function watchRatingsByTechnician(technicianId: string, cb: (list: Rating[]) => void) {
  const q = query(ref(rtdb, "ratings"), orderByChild("technicianId"), equalTo(technicianId));
  return onValue(q, (snap) => cb(toArray<Rating>(snap.val()).sort((a, b) => b.createdAt - a.createdAt)));
}

export function watchAllRatings(cb: (list: Rating[]) => void) {
  return onValue(ref(rtdb, "ratings"), (snap) => cb(toArray<Rating>(snap.val())));
}

export async function addRating(technicianId: string, deviceId: string, stars: number, comment: string) {
  const r = push(ref(rtdb, "ratings"));
  await set(r, { technicianId, deviceId, stars, comment, createdAt: Date.now() });

  const techSnap = await get(ref(rtdb, `technicians/${technicianId}`));
  const tech = techSnap.val();
  if (tech) {
    await update(ref(rtdb, `technicians/${technicianId}`), {
      ratingSum: (tech.ratingSum || 0) + stars,
      ratingCount: (tech.ratingCount || 0) + 1,
    });
  }
}

// ---------- Notifications ----------

export function watchNotifications(cb: (list: AppNotification[]) => void) {
  return onValue(ref(rtdb, "notifications"), (snap) => {
    cb(toArray<AppNotification>(snap.val()).sort((a, b) => b.createdAt - a.createdAt));
  });
}

export async function createNotification(data: {
  title: string;
  body: string;
  type: "booking" | "chat" | "general";
  target: "all" | string;
}) {
  const r = push(ref(rtdb, "notifications"));
  await set(r, { ...data, createdAt: Date.now() });
  return r.key;
}

export async function deleteNotification(id: string) {
  await remove(ref(rtdb, `notifications/${id}`));
}

// ---------- Users (device sessions) ----------

export function watchUser(deviceId: string, cb: (u: UserRecord | null) => void) {
  return onValue(ref(rtdb, `users/${deviceId}`), (snap) => cb(snap.val()));
}

export async function ensureUser(deviceId: string) {
  const snap = await get(ref(rtdb, `users/${deviceId}`));
  if (!snap.exists()) {
    await set(ref(rtdb, `users/${deviceId}`), { createdAt: Date.now() });
  }
}

export async function setUserPhone(deviceId: string, phone: string) {
  await update(ref(rtdb, `users/${deviceId}`), { phone });
}

export async function toggleFavorite(deviceId: string, technicianId: string, isFav: boolean) {
  await update(ref(rtdb, `users/${deviceId}/favorites`), { [technicianId]: isFav ? true : null });
}

export async function markNotificationRead(deviceId: string, notificationId: string) {
  await update(ref(rtdb, `users/${deviceId}/readNotifications`), { [notificationId]: true });
}

// ---------- Cities & Categories ----------

export function watchCities(cb: (list: { id: string; name: string }[]) => void) {
  return onValue(ref(rtdb, "cities"), (snap) => cb(toArray(snap.val())));
}

export function watchCategories(cb: (list: { id: string; name: string }[]) => void) {
  return onValue(ref(rtdb, "categories"), (snap) => cb(toArray(snap.val())));
}

export async function addCity(name: string) {
  const r = push(ref(rtdb, "cities"));
  await set(r, { name });
}

export async function deleteCity(id: string) {
  await remove(ref(rtdb, `cities/${id}`));
}

export async function addCategory(name: string) {
  const r = push(ref(rtdb, "categories"));
  await set(r, { name });
}

export async function deleteCategory(id: string) {
  await remove(ref(rtdb, `categories/${id}`));
}
