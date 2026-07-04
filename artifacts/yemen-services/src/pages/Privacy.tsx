import { Layout } from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout title="سياسة الخصوصية والشروط" back>
      <div className="p-4 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-bold text-foreground mb-2">سياسة الخصوصية</h2>
          <p>
            نحن في "كل خدمات اليمن" نحترم خصوصيتك. يقوم التطبيق بحفظ معرّف الجهاز ورقم الهاتف فقط عند إجراء حجز أو
            بدء محادثة، وذلك لتمكينك من متابعة حجوزاتك ومحادثاتك عند إعادة فتح التطبيق. لا تتم مشاركة بياناتك مع أي
            جهة خارجية.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-foreground mb-2">جمع البيانات</h2>
          <p>
            يتم جمع الاسم، رقم الهاتف، والمدينة عند الحجز فقط لغرض تنفيذ الخدمة المطلوبة والتواصل بين المستخدم
            والفني.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-foreground mb-2">المحادثات</h2>
          <p>جميع المحادثات بين المستخدمين والفنيين محفوظة بشكل دائم ولا يمكن حذفها لضمان الشفافية وحماية الطرفين.</p>
        </section>
        <section>
          <h2 className="font-bold text-foreground mb-2">الشروط والأحكام</h2>
          <p>
            باستخدامك لتطبيق "كل خدمات اليمن" فإنك توافق على الالتزام بالتعامل الحسن مع الفنيين والمستخدمين، وعدم
            إساءة استخدام نظام الحجز أو المحادثات. تحتفظ إدارة التطبيق بحق إيقاف أي حساب يخالف هذه الشروط.
          </p>
        </section>
      </div>
    </Layout>
  );
}
