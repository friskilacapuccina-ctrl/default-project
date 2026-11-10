"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";

/**
 * Jaringan Pengangkut Tumbuhan (berkas pembuluh).
 * Xilem: dua trakea berongga dengan penebalan cincin lignin.
 * Floem: satu pembuluh tapis dengan plat tapis berpori + sel pengiring.
 */

const TUBE_LEN = 4.5;

/** Posisi cincin penebalan pada trakea. */
const RING_XS = [-2.0, -1.55, -1.1, -0.65, -0.2, 0.25, 0.7, 1.15, 1.6, 2.05];

/** Posisi plat tapis pada pembuluh tapis. */
const PLATE_XS = [-1.5, -0.5, 0.5, 1.5];

export default function PlantVascular3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  // Lubang-lubang kecil pada tiap plat tapis (torus kecil sebagai pori).
  const pores = useMemo(
    () =>
      PLATE_XS.flatMap((px) =>
        [0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + px;
          return { x: px, y: Math.cos(a) * 0.13, z: 0.5 + Math.sin(a) * 0.13 };
        })
      ),
    []
  );

  return (
    <group>
      {/* ===== XILEM: dua trakea berongga dengan penebalan cincin ===== */}
      {[0.35, 0.85].map((y, vi) => (
        <group key={`xyl-${vi}`} position={[0, y, vi === 0 ? -0.35 : 0.6]}>
          {/* Dinding trakea (tabung terbuka → lumen terlihat) */}
          <Part
            id="xilem"
            color="#D9A066"
            materialPreset="wall"
            opacity={0.75}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.42, 0.42, TUBE_LEN, 28, 1, true]} />
          </Part>
          {/* Penebalan cincin lignin di sepanjang trakea */}
          {RING_XS.map((rx, i) => (
            <Part
              key={`ring-${vi}-${i}`}
              id="xilem"
              color="#A9713A"
              materialPreset="wall"
              position={[rx, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              {...p}
            >
              <torusGeometry args={[0.42, 0.045, 10, 28]} />
            </Part>
          ))}
          {/* Trakeid pendamping di sisi pembuluh */}
          <Part
            id="xilem"
            color="#C08A50"
            materialPreset="wall"
            opacity={0.7}
            position={[vi === 0 ? -0.6 : 0.9, 0, vi === 0 ? -0.95 : 0.05]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.16, 0.16, TUBE_LEN * 0.85, 16, 1, true]} />
          </Part>
        </group>
      ))}

      {/* ===== FLOEM: pembuluh tapis + plat tapis + sel pengiring ===== */}
      <group position={[0, -0.65, 0.5]}>
        <Part
          id="floem"
          color="#9FD9C0"
          materialPreset="wall"
          opacity={0.45}
          rotation={[0, 0, Math.PI / 2]}
          {...p}
        >
          <cylinderGeometry args={[0.26, 0.26, TUBE_LEN, 24, 1, true]} />
        </Part>

        {/* Plat tapis: sekat berpori di antara sel tapis */}
        {PLATE_XS.map((px, i) => (
          <Part
            key={`plate-${i}`}
            id="plat-tapis"
            color="#4A6A5C"
            materialPreset="wall"
            position={[px, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.265, 0.265, 0.06, 24]} />
          </Part>
        ))}
        {/* Pori pada plat tapis */}
        {pores.map((po, i) => (
          <Part
            key={`pore-${i}`}
            id="plat-tapis"
            color="#2F4A3E"
            materialPreset="membrane"
            position={[po.x, po.y, po.z]}
            {...p}
          >
            <sphereGeometry args={[0.035, 10, 8]} />
          </Part>
        ))}

        {/* Sel pengiring di sisi pembuluh tapis (berinti, sitoplasma padat) */}
        {[-1.35, 1.6].map((cx, i) => (
          <group key={`comp-${i}`} position={[cx, -0.42, 0]}>
            <Part
              id="sel-pengiring"
              color="#E8C14B"
              materialPreset="organelle"
              scale={[1.4, 1, 1]}
              {...p}
            >
              <sphereGeometry args={[0.16, 18, 14]} />
            </Part>
            <Part
              id="sel-pengiring"
              color="#8A6F1F"
              materialPreset="nucleus"
              position={[0.03, 0.02, 0]}
              {...p}
            >
              <sphereGeometry args={[0.06, 12, 10]} />
            </Part>
          </group>
        ))}
      </group>
    </group>
  );
}
