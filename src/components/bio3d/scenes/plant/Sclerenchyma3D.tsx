"use client";

import { useMemo } from "react";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";

/**
 * Jaringan Sklerenkim Tumbuhan.
 * ATAS: serat memanjang berdinding sangat tebal dengan lumen sempit.
 * BAWAH: sklerid (stone cell) bulat berdinding sangat tebal.
 * Sel sudah mati saat berfungsi → tanpa inti, hanya dinding & lumen.
 */

/** Serat: [x, y, z] — tiga serat memanjang sejajar di bagian atas. */
const FIBERS: [number, number, number][] = [
  [-0.3, 0.95, 0.3],
  [0.25, 0.7, 0.75],
  [-0.15, 0.45, -0.15],
];

/** Sklerid: [x, y, z, r] — empat sel bulat berdinding tebal di bawah. */
const SCEREIDS: [number, number, number, number][] = [
  [-1.5, -0.5, 0.7, 0.38],
  [-0.65, -0.85, 0.45, 0.34],
  [0.55, -0.65, 0.65, 0.36],
  [1.5, -0.35, 0.6, 0.4],
];

export default function PlantSclerenchyma3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  // Pita lignin halus melintang serat (tekstur dinding tebal).
  const bands = useMemo(
    () =>
      FIBERS.flatMap(([fx, fy, fz], fi) =>
        [-0.7, -0.25, 0.2, 0.65].map((bx) => ({
          key: `${fi}-${bx}`,
          pos: [fx + bx, fy, fz] as [number, number, number],
        }))
      ),
    []
  );

  return (
    <group>
      {/* ===== SERAT: sel memanjang berdinding sangat tebal, lumen sempit ===== */}
      {FIBERS.map(([fx, fy, fz], i) => (
        <group key={`fib-${i}`} position={[fx, fy, fz]} rotation={[0, i * 0.35, Math.PI / 2]}>
          {/* Dinding tebal (tabung terbuka → lumen terlihat dari ujung) */}
          <Part id="serat" color="#A3825C" materialPreset="wall" {...p}>
            <cylinderGeometry args={[0.17, 0.17, 2.2, 20, 1, true]} />
          </Part>
          {/* Lumen sempit di tengah serat */}
          <Part id="lumen" color="#4A3A28" materialPreset="membrane" {...p}>
            <cylinderGeometry args={[0.055, 0.055, 2.26, 12]} />
          </Part>
          {/* Penutup ujung agar dinding tampak padat */}
          <Part id="serat" color="#8A6F4F" materialPreset="wall" position={[0, 1.1, 0]} {...p}>
            <torusGeometry args={[0.11, 0.06, 10, 20]} />
          </Part>
        </group>
      ))}
      {bands.map((b) => (
        <Part
          key={`band-${b.key}`}
          id="serat"
          color="#8A6F4F"
          materialPreset="wall"
          position={b.pos}
          rotation={[0, 0, Math.PI / 2]}
          {...p}
        >
          <torusGeometry args={[0.172, 0.016, 8, 20]} />
        </Part>
      ))}

      {/* ===== SKLERID: sel bulat pendek berdinding sangat tebal ===== */}
      {SCEREIDS.map(([sx, sy, sz, r], i) => (
        <group key={`sc-${i}`} position={[sx, sy, sz]}>
          {/* Dinding lignin yang sangat tebal */}
          <Part id="sklerid" color="#8A6F5C" materialPreset="wall" {...p}>
            <sphereGeometry args={[r, 24, 18]} />
          </Part>
          {/* Lumen kecil di tengah */}
          <Part id="lumen" color="#4A3A28" materialPreset="membrane" {...p}>
            <sphereGeometry args={[r * 0.24, 14, 10]} />
          </Part>
          {/* Kanalikulus halus yang memancar dari lumen */}
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2 + i;
            const tilt = 0.4 + ((k + i) % 3) * 0.35;
            return (
              <Part
                key={`kan-${i}-${k}`}
                id="sklerid"
                color="#6B5546"
                materialPreset="membrane"
                position={[Math.cos(a) * r * 0.55, Math.sin(tilt) * r * 0.3, Math.sin(a) * r * 0.55]}
                rotation={[tilt, a, 0]}
                {...p}
              >
                <cylinderGeometry args={[0.014, 0.02, r * 0.85, 6]} />
              </Part>
            );
          })}
        </group>
      ))}
    </group>
  );
}
