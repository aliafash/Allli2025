import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Users,
  ClipboardList,
  MessageSquare,
  Megaphone,
  BarChart3,
  MapPin,
  Tags,
  LogOut,
  Trash2,
  Check,
  X,
  Ban,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import {
  watchTechnicians,
  watchAllBookings,
  watchAllChats,
  watchAllRatings,
  watchCities,
  watchCategories,
  addTechnician,
  updateTechnician,
  deleteTechnician,
  updateBookingStatus,
  deleteBooking,
  setChatBlocked,
  createNotification,
  addCity,
  deleteCity,
  addCategory,
  deleteCategory,
} from "@/lib/services";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_ORDER } from "@/lib/types";
import type { Technician, Booking, Chat, Rating } from "@/lib/types";

type Tab = "stats" | "technicians" | "bookings" | "chats" | "notifications" | "cities" | "categories";

export default function AdminDashboard() {
  const { isAdmin, logout } = useAdmin();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("stats");

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const u1 = watchTechnicians(setTechnicians);
    const u2 = watchAllBookings(setBookings);
    const u3 = watchAllChats(setChats);
    const u4 = watchAllRatings(setRatings);
    const u5 = watchCities(setCities);
    const u6 = watchCategories(setCategories);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
    };
  }, []);

  if (!isAdmin) return null;

  const uniqueDevices = new Set(bookings.map((b) => b.deviceId));

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "stats", label: "إحصائيات", icon: BarChart3 },
    { id: "technicians", label: "الفنيون", icon: Users },
    { id: "bookings", label: "الحجوزات", icon: ClipboardList },
    { id: "chats", label: "المحادثات", icon: MessageSquare },
    { id: "notifications", label: "الإشعارات", icon: Megaphone },
    { id: "cities", label: "المدن", icon: MapPin },
    { id: "categories", label: "الأقسام", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-background pb-4">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold">لوحة تحكم الأدمن</h1>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-1 text-sm"
          data-testid="button-admin-logout"
        >
          <LogOut size={16} />
          خروج
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto p-2 border-b bg-card sticky top-14 z-30">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
              data-testid={`tab-${t.id}`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="عدد المستخدمين" value={uniqueDevices.size} />
            <StatCard label="عدد الفنيين" value={technicians.length} />
            <StatCard label="عدد الحجوزات" value={bookings.length} />
            <StatCard label="عدد التقييمات" value={ratings.length} />
          </div>
        )}

        {tab === "technicians" && <TechniciansTab technicians={technicians} cities={cities} categories={categories} />}
        {tab === "bookings" && <BookingsTab bookings={bookings} />}
        {tab === "chats" && <ChatsTab chats={chats} />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "cities" && <ListManagerTab title="المدن" items={cities} onAdd={addCity} onDelete={deleteCity} />}
        {tab === "categories" && (
          <ListManagerTab title="الأقسام" items={categories} onAdd={addCategory} onDelete={deleteCategory} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-xl p-4 bg-card text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TechniciansTab({
  technicians,
  cities,
  categories,
}: {
  technicians: Technician[];
  cities: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !city || !phone) return;
    setSaving(true);
    try {
      await addTechnician({ name, category, city, phone, bio, photoUrl, approved: true });
      setName("");
      setCategory("");
      setCity("");
      setPhone("");
      setBio("");
      setPhotoUrl("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-bold"
        data-testid="button-toggle-add-technician"
      >
        {showForm ? "إغلاق" : "+ إضافة فني جديد"}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="border rounded-xl p-3 bg-card space-y-2">
          <input
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            data-testid="input-tech-name"
          />
          <input
            placeholder="القسم / التخصص"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            list="category-options"
            data-testid="input-tech-category"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <input
            placeholder="المدينة"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            list="city-options"
            data-testid="input-tech-city"
          />
          <datalist id="city-options">
            {cities.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <input
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            data-testid="input-tech-phone"
          />
          <input
            placeholder="رابط الصورة (اختياري)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            data-testid="input-tech-photo"
          />
          <textarea
            placeholder="نبذة (اختياري)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            data-testid="input-tech-bio"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent text-accent-foreground rounded-lg py-2 font-bold"
            data-testid="button-save-technician"
          >
            {saving ? "جاري الحفظ..." : "حفظ الفني"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {technicians.map((t) => (
          <div key={t.id} className="border rounded-xl p-3 bg-card flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.category} — {t.city}
              </p>
              <p className={`text-xs mt-0.5 ${t.approved ? "text-green-600" : "text-amber-600"}`}>
                {t.approved ? "مفعّل" : "بانتظار الموافقة"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!t.approved && (
                <button
                  onClick={() => updateTechnician(t.id, { approved: true })}
                  className="p-2 rounded-lg bg-green-100 text-green-700"
                  data-testid={`button-approve-${t.id}`}
                >
                  <Check size={14} />
                </button>
              )}
              {t.approved && (
                <button
                  onClick={() => updateTechnician(t.id, { approved: false })}
                  className="p-2 rounded-lg bg-amber-100 text-amber-700"
                  data-testid={`button-suspend-${t.id}`}
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => deleteTechnician(t.id)}
                className="p-2 rounded-lg bg-destructive/10 text-destructive"
                data-testid={`button-delete-technician-${t.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  const sorted = [...bookings].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-2">
      {sorted.map((b) => (
        <div key={b.id} className="border rounded-xl p-3 bg-card">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">{b.name}</p>
            <button
              onClick={() => deleteBooking(b.id)}
              className="p-1.5 rounded-lg bg-destructive/10 text-destructive"
              data-testid={`button-delete-booking-${b.id}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {b.technicianName} — {b.service} — {b.city} — {b.phone}
          </p>
          <select
            value={b.status}
            onChange={(e) => updateBookingStatus(b.id, e.target.value as Booking["status"])}
            className="mt-2 border rounded-lg px-2 py-1.5 text-xs bg-background"
            data-testid={`select-status-${b.id}`}
          >
            {BOOKING_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      ))}
      {sorted.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">لا توجد حجوزات</p>}
    </div>
  );
}

function ChatsTab({ chats }: { chats: Chat[] }) {
  return (
    <div className="space-y-2">
      {chats.map((c) => (
        <div key={c.id} className="border rounded-xl p-3 bg-card flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{c.technicianName}</p>
            <p className="text-xs text-muted-foreground">جهاز: {c.deviceId.slice(0, 12)}...</p>
          </div>
          <button
            onClick={() => setChatBlocked(c.id, !c.blocked)}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
              c.blocked ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"
            }`}
            data-testid={`button-block-chat-${c.id}`}
          >
            <Ban size={13} />
            {c.blocked ? "إعادة تفعيل" : "إيقاف"}
          </button>
        </div>
      ))}
      {chats.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">لا توجد محادثات</p>}
    </div>
  );
}

function NotificationsTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await createNotification({ title, body, type: "general", target: "all" });
      setTitle("");
      setBody("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="border rounded-xl p-3 bg-card space-y-2">
      <h3 className="font-bold text-sm">إرسال إشعار عام لجميع المستخدمين</h3>
      <input
        placeholder="عنوان الإشعار"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        data-testid="input-notification-title"
      />
      <textarea
        placeholder="نص الإشعار"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        data-testid="input-notification-body"
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-bold"
        data-testid="button-send-notification"
      >
        {sending ? "جاري الإرسال..." : "إرسال"}
      </button>
      {sent && <p className="text-sm text-green-600 text-center">تم إرسال الإشعار بنجاح</p>}
    </form>
  );
}

function ListManagerTab({
  title,
  items,
  onAdd,
  onDelete,
}: {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    try {
      await onAdd(value.trim());
      setValue("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`اسم ${title} جديد`}
          className="flex-1 border rounded-lg px-3 py-2 bg-card"
          data-testid={`input-add-${title}`}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground rounded-lg px-4 font-bold"
          data-testid={`button-add-${title}`}
        >
          إضافة
        </button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-2.5 bg-card flex items-center justify-between">
            <span className="text-sm">{item.name}</span>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg bg-destructive/10 text-destructive"
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
