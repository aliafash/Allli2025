import { type ReactNode } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";

export function Layout({ children, title, back }: { children: ReactNode; title?: string; back?: boolean }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <OfflineBanner />
      {title && (
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 h-14 flex items-center gap-2">
          {back && (
            <Link href="/" className="text-primary-foreground/80">
              رجوع
            </Link>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
      )}
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
