"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function DebugFirestorePage() {
  const [out, setOut] = useState<any>({ loading: true });

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "productos"), limit(200));
        const snap = await getDocs(q);

        setOut({
          loading: false,
          ok: true,
          count: snap.size,
          ids: snap.docs.map((d) => d.id),
          first: snap.docs[0]?.data() ?? null,
        });
      } catch (e: any) {
        setOut({
          loading: false,
          ok: false,
          name: e?.name,
          code: e?.code,
          message: e?.message ?? String(e),
        });
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 700, fontSize: 18 }}>Debug Firestore</h1>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(out, null, 2)}
      </pre>
    </main>
  );
}
