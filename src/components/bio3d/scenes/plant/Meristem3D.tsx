"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { mulberry } from "../tissueUtils";

/**
 * Jaringan Meristem Tumbuhan.
 * Blok sel kubus kecil rapat berdinding tipis dengan inti relatif besar,
 * plus region kanan berisi sel yang sedang membelah (dua inti anak +
 * dinding sel baru di tengah).
 */

const CELL = 0.5;

type CellDef = { x: number; y: number; z: number; div: boolean; s: number };

function buildCells(): CellDef[] {
  const rnd = mulberry(7);
  const out: CellDef[] = [];
  for (let ix = 0; ix < 5; ix++) {
    for (let iy = 0; iy < 4; iy++) {
      for (let iz = 0; iz < 3; iz++) {
        const x = (ix - 2) * CELL;
        const y = (iy - 1.5) * CELL;
        const z = (iz - 1) * CELL;
        // Region kanan-atas-tengah: sel yang sedang membelah.
        const div = ix >= 3 && iy === 2 && iz >= 1;
        out.push({ x, y, z, div, s: 0.94 + rnd() * 0.1 });
      }
    }
  }
  return out;
}

export default function PlantMeristem3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };
  const cells = useMemo(buildCells, []);

  return (
    <group position={[0, 0.1, 0]}>
      {cells.map((c, i) => {
        const half = (CELL / 2) * c.s;
        return (
          <group key={`m-${i}`} position={[c.x, c.y, c.z]}>
            {/* Dinding sel tipis (meristem berdinding tipis, transparan-ringan) */}
            <Part
              id={c.div ? "sel-membelah" : "sel-meristem"}
              color={c.div ? "#E0507A" : "#B6E3A0"}
              materialPreset="tissue"
              opacity={0.5}
              scale={c.s}
              {...p}
            >
              <boxGeometry args={[CELL, CELL, CELL]} />
            </Part>

            {c.div ? (
              <>
                {/* Dua inti anak yang menjauh + dinding sel baru di tengah */}
                <Part
                  id="sel-membelah"
                  color="#B83A5E"
                  materialPreset="nucleus"
                  position={[-half * 0.45, 0, 0]}
                  {...p}
                >
                  <sphereGeometry args={[0.09, 18, 14]} />
                </Part>
                <Part
                  id="sel-membelah"
                  color="#B83A5E"
                  materialPreset="nucleus"
                  position={[half * 0.45, 0, 0]}
                  {...p}
                >
                  <sphereGeometry args={[0.09, 18, 14]} />
                </Part>
                <Part
                  id="sel-membelah"
                  color="#F090A8"
                  materialPreset="tissue"
                  position={[0, 0, 0]}
                  {...p}
                >
                  <boxGeometry args={[0.04, CELL * 0.96, CELL * 0.96]} />
                </Part>
              </>
            ) : (
              /* Inti besar khas sel meristem */
              <Part
                id="inti-besar"
                color="#5B3A8E"
                materialPreset="nucleus"
                position={[0, 0, 0]}
                {...p}
              >
                <sphereGeometry args={[0.16, 20, 16]} />
              </Part>
            )}
          </group>
        );
      })}
    </group>
  );
}
