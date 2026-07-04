import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Phone, MapPin, MessageCircle, CalendarPlus, Heart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StarRating } from "@/components/StarRating";
import { watchTechnician, watchRatingsByTechnician, watchBookingsByDevice, addRating } from "@/lib/services";
import { useSession } from "@/contexts/SessionContext";
import type { Technician, Rating, Booking } from "@/lib/types";

export default function TechnicianProfile() {
  const { id } = useParams<{ id: string }>();
  const [tech, setTech] = useState<Technician | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myStars, setMyStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { deviceId, isFavorite, toggleFavorite } = useSession();

  useEffect(() => {
    if (!id) return;
    const u1 = watchTechnician(id, setTech);
    const u2 = watchRatingsByTechnician(id, setRatings);
    const u3 = watchBookingsByDevice(deviceId, setMyBookings);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [id, deviceId]);

  const alreadyRated = ratings.some((r) => r.deviceId === deviceId);
  const hasCompletedBooking =
    !!id && myBookings.some((b) => b.technicianId === id && b.status === "completed");

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || myStars === 0) return;
    setSubmitting(true);
    try {
      await addRating(id, deviceId, myStars, comment.trim());
      setSubmitted(true);
      setComment("");
      setMyStars(0);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tech) {
    return (
      <Layout title="الملف الشخصي" back>
        <p className="text-center text-muted-foreground py-16">جاري التحميل...</p>
      </Layout>
    );
  }

  const avg = tech.ratingCount > 0 ? tech.ratingSum / tech.ratingCount : 0;
  const fav = isFavorite(tech.id);

  return (
    <Layout title={tech.name} back>
      <div className="bg-primary px-4 pt-6 pb-10 flex flex-col items-center text-primary-foreground">
        <div className="w-24 h-24 rounded-full bg-primary-foreground/10 overflow-hidden border-2 border-accent">
          {tech.photoUrl ? (
            <img src={tech.photoUrl} className="w-full h-full object-cover" alt={tech.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
              {tech.name.charAt(0)}
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold mt-3">{tech.name}</h2>
        <p className="text-accent font-medium">{tech.category}</p>
        <div className="flex items-center gap-1 text-sm mt-1 text-primary-foreground/80">
          <MapPin size={14} />
          <span>{tech.city}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <StarRating value={avg} size={18} />
          <span className="text-sm">({tech.ratingCount} تقييم)</span>
        </div>
      </div>

      <div className="px-4 -mt-5 flex gap-2">
        <Link
          href={`/booking/${tech.id}`}
          className="flex-1 bg-accent text-accent-foreground rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-lg"
          data-testid="button-book"
        >
          <CalendarPlus size={18} />
          حجز الآن
        </Link>
        <Link
          href={`/chat/${tech.id}`}
          className="flex-1 bg-card border rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-lg"
          data-testid="button-message"
        >
          <MessageCircle size={18} />
          محادثة
        </Link>
        <button
          onClick={() => toggleFavorite(tech.id)}
          className="bg-card border rounded-xl px-4 shadow-lg"
          data-testid="button-toggle-favorite"
        >
          <Heart size={20} className={fav ? "fill-destructive text-destructive" : "text-muted-foreground"} />
        </button>
      </div>

      {tech.bio && (
        <div className="px-4 mt-6">
          <h3 className="font-bold mb-2">نبذة عن الفني</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{tech.bio}</p>
        </div>
      )}

      <div className="px-4 mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Phone size={16} />
        <span>{tech.phone}</span>
      </div>

      <div className="px-4 mt-6">
        <h3 className="font-bold mb-3">التقييمات ({ratings.length})</h3>
        <div className="space-y-3">
          {ratings.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 bg-card">
              <StarRating value={r.stars} size={14} />
              {r.comment && <p className="text-sm mt-1 text-card-foreground">{r.comment}</p>}
            </div>
          ))}
          {ratings.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد تقييمات حتى الآن</p>
          )}
        </div>

        {hasCompletedBooking && !alreadyRated && !submitted && (
          <form onSubmit={handleSubmitRating} className="border rounded-xl p-3 bg-card mt-4 space-y-2">
            <h4 className="font-bold text-sm">قيّم هذا الفني</h4>
            <div className="flex items-center gap-1" data-testid="input-rating-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setMyStars(s)}
                  className={s <= myStars ? "text-accent" : "text-muted-foreground"}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="أضف تعليقاً (اختياري)"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              data-testid="input-rating-comment"
            />
            <button
              type="submit"
              disabled={submitting || myStars === 0}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-bold text-sm disabled:opacity-50"
              data-testid="button-submit-rating"
            >
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </form>
        )}
        {submitted && (
          <p className="text-sm text-green-600 text-center mt-4">تم إرسال تقييمك، شكراً لك!</p>
        )}
      </div>
    </Layout>
  );
}
