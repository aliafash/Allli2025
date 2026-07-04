import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { watchTechnician, createBooking } from "@/lib/services";
import { useSession } from "@/contexts/SessionContext";
import type { Technician } from "@/lib/types";

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { deviceId, phone, setPhone } = useSession();
  const [tech, setTech] = useState<Technician | null>(null);
  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState(phone ?? "");
  const [service, setService] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    return watchTechnician(id, (t) => {
      setTech(t);
      if (t) {
        setService(t.category);
        setCity(t.city);
      }
    });
  }, [id]);

  useEffect(() => {
    if (phone) setPhoneInput(phone);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phoneInput.trim() || !service.trim() || !city.trim()) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (!tech) return;
    setLoading(true);
    try {
      await setPhone(phoneInput.trim());
      await createBooking({
        technicianId: tech.id,
        technicianName: tech.name,
        name: name.trim(),
        phone: phoneInput.trim(),
        service: service.trim(),
        city: city.trim(),
        deviceId,
      });
      navigate("/bookings");
    } catch {
      setError("حدث خطأ أثناء إرسال الحجز، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="حجز خدمة" back>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {tech && (
          <div className="bg-card border rounded-xl p-3 text-sm">
            حجز مع: <span className="font-bold">{tech.name}</span>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1">الاسم الكامل</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 bg-card"
            data-testid="input-name"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">رقم الهاتف</label>
          <input
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            type="tel"
            className="w-full border rounded-lg px-3 py-2.5 bg-card"
            data-testid="input-phone"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">الخدمة المطلوبة</label>
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 bg-card"
            data-testid="input-service"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">المدينة</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 bg-card"
            data-testid="input-city"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-bold disabled:opacity-60"
          data-testid="button-submit-booking"
        >
          {loading ? "جاري الإرسال..." : "تأكيد الحجز"}
        </button>
      </form>
    </Layout>
  );
}
