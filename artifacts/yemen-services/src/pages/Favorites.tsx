import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { TechnicianCard } from "@/components/TechnicianCard";
import { watchTechnicians } from "@/lib/services";
import { useSession } from "@/contexts/SessionContext";
import type { Technician } from "@/lib/types";

export default function Favorites() {
  const { favorites } = useSession();
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => watchTechnicians(setTechnicians), []);

  const favTechs = technicians.filter((t) => favorites[t.id]);

  return (
    <Layout title="المفضلة" back>
      <div className="p-4 grid grid-cols-2 gap-3">
        {favTechs.map((t) => (
          <TechnicianCard key={t.id} tech={t} />
        ))}
      </div>
      {favTechs.length === 0 && (
        <p className="text-center text-muted-foreground py-16 text-sm">لم تقم بإضافة أي فني إلى المفضلة بعد</p>
      )}
    </Layout>
  );
}
