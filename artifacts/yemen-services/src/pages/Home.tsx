import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { TechnicianCard } from "@/components/TechnicianCard";
import { watchTechnicians, watchCities, watchCategories } from "@/lib/services";
import type { Technician } from "@/lib/types";

export default function Home() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("الكل");
  const [category, setCategory] = useState("الكل");

  useEffect(() => {
    const u1 = watchTechnicians(setTechnicians);
    const u2 = watchCities(setCities);
    const u3 = watchCategories(setCategories);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const filtered = useMemo(() => {
    return technicians
      .filter((t) => t.approved)
      .filter((t) => (city === "الكل" ? true : t.city === city))
      .filter((t) => (category === "الكل" ? true : t.category === category))
      .filter((t) => (search ? t.name.includes(search) || t.category.includes(search) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [technicians, search, city, category]);

  return (
    <Layout>
      <div className="bg-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <h1 className="text-primary-foreground text-2xl font-bold">كل خدمات اليمن</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">بوابة خدمات ومحترفي اليمن</p>
        <div className="relative mt-4">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن فني أو خدمة..."
            className="w-full rounded-xl bg-card pe-10 ps-3 py-3 text-sm text-card-foreground outline-none"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="px-4 -mt-3 mb-4 flex gap-2 overflow-x-auto pb-1">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-card border rounded-lg px-3 py-2 text-sm shrink-0"
          data-testid="select-city"
        >
          <option>الكل</option>
          {cities.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-card border rounded-lg px-3 py-2 text-sm shrink-0"
          data-testid="select-category"
        >
          <option>الكل</option>
          {categories.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((t) => (
          <TechnicianCard key={t.id} tech={t} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-16 text-sm">لا يوجد فنيون مطابقون لبحثك حالياً</p>
      )}
    </Layout>
  );
}
