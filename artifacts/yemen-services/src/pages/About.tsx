import { Link } from "wouter";
import { Phone, Facebook, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function About() {
  return (
    <Layout title="عن التطبيق" back>
      <div className="p-4 flex flex-col items-center text-center gap-2 pt-8">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-3xl font-bold text-accent">ي</span>
        </div>
        <h2 className="text-xl font-bold mt-2">كل خدمات اليمن</h2>
        <p className="text-sm text-muted-foreground">بوابة خدمات ومحترفي اليمن</p>
        <p className="text-xs text-muted-foreground mt-1">الإصدار 1.0.0</p>
      </div>

      <div className="p-4 mt-4 space-y-3">
        <a href="tel:+967700000000" className="flex items-center gap-3 border rounded-xl p-3 bg-card">
          <Phone size={18} className="text-primary" />
          <div>
            <p className="text-sm font-medium">الدعم الفني</p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              +967 700 000 000
            </p>
          </div>
        </a>
        <a href="#" className="flex items-center gap-3 border rounded-xl p-3 bg-card">
          <Facebook size={18} className="text-primary" />
          <p className="text-sm font-medium">فيسبوك</p>
        </a>
        <a href="#" className="flex items-center gap-3 border rounded-xl p-3 bg-card">
          <MessageCircle size={18} className="text-primary" />
          <p className="text-sm font-medium">واتساب</p>
        </a>
      </div>

      <div className="p-4 space-y-2">
        <Link href="/privacy" className="block text-sm text-primary font-medium">
          سياسة الخصوصية والشروط والأحكام
        </Link>
      </div>
    </Layout>
  );
}
