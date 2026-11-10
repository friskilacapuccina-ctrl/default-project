"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { mulberry } from "../tissueUtils";

/**
 * Jaringan Epidermis Tumbuhan.
 * Lapisan sel pipih heksagon rapat + kutikula transparan di atasnya,
 * satu stomata (dua sel penjaga ginjal + celah) dan beberapa trikoma.
 */

const CELL_R = 0.52;
const CELL_H = 0.5;

/** Posisi sel epidermis heksagon (grid offset brick-pattern di bidang XZ). */
function hexGridPositions(): [number, number][] {
  const out: [number, number][] = [];
  const cols = 6;
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * CELL_R * 1.72 + (r % 2 === 1 ? CELL_R * 0.86 : 0);
      const z = (r - (rows - 1) / 2) * CELL_R * 1.5;
      out.push([x, z]);
    }
  }
  return out;
}

export default function PlantEpidermis3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  const cells = useMemo(hexGridPositions, []);
  const trichomeSeeds = useMemo(() => {
    const rnd = mulberry(41);
    return [
      { x: 1.7, z: -0.8, tilt: 0.18 },
      { x: -2.1, z: 0.9, tilt: -0.22 },
      { x: 0.6, z: 1.35, tilt: 0.1 },
      { x: -1.0, z: -1.3, tilt: -0.12 },
    ].map((t) => ({ ...t, h: 0.75 + rnd() * 0.25 }));
  }, []);

  return (
    <group>
      {/* Sel epidermis — heksagon pipih rapat tanpa ruang antar sel */}
      {cells.map(([x, z], i) => (
        <Part
          key={`ep-${i}`}
          id="sel-epidermis"
          color="#9BD18A"
          materialPreset="tissue"
          position={[x, 0, z]}
          {...p}
        >
          <cylinderGeometry args={[CELL_R, CELL_R, CELL_H, 6]} />
        </Part>
      ))}

      {/* Stomata: sepasang sel penjaga ginjal + celah (pore) di antaranya */}
      <group position={[0.15, 0.28, 0.2]}>
        {[-1, 1].map((side) => (
          <Part
            key={`guard-${side}`}
            id="stomata"
            color="#2F8F4A"
            materialPreset="organelle"
            position={[side * 0.19, 0, 0]}
            rotation={[0, side * 0.28, 0]}
            scale={[1, 0.55, 1]}
            {...p}
          >
            <sphereGeometry args={[0.28, 24, 18]} />
          </Part>
        ))}
        {/* Celah stomata (pore) di antara dua sel penjaga */}
        <Part id="stomata" color="#1D6B33" materialPreset="membrane" {...p}>
          <boxGeometry args={[0.1, 0.05, 0.42]} />
        </Part>
      </group>

      {/* Kutikula — lapisan lilin tipis transparan menutupi permukaan */}
      <Part
        id="kutikula"
        color="#D9D28A"
        materialPreset="membrane"
        opacity={0.32}
        position={[0, 0.42, 0]}
        {...p}
      >
        <boxGeometry args={[5.6, 0.06, 4.0]} />
      </Part>

      {/* Trikoma — rambut daun dari tonjolan sel epidermis */}
      {trichomeSeeds.map((t, i) => (
        <Part
          key={`tri-${i}`}
          id="trikoma"
          color="#C9C08A"
          materialPreset="tissue"
          position={[t.x, 0.42 + t.h / 2, t.z]}
          rotation={[t.tilt, 0, t.tilt * 0.6]}
          {...p}
        >
          <coneGeometry args={[0.07, t.h, 10]} />
        </Part>
      ))}
    </group>
  );
}
