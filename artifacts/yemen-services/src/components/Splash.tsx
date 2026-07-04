import { useEffect, useState } from "react";

export function Splash({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-primary transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 border-2 border-accent flex items-center justify-center animate-pulse">
        <span className="text-4xl font-bold text-accent">ي</span>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">كل خدمات اليمن</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">بوابة خدمات ومحترفي اليمن</p>
      </div>
    </div>
  );
}
