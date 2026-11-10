"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { mulberry } from "../tissueUtils";

/**
 * Jaringan Parenkim Tumbuhan.
 * Sel besar berdinding tipis dengan vakuola besar yang mendominasi,
 * inti terdesak ke tepi, kloroplas lensa di sitoplasma tepi,
 * serta ruang antar sel yang nyata.
 */

type CellDef = { pos: [number, number, number]; r: number; seed: number };

// Posisi sel: menyusun rapat namun menyisakan celah ruang antar sel.
const CELL_DEFS: CellDef[] = [
  { pos: [-1.55, 0.55, 0.4], r: 0.62, seed: 11 },
  { pos: [0.1, 0.3, 0.8], r: 0.66, seed: 23 },
  { pos: [1.55, -0.45, 0.7], r: 0.6, seed: 37 },
  { pos: [-0.75, -1.05, 0.75], r: 0.58, seed: 41 },
  { pos: [0.85, -1.15, -0.35], r: 0.6, seed: 53 },
  { pos: [-1.25, -0.15, -0.55], r: 0.56, seed: 67 },
  { pos: [1.35, 0.95, -0.5], r: 0.54, seed: 71 },
];

export default function PlantParenchyma3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  const details = useMemo(
    () =>
      CELL_DEFS.map((c) => {
        const rnd = mulberry(c.seed);
        // Inti sel terdesak ke tepi (di antara vakuola dan dinding).
        const na = rnd() * Math.PI * 2;
        const np: [number, number, number] = [
          Math.cos(na) * c.r * 0.72,
          (rnd() - 0.5) * c.r * 0.5,
          Math.sin(na) * c.r * 0.72,
        ];
        // 3-5 kloroplas lensa di sitoplasma tepi.
        const n = 3 + Math.floor(rnd() * 3);
        const chloros: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd() * 0.9;
          chloros.push({
            pos: [Math.cos(a) * c.r * 0.74, (rnd() - 0.5) * c.r * 0.55, Math.sin(a) * c.r * 0.74],
            rot: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],
          });
        }
        return { ...c, np, chloros };
      }),
    []
  );

  return (
    <group>
      {details.map((c, ci) => (
        <group key={`pc-${ci}`} position={c.pos}>
          {/* Dinding sel tipis transparan */}
          <Part
            id="dinding-sel"
            color="#BFE6A8"
            materialPreset="wall"
            opacity={0.3}
            scale={[1, 0.92, 1]}
            {...p}
          >
            <sphereGeometry args={[c.r, 28, 22]} />
          </Part>

          {/* Vakuola besar yang mendominasi isi sel */}
          <Part id="vakuola" color="#8FC8EF" materialPreset="vesicle" scale={[1, 0.9, 1]} {...p}>
            <sphereGeometry args={[c.r * 0.66, 24, 18]} />
          </Part>

          {/* Inti sel terdesak ke tepi */}
          <Part
            id="inti-sel"
            color="#5B3A8E"
            materialPreset="nucleus"
            position={c.np}
            {...p}
          >
            <sphereGeometry args={[0.1, 18, 14]} />
          </Part>

          {/* Kloroplas lensa di sitoplasma tepi */}
          {c.chloros.map((cl, i) => (
            <Part
              key={`chl-${i}`}
              id="kloroplas"
              color="#2F9A3C"
              materialPreset="organelle"
              position={cl.pos}
              rotation={cl.rot}
              scale={[1, 0.55, 0.75]}
              {...p}
            >
              <sphereGeometry args={[0.11, 16, 12]} />
            </Part>
          ))}
        </group>
      ))}
    </group>
  );
}
