"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type TestResult =
  | {
      ok: true;
      count: number;
      ids: string[];
      first: any | null;
    }
  | {
      ok: false;
      name?: string;
      code?: string;
      message: string;
    };

async function runTest(
  label: string,
  buildQuery: () => any,
): Promise<{ label: string; result: TestResult }> {
  try {
    const q = buildQuery();
    const snap = await getDocs(q);

    return {
      label,
      result: {
        ok: true,
        count: snap.size,
        ids: snap.docs.map((d) => d.id),
        first: snap.docs[0]?.data() ?? null,
      },
    };
  } catch (e: any) {
    return {
      label,
      result: {
        ok: false,
        name: e?.name,
        code: e?.code,
        message: e?.message ?? String(e),
      },
    };
  }
}

export default function DebugFirestorePage() {
  const [out, setOut] = useState<any>({ loading: true });

  useEffect(() => {
    (async () => {
      // 🔧 Ajusta estos valores para probar con tus datos reales
      const TEST_TIPO = "aretes";
      const TEST_COLECCION = "Personalizados";
      const MIN_PRECIO = 10000;
      const MAX_PRECIO = 60000;

      // ⚠️ Firestore: cuando hay rango (>=, <=) en "precio",
      // suele requerir orderBy("precio") como primer orderBy si además ordenas.
      // Aquí dejo pruebas con y sin orderBy para detectar índices/errores.
      const tests = [
        // 1) Sin filtros
        () =>
          runTest("1) Base: primeros 200 sin filtros", () =>
            query(collection(db, "productos"), limit(200)),
          ),

        // 2) Filtro por tipo
        () =>
          runTest(`2) where tipo == "${TEST_TIPO}"`, () =>
            query(
              collection(db, "productos"),
              where("tipo", "==", TEST_TIPO),
              limit(200),
            ),
          ),

        // 3) Filtro por colección
        () =>
          runTest(`3) where coleccion == "${TEST_COLECCION}"`, () =>
            query(
              collection(db, "productos"),
              where("coleccion", "==", TEST_COLECCION),
              limit(200),
            ),
          ),

        // 4) Rango de precio (sin orderBy)
        () =>
          runTest(
            `4) where precio in [${MIN_PRECIO}, ${MAX_PRECIO}] (sin orderBy)`,
            () =>
              query(
                collection(db, "productos"),
                where("precio", ">=", MIN_PRECIO),
                where("precio", "<=", MAX_PRECIO),
                limit(200),
              ),
          ),

        // 5) Rango de precio + orderBy(precio)
        () =>
          runTest(
            `5) where precio in [${MIN_PRECIO}, ${MAX_PRECIO}] + orderBy(precio asc)`,
            () =>
              query(
                collection(db, "productos"),
                where("precio", ">=", MIN_PRECIO),
                where("precio", "<=", MAX_PRECIO),
                orderBy("precio", "asc"),
                limit(200),
              ),
          ),

        // 6) Rango de precio + orderBy(precio) + orderBy(nombre)
        () =>
          runTest(
            `6) where precio in [${MIN_PRECIO}, ${MAX_PRECIO}] + orderBy(precio asc) + orderBy(nombre asc)`,
            () =>
              query(
                collection(db, "productos"),
                where("precio", ">=", MIN_PRECIO),
                where("precio", "<=", MAX_PRECIO),
                orderBy("precio", "asc"),
                orderBy("nombre", "asc"),
                limit(200),
              ),
          ),

        // 7) Combinado: tipo + colección (sin precio)
        () =>
          runTest(
            `7) tipo == "${TEST_TIPO}" AND coleccion == "${TEST_COLECCION}"`,
            () =>
              query(
                collection(db, "productos"),
                where("tipo", "==", TEST_TIPO),
                where("coleccion", "==", TEST_COLECCION),
                limit(200),
              ),
          ),

        // 8) Combinado: tipo + colección + rango precio + orderBy(precio)
        () =>
          runTest(
            `8) tipo == "${TEST_TIPO}" AND coleccion == "${TEST_COLECCION}" AND precio in [${MIN_PRECIO}, ${MAX_PRECIO}] + orderBy(precio)`,
            () =>
              query(
                collection(db, "productos"),
                where("tipo", "==", TEST_TIPO),
                where("coleccion", "==", TEST_COLECCION),
                where("precio", ">=", MIN_PRECIO),
                where("precio", "<=", MAX_PRECIO),
                orderBy("precio", "asc"),
                limit(200),
              ),
          ),
      ];

      const results = [];
      for (const t of tests) {
        results.push(await t());
      }

      setOut({
        loading: false,
        ok: true,
        params: {
          TEST_TIPO,
          TEST_COLECCION,
          MIN_PRECIO,
          MAX_PRECIO,
        },
        results,
        tips: [
          "Si alguna prueba da code: 'failed-precondition' o mensaje de 'requires an index', es un tema de índices.",
          "Si da 'permission-denied', es Rules.",
          "Si todas las pruebas funcionan aquí pero en la UI no filtra, el bug es del front (no está pasando filters al hook o no se aplica 'Aplicar filtros').",
        ],
      });
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 700, fontSize: 18 }}>Debug Firestore</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Esta página ejecuta varias consultas para aislar si el problema es
        Firestore (rules/índices) o el wiring del frontend.
      </p>

      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(out, null, 2)}
      </pre>
    </main>
  );
}
