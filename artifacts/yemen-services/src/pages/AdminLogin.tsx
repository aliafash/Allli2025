import { useState } from "react";
import { useLocation } from "wouter";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminLogin() {
  const { login } = useAdmin();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/admin");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold">لوحة تحكم الأدمن</h1>
          <p className="text-sm text-muted-foreground">كل خدمات اليمن</p>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">اسم المستخدم</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5"
            data-testid="input-admin-username"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">كلمة المرور</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full border rounded-lg px-3 py-2.5"
            data-testid="input-admin-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-bold"
          data-testid="button-admin-login"
        >
          دخول
        </button>
      </form>
    </div>
  );
}
