"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";

/**
 * Jaringan Kolenkim Tumbuhan.
 * Sel hidup prisma berdinding tebal TIDAK MERATA — penebalan selulosa-
 * pektin hanya menumpuk di sudut-sudut sel. Inti tetap hidup.
 */

const CELL = 0.62;

type CellDef = { x: number; y: number; ix: number; iy: number };

function buildCells(): CellDef[] {
  const out: CellDef[] = [];
  for (let ix = 0; ix < 4; ix++) {
    for (let iy = 0; iy < 3; iy++) {
      out.push({ x: (ix - 1.5) * CELL, y: (iy - 1) * CELL, ix, iy });
    }
  }
  return out;
}

export default function PlantCollenchyma3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };
  const cells = useMemo(buildCells, []);

  // Penebalan sudut: silinder vertikal di tiap sudut sel (sudut bersama
  // antar sel dipasang sekali lewat Set kunci posisi).
  const corners = useMemo(() => {
    const seen = new Set<string>();
    const out: [number, number][] = [];
    for (const c of cells) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          const cx = c.x + (sx * CELL) / 2;
          const cy = c.y + (sy * CELL) / 2;
          const key = `${cx.toFixed(2)}:${cy.toFixed(2)}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push([cx, cy]);
          }
        }
      }
    }
    return out;
  }, [cells]);

  return (
    <group position={[0, 0.1, 0.4]}>
      {/* Sel kolenkim — dinding transparan-ringan agar penebalan terlihat */}
      {cells.map((c, i) => (
        <group key={`kc-${i}`} position={[c.x, c.y, 0]}>
          <Part
            id="sel-kolenkim"
            color="#DCC48F"
            materialPreset="tissue"
            opacity={0.45}
            {...p}
          >
            <boxGeometry args={[CELL, CELL, 0.62]} />
          </Part>
          {/* Inti sel yang masih hidup */}
          <Part
            id="inti-sel"
            color="#6E5A3A"
            materialPreset="nucleus"
            position={[0, 0, 0.06]}
            {...p}
          >
            <sphereGeometry args={[0.1, 16, 12]} />
          </Part>
        </group>
      ))}

      {/* Penebalan dinding di sudut-sudut sel (ciri khas kolenkim) */}
      {corners.map(([cx, cy], i) => (
        <Part
          key={`cn-${i}`}
          id="penebalan-dinding"
          color="#B0894A"
          materialPreset="wall"
          position={[cx, cy, 0]}
          {...p}
        >
          <cylinderGeometry args={[0.11, 0.11, 0.66, 14]} />
        </Part>
      ))}
    </group>
  );
}
